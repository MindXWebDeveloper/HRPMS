import { EMPLOYEES } from "../assets/js/common/storageKeys.js";

const DEFAULT_CREATED_AT = "2026-07-10T09:00:00";

function createEmployeeRecord({
  id,
  employeeID,
  fullName,
  dob = "",
  gender = "",
  phone = "",
  email = "",
  idNumber = "",
  nationality = "",
  idIssueDate = "",
  idIssuePlace = "",
  permanentAddress = "",
  currentAddress = "",
  avatarUrl = "",
  department = "",
  jobTitle = "",
  jobLevel = "",
  status = "active",
  startDate = "",
  managerCode = "",
  emergencyName = "",
  emergencyPhone = "",
  relationship = "",
  emergencyAddress = "",
  degree = "",
  foreignLanguage = "",
  skills = [],
  notes = "",
  points = 0,
  createdAt = DEFAULT_CREATED_AT,
  updatedAt = DEFAULT_CREATED_AT,
}) {
  return {
    id: String(id || `emp-${employeeID || Date.now()}`),
    profile: {
      fullName: String(fullName || "").trim(),
      dob: String(dob || "").trim(),
      gender: String(gender || "").trim(),
      phone: String(phone || "").trim(),
      email: String(email || "").trim(),
      idNumber: String(idNumber || "").trim(),
      nationality: String(nationality || "").trim(),
      idIssueDate: String(idIssueDate || "").trim(),
      idIssuePlace: String(idIssuePlace || "").trim(),
      permanentAddress: String(permanentAddress || "").trim(),
      currentAddress: String(currentAddress || "").trim(),
      avatarUrl: String(avatarUrl || "").trim(),
    },
    job: {
      employeeID: String(employeeID || "").trim(),
      department: String(department || "").trim(),
      jobTitle: String(jobTitle || "").trim(),
      jobLevel: String(jobLevel || "").trim(),
      status: normalizeJobStatus(status),
      startDate: String(startDate || "").trim(),
      managerCode: String(managerCode || "").trim(),
    },
    emergencyContact: {
      name: String(emergencyName || "").trim(),
      phone: String(emergencyPhone || "").trim(),
      relationship: String(relationship || "").trim(),
      address: String(emergencyAddress || "").trim(),
    },
    education: {
      degree: String(degree || "").trim(),
      foreignLanguage: String(foreignLanguage || "").trim(),
      skills: normalizeSkills(skills),
      notes: String(notes || "").trim(),
    },
    meta: {
      points: Number(points) || 0,
      createdAt: String(createdAt || DEFAULT_CREATED_AT),
      updatedAt: String(updatedAt || createdAt || DEFAULT_CREATED_AT),
    },
  };
}

const defaultEmployees = [
  createEmployeeRecord({
    id: "emp-001",
    employeeID: "thanhlv",
    fullName: "Lương Văn Thanh",
    dob: "1995-03-15",
    phone: "0901234567",
    email: "thanh.luong@company.com",
    idIssueDate: "2020-05-12",
    idIssuePlace: "Cục CSQLHC về TTXH",
    gender: "Nam",
    idNumber: "001095123456",
    nationality: "Việt Nam",
    jobLevel: "Junior Developer",
    department: "Phát triển phần mềm",
    permanentAddress: "Ba Đình, Hà Nội",
    currentAddress: "Nam Từ Liêm, Hà Nội",
    emergencyName: "Nguyễn Thị Lan",
    emergencyPhone: "0911222333",
    relationship: "Bố/mẹ đẻ",
    emergencyAddress: "Ba Đình, Hà Nội",
    degree: "Cao đẳng/Đại học",
    foreignLanguage: "Tiếng Anh (IELTS 6.5)",
    skills: ["HTML", "CSS", "JavaScript"],
    notes: "",
    avatarUrl: "https://lh3.googleusercontent.com/d/1TmkF8xaojUTHJ3C9iFDUTZRr_vr1MKwE",
    jobTitle: "Developer",
    status: "active",
    points: 1350,
  }),
  createEmployeeRecord({
    id: "emp-002",
    employeeID: "linhnh",
    fullName: "Nguyễn Hữu Linh",
    dob: "1997-07-22",
    phone: "0902345678",
    email: "linh.nguyen@company.com",
    idIssueDate: "2021-03-18",
    idIssuePlace: "Công an TP Hà Nội",
    gender: "Nữ",
    idNumber: "001097654321",
    nationality: "Việt Nam",
    jobLevel: "Tester",
    department: "QA/QC",
    permanentAddress: "Hải Châu, Đà Nẵng",
    currentAddress: "Cầu Giấy, Hà Nội",
    emergencyName: "Trần Văn Minh",
    emergencyPhone: "0912333444",
    relationship: "Bố/mẹ đẻ",
    emergencyAddress: "Hải Châu, Đà Nẵng",
    degree: "Cao đẳng/Đại học",
    foreignLanguage: "Tiếng Anh (TOEIC 850)",
    skills: ["Manual Test", "SQL", "Postman"],
    notes: "",
    avatarUrl: "https://lh3.googleusercontent.com/d/1maiLrZMV4YPFNiuav9Z0q7mnvKvnmPp8",
    jobTitle: "IT Support",
    status: "active",
    points: 1280,
  }),
  createEmployeeRecord({
    id: "emp-003",
    employeeID: "cuonglm",
    fullName: "Lê Minh Cường",
    dob: "1993-11-08",
    phone: "0903456789",
    email: "cuong.le@company.com",
    idIssueDate: "2019-09-20",
    idIssuePlace: "Công an TP Hồ Chí Minh",
    gender: "Nam",
    idNumber: "001093987654",
    nationality: "Việt Nam",
    jobLevel: "Senior Developer",
    department: "Phát triển phần mềm",
    permanentAddress: "Quận 1, TP Hồ Chí Minh",
    currentAddress: "Thanh Xuân, Hà Nội",
    emergencyName: "Lê Thị Hoa",
    emergencyPhone: "0913444555",
    relationship: "Vợ/chồng",
    emergencyAddress: "Thanh Xuân, Hà Nội",
    degree: "Cao đẳng/Đại học",
    foreignLanguage: "Tiếng Anh, Tiếng Nhật N3",
    skills: ["Java", "Spring Boot", "SQL Server"],
    notes: "Team Leader dự án HRM",
    avatarUrl: "https://lh3.googleusercontent.com/d/1Dv3q-53YJXCHTB1pUZcCyRLxuPguphvK",
    jobTitle: "Frontend Dev",
    status: "active",
    points: 980,
  }),
  createEmployeeRecord({
    id: "emp-004",
    employeeID: "hapt",
    fullName: "Phạm Thu Hà",
    dob: "1998-01-30",
    phone: "0904567890",
    email: "ha.pham@company.com",
    idIssueDate: "2022-01-12",
    idIssuePlace: "Công an TP Hải Phòng",
    gender: "Nữ",
    idNumber: "001098112233",
    nationality: "Việt Nam",
    jobLevel: "Business Analyst",
    department: "Phân tích nghiệp vụ",
    permanentAddress: "Lê Chân, Hải Phòng",
    currentAddress: "Đống Đa, Hà Nội",
    emergencyName: "Phạm Văn Long",
    emergencyPhone: "0914555666",
    relationship: "Anh/chị/em ruột",
    emergencyAddress: "Lê Chân, Hải Phòng",
    degree: "Cao đẳng/Đại học",
    foreignLanguage: "Tiếng Anh",
    skills: ["Agile", "UML", "Jira", "Figma"],
    notes: "",
    avatarUrl: "https://lh3.googleusercontent.com/d/1cG1wRkGMbpb06Rrn8EOAWp_M5XQkyNgA",
    jobTitle: "Developer",
    status: "active",
    points: 1050,
  }),
  createEmployeeRecord({
    id: "emp-005",
    employeeID: "viethq",
    fullName: "Hoàng Quốc Việt",
    dob: "1991-09-18",
    phone: "0905678901",
    email: "viet.hoang@company.com",
    idIssueDate: "2018-06-10",
    idIssuePlace: "Cục CSQLHC về TTXH",
    gender: "Nam",
    idNumber: "001091223344",
    nationality: "Việt Nam",
    jobLevel: "Project Manager",
    department: "Quản lý dự án",
    permanentAddress: "Ninh Kiều, Cần Thơ",
    currentAddress: "Tây Hồ, Hà Nội",
    emergencyName: "Hoàng Thị Mai",
    emergencyPhone: "0915666777",
    relationship: "Con",
    emergencyAddress: "Tây Hồ, Hà Nội",
    degree: "Thạc sĩ",
    foreignLanguage: "Tiếng Anh (IELTS 7.5)",
    skills: ["Project Management", "Scrum", "Power BI"],
    notes: "Quản lý nhiều dự án nội bộ",
    avatarUrl: "https://lh3.googleusercontent.com/d/1hgM0h71O-16rlsMRmWMchDmWR116g1Gm",
    jobTitle: "Project Manager",
    status: "inactive",
    points: 900,
  }),
];

function normalizeEmployeeRecord(employee) {
  if (!employee) {
    return createEmployeeRecord({ employeeID: "", fullName: "" });
  }

  if (employee.profile || employee.job || employee.emergencyContact || employee.education || employee.meta) {
    const normalized = createEmployeeRecord({
      id: employee.id,
      employeeID: employee.job?.employeeID || employee.employeeID || employee.account || "",
      fullName: employee.profile?.fullName || employee.HoTen || "",
      dob: employee.profile?.dob || employee.NgaySinh || "",
      gender: employee.profile?.gender || employee.GioiTinh || "",
      phone: employee.profile?.phone || employee.SoDienThoai || "",
      email: employee.profile?.email || employee.DcEmail || employee.EmailDangNhap || "",
      idNumber: employee.profile?.idNumber || employee.SoCccd || "",
      nationality: employee.profile?.nationality || employee.QuocTich || "",
      idIssueDate: employee.profile?.idIssueDate || employee.NgayCap || "",
      idIssuePlace: employee.profile?.idIssuePlace || employee.NoiCap || "",
      permanentAddress: employee.profile?.permanentAddress || employee.DCTtru || "",
      currentAddress: employee.profile?.currentAddress || employee.DCHtai || "",
      avatarUrl: employee.profile?.avatarUrl || employee.avatarUrl || employee.Avatar || "",
      department: employee.job?.department || employee.PhongBan || "",
      jobTitle: employee.job?.jobTitle || employee.ChucVu || "",
      jobLevel: employee.job?.jobLevel || employee.Level || "",
      status: employee.job?.status || employee.status || employee.TrangThai || "active",
      startDate: employee.job?.startDate || employee.startDate || "",
      managerCode: employee.job?.managerCode || employee.managerCode || "",
      emergencyName: employee.emergencyContact?.name || employee.NgLienHe || "",
      emergencyPhone: employee.emergencyContact?.phone || employee.SDTNgLienHe || "",
      relationship: employee.emergencyContact?.relationship || employee.QuanHe || "",
      emergencyAddress: employee.emergencyContact?.address || employee.DCNgLienHe || "",
      degree: employee.education?.degree || employee.HocVan || "",
      foreignLanguage: employee.education?.foreignLanguage || employee.NgoaiNgu || "",
      skills: employee.education?.skills || employee.KyNang || [],
      notes: employee.education?.notes || employee.GhiChu || "",
      points: employee.meta?.points ?? employee.Points ?? 0,
      createdAt: employee.meta?.createdAt || employee.createdAt || DEFAULT_CREATED_AT,
      updatedAt: employee.meta?.updatedAt || employee.updatedAt || employee.createdAt || DEFAULT_CREATED_AT,
    });

    return attachLegacyAliases(normalized);
  }

  const normalized = createEmployeeRecord({
    id: employee.id,
    employeeID: employee.employeeID || employee.account || "",
    fullName: employee.HoTen || employee.fullName || "",
    dob: employee.NgaySinh || employee.profile?.dob || "",
    gender: employee.GioiTinh || employee.profile?.gender || "",
    phone: employee.SoDienThoai || employee.profile?.phone || "",
    email: employee.DcEmail || employee.profile?.email || employee.EmailDangNhap || "",
    idNumber: employee.SoCccd || employee.profile?.idNumber || "",
    nationality: employee.QuocTich || employee.profile?.nationality || "",
    idIssueDate: employee.NgayCap || employee.profile?.idIssueDate || "",
    idIssuePlace: employee.NoiCap || employee.profile?.idIssuePlace || "",
    permanentAddress: employee.DCTtru || employee.profile?.permanentAddress || "",
    currentAddress: employee.DCHtai || employee.profile?.currentAddress || "",
    avatarUrl: employee.avatarUrl || employee.Avatar || employee.profile?.avatarUrl || "",
    department: employee.PhongBan || employee.job?.department || "",
    jobTitle: employee.ChucVu || employee.job?.jobTitle || "",
    jobLevel: employee.Level || employee.job?.jobLevel || "",
    status: employee.status || employee.TrangThai || employee.job?.status || "active",
    startDate: employee.startDate || employee.job?.startDate || "",
    managerCode: employee.managerCode || employee.job?.managerCode || "",
    emergencyName: employee.NgLienHe || employee.emergencyContact?.name || "",
    emergencyPhone: employee.SDTNgLienHe || employee.emergencyContact?.phone || "",
    relationship: employee.QuanHe || employee.emergencyContact?.relationship || "",
    emergencyAddress: employee.DCNgLienHe || employee.emergencyContact?.address || "",
    degree: employee.HocVan || employee.education?.degree || "",
    foreignLanguage: employee.NgoaiNgu || employee.education?.foreignLanguage || "",
    skills: employee.KyNang || employee.education?.skills || [],
    notes: employee.GhiChu || employee.education?.notes || "",
    points: employee.Points || employee.meta?.points || 0,
    createdAt: employee.createdAt || employee.meta?.createdAt || DEFAULT_CREATED_AT,
    updatedAt: employee.updatedAt || employee.meta?.updatedAt || employee.createdAt || DEFAULT_CREATED_AT,
  });

  return attachLegacyAliases(normalized);
}

function attachLegacyAliases(employee) {
  const aliasMap = {
    HoTen: () => employee.profile.fullName,
    NgaySinh: () => employee.profile.dob,
    SoDienThoai: () => employee.profile.phone,
    NgayCap: () => employee.profile.idIssueDate,
    DcEmail: () => employee.profile.email,
    NoiCap: () => employee.profile.idIssuePlace,
    GioiTinh: () => employee.profile.gender,
    SoCccd: () => employee.profile.idNumber,
    QuocTich: () => employee.profile.nationality,
    DCTtru: () => employee.profile.permanentAddress,
    DCHtai: () => employee.profile.currentAddress,
    Avatar: () => employee.profile.avatarUrl,
    Level: () => employee.job.jobLevel,
    PhongBan: () => employee.job.department,
    ChucVu: () => employee.job.jobTitle,
    TrangThai: () => (employee.job.status === "active" ? "Hoạt động" : "Ngưng hoạt động"),
    status: () => employee.job.status,
    NgLienHe: () => employee.emergencyContact.name,
    SDTNgLienHe: () => employee.emergencyContact.phone,
    QuanHe: () => employee.emergencyContact.relationship,
    DCNgLienHe: () => employee.emergencyContact.address,
    HocVan: () => employee.education.degree,
    NgoaiNgu: () => employee.education.foreignLanguage,
    KyNang: () => employee.education.skills,
    GhiChu: () => employee.education.notes,
    Points: () => employee.meta.points,
    avatarUrl: () => employee.profile.avatarUrl,
  };

  Object.entries(aliasMap).forEach(([key, getter]) => {
    if (Object.prototype.hasOwnProperty.call(employee, key)) {
      return;
    }

    Object.defineProperty(employee, key, {
      enumerable: false,
      configurable: true,
      get: getter,
    });
  });

  return employee;
}

function normalizeJobStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "active" || normalized === "hoạt động" || normalized === "hoat dong") {
    return "active";
  }

  if (normalized === "inactive" || normalized === "ngưng hoạt động" || normalized === "ngung hoat dong") {
    return "inactive";
  }

  return normalized || "inactive";
}

function normalizeSkills(skills) {
  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill || "").trim()).filter(Boolean);
  }

  const value = String(skills || "").trim();

  if (!value) {
    return [];
  }

  return value
    .split(/[;,]/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function initEmployees() {
  const data = JSON.parse(localStorage.getItem(EMPLOYEES));

  if (!Array.isArray(data) || data.length === 0) {
    localStorage.setItem(EMPLOYEES, JSON.stringify(defaultEmployees.map(normalizeEmployeeRecord)));
    return;
  }

  const normalizedEmployees = mergeDefaultEmployees(data.map(normalizeEmployeeRecord));
  localStorage.setItem(EMPLOYEES, JSON.stringify(normalizedEmployees));
}

function getAllEmployees() {
  const storedEmployees = JSON.parse(localStorage.getItem(EMPLOYEES)) || [];

  return Array.isArray(storedEmployees)
    ? storedEmployees.map(normalizeEmployeeRecord)
    : [];
}

function saveEmployees(employees) {
  const normalizedEmployees = Array.isArray(employees)
    ? employees.map(normalizeEmployeeRecord)
    : [];

  localStorage.setItem(EMPLOYEES, JSON.stringify(normalizedEmployees));
}

function mergeDefaultEmployees(existingEmployees) {
  const byEmployeeID = new Map();

  [...defaultEmployees, ...(Array.isArray(existingEmployees) ? existingEmployees : [])].forEach((employee) => {
    const employeeID = getEmployeeID(employee);

    if (!employeeID) {
      return;
    }

    if (!byEmployeeID.has(employeeID)) {
      byEmployeeID.set(employeeID, normalizeEmployeeRecord(employee));
      return;
    }

    byEmployeeID.set(employeeID, normalizeEmployeeRecord({
      ...byEmployeeID.get(employeeID),
      ...employee,
    }));
  });

  return [...byEmployeeID.values()];
}

function getEmployeeID(employee) {
  return String(employee?.job?.employeeID || employee?.employeeID || "").trim();
}

function getEmployeeFullName(employee) {
  return String(employee?.profile?.fullName || employee?.HoTen || "").trim();
}

function getEmployeeProfile(employee) {
  return employee?.profile || {
    fullName: getEmployeeFullName(employee),
    dob: String(employee?.NgaySinh || "").trim(),
    gender: String(employee?.GioiTinh || "").trim(),
    phone: String(employee?.SoDienThoai || "").trim(),
    email: String(employee?.DcEmail || employee?.EmailDangNhap || "").trim(),
    idNumber: String(employee?.SoCccd || "").trim(),
    nationality: String(employee?.QuocTich || "").trim(),
    idIssueDate: String(employee?.NgayCap || "").trim(),
    idIssuePlace: String(employee?.NoiCap || "").trim(),
    permanentAddress: String(employee?.DCTtru || "").trim(),
    currentAddress: String(employee?.DCHtai || "").trim(),
    avatarUrl: getEmployeeAvatarUrl(employee),
  };
}

function getEmployeeEmergencyContact(employee) {
  return employee?.emergencyContact || {
    name: String(employee?.NgLienHe || "").trim(),
    phone: String(employee?.SDTNgLienHe || "").trim(),
    relationship: String(employee?.QuanHe || "").trim(),
    address: String(employee?.DCNgLienHe || "").trim(),
  };
}

function getEmployeeEducation(employee) {
  const skills = employee?.education?.skills;

  return employee?.education || {
    degree: String(employee?.HocVan || "").trim(),
    foreignLanguage: String(employee?.NgoaiNgu || "").trim(),
    skills: Array.isArray(skills)
      ? skills
      : normalizeSkills(employee?.KyNang || ""),
    notes: String(employee?.GhiChu || "").trim(),
  };
}

function getEmployeeMeta(employee) {
  return employee?.meta || {
    points: getEmployeePoints(employee),
    createdAt: String(employee?.createdAt || DEFAULT_CREATED_AT),
    updatedAt: String(employee?.updatedAt || employee?.createdAt || DEFAULT_CREATED_AT),
  };
}

function getEmployeeAvatarUrl(employee) {
  return String(employee?.profile?.avatarUrl || employee?.avatarUrl || employee?.Avatar || "").trim();
}

function getEmployeeDepartment(employee) {
  return String(employee?.job?.department || employee?.PhongBan || "").trim();
}

function getEmployeeJobTitle(employee) {
  return String(employee?.job?.jobTitle || employee?.ChucVu || "").trim();
}

function getEmployeeJobLevel(employee) {
  return String(employee?.job?.jobLevel || employee?.Level || "").trim();
}

function getEmployeeStatus(employee) {
  return String(employee?.job?.status || employee?.status || "inactive").trim().toLowerCase();
}

function getEmployeeStatusLabel(employee) {
  return getEmployeeStatus(employee) === "active" ? "Hoạt động" : "Ngưng hoạt động";
}

function getEmployeePoints(employee) {
  return Number(employee?.meta?.points ?? employee?.Points ?? 0) || 0;
}

function findEmployeeByEmployeeID(employeeID) {
  const employeeCode = String(employeeID || "").trim();

  if (!employeeCode) {
    return null;
  }

  const storedEmployees = getAllEmployees();

  if (Array.isArray(storedEmployees) && storedEmployees.length > 0) {
    const foundInStorage = storedEmployees.find(
      (employee) => getEmployeeID(employee) === employeeCode,
    );

    if (foundInStorage) {
      return foundInStorage;
    }
  }

  return defaultEmployees.find((employee) => getEmployeeID(employee) === employeeCode) || null;
}

function updateEmployee(updatedEmployee) {
  const normalizedEmployee = normalizeEmployeeRecord(updatedEmployee);
  const storedEmployees = getAllEmployees();
  const index = storedEmployees.findIndex(
    (employee) => getEmployeeID(employee) === getEmployeeID(normalizedEmployee),
  );

  if (index !== -1) {
    storedEmployees[index] = normalizeEmployeeRecord({
      ...storedEmployees[index],
      ...normalizedEmployee,
      profile: {
        ...storedEmployees[index].profile,
        ...normalizedEmployee.profile,
      },
      job: {
        ...storedEmployees[index].job,
        ...normalizedEmployee.job,
      },
      emergencyContact: {
        ...storedEmployees[index].emergencyContact,
        ...normalizedEmployee.emergencyContact,
      },
      education: {
        ...storedEmployees[index].education,
        ...normalizedEmployee.education,
      },
      meta: {
        ...storedEmployees[index].meta,
        ...normalizedEmployee.meta,
      },
    });
  } else {
    storedEmployees.push(normalizedEmployee);
  }

  saveEmployees(storedEmployees);
}

export {
  defaultEmployees,
  createEmployeeRecord,
  normalizeEmployeeRecord,
  initEmployees,
  getAllEmployees,
  saveEmployees,
  getEmployeeID,
  getEmployeeFullName,
  getEmployeeProfile,
  getEmployeeEmergencyContact,
  getEmployeeEducation,
  getEmployeeMeta,
  getEmployeeAvatarUrl,
  getEmployeeDepartment,
  getEmployeeJobTitle,
  getEmployeeJobLevel,
  getEmployeeStatus,
  getEmployeeStatusLabel,
  getEmployeePoints,
  findEmployeeByEmployeeID,
  updateEmployee,
};
