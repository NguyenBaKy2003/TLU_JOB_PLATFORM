# 📋 TLU_JOB_PLATFORM

**TLU_JOB_PLATFORM** là nền tảng công việc được phát triển bởi **NguyenBaKy DEV** - sinh viên chuyên ngành Khoa học Máy tính tại **Đại học Thăng Long (TLU)**.

Đây là một ứng dụng quản lý việc làm toàn diện kết hợp công nghệ hiện đại để kết nối nhà tuyển dụng và ứng viên một cách hiệu quả.

---

## 📑 Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Kiến trúc Dự án](#-kiến-trúc-dự-án)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Thống Kê Repository](#-thống-kê-repository)
- [Bắt Đầu](#-bắt-đầu)
- [Quy Trình Phát Triển](#-quy-trình-phát-triển)
- [Tài Liệu Tham Khảo](#-tài-liệu-tham-khảo)
- [Nhà Phát Triển](#-nhà-phát-triển)
- [Ghi Chú](#-ghi-chú)

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
- **Build Tool**: npm/yarn

### Thành phần Backend
- **Java**: 43%
- **Dockerfile**: 0.1%
- **Architecture**: REST API / Microservices

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
| **URL Repository** | https://github.com/NguyenBaKy2003/TLU_JOB_PLATFORM |

---

## 🚀 Bắt Đầu

### Yêu Cầu Tiên Quyết

- **Node.js** phiên bản 18+ (cho Frontend)
- **npm** hoặc **yarn**
- **Java JDK** 11+ (cho Backend)
- **Maven** (cho Backend)
- **Git** để quản lý mã nguồn

### Cài Đặt Frontend

```bash
# Đi vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install
# hoặc
yarn install

# Chạy development server
npm run dev
# hoặc
yarn dev
```

Truy cập ứng dụng tại: **[http://localhost:3000](http://localhost:3000)**

### Cài Đặt Backend

```bash
# Đi vào thư mục backend
cd backend

# Xây dựng dự án bằng Maven
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

Backend sẽ chạy mặc định trên: **http://localhost:8080**

---

## 🔄 Quy Trình Phát Triển (Development Workflow)

### 🎯 Tổng Quan Quy Trình

```
┌─────────────────────────────────────────────────────────┐
│         GIT BRANCHING STRATEGY (Sprint Based)           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  main (Production)                                     │
│    ↓                                                    │
│  develop (Development)                                 │
│    ↓                                                    │
│  sprint/Q1-SP1 (Sprint Release)                        │
│    ↓                                                    │
│  fix/feature/{Vai trò}/{Tên}/Task{số} (Work Branch)  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 📋 Kiến trúc Nhánh (Branching Strategy)

Dự án sử dụng mô hình phát triển theo **Sprint** với cấu trúc nhánh chi tiết:

```
main (Production)
│
├── develop (Development)
│   │
│   └── sprint/Q1-SP1 (Sprint Release)
│       ├── fix/frontend/LoginForm/Task001-AuthValidation
│       ├── feature/backend/UserService/Task002-CreateUser
│       ├── fix/frontend/Dashboard/Task003-LayoutFix
│       ├── feature/mobile/Profile/Task004-EditProfile
│       ├── fix/backend/Database/Task005-Optimization
│       └── feature/devops/CI-CD/Task006-GithubActions
```

### 📝 Các Loại Nhánh

| Loại | Format | Mục đích | Ví dụ |
|------|--------|---------|-------|
| **Feature** | `feature/{Vai trò}/{Tên tính năng}/Task{số}` | Phát triển tính năng mới | `feature/frontend/UserProfile/Task001` |
| **Fix** | `fix/{Vai trò}/{Tên lỗi}/Task{số}` | Sửa lỗi hoặc cải thiện | `fix/backend/AuthBug/Task002` |
| **Hotfix** | `hotfix/{Tên}/Task{số}` | Sửa lỗi nóng trên production | `hotfix/LoginError/Task999` |

**Vai trò bao gồm:**
- `frontend` - Phát triển giao diện người dùng (UI/UX)
- `backend` - Phát triển server-side và API
- `mobile` - Phát triển mobile app
- `devops` - Cấu hình deployment, CI/CD
- `database` - Quản lý database schema, migration
- `infrastructure` - Cấu hình hạ tầng

### 🔧 Quy Trình Làm Việc Chi Tiết

#### 1️⃣ **Chuẩn Bị: Cập Nhật Nhánh Deploy**

Trước khi bắt đầu công việc, hãy chắc chắn nhánh Sprint của bạn là mới nhất:

```bash
# Cập nhật nhánh develop mới nhất
git checkout develop
git pull origin develop

# Checkout vào nhánh sprint/Q1-SP1
git checkout sprint/Q1-SP1
git pull origin sprint/Q1-SP1
```

**Lý do:** Đảm bảo bạn có các thay đổi mới nhất từ team trước khi bắt đầu coding.

---

#### 2️⃣ **Tạo Nhánh Công Việc Cá Nhân**

Từ nhánh `sprint/Q1-SP1`, tạo nhánh mới cho task của bạn:

```bash
# Ví dụ 1: Feature mới cho Frontend
git checkout -b feature/frontend/LoginForm/Task001-AuthValidation

# Ví dụ 2: Sửa lỗi Backend
git checkout -b fix/backend/UserService/Task002-CreateUser

# Ví dụ 3: Sửa lỗi Database
git checkout -b fix/database/Migration/Task003-UpdateSchema
```

**Quy tắc đặt tên chi tiết:**

- **Phần 1 (Type)**: `feature` hoặc `fix` hoặc `hotfix`
- **Phần 2 (Vai trò)**: `frontend`, `backend`, `mobile`, `devops`, `database`, `infrastructure`
- **Phần 3 (Mô tả)**: PascalCase, mô tả rõ ràng nội dung
- **Phần 4 (Task ID)**: `Task{số}-KhôDấuCách`

**✅ Ví dụ tốt:**
- `feature/frontend/LoginForm/Task001-AuthValidation`
- `fix/backend/UserService/Task002-CreateUser`
- `feature/database/Migration/Task003-AddUserTable`

**❌ Ví dụ không tốt:**
- `feature/task1` (quá ngắn)
- `feature/frontend/task 1` (có dấu cách)
- `feature/Frontend/LoginForm/Task1-auth validation` (hỗn hợp case)

---

#### 3️⃣ **Phát Triển và Commit**

Thực hiện các thay đổi code và commit với message rõ ràng:

```bash
# Xem trạng thái file
git status

# Thêm file vào staging area
git add .
# hoặc thêm file cụ thể
git add src/components/LoginForm.tsx

# Commit với message rõ ràng (theo Conventional Commits)
git commit -m "feat: thêm xác thực đăng nhập [Task001]"
git commit -m "fix: sửa lỗi validation password [Task001]"
git commit -m "docs: cập nhật hướng dẫn setup [Task002]"
```

**Format Commit Message:**
```
<type>(<scope>): <subject> [<task-id>]

<body>

<footer>
```

**Type bao gồm:**
- `feat` - Tính năng mới
- `fix` - Sửa lỗi
- `docs` - Cập nhật tài liệu
- `style` - Thay đổi format code (không ảnh hưởng logic)
- `refactor` - Tái cấu trúc code
- `test` - Thêm hoặc cập nhật test
- `chore` - Task liên quan xây dựng, dependencies

**Ví dụ commit tốt:**
```
feat(auth): thêm xác thực 2FA [Task001]

- Implement TOTP authentication
- Add QR code generation
- Update user model to support 2FA status

Closes #123
```

---

#### 4️⃣ **Push Code lên Repository**

Đẩy nhánh công việc lên GitHub:

```bash
# Push nhánh lần đầu tiên
git push -u origin feature/frontend/LoginForm/Task001-AuthValidation

# Push lần tiếp theo
git push origin
```

**Lưu ý:** Flag `-u` giúp tracking nhánh remote, lần sau chỉ cần `git push`.

---

#### 5️⃣ **Tạo Pull Request (PR)**

Khi code sẵn sàng, tạo Pull Request để team review:

**Bước tạo PR trên GitHub:**

1. Mở https://github.com/NguyenBaKy2003/TLU_JOB_PLATFORM
2. Nhấp vào tab **Pull Requests**
3. Nhấp **New Pull Request**
4. Chọn:
   - **Base branch**: `sprint/Q1-SP1` ✅
   - **Compare branch**: `feature/frontend/LoginForm/Task001-AuthValidation`
5. Điền thông tin PR

**Mẫu PR Description:**

```markdown
## 📝 Mô Tả
Sơ lược về thay đổi của bạn (2-3 câu).

Ví dụ: Thêm tính năng xác thực 2FA để tăng bảo mật tài khoản người dùng.

## 🎯 Loại Thay Đổi
- [x] Tính năng mới
- [ ] Sửa lỗi
- [ ] Breaking change
- [ ] Cập nhật tài liệu

## 📋 Danh Sách Thay Đổi
- [ ] Thêm file auth.service.ts
- [ ] Cập nhật UserModel
- [ ] Thêm unit tests
- [ ] Cập nhật documentation

## 🔗 Liên Kết Issue
Closes #123
Related to #456

## 📸 Screenshots (nếu có UI changes)
[Thêm screenshot ở đây]

## ✅ Checklist Trước Khi Submit
- [x] Code follow coding standards
- [x] Tự test local trước submit
- [x] Không có conflicts
- [x] Commit message rõ ràng
- [x] Documentation đã update
```

**Tiêu đề PR (ngắn, rõ ràng):**
```
[Task001] Thêm xác thực đăng nhập (Authentication)
```

---

#### 6️⃣ **Review và Feedback**

Chờ team members review code:

```bash
# Nếu có feedback, sửa code
git add .
git commit -m "refactor: cải thiện validate form [Task001]"
git push origin

# GitHub sẽ tự động update PR
```

**Trong quá trình review:**
- ✅ Hãy responsive với comments
- ✅ Giải thích lựa chọn kỹ thuật của bạn
- ✅ Giải quyết conflicts (nếu có)

---

#### 7️⃣ **Merge và Cleanup**

Sau khi được approve, merge PR:

```bash
# GitHub UI: Nhấp "Merge Pull Request"
# Hoặc dùng command line:

# Chuyển về sprint branch
git checkout sprint/Q1-SP1
git pull origin sprint/Q1-SP1

# Xóa local branch
git branch -d feature/frontend/LoginForm/Task001-AuthValidation

# Xóa remote branch
git push origin --delete feature/frontend/LoginForm/Task001-AuthValidation
```

---

### 📚 Bảng Lệnh Git Nhanh

| Lệnh | Mục đích |
|------|---------|
| `git status` | Xem file đã thay đổi |
| `git branch -a` | Xem tất cả nhánh |
| `git log --oneline -10` | Xem 10 commit gần nhất |
| `git diff` | Xem chi tiết thay đổi file |
| `git stash` | Lưu temporary changes |
| `git merge <branch>` | Merge nhánh khác vào nhánh hiện tại |
| `git rebase <branch>` | Rebase nhánh (tái cơ sở) |
| `git reset --hard HEAD` | Quay về commit cuối cùng |

---

### ✅ Best Practices

**✅ Nên làm:**
- ✔️ Commit **thường xuyên** (1-2 lần/giờ)
- ✔️ **Pull latest changes** trước khi làm việc
- ✔️ **Test local** trước push
- ✔️ Tạo PR **nhỏ** (< 400 dòng code)
- ✔️ **Review** code của team members
- ✔️ Giải quyết **conflicts** kịp thời
- ✔️ Viết **unit tests** cho code mới
- ✔️ Update **documentation**

**❌ Không nên làm:**
- ❌ Commit trực tiếp lên `main`, `develop`, hoặc `sprint/Q1-SP1`
- ❌ Push code **chưa test**
- ❌ Để PR **chưa được review** lâu ngày
- ❌ Tạo nhánh với tên **không rõ ràng**
- ❌ Commit code **có lỗi syntax**
- ❌ Push **mà chưa pull latest** (gây conflict)
- ❌ Rebase trên **public branches** (nếu team share)

---

### 🚨 Giải Quyết Conflicts

Nếu xảy ra conflict khi merge:

```bash
# 1. Xem file có conflict
git status

# 2. Mở file conflict và sửa (tìm <<<<<<, ======, >>>>>> markers)
# Ví dụ:
# <<<<<<< HEAD
# code từ branch hiện tại
# =======
# code từ branch khác
# >>>>>>> feature/xyz

# 3. Chọn code đúng, xóa markers

# 4. Commit changes
git add .
git commit -m "resolve: merge conflict from sprint/Q1-SP1"
git push origin
```

---

## 📖 Tài Liệu Tham Khảo

### 🎨 Frontend
- **Next.js**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Learn Next.js**: [https://nextjs.org/learn](https://nextjs.org/learn)
- **TypeScript**: [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)

### 🔧 Backend
- **Spring Boot**: [https://spring.io/projects/spring-boot](https://spring.io/projects/spring-boot)
- **Java**: [https://docs.oracle.com/javase/](https://docs.oracle.com/javase/)

### 📦 DevOps & Deployment
- **Docker**: [https://docs.docker.com/](https://docs.docker.com/)
- **Vercel**: [https://vercel.com/docs](https://vercel.com/docs)
- **GitHub Actions**: [https://docs.github.com/en/actions](https://docs.github.com/en/actions)

### 🌐 Linting & Formatting
- **ESLint**: [https://eslint.org/docs/](https://eslint.org/docs/)
- **Prettier**: [https://prettier.io/docs/](https://prettier.io/docs/)

---

## 👨‍💻 Nhà Phát Triển

| Thông tin | Chi tiết |
|-----------|---------|
| **Tác giả** | NguyenBaKy DEV |
| **Trường** | Đại học Thăng Long (TLU) |
| **Chuyên ngành** | Khoa học Máy tính |
| **GitHub** | [@NguyenBaKy2003](https://github.com/NguyenBaKy2003) |
| **Email** | [134308896+NguyenBaKy2003@users.noreply.github.com](mailto:134308896+NguyenBaKy2003@users.noreply.github.com) |

---

## 📝 Ghi Chú

Đây là một dự án học tập nhằm:

- 🎓 **Nâng cao kỹ năng** lập trình Full Stack
- 🔧 **Áp dụng** các công nghệ hiện đại
- 💼 **Giải quyết** vấn đề thực tế trong tuyển dụng
- 🚀 **Thực hành** best practices phát triển phần mềm
- 👥 **Hợp tác** hiệu quả với team

---

## 📅 Cập Nhật

- **Lần cập nhật cuối**: 16/06/2026
- **Phiên bản hiện tại**: 1.1.0 (Development)
- **Trạng thái**: 🟢 Active Development

---

## 📜 License

Dự án này là private. Vui lòng liên hệ tác giả để biết thêm chi tiết quyền sử dụng.

---

## 💬 Hỗ Trợ

Nếu có câu hỏi hoặc cần hỗ trợ:

1. **Kiểm tra Documentation** trước
2. **Tạo Issue** trên GitHub
3. **Liên hệ trực tiếp** với team

---

**Made with ❤️ by NguyenBaKy DEV**
