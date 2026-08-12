import { getAllEmployees, getEmployeeAvatarUrl, getEmployeeDepartment, getEmployeeEducation, getEmployeeEmergencyContact, getEmployeeFullName, getEmployeeID, getEmployeeJobLevel, getEmployeeJobTitle, getEmployeeProfile, getEmployeeStatus, getEmployeeStatusLabel, initEmployees, updateEmployee } from "../../database/employeedata.js";

const CURRENT_USER_KEY = "CURRENT_USER";
const params = new URLSearchParams(window.location.search);
let employeeID = params.get("employeeID");


if (!employeeID) {
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

    if (currentUser) {
        employeeID = currentUser.employeeID;
    }
}
initEmployees();
const employees = getAllEmployees();
const employee = employees.find(emp => getEmployeeID(emp) === employeeID);

if (!employee) {
    throw new Error("Không tìm thấy nhân viên để chỉnh sửa.");
}

document.getElementById('employeeID').value = getEmployeeID(employee);
const profile = getEmployeeProfile(employee);
const emergencyContact = getEmployeeEmergencyContact(employee);
const education = getEmployeeEducation(employee);

document.getElementById('HoTen').value = getEmployeeFullName(employee);
document.getElementById('NgaySinh').value = profile.dob;
document.getElementById('SoDienThoai').value = profile.phone;
document.getElementById('NgayCap').value = profile.idIssueDate;
document.getElementById('DcEmail').value = profile.email;
document.getElementById('NoiCap').value = profile.idIssuePlace;
document.getElementById('GioiTinh').value = profile.gender;
document.getElementById('SoCccd').value = profile.idNumber;
document.getElementById('QuocTich').value = profile.nationality;
document.getElementById('Level').value = getEmployeeJobLevel(employee);
document.getElementById('PhongBan').value = getEmployeeDepartment(employee);
document.getElementById('ChucVu').value = getEmployeeJobTitle(employee) || "";
document.getElementById('TrangThai').value = getEmployeeStatus(employee) === "active" ? "Hoạt động" : "Ngưng hoạt động";
document.getElementById('DCTtru').value = profile.permanentAddress;
document.getElementById('DCHtai').value = profile.currentAddress;
document.getElementById('NgLienHe').value = emergencyContact.name;
document.getElementById('SDTNgLienHe').value = emergencyContact.phone;
document.getElementById('QuanHe').value = emergencyContact.relationship;
document.getElementById('DCNgLienHe').value = emergencyContact.address;
document.getElementById('HocVan').value = education.degree;
document.getElementById('NgoaiNgu').value = education.foreignLanguage;
document.getElementById('KyNang').value = Array.isArray(education.skills) ? education.skills.join(", ") : "";
document.getElementById('GhiChu').value = education.notes;
document.getElementById('AvatarPreview').src = getEmployeeAvatarUrl(employee);
const btnTiepTuc = document.getElementById('btnTiepTuc');
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
    "employeeID",
    "Level",
    "PhongBan",
    "ChucVu",
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
let avatarUrl ="";
let isValid = true;

function getFormEmployeePayload() {
    const currentAvatar = avatarUrl || getEmployeeAvatarUrl(employee);
    const skillsValue = document.getElementById('KyNang').value.trim();

    return {
        id: employee.id,
        job: {
            employeeID: document.getElementById('employeeID').value.trim(),
            jobLevel: document.getElementById('Level').value,
            department: document.getElementById('PhongBan').value,
            jobTitle: document.getElementById('ChucVu').value,
            status: document.getElementById('TrangThai').value === "Hoạt động" ? "active" : "inactive",
        },
        profile: {
            fullName: document.getElementById('HoTen').value,
            dob: document.getElementById('NgaySinh').value,
            phone: document.getElementById('SoDienThoai').value,
            idIssueDate: document.getElementById('NgayCap').value,
            email: document.getElementById('DcEmail').value,
            idIssuePlace: document.getElementById('NoiCap').value,
            gender: document.getElementById('GioiTinh').value,
            idNumber: document.getElementById('SoCccd').value,
            nationality: document.getElementById('QuocTich').value,
            permanentAddress: document.getElementById('DCTtru').value,
            currentAddress: document.getElementById('DCHtai').value,
            avatarUrl: currentAvatar,
        },
        emergencyContact: {
            name: document.getElementById('NgLienHe').value,
            phone: document.getElementById('SDTNgLienHe').value,
            relationship: document.getElementById('QuanHe').value,
            address: document.getElementById('DCNgLienHe').value,
        },
        education: {
            degree: document.getElementById('HocVan').value,
            foreignLanguage: document.getElementById('NgoaiNgu').value,
            skills: skillsValue ? skillsValue.split(',').map((item) => item.trim()).filter(Boolean) : [],
            notes: document.getElementById('GhiChu').value,
        },
        meta: {
            updatedAt: new Date().toISOString(),
        },
    };
}
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

function validateForm() {
    let isValid = true;
    document.querySelectorAll(".error-msg").forEach(el => el.remove());

    document.querySelectorAll("input").forEach(input => {
        input.classList.remove("border-red-500", "focus:border-red-500");
        input.classList.add("border-slate-400");
    });

    const phone = document.getElementById("SoDienThoai").value.trim();
    if (!/^\d{10}$/.test(phone)) {
        showError("SoDienThoai", "Số điện thoại phải gồm đúng 10 chữ số.");
        isValid = false;
    }

    const cccd = document.getElementById("SoCccd").value.trim();
    if (!/^\d{12}$/.test(cccd)) {
        showError("SoCccd", "CCCD phải gồm đúng 12 chữ số.");
        isValid = false;
    }

    const email = document.getElementById("DcEmail").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError("DcEmail", "Email không đúng định dạng.");
        isValid = false;
    }
    const phoneNLH = document.getElementById("SDTNgLienHe").value.trim();
    if (!/^\d{10}$/.test(phoneNLH)) {
        showError("SDTNgLienHe", "Số điện thoại phải gồm đúng 10 chữ số.");
        isValid = false;
    }

    return isValid;
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
    if (!validateForm()) return;
    
    modal.style.display = "flex";
});

btnBack.addEventListener('click',()=>{
    isValid = true;
    modal.style.display= "none";});

btnConfirm.addEventListener('click',() =>{
    updateEmployee(getFormEmployeePayload());
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

