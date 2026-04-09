package edu.tlu.jobplatform.ai;

import edu.tlu.jobplatform.ai.domain.model.CvAnalysisRequest;
import edu.tlu.jobplatform.ai.domain.model.CvAnalysisResult;
import edu.tlu.jobplatform.ai.domain.port.CvAnalysisPort;
import edu.tlu.jobplatform.ai.infrastructure.adapter.OpenAIScoreAdapter;
import edu.tlu.jobplatform.ai.infrastructure.openai.PdfTextExtractor;
import edu.tlu.jobplatform.application.domain.model.vo.AIScore;
import edu.tlu.jobplatform.application.infrastructure.adapter.MockAIScoreAdapter;
import org.junit.jupiter.api.*;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DisplayName("AI Domain Tests")
class AiDomainTest {

    CvAnalysisPort  cvAnalysisPort = mock(CvAnalysisPort.class);
    PdfTextExtractor pdfExtractor  = mock(PdfTextExtractor.class);

    OpenAIScoreAdapter adapter;

    UUID appId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        adapter = new OpenAIScoreAdapter(cvAnalysisPort, pdfExtractor);
    }

    // ════════════════════════════════════════════════════════════
    //  OpenAIScoreAdapter
    // ════════════════════════════════════════════════════════════

    @Nested @DisplayName("OpenAIScoreAdapter")
    class AdapterTests {

        @Test @DisplayName("Happy path — AI trả về kết quả đầy đủ")
        void shouldMapResultToAIScore() {
            when(pdfExtractor.extractFromUrl(any())).thenReturn("Nguyễn Văn A. Java 5 năm...");
            when(cvAnalysisPort.analyze(any())).thenReturn(CvAnalysisResult.builder()
                .overallScore(85)
                .skillMatchScore(90)
                .experienceScore(80)
                .educationScore(75)
                .strengths(List.of("Thành thạo Java", "Kinh nghiệm Spring Boot"))
                .gaps(List.of("Thiếu Kubernetes"))
                .summary("Ứng viên phù hợp tốt.")
                .build());

            String jobFullText = "Vị trí: Senior Java Dev\n\nMô tả: Phát triển backend\n\nYêu cầu: Java 3+ năm";
            AIScore score = adapter.calculateScore(appId, "https://storage/cv.pdf", jobFullText);

            assertThat(score.getScore()).isEqualTo(85);
            assertThat(score.getSkillMatchScore()).isEqualTo(90);
            assertThat(score.getModelVersion()).isEqualTo("gpt-4o-mini");
            assertThat(score.isHighScore()).isTrue();
            assertThat(score.getLabel()).isEqualTo("Rất phù hợp");
            assertThat(score.getStrengths()).hasSize(2);
        }

        @Test @DisplayName("PDF extract rỗng → dùng URL làm fallback text")
        void shouldFallbackWhenPdfEmpty() {
            when(pdfExtractor.extractFromUrl(any())).thenReturn("");
            when(cvAnalysisPort.analyze(any())).thenAnswer(inv -> {
                CvAnalysisRequest req = inv.getArgument(0);
                assertThat(req.getCvText()).startsWith("CV URL:");
                return CvAnalysisResult.builder()
                    .overallScore(60).skillMatchScore(60)
                    .experienceScore(60).educationScore(60)
                    .strengths(List.of()).gaps(List.of())
                    .summary("fallback").build();
            });

            adapter.calculateScore(appId, "https://storage/cv.pdf", "Vị trí: Dev");
            verify(cvAnalysisPort).analyze(any());
        }

        @Test @DisplayName("parseSection — extract đúng từng phần từ jobFullText")
        void shouldParseJobFullTextCorrectly() {
            when(pdfExtractor.extractFromUrl(any())).thenReturn("cv text");
            when(cvAnalysisPort.analyze(any())).thenAnswer(inv -> {
                CvAnalysisRequest req = inv.getArgument(0);
                assertThat(req.getJobTitle()).isEqualTo("Senior Java Developer");
                assertThat(req.getJobDescription()).isEqualTo("Phát triển hệ thống tuyển dụng");
                assertThat(req.getJobRequirements()).isEqualTo("Java 3 năm, Spring Boot");
                return CvAnalysisResult.builder()
                    .overallScore(75).skillMatchScore(75)
                    .experienceScore(75).educationScore(75)
                    .strengths(List.of()).gaps(List.of()).summary("ok").build();
            });

            String fullText = "Vị trí: Senior Java Developer\n\n" +
                              "Mô tả: Phát triển hệ thống tuyển dụng\n\n" +
                              "Yêu cầu: Java 3 năm, Spring Boot\n\n" +
                              "Quyền lợi: Lương cao";

            adapter.calculateScore(appId, "https://cv.pdf", fullText);
            verify(cvAnalysisPort).analyze(any());
        }
    }

    // ════════════════════════════════════════════════════════════
    //  MockAIScoreAdapter (dùng khi test)
    // ════════════════════════════════════════════════════════════

    @Nested @DisplayName("MockAIScoreAdapter")
    class MockTests {

        @Test @DisplayName("Score luôn trong khoảng 50-100")
        void scoreShouldBeInRange() {
            MockAIScoreAdapter mockAdapter = new MockAIScoreAdapter();
            for (int i = 0; i < 20; i++) {
                AIScore score = mockAdapter.calculateScore(
                    UUID.randomUUID(), "https://cv.pdf", "jd text");
                assertThat(score.getScore()).isBetween(50, 100);
                assertThat(score.getModelVersion()).isEqualTo("mock-v1.0");
            }
        }

        @Test @DisplayName("AIScore.getLabel() trả về đúng nhãn")
        void labelTest() {
            AIScore high = AIScore.builder().score(80).skillMatchScore(80)
                .experienceScore(80).educationScore(80)
                .strengths(List.of()).gaps(List.of()).summary("").modelVersion("test").build();
            AIScore mid = AIScore.builder().score(60).skillMatchScore(60)
                .experienceScore(60).educationScore(60)
                .strengths(List.of()).gaps(List.of()).summary("").modelVersion("test").build();
            AIScore low = AIScore.builder().score(40).skillMatchScore(40)
                .experienceScore(40).educationScore(40)
                .strengths(List.of()).gaps(List.of()).summary("").modelVersion("test").build();

            assertThat(high.getLabel()).isEqualTo("Rất phù hợp");
            assertThat(mid.getLabel()).isEqualTo("Phù hợp");
            assertThat(low.getLabel()).isEqualTo("Ít phù hợp");
        }
    }
}
