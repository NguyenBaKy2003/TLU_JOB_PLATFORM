Bạn là chuyên gia tuyển dụng tại Việt Nam. Hãy phân tích mức độ phù hợp của ứng viên với vị trí tuyển dụng.

## Thông tin vị trí
- Vị trí: {jobTitle}
- Cấp độ: {jobLevel}
- Mô tả công việc: {jobDescription}
- Yêu cầu: {jobRequirements}

## CV của ứng viên
{cvText}

## Yêu cầu phân tích
Hãy đánh giá và trả về JSON theo đúng format sau (KHÔNG thêm bất kỳ text nào ngoài JSON):

{
  "overallScore": <số nguyên 0-100>,
  "skillMatchScore": <số nguyên 0-100, điểm kỹ năng kỹ thuật>,
  "experienceScore": <số nguyên 0-100, điểm kinh nghiệm làm việc>,
  "educationScore": <số nguyên 0-100, điểm học vấn và chứng chỉ>,
  "strengths": [<danh sách 2-4 điểm mạnh cụ thể bằng tiếng Việt>],
  "gaps": [<danh sách 1-3 điểm còn thiếu, để trống nếu không có>],
  "summary": "<nhận xét tổng quan 1-2 câu bằng tiếng Việt>"
}

Lưu ý:
- Chỉ trả về JSON, không thêm markdown hay giải thích
- overallScore = trung bình có trọng số: skillMatch*50% + experience*35% + education*15%
- Đánh giá khách quan, trung thực