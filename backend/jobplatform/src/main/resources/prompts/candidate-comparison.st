Bạn là chuyên gia tuyển dụng. So sánh các ứng viên dưới đây cho vị trí tuyển dụng.

=== VỊ TRÍ ===
Chức danh: $jobTitle$ | Cấp độ: $jobLevel$
Yêu cầu: $jobRequirements$


 CÁC ỨNG VIÊN ===
$candidates$
====================

Trả về JSON (KHÔNG thêm text ngoài JSON):
{
  "ranking": [
    {
      "rank": 1,
      "applicationId": "uuid-ở-đây",
      "candidateName": "Tên ứng viên",
      "totalScore": 85,
      "skillScore": 88,
      "experienceScore": 82,
      "educationScore": 80,
      "uniqueStrengths": ["Điểm mạnh nổi bật so với pool"],
      "relativeWeaknesses": ["Điểm yếu so với người khác"],
      "verdict": "Mô tả ngắn tại sao xếp hạng này"
    }
  ],
  "topRecommendation": "applicationId của ứng viên tốt nhất",
  "comparisonSummary": "Nhận xét 2-3 câu về chất lượng cả pool",
  "recruitmentAdvice": "Lời khuyên cho employer"
}

Yêu cầu:
- Xếp hạng từ cao xuống thấp theo sự phù hợp tổng thể với JD
- uniqueStrengths: so sánh với các ứng viên KHÁC trong pool, không chỉ với JD
- verdict: ngắn gọn, cụ thể (ví dụ: "Kinh nghiệm thực chiến nhất")
- Giữ nguyên applicationId từ input