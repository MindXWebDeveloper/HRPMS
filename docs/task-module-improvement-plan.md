# Kế Hoạch Nâng Cấp Module Task

## Mục tiêu
Nâng module task từ mức demo sang mức dùng được thực tế cho quản lý dự án nội bộ.

## 1) Các mục cần sửa

### 1.1 Dữ liệu và schema (database)
- Chuẩn hóa schema task trong `database/task.js`:
  - `id`, `projectId`, `phaseId`, `title`, `description`
  - `assigneeCode`, `assigneeName`
  - `priority` (`high|medium|low`)
  - `status` (`todo|in_progress|blocked|done`)
  - `startDate`, `dueDate`, `completedAt`
  - `estimateHours`, `actualHours`
  - `tags` (array)
  - `dependencies` (array taskId)
  - `checklist` (array item)
  - `attachments` (array file metadata)
  - `createdBy`, `updatedBy`, `createdAt`, `updatedAt`
- Bổ sung normalize/migrate dữ liệu cũ để không vỡ dữ liệu localStorage hiện có.
- Bổ sung rule validate:
  - `title` bắt buộc
  - `dueDate >= startDate`
  - `done` thì bắt buộc `completedAt`
  - không cho `done` nếu còn dependency chưa done (nếu bật rule)

### 1.2 Quan hệ project-task-phase
- Đồng bộ `task.js` với `projet_task.js` và `project_phase.js`:
  - Đảm bảo xóa task sẽ gỡ mapping ở bảng liên kết.
  - Đảm bảo đổi phase sẽ cập nhật mapping phase.
- Tái tính progress theo phase và project dựa trên `status`, không chỉ theo số lượng thô.

### 1.3 Logic nghiệp vụ trong UI
- Chuẩn hóa thao tác CRUD task trong `assets/js/projectDetailLayout.js`:
  - Tạo/sửa/xóa có toast rõ ràng.
  - Bảo toàn trạng thái mở/đóng phase khi rerender.
- Bổ sung điều hướng task:
  - Click vào tên task trong danh sách phase để mở trang chi tiết task.
  - Nút `View` cũng chuyển đến cùng trang chi tiết task.
  - Chuẩn query param điều hướng: `taskId`, `projectId` (nếu cần thêm context).
- Bổ sung filter/sort:
  - Theo assignee, priority, status, overdue, keyword.
- Bổ sung pagination hoặc virtual list khi task nhiều.

### 1.4 Quyền và phân vai
- Employee:
  - Chỉ xem task của mình (hoặc task được phân quyền).
  - Chỉ sửa trạng thái/task fields được phép.
- Manager/Admin:
  - Full CRUD task/phase.
  - Có thể đổi assignee và deadline.

### 1.5 UX và chất lượng dữ liệu
- Bổ sung empty state rõ ràng cho:
  - Chưa có phase
  - Chưa có task
  - Không có kết quả tìm kiếm
- Bổ sung loading state cho render danh sách.
- Bổ sung confirm dialog chuẩn cho xóa task/phase.

---

## 2) Nên tạo giao diện như thế nào

## 2.1 Bố cục tổng thể trang chi tiết dự án
- Header dự án (không đổi nhiều): thông tin chính + action chính.
- Content 2 cột desktop:
  - Trái: Danh sách nhân viên dự án.
  - Phải: Danh sách phase + task.
- Mỗi cột có scroll nội bộ độc lập khi nội dung dài.

## 2.2 Khu vực task theo phase (Accordion)
- Mỗi phase là 1 card có:
  - Tên phase, số task, progress bar, nút expand/collapse.
- Click header phase để ẩn/hiện danh sách task.
- Mặc định mở phase đầu tiên hoặc giữ state lần trước.

## 2.3 Toolbar task
- Đặt phía trên danh sách task:
  - Ô tìm kiếm task
  - Filter status/priority/assignee
  - Sort (mới nhất, deadline gần nhất, ưu tiên cao)
  - Nút `Tạo task`
- Trên mobile: filter/sort thu gọn dạng dropdown hoặc modal.

## 2.4 Bảng task
- Cột đề xuất:
  - Task
  - Assignee
  - Priority
  - Status
  - Due date
  - Progress mini/checklist
  - Action
- Status/Priority hiển thị badge màu nhất quán.
- Action theo role: view/edit/delete.
- Tương tác điều hướng:
  - Tên task là link/clickable để mở trang Task Detail.
  - Nút `View` điều hướng đến cùng trang Task Detail để đồng nhất trải nghiệm.

## 2.5 Modal tạo/sửa task
- Chia nhóm field:
  - Thông tin cơ bản: title, description, phase
  - Phụ trách: assignee
  - Tiến độ: status, checklist, progress
  - Kế hoạch: startDate, dueDate, estimateHours
  - Thông tin mở rộng: tags, attachments, dependencies
- Footer modal:
  - `Hủy`
  - `Lưu` (primary)

## 2.6 Trang Task Detail mới (bắt buộc)
- Tạo trang mới, ví dụ: `pages/projects-management/task-detail.html`.
- Nguồn vào trang:
  - Từ click tên task trong danh sách phase.
  - Từ click nút `View` của task.
- Nội dung trang Task Detail đề xuất:
  - Header: tên task, breadcrumb quay về dự án/phase.
  - Tổng quan: trạng thái, ưu tiên, assignee, progress.
  - Kế hoạch: start date, due date, estimate/actual hours.
  - Mô tả chi tiết và checklist.
  - Timeline thay đổi (activity log).
  - Comment và attachment.
- Hành động chính:
  - `Chỉnh sửa`
  - `Cập nhật trạng thái`
  - `Quay lại dự án`

---

## 3) Lộ trình triển khai đề xuất
- Giai đoạn 1 (Core): chuẩn hóa schema + CRUD + validation cơ bản.
- Giai đoạn 2 (UX): accordion phase, filter/sort, điều hướng sang Task Detail.
- Giai đoạn 3 (Advanced): checklist, dependency, activity log, attachment.

## 4) Tiêu chí hoàn thành
- Không lỗi dữ liệu cũ sau migrate.
- CRUD task hoạt động đầy đủ theo role.
- Trang desktop không scroll dọc toàn trang, chỉ scroll nội bộ theo block.
- Có filter/sort cơ bản và accordion phase ổn định.
- UI đồng bộ style với hệ thống hiện tại.

## 5) Cập nhật bổ sung (2026-08-12)
- Nâng cấp trang `Task Detail` từ chế độ xem + cập nhật trạng thái đơn lẻ sang chế độ chỉnh sửa đầy đủ.
- Trường bắt buộc có thể chỉnh sửa trực tiếp trên `Task Detail`:
  - `title`
  - `assignee`
  - `priority`
  - `dueDate`
  - `description`
- Giữ khả năng cập nhật `status` ngay trên cùng form để đồng bộ tiến độ.
- Loại bỏ luồng `View task` dạng modal trong trang chi tiết dự án để tránh trùng chức năng với trang `Task Detail` mới.

## 6) Nhật ký triển khai thực tế (đã làm)

### 6.1 Điều hướng và kiến trúc màn hình
- Đã chuyển luồng `View` task trong trang chi tiết dự án sang điều hướng trực tiếp đến trang `Task Detail`.
- Đã loại bỏ modal `View task` cũ trong `project-detail` để tránh trùng luồng chỉnh sửa.

### 6.2 Nâng cấp Task Detail thành form chỉnh sửa đầy đủ
- Đã triển khai form chỉnh sửa trực tiếp cho task với các trường:
  - `title`
  - `assignee`
  - `priority`
  - `dueDate`
  - `description`
  - `status`
- Đã bổ sung validate cơ bản:
  - không cho `title` rỗng
  - `dueDate` không sớm hơn `startDate`
- Đã lưu dữ liệu bằng `updateTask(...)` và hiển thị toast phản hồi sau khi lưu.

### 6.3 Checklist kiểu Jira (Subtask)
- Đã chuyển khu vực checklist thành quản lý `Subtask`:
  - hiển thị danh sách subtask
  - tạo subtask mới
  - sửa subtask
  - xóa subtask
- Mỗi subtask có cấu trúc tương tự task:
  - `title`, `assigneeCode`, `assigneeName`, `priority`, `status`, `dueDate`, `description`, `createdAt`, `updatedAt`, `completedAt`
- Dữ liệu subtask được lưu trong trường `checklist` của task cha.

### 6.4 Tương thích dữ liệu cũ
- Đã thêm normalize cho checklist cũ (dạng string/object đơn giản) sang object subtask để không vỡ dữ liệu localStorage hiện có.
