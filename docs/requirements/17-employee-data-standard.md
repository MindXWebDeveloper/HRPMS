# 17. Chuẩn hóa dữ liệu Employee

## Mục tiêu
Chuẩn hóa dữ liệu nhân viên sang một schema thống nhất để tránh phụ thuộc vào key tiếng Việt rải rác trong localStorage và giúp hệ thống dễ mở rộng hơn.

## Vấn đề hiện tại
- Dữ liệu `EMPLOYEES` đang lưu trực tiếp các key tiếng Việt như `HoTen`, `NgaySinh`, `PhongBan`, `ChucVu`.
- Một số trường bị trùng key hoặc chưa nhất quán, ví dụ `Avatar` bị khai báo nhiều lần.
- Một số màn hình đang đọc dữ liệu trực tiếp từ những key này, nên nếu đổi đột ngột sẽ dễ vỡ UI và logic.
- Định danh chính của nhân sự nên là `employeeID`, và khóa này phải nằm trong `user.js` để quản lý tài khoản và phân quyền tập trung.

## Hướng giải quyết đề xuất
- Giữ giao diện tiếng Việt.
- Chuẩn hóa dữ liệu lưu trữ sang key tiếng Anh rõ nghĩa.
- Tạo lớp chuyển đổi để đọc dữ liệu cũ và ghi dữ liệu mới.
- Migrate dần dữ liệu cũ sang format mới thay vì đổi một lần.

## Schema chuẩn đề xuất

### 17.1 Cấu trúc tổng quan
```json
{
  "id": "emp-001",
  "profile": {
    "fullName": "Lương Văn Thanh",
    "dob": "1995-03-15",
    "gender": "Nam",
    "phone": "0901234567",
    "email": "thanh.luong@company.com",
    "idNumber": "001095123456",
    "nationality": "Việt Nam",
    "idIssueDate": "2020-05-12",
    "idIssuePlace": "Cục CSQLHC về TTXH",
    "permanentAddress": "Ba Đình, Hà Nội",
    "currentAddress": "Nam Từ Liêm, Hà Nội",
    "avatarUrl": "https://..."
  },
  "job": {
    "employeeID": "emp-001",
    "department": "Phát triển phần mềm",
    "jobTitle": "Developer",
    "jobLevel": "Junior Developer",
    "status": "active",
    "startDate": "2026-07-10",
    "managerCode": ""
  },
  "emergencyContact": {
    "name": "Nguyễn Thị Lan",
    "phone": "0911222333",
    "relationship": "Bố/mẹ đẻ",
    "address": "Ba Đình, Hà Nội"
  },
  "education": {
    "degree": "Cao đẳng/Đại học",
    "foreignLanguage": "Tiếng Anh (IELTS 6.5)",
    "skills": ["HTML", "CSS", "JavaScript"],
    "notes": ""
  },
  "meta": {
    "points": 1350,
    "createdAt": "2026-07-10T09:00:00",
    "updatedAt": "2026-07-10T09:00:00"
  }
}
```

### 17.2 Quy tắc đặt key
- Dùng chữ thường camelCase.
- Không dùng dấu tiếng Việt trong key.
- Không trùng key trong cùng object.
- `status` nên dùng giá trị chuẩn hóa như `active`, `inactive`.
- Các trường text hiển thị tiếng Việt vẫn giữ ở UI, chỉ đổi format lưu trữ.

## Bảng map từ dữ liệu cũ sang dữ liệu mới

| Key cũ | Key mới | Nhóm |
|---|---|---|
| `HoTen` | `profile.fullName` | Thông tin cá nhân |
| `NgaySinh` | `profile.dob` | Thông tin cá nhân |
| `SoDienThoai` | `profile.phone` | Thông tin cá nhân |
| `NgayCap` | `profile.idIssueDate` | Thông tin cá nhân |
| `DcEmail` | `profile.email` | Thông tin cá nhân |
| `NoiCap` | `profile.idIssuePlace` | Thông tin cá nhân |
| `GioiTinh` | `profile.gender` | Thông tin cá nhân |
| `SoCccd` | `profile.idNumber` | Thông tin cá nhân |
| `QuocTich` | `profile.nationality` | Thông tin cá nhân |
| `DCTtru` | `profile.permanentAddress` | Thông tin cá nhân |
| `DCHtai` | `profile.currentAddress` | Thông tin cá nhân |
| `Avatar` | `profile.avatarUrl` | Thông tin cá nhân |
| `MaNhanVien` | `job.employeeID` | Công việc |
| `Level` | `job.jobLevel` | Công việc |
| `PhongBan` | `job.department` | Công việc |
| `ChucVu` | `job.jobTitle` | Công việc |
| `TrangThai` | `job.status` | Công việc |
| `NgLienHe` | `emergencyContact.name` | Liên hệ khẩn cấp |
| `SDTNgLienHe` | `emergencyContact.phone` | Liên hệ khẩn cấp |
| `QuanHe` | `emergencyContact.relationship` | Liên hệ khẩn cấp |
| `DCNgLienHe` | `emergencyContact.address` | Liên hệ khẩn cấp |
| `HocVan` | `education.degree` | Thông tin bổ sung |
| `NgoaiNgu` | `education.foreignLanguage` | Thông tin bổ sung |
| `KyNang` | `education.skills` | Thông tin bổ sung |
| `GhiChu` | `education.notes` | Thông tin bổ sung |
| `Points` | `meta.points` | Meta |

## Dữ liệu cần chuẩn hóa ngay
- `TrangThai` có giá trị chứa khoảng trắng ở đầu cần trim trước khi lưu.
- `Avatar` đang bị khai báo nhiều lần, cần giữ một giá trị duy nhất.
- `ChucVu` và `Level` nên được định nghĩa rõ để tránh chồng nghĩa.
- `employeeID` nên được quản lý trong `USERS` (user.js), không nên lưu lại trong `EMPLOYEES`.

## Lớp chuyển đổi đề xuất

### 17.3 Read adapter
- Khi đọc dữ liệu cũ, convert sang schema chuẩn mới.
- Nếu record đã là schema mới thì trả về nguyên trạng.

### 17.4 Write adapter
- Khi lưu dữ liệu từ form, chỉ ghi schema mới.
- Dữ liệu cũ chỉ dùng để migrate một lần hoặc tương thích ngắn hạn.

## Kế hoạch migrate an toàn
1. Tạo hàm normalize cho `EMPLOYEES`.
2. Khi app khởi động, đọc toàn bộ data cũ và convert.
3. Ghi lại data theo schema mới.
4. Cập nhật từng màn hình để đọc schema mới.
5. Khi tất cả màn hình đã chuyển, bỏ dần key cũ.

## Lợi ích
- Dữ liệu dễ bảo trì hơn.
- Dễ mở rộng sang hồ sơ 360 độ, hợp đồng, lương, chấm công.
- Giảm bug do trùng key hoặc đặt tên không nhất quán.
- Tách rõ dữ liệu nhân sự và dữ liệu tài khoản.

## Quy ước liên kết với user.js
- `user.js` giữ thông tin tài khoản đăng nhập và định danh chính `employeeID`.
- `EMPLOYEES` chỉ giữ dữ liệu nhân sự.
- Hai bảng dữ liệu liên kết với nhau bằng `employeeID`.
- Khi cần lấy thông tin nhân sự từ tài khoản, đọc `EMPLOYEES` theo `employeeID` tương ứng.
