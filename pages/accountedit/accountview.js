import { findEmployeeByMaNV } from "../../database/employeedata.js";

const params = new URLSearchParams(window.location.search);
const maNV = params.get("maNV");

let employee;

if (maNV) {employee = findEmployeeByMaNV(maNV)}
else {
const currentUser = JSON.parse(localStorage.getItem("CURRENT_USER"));
employee = findEmployeeByMaNV(currentUser.MaNhanVien);
}
console.log(employee);
document.getElementById('Re_MaNhanVien').textContent = employee.MaNhanVien || "Chưa có thông tin nhân viên";        
document.getElementById('Re_HoTen').textContent = employee.HoTen || "Chưa có thông tin nhân viên";
document.getElementById('Re_NgaySinh').textContent = employee.NgaySinh || "Chưa có thông tin nhân viên";
document.getElementById('Re_SoDienThoai').textContent = employee.SoDienThoai || "Chưa có thông tin nhân viên";
document.getElementById('Re_NgayCap').textContent = employee.NgayCap || "Chưa có thông tin nhân viên";
document.getElementById('Re_DcEmail').textContent = employee.DcEmail || "Chưa có thông tin nhân viên";
document.getElementById('Re_NoiCap').textContent = employee.NoiCap || "Chưa có thông tin nhân viên";
document.getElementById('Re_GioiTinh').textContent = employee.GioiTinh || "Chưa có thông tin nhân viên";
document.getElementById('Re_SoCccd').textContent = employee.SoCccd || "Chưa có thông tin nhân viên";
document.getElementById('Re_QuocTich').textContent = employee.QuocTich || "Chưa có thông tin nhân viên";
document.getElementById('Re_Level').textContent = employee.Level || "Chưa có thông tin nhân viên";
document.getElementById('Re_PhongBan').textContent = employee.PhongBan || "Chưa có thông tin nhân viên";
document.getElementById('Re_DCTtru').textContent = employee.DCTtru || "Chưa có thông tin nhân viên";
document.getElementById('Re_DCHtai').textContent = employee.DCHtai || "Chưa có thông tin nhân viên";
document.getElementById('Re_NgLienHe').textContent = employee.NgLienHe || "Chưa có thông tin nhân viên";
document.getElementById('Re_SDTNgLienHe').textContent = employee.SDTNgLienHe || "Chưa có thông tin nhân viên";
document.getElementById('Re_QuanHe').textContent = employee.QuanHe || "Chưa có thông tin nhân viên";
document.getElementById('Re_DCNgLienHe').textContent = employee.DCNgLienHe || "Chưa có thông tin nhân viên";
document.getElementById('Re_TenDangNhap').textContent = employee.TenDangNhap || "Chưa có thông tin nhân viên";
document.getElementById('Re_EmailDangNhap').textContent = employee.EmailDangNhap || "Chưa có thông tin nhân viên";
document.getElementById('Re_HocVan').textContent = employee.HocVan || "Chưa có thông tin nhân viên";
document.getElementById('Re_NgoaiNgu').textContent = employee.NgoaiNgu || "Chưa có thông tin nhân viên";
document.getElementById('Re_KyNang').textContent = employee.KyNang || "Chưa có thông tin nhân viên";
document.getElementById('Re_GhiChu').textContent = employee.GhiChu || "Chưa có thông tin nhân viên";
document.getElementById('Re_Avatar').src = employee.Avatar || "Chưa có thông tin nhân viên";
    
document.getElementById("btnBack").addEventListener("click", () => {
    history.back()});