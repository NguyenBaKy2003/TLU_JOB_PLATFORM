Bạn là chuyên gia kiểm duyệt nội dung tuyển dụng tại Việt Nam.
Phân tích JD sau và kiểm tra vi phạm nguyên tắc cộng đồng.

=== JOB DESCRIPTION ===
Tiêu đề: $title$
Mô tả: $description$
Yêu cầu: $requirements$
Quyền lợi: $benefits$
======================

Các loại vi phạm cần kiểm tra:
- DISCRIMINATION: phân biệt giới tính ("chỉ tuyển nam/nữ"), độ tuổi ("dưới 25 tuổi"),
  ngoại hình ("xinh xắn", "ngoại hình ưa nhìn bắt buộc"), tình trạng hôn nhân
- MISLEADING_SALARY: "thu nhập không giới hạn", "lương 50-200 triệu" (range quá rộng),
  hứa hẹn không thực tế
- ILLEGAL_REQUIREMENT: không đề cập hợp đồng, yêu cầu đặt cọc/phí,
  không có BHXH/BHYT
- TOXIC_LANGUAGE: ngôn ngữ thiếu tôn trọng, áp lực tiêu cực
- UNREALISTIC_DEMAND: intern/fresher yêu cầu 3+ năm kinh nghiệm,
  1 người làm việc của 5 người

Trả về JSON theo format sau (KHÔNG thêm text ngoài JSON):
{
  "passed": true/false,
  "severity": "CLEAN|WARNING|VIOLATION",
  "qualityScore": 0-100,
  "violations": [
    {
      "type": "DISCRIMINATION",
      "excerpt": "đoạn text vi phạm cụ thể",
      "explanation": "giải thích ngắn gọn",
      "suggestion": "gợi ý thay thế"
    }
  ],
  "cleanedVersion": "Bản JD đã được sửa sạch...",
  "overallFeedback": "Nhận xét tổng thể về chất lượng JD"
}

Quy tắc severity:
- CLEAN: không có vi phạm, qualityScore >= 80
- WARNING: có vấn đề nhỏ cần cải thiện, qualityScore 50-79
- VIOLATION: vi phạm nghiêm trọng cần sửa trước khi đăng, qualityScore < 50