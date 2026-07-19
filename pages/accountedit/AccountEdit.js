import { findEmployeeByMaNV, updateEmployee } from "../../database/employeedata.js";

const params = new URLSearchParams(window.location.search);
const maNV = params.get("maNV");

let employee;

if (maNV) {employee = findEmployeeByMaNV(maNV)}
else {
const currentUser = JSON.parse(localStorage.getItem("CURRENT_USER"));
employee = findEmployeeByMaNV(currentUser.MaNhanVien);
}
console.log(employee);

document.getElementById('MaNhanVien').value = employee.MaNhanVien || "Chưa có thông tin nhân viên";        
document.getElementById('HoTen').value = employee.HoTen || "Chưa có thông tin nhân viên";
document.getElementById('NgaySinh').value = employee.NgaySinh || "Chưa có thông tin nhân viên";
document.getElementById('SoDienThoai').value = employee.SoDienThoai || "Chưa có thông tin nhân viên";
document.getElementById('NgayCap').value = employee.NgayCap || "Chưa có thông tin nhân viên";
document.getElementById('DcEmail').value = employee.DcEmail || "Chưa có thông tin nhân viên";
document.getElementById('NoiCap').value = employee.NoiCap || "Chưa có thông tin nhân viên";
document.getElementById('GioiTinh').value = employee.GioiTinh || "Chưa có thông tin nhân viên";
document.getElementById('SoCccd').value = employee.SoCccd || "Chưa có thông tin nhân viên";
document.getElementById('QuocTich').value = employee.QuocTich || "Chưa có thông tin nhân viên";
document.getElementById('Level').value = employee.Level || "Chưa có thông tin nhân viên";
document.getElementById('PhongBan').value = employee.PhongBan || "Chưa có thông tin nhân viên";
document.getElementById('DCTtru').value = employee.DCTtru || "Chưa có thông tin nhân viên";
document.getElementById('DCHtai').value = employee.DCHtai || "Chưa có thông tin nhân viên";
document.getElementById('NgLienHe').value = employee.NgLienHe || "Chưa có thông tin nhân viên";
document.getElementById('SDTNgLienHe').value = employee.SDTNgLienHe || "Chưa có thông tin nhân viên";
document.getElementById('QuanHe').value = employee.QuanHe || "Chưa có thông tin nhân viên";
document.getElementById('DCNgLienHe').value = employee.DCNgLienHe || "Chưa có thông tin nhân viên";
document.getElementById('TenDangNhap').value = employee.TenDangNhap || "Chưa có thông tin nhân viên";
document.getElementById('EmailDangNhap').value = employee.EmailDangNhap || "Chưa có thông tin nhân viên";
document.getElementById('HocVan').value = employee.HocVan || "Chưa có thông tin nhân viên";
document.getElementById('NgoaiNgu').value = employee.NgoaiNgu || "Chưa có thông tin nhân viên";
document.getElementById('KyNang').value = employee.KyNang || "Chưa có thông tin nhân viên";
document.getElementById('GhiChu').value = employee.GhiChu || "Chưa có thông tin nhân viên";
document.getElementById('Avatar').src = employee.Avatar || "Chưa có thông tin nhân viên";

const btnTiepTuc = document.getElementById('btnTiepTuc');
const btnHuy = document.getElementById('btnHuy');
const modal = document.getElementById('confirmationModal');
const btnBack = document.getElementById('btnBack');
const btnConfirm = document.getElementById('btnConfirm');
const avatarInput = document.getElementById('Avatar');
const uploadBtn = document.getElementById('AvatarUploadBtn');
const fieldIds = [
    "HoTen",
    "SoDienThoai",
    "NgayCap",
    "NgaySinh",
    "DcEmail",
    "NoiCap",
    "GioiTinh",
    "SoCccd",
    "QuocTich",
    "MaNhanVien",
    "Level",
    "PhongBan",
    "DCTtru",
    "DCHtai",
    "NgLienHe",
    "SDTNgLienHe",
    "QuanHe",
    "DCNgLienHe",
    "TenDangNhap",
    "EmailDangNhap",
    "MatKhauTam",
    "NhapLaiMK",
    "HocVan",
    "NgoaiNgu",
    "KyNang",
    "GhiChu"
];
btnHuy.addEventListener("click", () => {
    history.back()});

let avatarUrl ="";
let isValid = true;
const togglePasswordBtn = document.querySelector('button[aria-label="Hiện mật khẩu"]');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const passInput = document.getElementById('MatKhauTam');
            if (passInput.type === 'password') {
                passInput.type = 'text';
                this.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                    </svg>
                `;
            } else {
                passInput.type = 'password';
                this.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                `;
            }
        });
    }

const togglePasswordBtn1 = document.querySelector('button[aria-label="Hiện mật khẩu1"]');
    if (togglePasswordBtn1) {
        togglePasswordBtn1.addEventListener('click', function() {
            const passInput = document.getElementById('NhapLaiMK');
            if (passInput.type === 'password') {
                passInput.type = 'text';
                this.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                    </svg>
                `;
            } else {
                passInput.type = 'password';
                this.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                `;
            }
        });
    }

uploadBtn.addEventListener ('click',()=>
{avatarInput.click();

});

avatarInput.addEventListener('change',()=>{
    const file = avatarInput.files[0];
    if (!file) return;
    const preview = document.getElementById('AvatarPreview');
    avatarUrl = URL.createObjectURL(file);
    preview.src = avatarUrl

    preview.hidden =false;
});

const message = 'Không được để trống';

function showError(id,message) {
        const input = document.getElementById(id);
        input.classList.remove('border-slate-400');
        input.classList.add('border-red-500', 'focus:border-red-500');
        
        const container = input.closest('.relative') ? input.closest('.relative').parentNode : input.parentNode;
        
        let errorSpan = container.querySelector('.error-msg');
        if (!errorSpan) {
            errorSpan = document.createElement('span');
            errorSpan.className = 'error-msg text-xs text-rose2 mt-1 block';
            container.appendChild(errorSpan);
        }
        errorSpan.innerText = message; 
    }


function clearError(id) {
        const input = document.getElementById(id);
        input.classList.remove('border-red-500', 'focus:border-red-500');
        input.classList.add('border-slate-400');
        
        const container = input.closest('.relative') ? input.closest('.relative').parentNode : input.parentNode;
        const errorSpan = container.querySelector('.error-msg');
        if (errorSpan) {
            errorSpan.remove()}; 
        }



btnTiepTuc.addEventListener ('click',()=>
{
    isValid = true;
    for (const id of fieldIds){ 
    const element = document.getElementById(id);
  
    if (!element) continue;
    if (element.tagName === "INPUT"){
    
        if (element.value.trim() === "") {
            showError(id,message);
            isValid = false;}
    else {
        clearError(id);
    }}
    if (element.tagName === "SELECT") {
        if (element.selectedIndex === 0) {
            showError(id,message);
            isValid = false;
        } else
        {clearError(id);}
    }
}

    if (!isValid) {
        return;
    }

    

    {modal.style.display = "flex";
const HoTen1 = document.getElementById('HoTen').value; 
const SoDienThoai1 = document.getElementById('SoDienThoai').value;
const NgayCap1 = document.getElementById('NgayCap').value;
const NgaySinh1 = document.getElementById('NgaySinh').value;
const DcEmail1 = document.getElementById('DcEmail').value;
const NoiCap1 = document.getElementById('NoiCap').value;
const GioiTinh1 = document.getElementById('GioiTinh').value;
const SoCccd1 = document.getElementById('SoCccd').value;
const QuocTich1 = document.getElementById('QuocTich').value;
const MaNhanVien1 = document.getElementById('MaNhanVien').value;
const Level1 = document.getElementById('Level').value;
const PhongBan1 = document.getElementById('PhongBan').value;
const DCTtru1 = document.getElementById('DCTtru').value;
const DCHtai1 = document.getElementById('DCHtai').value;
const NgLienHe1 = document.getElementById('NgLienHe').value;
const SDTNgLienHe1 = document.getElementById('SDTNgLienHe').value;
const QuanHe1 = document.getElementById('QuanHe').value;
const DCNgLienHe1 = document.getElementById('DCNgLienHe').value;
const TenDangNhap1 = document.getElementById('TenDangNhap').value;
const EmailDangNhap1 = document.getElementById('EmailDangNhap').value;
const MatKhauTam1 = document.getElementById('MatKhauTam').value;
const NhapLaiMK1 = document.getElementById('NhapLaiMK').value;
const HocVan1 = document.getElementById('HocVan').value;
const NgoaiNgu1 = document.getElementById('NgoaiNgu').value;
const KyNang1 = document.getElementById('KyNang').value;
const GhiChu1 = document.getElementById('GhiChu').value;

document.getElementById('Re_HoTen').textContent = HoTen1 || "Chưa nhập";
document.getElementById('Re_NgaySinh').textContent = NgaySinh1 || "Chưa nhập";
document.getElementById('Re_SoDienThoai').textContent = SoDienThoai1 || "Chưa nhập";
document.getElementById('Re_NgayCap').textContent = NgayCap1 || "Chưa nhập";
document.getElementById('Re_DcEmail').textContent = DcEmail1 || "Chưa nhập";
document.getElementById('Re_NoiCap').textContent = NoiCap1 || "Chưa nhập";
document.getElementById('Re_GioiTinh').textContent = GioiTinh1 || "Chưa nhập";
document.getElementById('Re_SoCccd').textContent = SoCccd1 || "Chưa nhập";
document.getElementById('Re_QuocTich').textContent = QuocTich1 || "Chưa nhập";
document.getElementById('Re_MaNhanVien').textContent = MaNhanVien1 || "Chưa nhập";
document.getElementById('Re_Level').textContent = Level1 || "Chưa nhập";
document.getElementById('Re_PhongBan').textContent = PhongBan1 || "Chưa nhập";
document.getElementById('Re_DCTtru').textContent = DCTtru1 || "Chưa nhập";
document.getElementById('Re_DCHtai').textContent = DCHtai1 || "Chưa nhập";
document.getElementById('Re_NgLienHe').textContent = NgLienHe1 || "Chưa nhập";
document.getElementById('Re_SDTNgLienHe').textContent = SDTNgLienHe1 || "Chưa nhập";
document.getElementById('Re_QuanHe').textContent = QuanHe1 || "Chưa nhập";
document.getElementById('Re_DCNgLienHe').textContent = DCNgLienHe1 || "Chưa nhập";
document.getElementById('Re_TenDangNhap').textContent = TenDangNhap1 || "Chưa nhập";
document.getElementById('Re_EmailDangNhap').textContent = EmailDangNhap1 || "Chưa nhập";
document.getElementById('Re_MatKhauTam').textContent = MatKhauTam1 || "Chưa nhập";
document.getElementById('Re_NhapLaiMK').textContent = NhapLaiMK1 || "Chưa nhập";
document.getElementById('Re_HocVan').textContent = HocVan1 || "Chưa nhập";
document.getElementById('Re_NgoaiNgu').textContent = NgoaiNgu1 || "Chưa nhập";
document.getElementById('Re_KyNang').textContent = KyNang1 || "Chưa nhập";
document.getElementById('Re_GhiChu').textContent = GhiChu1 || "Chưa nhập";
document.getElementById('Re_Avatar').src = avatarUrl || "Chưa có avatar";

}
});

btnBack.addEventListener('click',()=>{
    isValid = true;
    modal.style.display= "none";});

btnConfirm.addEventListener('click',() =>{
    const updatedEmployee ={
        ...employee,
        HoTen: document.getElementById("HoTen").value,
        NgaySinh: document.getElementById("NgaySinh").value,
        SoDienThoai: document.getElementById("SoDienThoai").value,
        NgayCap: document.getElementById("NgayCap").value,
        DcEmail: document.getElementById("DcEmail").value,
        NoiCap: document.getElementById("NoiCap").value,
        GioiTinh: document.getElementById("GioiTinh").value,
        SoCccd: document.getElementById("SoCccd").value,
        QuocTich: document.getElementById("QuocTich").value,
        Level: document.getElementById("Level").value,
        PhongBan: document.getElementById("PhongBan").value,
        DCTtru: document.getElementById("DCTtru").value,
        DCHtai: document.getElementById("DCHtai").value,
        NgLienHe: document.getElementById("NgLienHe").value,
        SDTNgLienHe: document.getElementById("SDTNgLienHe").value,
        QuanHe: document.getElementById("QuanHe").value,
        DCNgLienHe: document.getElementById("DCNgLienHe").value,
        TenDangNhap: document.getElementById("TenDangNhap").value,
        EmailDangNhap: document.getElementById("EmailDangNhap").value,
        HocVan: document.getElementById("HocVan").value,
        NgoaiNgu: document.getElementById("NgoaiNgu").value,
        KyNang: document.getElementById("KyNang").value,
        GhiChu: document.getElementById("GhiChu").value,

        Avatar: avatarUrl || employee.Avatar
    };
    updateEmployee(updatedEmployee);
    alert("Cập nhật thành công!");    
    modal.style.display="none";
})

console.log(employee);