package edu.tlu.jobplatform.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchConfiguration;

/**
 * Cấu hình Elasticsearch client.
 *
 * Sprint 1-4: Không cần thiết (dùng PostgreSQL FTS tạm thời).
 * Sprint 5: Bật lên, trỏ vào ES cluster.
 *
 * Config lấy từ application.yml:
 *   app.elasticsearch.host: localhost
 *   app.elasticsearch.port: 9200
 */
@Configuration
public class ElasticsearchConfig extends ElasticsearchConfiguration {

    @Value("${app.elasticsearch.host:localhost}")
    private String host;

    @Value("${app.elasticsearch.port:9200}")
    private int port;

    @Value("${app.elasticsearch.username:}")
    private String username;

    @Value("${app.elasticsearch.password:}")
    private String password;

    @Override
    public ClientConfiguration clientConfiguration() {
        var builder = ClientConfiguration.builder()
            .connectedTo(host + ":" + port)
            .withConnectTimeout(java.time.Duration.ofSeconds(5))
            .withSocketTimeout(java.time.Duration.ofSeconds(30));

        // Chỉ set auth nếu có username
        if (!username.isBlank()) {
            builder.withBasicAuth(username, password);
        }

        return builder.build();
    }
}
