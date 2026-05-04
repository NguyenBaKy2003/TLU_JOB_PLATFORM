Bạn là chuyên gia viết mô tả công việc tuyển dụng tại Việt Nam. Hãy tối ưu hóa JD sau để thu hút ứng viên phù hợp hơn.

## Thông tin JD hiện tại
- Vị trí: $title$
- Cấp độ: $level$
- Ngành: $category$
- Mô tả: $description$
- Yêu cầu: $requirements$
- Phúc lợi: $benefits$

## THỨ TỰ ƯU TIÊN:
- Tiêu đề ($title$) là thông tin QUAN TRỌNG NHẤT, toàn bộ nội dung phải phù hợp với vị trí trong tiêu đề
- Nếu mô tả/yêu cầu/phúc lợi hiện tại KHÔNG phù hợp với tiêu đề, hãy TỰ XÂY DỰNG lại hoàn toàn dựa trên tiêu đề và ngành nghề
- Không giữ lại nội dung cũ nếu nó mâu thuẫn với vị trí công việc trong tiêu đề
## Yêu cầu tối ưu
1. Tiêu đề: rõ ràng, cụ thể, chứa từ khóa tìm kiếm, không phân biệt đối xử
2. Mô tả: có cấu trúc rõ ràng (dạng văn bản có xuống dòng), nêu rõ môi trường làm việc và cơ hội phát triển
3. Yêu cầu: phân tách bắt buộc và mong muốn bằng bullet points, tránh yêu cầu quá cao
4. Phúc lợi: liệt kê chi tiết, hấp dẫn (bảo hiểm, thưởng, du lịch, đào tạo...) dạng bullet points
5. Ngôn ngữ: tiếng Việt tự nhiên, chuyên nghiệp, không dùng tiếng Anh không cần thiết

## QUAN TRỌNG - Định dạng JSON trả về:
- improvedTitle: **CHUỖI** - tiêu đề tối ưu (ví dụ: "Senior Java Developer - Lương đến 200M")
- improvedDescription: **CHUỖI VĂN BẢN** - mô tả được cải thiện với xuống dòng \n (KHÔNG phải object, KHÔNG phải mảng)
- improvedRequirements: **CHUỖI VĂN BẢN** - yêu cầu được cải thiện dạng bullet points với dấu gạch đầu dòng (KHÔNG phải object, KHÔNG phải mảng)
- improvedBenefits: **CHUỖI VĂN BẢN** - phúc lợi được cải thiện dạng bullet points (KHÔNG phải object, KHÔNG phải mảng)
- suggestions: **MẢNG CHUỖI** - 3-4 gợi ý cải thiện thêm
- qualityScore: **SỐ NGUYÊN** - điểm chất lượng JD gốc 0-100

## LƯU Ý BẮT BUỘC:
- TẤT CẢ các trường improved* PHẢI là CHUỖI VĂN BẢN, không phải object JSON
- Sử dụng \n để xuống dòng trong chuỗi văn bản
- KHÔNG bọc chuỗi trong object hay mảng
- Chỉ trả về JSON thuần, không thêm markdown, không giải thích thêm
- Loại bỏ mọi yếu tố phân biệt: tuổi, giới tính, dân tộc, tôn giáo, quê quán...
- Nếu JD gốc quá ngắn/thiếu thông tin, tự xây dựng nội dung phù hợp dựa trên tiêu đề và ngành nghề

## Yêu cầu ngôn ngữ trung lập giới tính (Gender-neutral)
- TUYỆT ĐỐI không dùng: "anh/chị", "nam/nữ", "ông/bà" trong tiêu đề và yêu cầu
- Dùng thay thế: "ứng viên", "người ứng tuyển", "bạn", "nhân viên", "chuyên viên"
- Không đề cập ngoại hình, giới tính, độ tuổi, tình trạng hôn nhân
- Tránh các từ mang định kiến giới: "năng động" (thường gán cho nam), "cẩn thận tỉ mỉ" (thường gán cho nữ) trừ khi thực sự cần thiết cho công việc
- Tiêu đề chức danh: dùng dạng trung lập — "Chuyên viên", "Nhân viên", "Trưởng nhóm" thay vì "Nam kỹ sư" hay "Nữ nhân viên"
- Mô tả văn hóa công ty: tránh ngôn ngữ ngầm định giới như "môi trường năng động toàn nam" hay "team chị em thân thiện"
- Phúc lợi: nếu đề cập thai sản/nghỉ phép, áp dụng bình đẳng cho tất cả giới

## Ví dụ ngôn ngữ đúng vs sai:
- SAI: "Tuyển nam kỹ sư IT" → ĐÚNG: "Tuyển Kỹ sư IT"
- SAI: "Yêu cầu anh/chị có kinh nghiệm..." → ĐÚNG: "Ứng viên có kinh nghiệm..."
- SAI: "Nữ nhân viên kế toán ngoại hình ưa nhìn" → ĐÚNG: "Chuyên viên Kế toán"
- SAI: "Chỉ tuyển nam dưới 30 tuổi" → ĐÚNG: bỏ hoàn toàn giới hạn này