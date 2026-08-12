import {
    findEmployeeByEmployeeID,
    getAllEmployees,
    getEmployeeAvatarUrl,
    getEmployeeDepartment,
    getEmployeeEducation,
    getEmployeeEmergencyContact,
    getEmployeeFullName,
    getEmployeeID,
    getEmployeeJobLevel,
    getEmployeeJobTitle,
    getEmployeeProfile,
    getEmployeeStatusLabel,
    initEmployees,
} from "../../database/employeedata.js";

const CURRENT_USER_KEY = "CURRENT_USER";
const params = new URLSearchParams(window.location.search);

function setTextContent(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value ?? "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initEmployees();

    const requestedEmployeeID = params.get("employeeID");
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
    const employeeID = requestedEmployeeID || currentUser?.employeeID || "";
    const employee = getAllEmployees().find((item) => getEmployeeID(item) === employeeID) || findEmployeeByEmployeeID(employeeID);

    if (!employee) {
        return;
    }

    const profile = getEmployeeProfile(employee);
    const emergencyContact = getEmployeeEmergencyContact(employee);
    const education = getEmployeeEducation(employee);

    setTextContent("Re_employeeID", getEmployeeID(employee));
    setTextContent("Re_HoTen", getEmployeeFullName(employee));
    setTextContent("Re_NgaySinh", profile.dob);
    setTextContent("Re_SoDienThoai", profile.phone);
    setTextContent("Re_NgayCap", profile.idIssueDate);
    setTextContent("Re_DcEmail", profile.email);
    setTextContent("Re_NoiCap", profile.idIssuePlace);
    setTextContent("Re_GioiTinh", profile.gender);
    setTextContent("Re_SoCccd", profile.idNumber);
    setTextContent("Re_QuocTich", profile.nationality);
    setTextContent("Re_ChucVu", getEmployeeJobTitle(employee));
    setTextContent("Re_PhongBan", getEmployeeDepartment(employee));
    setTextContent("Re_TrangThai", getEmployeeStatusLabel(employee));
    setTextContent("Re_DCTtru", profile.permanentAddress);
    setTextContent("Re_DCHtai", profile.currentAddress);
    setTextContent("Re_NgLienHe", emergencyContact.name);
    setTextContent("Re_SDTNgLienHe", emergencyContact.phone);
    setTextContent("Re_QuanHe", emergencyContact.relationship);
    setTextContent("Re_DCNgLienHe", emergencyContact.address);
    setTextContent("Re_HocVan", education.degree);
    setTextContent("Re_NgoaiNgu", education.foreignLanguage);
    setTextContent("Re_KyNang", Array.isArray(education.skills) ? education.skills.join(", ") : "");
    setTextContent("Re_GhiChu", education.notes);

    const avatarElement = document.getElementById("Re_Avatar");

    if (avatarElement) {
        avatarElement.src = getEmployeeAvatarUrl(employee);
    }
});

const btnBack = document.getElementById("btnBack");

if (btnBack) {
    btnBack.addEventListener("click", () => {
        history.back();
    });
}