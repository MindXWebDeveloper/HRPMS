import { updateEmployee } from "./employeedata.js";

function RegisterEmployee() {

    const employee = {
        job: {
            employeeID: document.getElementById("Re_employeeID").textContent,
            jobLevel: document.getElementById("Re_Level").textContent,
            department: document.getElementById("Re_PhongBan").textContent,
            jobTitle: document.getElementById("Re_Level").textContent,
            status: "active",
        },
        profile: {
            fullName: document.getElementById("Re_HoTen").textContent,
            dob: document.getElementById("Re_NgaySinh").textContent,
            phone: document.getElementById("Re_SoDienThoai").textContent,
            idIssueDate: document.getElementById("Re_NgayCap").textContent,
            email: document.getElementById("Re_DcEmail").textContent,
            idIssuePlace: document.getElementById("Re_NoiCap").textContent,
            gender: document.getElementById("Re_GioiTinh").textContent,
            idNumber: document.getElementById("Re_SoCccd").textContent,
            nationality: document.getElementById("Re_QuocTich").textContent,
            permanentAddress: document.getElementById("Re_DCTtru").textContent,
            currentAddress: document.getElementById("Re_DCHtai").textContent,
            avatarUrl: document.getElementById("Re_Avatar").src,
        },
        emergencyContact: {
            name: document.getElementById("Re_NgLienHe").textContent,
            phone: document.getElementById("Re_SDTNgLienHe").textContent,
            relationship: document.getElementById("Re_QuanHe").textContent,
            address: document.getElementById("Re_DCNgLienHe").textContent,
        },
        education: {
            degree: document.getElementById("Re_HocVan").textContent,
            foreignLanguage: document.getElementById("Re_NgoaiNgu").textContent,
            skills: document.getElementById("Re_KyNang").textContent,
            notes: document.getElementById("Re_GhiChu").textContent,
        },
        meta: {
            points: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    };

    updateEmployee(employee);
    alert("Đăng ký nhân viên thành công!");
}