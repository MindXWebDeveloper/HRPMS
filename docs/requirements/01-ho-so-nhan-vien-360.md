# 01. Hồ sơ nhân viên 360 độ

## Mục tiêu
Xây dựng một hồ sơ nhân sự đầy đủ để HR, quản lý và lãnh đạo có thể xem được toàn bộ thông tin cốt lõi về một nhân viên tại một nơi.

## Nội dung cần có
- Thông tin cá nhân: họ tên, ngày sinh, giới tính, email, số điện thoại, CCCD, quốc tịch, địa chỉ.
- Thông tin công việc: mã nhân viên, phòng ban, chức vụ, cấp bậc, quản lý trực tiếp, ngày vào làm, trạng thái làm việc.
- Ảnh đại diện.
- Thông tin liên hệ khẩn cấp.
- Thông tin gia đình và người phụ thuộc.
- Trình độ học vấn, ngoại ngữ, kỹ năng, chứng chỉ.
- Ghi chú nội bộ.

## Cần có thêm trong bản 360 độ hoàn chỉnh
- Lịch sử thay đổi hồ sơ.
- Lịch sử công tác.
- Hợp đồng lao động.
- Tài liệu đính kèm.
- Lương thưởng cơ bản.
- Chấm công và nghỉ phép.
- Đánh giá hiệu suất.
- Tài sản được cấp phát.

## Kỳ vọng hiển thị
- Thông tin được chia tab rõ ràng.
- Các trường quan trọng phải dễ tìm, dễ sửa và có validate.
- Có lịch sử chỉnh sửa để truy vết.

## Đối tượng sử dụng
- Nhân sự/HR: xem, chỉnh sửa thông tin nhân viên và hồ sơ liên quan.
- Quản lý trực tiếp: theo dõi thông tin, đánh giá và tài sản cấp phát cho nhân viên trong bộ phận.
- Lãnh đạo cao cấp: truy cập tóm tắt hồ sơ, lịch sử công tác và đánh giá hiệu suất.
- Nhân viên: xem được hồ sơ cá nhân, lịch sử thay đổi và các tài liệu đính kèm của mình.

## Phạm vi yêu cầu chức năng
- Hiển thị thông tin cá nhân, công việc và liên hệ trong các tab riêng biệt.
- Cho phép cập nhật thông tin cơ bản và lưu lại lịch sử thay đổi.
- Quản lý hình ảnh đại diện, tài liệu đính kèm và hợp đồng lao động.
- Liên kết với dữ liệu chấm công, nghỉ phép, lương thưởng và tài sản được cấp.
- Hỗ trợ tra cứu nhanh theo mã nhân viên, tên hoặc phòng ban.
- Chế độ phân quyền: chỉ HR và quản lý được phép sửa, nhân viên chỉ được phép xem hồ sơ của chính mình.

## Yêu cầu chức năng chi tiết
### 1. Hồ sơ cá nhân
- Hiển thị ảnh đại diện và thông tin cơ bản: họ tên, ngày sinh, giới tính, email, số điện thoại, CCCD, quốc tịch, địa chỉ.
- Trường dữ liệu phân loại rõ ràng, có label và tooltip nếu cần.
- Có nút sửa riêng cho từng nhóm thông tin hoặc toàn bộ hồ sơ.

### 2. Thông tin công việc
- Hiển thị mã nhân viên, phòng ban, chức vụ, cấp bậc, quản lý trực tiếp, ngày vào làm, trạng thái làm việc.
- Cho phép upload hợp đồng lao động và các tài liệu liên quan.
- Tích hợp dữ liệu đơn vị/đơn vị công tác để hiển thị tên phòng ban và quản lý trực tiếp.

### 3. Lịch sử hồ sơ và thay đổi
- Mỗi lần cập nhật thông tin phải tạo bản ghi lịch sử gồm: trường thay đổi, giá trị cũ, giá trị mới, người thực hiện, thời điểm.
- Cho phép lọc lịch sử theo mốc thời gian và loại thay đổi.
- Hiển thị lịch sử công tác riêng biệt khi nhân viên chuyển bộ phận, thăng chức, hoặc thay đổi trạng thái.

### 4. Tài liệu đính kèm và hợp đồng
- Cho phép upload và xem các file liên quan: hợp đồng lao động, bổ nhiệm, bằng cấp, chứng chỉ.
- Hiển thị danh sách file theo loại và ngày tải lên.
- Đảm bảo truy cập chỉ cho người có quyền.

### 5. Đánh giá hiệu suất
- Tích hợp các biên bản đánh giá, điểm đánh giá, nhận xét và kết luận.
- Hiển thị lịch sử đánh giá theo chu kỳ định kỳ.
- Cho phép HR hoặc quản lý upload file đánh giá.

### 6. Tài sản cấp phát
- Hiển thị danh sách tài sản công ty cấp cho nhân viên: laptop, điện thoại, thẻ, v.v.
- Mỗi tài sản có mã, ngày cấp, trạng thái sử dụng và ghi chú.

### 7. Chấm công và nghỉ phép
- Hiển thị tổng số ngày công, ngày nghỉ phép, phép chưa sử dụng.
- Cho phép xem chi tiết theo tháng hoặc kỳ báo cáo.
- Liên kết đến hệ thống chấm công để cập nhật số liệu thực tế.

## Yêu cầu dữ liệu và xác thực
- Các trường bắt buộc: họ tên, mã nhân viên, phòng ban, chức vụ, trạng thái làm việc.
- Định dạng bắt buộc: email, số điện thoại, ngày tháng.
- Giá trị quyền truy cập và trạng thái phải là danh sách cố định.
- Mỗi hồ sơ phải có ID duy nhất và thời điểm tạo/cập nhật.

## Yêu cầu phi chức năng
- Bảo mật dữ liệu: mã hóa khi cần, phân quyền truy cập theo vai trò.
- Thời gian phản hồi nhanh: tải trang không quá 2 giây với số lượng hồ sơ vừa và lớn.
- Tính sẵn sàng: hỗ trợ xem trên desktop và mobile.
- Khả năng mở rộng: dễ bổ sung thông tin mới như bằng cấp, kỹ năng, đào tạo.
- Audit: mọi thao tác sửa/hủy bỏ phải được ghi lại.

## Tiêu chí nghiệm thu
- Nhân viên có thể xem đầy đủ hồ sơ 360 độ.
- HR/Quản lý có thể sửa và lưu thay đổi với lịch sử truy vết.
- Tài liệu đính kèm và hợp đồng được quản lý đúng phân quyền.
- Mã nhân viên, phòng ban và trạng thái hiển thị chính xác.
- Tìm kiếm và lọc hồ sơ theo mã, tên, phòng ban hoạt động.

## Giao diện (UI)
- Trang hồ sơ nhân viên chia thành các tab: Thông tin cá nhân, Thông tin công việc, Hồ sơ, Lịch sử, Tài sản và Tài liệu.
- Mỗi tab có bố cục dạng card hoặc form rõ ràng, các nhóm trường dữ liệu được phân tách bằng tiêu đề.
- Thanh tìm kiếm và bộ lọc được đặt ở đầu trang hồ sơ danh sách.
- Nút hành động rõ ràng: Sửa, Lưu, Hủy, Upload tài liệu, Thêm tài sản, Xem lịch sử.
- Sử dụng indicator trạng thái làm việc trực quan: màu sắc, nhãn, icon.
- Khi mở chế độ sửa, các trường được chuyển thành input edit inline hoặc modal/pop-up để cập nhật.
- Hiển thị breadcrumb hoặc tiêu đề phụ để người dùng biết đang ở trong hồ sơ nhân viên nào.
- Trên mobile, giao diện cuộn dọc với các nhóm thông tin thu gọn vào accordion để tiết kiệm không gian.

## Luồng nghiệp vụ
### 1. Xem hồ sơ nhân viên
1. Người dùng truy cập trang danh sách nhân viên hoặc tìm kiếm theo mã/tên/phòng ban.
2. Chọn nhân viên cần xem, hệ thống chuyển tới trang hồ sơ 360 độ.
3. Hệ thống hiển thị toàn bộ thông tin: cá nhân, công việc, lịch sử, tài sản và tài liệu.
4. Nếu người dùng không có quyền sửa, chỉ hiển thị chế độ xem.

### 2. Sửa thông tin nhân viên
1. Người dùng có quyền HR hoặc quản lý bấm nút "Sửa".
2. Hệ thống chuyển đổi các trường sang chế độ edit.
3. Người dùng cập nhật thông tin cần thiết.
4. Khi bấm "Lưu", hệ thống xác thực dữ liệu (email, số điện thoại, ngày tháng, trường bắt buộc).
5. Nếu hợp lệ, hệ thống lưu thay đổi và tạo bản ghi lịch sử.
6. Nếu lỗi, hiển thị cảnh báo và giữ lại giá trị người dùng vừa nhập.

### 3. Upload tài liệu và hợp đồng
1. Người dùng bấm nút "Thêm tài liệu" hoặc "Upload hợp đồng".
2. Chọn file và nhập mô tả, loại tài liệu.
3. Hệ thống kiểm tra quyền hạn và định dạng file.
4. File được lưu và hiển thị trong danh sách tài liệu đính kèm.
5. Người dùng có quyền có thể tải xuống hoặc xóa file.

### 4. Theo dõi lịch sử thay đổi
1. Khi hồ sơ được cập nhật, tạo bản ghi lịch sử chứa: người sửa, ngày giờ, trường thay đổi, giá trị cũ và giá trị mới.
2. Người dùng có quyền xem lịch sử trong tab Lịch sử.
3. Có bộ lọc theo loại thay đổi, khoảng thời gian và người thực hiện.

### 5. Quản lý tài sản cấp phát
1. Truy cập tab Tài sản để xem danh sách tài sản nhân viên đang sử dụng.
2. Mỗi dòng hiển thị: tên tài sản, mã, ngày cấp, trạng thái và ghi chú.
3. Quản lý có thể cập nhật trạng thái tài sản hoặc cấp mới tài sản.

### 6. Phân quyền
- HR: xem, sửa toàn bộ dữ liệu hồ sơ, quản lý tài liệu, xem lịch sử, quản lý tài sản.
- Quản lý trực tiếp: xem hồ sơ nhân viên trong nhóm, cập nhật thông tin công việc và đánh giá.
- Nhân viên: xem hồ sơ của chính mình, xem lịch sử và tài liệu cá nhân.
- Người dùng không có quyền: chỉ được truy cập trang báo lỗi hoặc bị chặn.
