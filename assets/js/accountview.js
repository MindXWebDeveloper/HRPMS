import { initEmployees, getAllEmployees } from "../../database/employeedata.js";
const EMPLOYEES_KEY ="EMPLOYEES";
const CURRENT_USER_KEY = "CURRENT_USER";
const params = new URLSearchParams(window.location.search);

document.addEventListener("DOMContentLoaded", () => {
    initEmployees();
    let maNV = params.get("maNV");
    if (!maNV) {
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

    if (currentUser) {
    maNV = currentUser.MaNhanVien;
    }}
    const employees = getAllEmployees();
    const employee = employees.find(emp => emp.MaNhanVien === maNV);

    document.getElementById('Re_MaNhanVien').textContent = employee.MaNhanVien;        
    document.getElementById('Re_HoTen').textContent = employee.HoTen;
    document.getElementById('Re_NgaySinh').textContent = employee.NgaySinh;
    document.getElementById('Re_SoDienThoai').textContent = employee.SoDienThoai;
    document.getElementById('Re_NgayCap').textContent = employee.NgayCap;
    document.getElementById('Re_DcEmail').textContent = employee.DcEmail;
    document.getElementById('Re_NoiCap').textContent = employee.NoiCap;
    document.getElementById('Re_GioiTinh').textContent = employee.GioiTinh;
    document.getElementById('Re_SoCccd').textContent = employee.SoCccd;
    document.getElementById('Re_QuocTich').textContent = employee.QuocTich;
    document.getElementById('Re_ChucVu').textContent = employee.Level;
    document.getElementById('Re_PhongBan').textContent = employee.PhongBan;
    document.getElementById('Re_TrangThai').textContent = employee.TrangThai;
    document.getElementById('Re_DCTtru').textContent = employee.DCTtru;
    document.getElementById('Re_DCHtai').textContent = employee.DCHtai;
    document.getElementById('Re_NgLienHe').textContent = employee.NgLienHe;
    document.getElementById('Re_SDTNgLienHe').textContent = employee.SDTNgLienHe;
    document.getElementById('Re_QuanHe').textContent = employee.QuanHe;
    document.getElementById('Re_DCNgLienHe').textContent = employee.DCNgLienHe;
    document.getElementById('Re_HocVan').textContent = employee.HocVan;
    document.getElementById('Re_NgoaiNgu').textContent = employee.NgoaiNgu;
    document.getElementById('Re_KyNang').textContent = employee.KyNang;
    document.getElementById('Re_GhiChu').textContent = employee.GhiChu;
    document.getElementById('Re_Avatar').src = employee.Avatar;
})    
    
document.getElementById("btnBack").addEventListener("click", () => {
    history.back()});