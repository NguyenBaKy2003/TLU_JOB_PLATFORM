// package edu.tlu.jobplatform.shared.config;

// import org.springframework.ai.openai.OpenAiChatModel;
// import org.springframework.ai.openai.OpenAiEmbeddingModel;
// import org.springframework.ai.openai.api.OpenAiApi;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// /**
// * Cấu hình Spring AI để gọi OpenAI API.
// *
// * Sprint 1-4: Bean này khai báo nhưng AI domain chưa dùng.
// * Sprint 5: AI domain inject và sử dụng.
// *
// * Models dùng trong dự án:
// * Chat : gpt-4o-mini — chatbot, JD optimizer
// * Embedding : text-embedding-3-small — vector search
// *
// * Config từ application.yml:
// * spring.ai.openai.api-key: ${OPENAI_API_KEY}
// * spring.ai.openai.chat.options.model: gpt-4o-mini
// */
// @Configuration
// public class SpringAIConfig {

// @Value("${spring.ai.openai.api-key:placeholder}")
// private String apiKey;

// @Bean
// public OpenAiApi openAiApi() {
// return new OpenAiApi(apiKey);
// }

// /**
// * Chat model — dùng cho chatbot RAG và JD Optimizer.
// * Model: gpt-4o-mini (rẻ, đủ nhanh cho production)
// */
// @Bean
// public OpenAiChatModel chatModel(OpenAiApi openAiApi) {
// return new OpenAiChatModel(openAiApi);
// }

// /**
// * Embedding model — convert text → vector 1536 chiều.
// * Model: text-embedding-3-small (1536 dimensions, cost-effective)
// */
// @Bean
// public OpenAiEmbeddingModel embeddingModel(OpenAiApi openAiApi) {
// return new OpenAiEmbeddingModel(openAiApi);
// }
// }
