## 📋 Giới thiệu

**TLU_JOB_PLATFORM** là nền tảng công việc được phát triển bởi **NguyenBaKy DEV** - sinh viên chuyên ngành Khoa học Máy tính tại **Đại học Thăng Long (TLU)**.

Đây là một ứng dụng quản lý việc làm toàn diện kết hợp công nghệ hiện đại để kết nối nhà tuyển dụng và ứng viên một cách hiệu quả.

---

## 🏗️ Kiến trúc Dự án

Dự án được xây dựng theo **kiến trúc Monorepo** với hai thành phần chính:

```
TLU_JOB_PLATFORM/
├── frontend/          (TypeScript + Next.js)
├── backend/           (Java)
└── ...
```

---

## 💻 Công Nghệ Sử Dụng

### Thành phần Frontend
- **TypeScript**: 54.2%
- **HTML**: 2%
- **CSS**: 0.3%
- **Framework**: Next.js

### Thành phần Backend
- **Java**: 43%
- **Dockerfile**: 0.1%

### Khác
- **StringTemplate**: 0.4%

---

## 📊 Thống Kê Repository

| Thông tin | Chi tiết |
|-----------|---------|
| **ID Repository** | 1173443873 |
| **Ngôn ngữ chính** | TypeScript |
| **Nhánh mặc định** | develop |
| **Trạng thái** | Active (Cập nhật lần cuối: 30/05/2026) |
| **Quyền riêng tư** | Private |
| **Số Pull Request** | Đang phát triển |
| **Số Issues** | 0 |

---

## 🚀 Bắt Đầu

### Cài Đặt Frontend

```bash
cd frontend
npm install
npm run dev
```

Truy cập ứng dụng tại: [http://localhost:3000](http://localhost:3000)

### Cài Đặt Backend

```bash
cd backend
# Cấu hình theo hướng dẫn backend của dự án
```

---

## 🔄 Quy Trình Phát Triển (Development Workflow)

### Kiến trúc Nhánh (Branching Strategy)

Dự án sử dụng mô hình phát triển theo Sprint với cấu trúc nhánh như sau:

```
main (Production)
├── develop (Development)
│   └── sprint/Q1-SP1 (Sprint Release)
│       ├── fix/frontend/LoginForm/Task001-AuthValidation
│       ├── feature/backend/UserService/Task002-CreateUser
│       ├── fix/frontend/Dashboard/Task003-LayoutFix
│       └── feature/mobile/Profile/Task004-EditProfile
```

### Các Loại Nhánh

| Loại | Format | Mục đích |
|------|--------|---------|
| **Feature** | `feature/{Vai trò}/{Tên tính năng}/Task{số}` | Phát triển tính năng mới |
| **Fix** | `fix/{Vai trò}/{Tên lỗi}/Task{số}` | Sửa lỗi hoặc cải thiện |

**Vai trò bao gồm**: `frontend`, `backend`, `mobile`, `devops`, v.v.

### Quy Trình Làm Việc

#### 1️⃣ **Checkout từ nhánh Deploy**
```bash
# Cập nhật nhánh develop mới nhất
git checkout develop
git pull origin develop

# Checkout từ nhánh sprint/Q1-SP1
git checkout sprint/Q1-SP1
git pull origin sprint/Q1-SP1
```

#### 2️⃣ **Tạo Nhánh Công Việc Cá Nhân**
```bash
# Tạo nhánh mới để code
git checkout -b fix/frontend/LoginForm/Task001-AuthValidation

# Hoặc nếu là feature
git checkout -b feature/backend/UserService/Task002-CreateUser
```

**Quy tắc đặt tên:**
- Sử dụng kebab-case (dấu gạch ngang) cho tên tác vụ
- Giữi ngắn gọn, mô tả rõ ràng nội dung công việc
- Ví dụ: `Task001-AuthValidation`, `Task002-CreateUser`

#### 3️⃣ **Phát Triển và Commit**
```bash
# Thực hiện các thay đổi và commit
git add .
git commit -m "feat: thêm xác thực đăng nhập [Task001]"
```

#### 4️⃣ **Push Code lên Repository**
```bash
# Push nhánh công việc lên remote
git push origin fix/frontend/LoginForm/Task001-AuthValidation
```

#### 5️⃣ **Tạo Pull Request**
- Mở GitHub và tạo **Pull Request (PR)** từ nhánh công việc vào nhánh `sprint/Q1-SP1`
- **Base branch**: `sprint/Q1-SP1`
- **Compare branch**: `fix/frontend/LoginForm/Task001-AuthValidation`
- Tiêu đề PR: `[Task001] Thêm xác thực đăng nhập`
- Mô tả PR bao gồm:
  - Mô tả chi tiết thay đổi
  - Link vấn đề liên quan (nếu có)
  - Screenshots (nếu là UI changes)

#### 6️⃣ **Review và Merge**
- Chờ đợi code review từ team members
- Giải quyết các comments/suggestions
- Merge PR vào `sprint/Q1-SP1` sau khi được approve

#### 7️⃣ **Cập Nhật Nhánh Local**
```bash
# Quay về nhánh sprint/Q1-SP1
git checkout sprint/Q1-SP1
git pull origin sprint/Q1-SP1

# Xóa nhánh công việc đã merge
git branch -d fix/frontend/LoginForm/Task001-AuthValidation
git push origin --delete fix/frontend/LoginForm/Task001-AuthValidation
```

### Quy Tắc Chung

✅ **Nên làm:**
- Commit thường xuyên với message rõ ràng
- Pull latest changes trước khi làm việc
- Tạo PR nhỏ, dễ review (< 400 dòng code)
- Giải quyết conflicts kịp thời

❌ **Không nên làm:**
- Commit trực tiếp lên `develop` hoặc `sprint/Q1-SP1`
- Push code mà chưa test
- Để PR chưa giải quyết conflicts
- Tạo nhánh với tên không rõ ràng

---

## 📖 Tài Liệu Tham Khảo

### Frontend (Next.js)
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### Triển Khai
- Deploy frontend trên [Vercel Platform](https://vercel.com)

---

## 👨‍💻 Nhà Phát Triển

- **Tác giả**: NguyenBaKy DEV
- **Trường**: Đại học Thăng Long (TLU)
- **Chuyên ngành**: Khoa học Máy tính
- **GitHub**: [@NguyenBaKy2003](https://github.com/NguyenBaKy2003)

---

## 📝 Ghi Chú

Đây là một dự án học tập nhằm:
- 🎓 Nâng cao kỹ năng lập trình Full Stack
- 🔧 Áp dụng các công nghệ hiện đại trong phát triển web
- 💼 Giải quyết vấn đề thực tế trong tuyển dụng nhân sự

---

**Cập nhật lần cuối**: 30/05/2026
