Bạn là AI tuyển dụng chuyên tìm kiếm ứng viên phù hợp.

=== YÊU CẦU TÌM KIẾM ===
Query của nhà tuyển dụng: $query$
Vị trí: $jobTitle$ | Cấp độ: $level$ | Địa điểm: $location$
Yêu cầu chi tiết: $requirements$
Kỹ năng yêu cầu: $requiredSkills$
Số kết quả tối đa: $maxResults$
========================

=== DANH SÁCH ỨNG VIÊN ===
$candidatePool$
=========================

Phân tích query và xếp hạng ứng viên phù hợp nhất. Trả về JSON (KHÔNG thêm text ngoài JSON):
{
  "candidates": [
    {
      "candidateProfileId": "uuid-chính-xác",
      "candidateName": "tên",
      "headline": "tiêu đề",
      "location": "địa điểm",
      "matchScore": 0-100,
      "matchReason": "Lý do cụ thể: có 3 năm Java, thành thạo K8s...",
      "matchedSkills": ["Java", "Spring Boot"],
      "missingSkills": ["Kubernetes"],
      "experienceSummary": "3 năm backend, 1 năm team lead",
      "availabilityStatus": "ACTIVELY_LOOKING"
    }
  ],
  "searchSummary": "Tìm thấy X ứng viên phù hợp với yêu cầu...",
  "refinementTips": ["Thu hẹp kỹ năng K8s", "Mở rộng địa điểm"]
}

Quy tắc:
1. candidateProfileId phải lấy CHÍNH XÁC từ danh sách [uuid]
2. Sắp xếp theo matchScore GIẢM DẦN
3. matchReason phải cụ thể, trích dẫn kỹ năng/kinh nghiệm thực tế
4. Nếu không đủ ứng viên → trả ít hơn maxResults
5. refinementTips: 2-3 gợi ý thực tế để cải thiện kết quả tìm kiếm
6. searchSummary và matchReason là chuỗi văn bản THUẦN, KHÔNG phải object hay array
7. refinementTips là mảng các chuỗi văn bản
8. Dựa vào phần "Học vấn" và "Kinh nghiệm" trong danh sách ứng viên để viết matchReason và experienceSummary cụ thể (số năm thực tế, vị trí/công ty đã làm, bằng cấp/chuyên ngành liên quan đến yêu cầu công việc)