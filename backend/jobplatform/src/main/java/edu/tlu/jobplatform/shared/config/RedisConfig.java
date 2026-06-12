package edu.tlu.jobplatform.shared.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

@EnableCaching
@Configuration
public class RedisConfig {

        @Bean
        public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory factory) {
                return new StringRedisTemplate(factory);
        }

        @Bean
        public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
                ObjectMapper mapper = new ObjectMapper()
                                .registerModule(new JavaTimeModule())
                                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

                mapper.activateDefaultTypingAsProperty(
                                mapper.getPolymorphicTypeValidator(),
                                ObjectMapper.DefaultTyping.NON_FINAL,
                                "@class");

                RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(10))
                                .prefixCacheNameWith("v8:")
                                .serializeKeysWith(
                                                RedisSerializationContext.SerializationPair.fromSerializer(
                                                                new StringRedisSerializer()))
                                .serializeValuesWith(
                                                RedisSerializationContext.SerializationPair.fromSerializer(
                                                                new GenericJackson2JsonRedisSerializer(mapper)))
                                .disableCachingNullValues();

                Map<String, RedisCacheConfiguration> cacheConfigs = Map.of(
                                "recommendations", defaultConfig.entryTtl(Duration.ofMinutes(30)),
                                "passProbability", defaultConfig.entryTtl(Duration.ofMinutes(10)),
                                "competitionRate", defaultConfig.entryTtl(Duration.ofMinutes(15)),
                                "candidateSuggestions", defaultConfig.entryTtl(Duration.ofHours(1)));

                return RedisCacheManager.builder(factory)
                                .cacheDefaults(defaultConfig)
                                .withInitialCacheConfigurations(cacheConfigs)
                                .build();
        }
}