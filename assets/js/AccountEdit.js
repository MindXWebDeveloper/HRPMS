const EMPLOYEES_KEY = "EMPLOYEES";
const CURRENT_USER_KEY = "CURRENT_USER";
const params = new URLSearchParams(window.location.search);
let maNV = params.get("maNV");


if (!maNV) {
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

    if (currentUser) {
        maNV = currentUser.MaNhanVien;
    }
}
const employees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || [];
const employee = employees.find(emp => emp.MaNhanVien === maNV);

document.getElementById('MaNhanVien').value = employee.MaNhanVien;        
document.getElementById('HoTen').value = employee.HoTen;
document.getElementById('NgaySinh').value = employee.NgaySinh;
document.getElementById('SoDienThoai').value = employee.SoDienThoai;
document.getElementById('NgayCap').value = employee.NgayCap;
document.getElementById('DcEmail').value = employee.DcEmail;
document.getElementById('NoiCap').value = employee.NoiCap;
document.getElementById('GioiTinh').value = employee.GioiTinh;
document.getElementById('SoCccd').value = employee.SoCccd;
document.getElementById('QuocTich').value = employee.QuocTich;
document.getElementById('Level').value = employee.Level;
document.getElementById('PhongBan').value = employee.PhongBan;
document.getElementById('TrangThai').value = employee.TrangThai;
document.getElementById('DCTtru').value = employee.DCTtru;
document.getElementById('DCHtai').value = employee.DCHtai;
document.getElementById('NgLienHe').value = employee.NgLienHe;
document.getElementById('SDTNgLienHe').value = employee.SDTNgLienHe;
document.getElementById('QuanHe').value = employee.QuanHe;
document.getElementById('DCNgLienHe').value = employee.DCNgLienHe;
document.getElementById('HocVan').value = employee.HocVan;
document.getElementById('NgoaiNgu').value = employee.NgoaiNgu;
document.getElementById('KyNang').value = employee.KyNang;
document.getElementById('GhiChu').value = employee.GhiChu;
document.getElementById('Avatar').src = employee.Avatar;

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
    "TrangThai",
    "DCTtru",
    "DCHtai",
    "NgLienHe",
    "SDTNgLienHe",
    "QuanHe",
    "DCNgLienHe",
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
const TrangThai1 = document.getElementById('TrangThai').value;
const DCTtru1 = document.getElementById('DCTtru').value;
const DCHtai1 = document.getElementById('DCHtai').value;
const NgLienHe1 = document.getElementById('NgLienHe').value;
const SDTNgLienHe1 = document.getElementById('SDTNgLienHe').value;
const QuanHe1 = document.getElementById('QuanHe').value;
const DCNgLienHe1 = document.getElementById('DCNgLienHe').value;
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
document.getElementById('Re_TrangThai').textContent = TrangThai1 || "Chưa nhập";
document.getElementById('Re_DCTtru').textContent = DCTtru1 || "Chưa nhập";
document.getElementById('Re_DCHtai').textContent = DCHtai1 || "Chưa nhập";
document.getElementById('Re_NgLienHe').textContent = NgLienHe1 || "Chưa nhập";
document.getElementById('Re_SDTNgLienHe').textContent = SDTNgLienHe1 || "Chưa nhập";
document.getElementById('Re_QuanHe').textContent = QuanHe1 || "Chưa nhập";
document.getElementById('Re_DCNgLienHe').textContent = DCNgLienHe1 || "Chưa nhập";
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
        HoTen: document.getElementById("Re_HoTen").textContent,
        NgaySinh: document.getElementById("Re_NgaySinh").textContent,
        SoDienThoai: document.getElementById("Re_SoDienThoai").textContent,
        NgayCap: document.getElementById("Re_NgayCap").textContent,
        DcEmail: document.getElementById("Re_DcEmail").textContent,
        NoiCap: document.getElementById("Re_NoiCap").textContent,
        GioiTinh: document.getElementById("Re_GioiTinh").textContent,
        SoCccd: document.getElementById("Re_SoCccd").textContent,
        QuocTich: document.getElementById("Re_QuocTich").textContent,
        Level: document.getElementById("Re_Level").textContent,
        PhongBan: document.getElementById("Re_PhongBan").textContent,
        TrangThai: document.getElementById("Re_TrangThai").textContent,
        DCTtru: document.getElementById("Re_DCTtru").textContent,
        DCHtai: document.getElementById("Re_DCHtai").textContent,
        NgLienHe: document.getElementById("Re_NgLienHe").textContent,
        SDTNgLienHe: document.getElementById("Re_SDTNgLienHe").textContent,
        QuanHe: document.getElementById("Re_QuanHe").textContent,
        DCNgLienHe: document.getElementById("Re_DCNgLienHe").textContent,
        HocVan: document.getElementById("Re_HocVan").textContent,
        NgoaiNgu: document.getElementById("Re_NgoaiNgu").textContent,
        KyNang: document.getElementById("Re_KyNang").textContent,
        GhiChu: document.getElementById("Re_GhiChu").textContent,

        Avatar: avatarUrl || employee.Avatar
    };
let employees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || [];
const index = employees.findIndex(
        emp => emp.MaNhanVien === updatedEmployee.MaNhanVien
);
employees[index] = updatedEmployee;
localStorage.setItem(EMPLOYEES_KEY,JSON.stringify(employees)
        );
    Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Cập nhật thành công!",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });   
    modal.style.display="none";
    window.location.reload();
})

