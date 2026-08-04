import { PROJECT_EMPLOYEES } from "../assets/js/common/storageKeys.js";
import { employees, getAllEmployees } from "./employeedata.js";

const DEFAULT_PROJECT_EMPLOYEES = [
  {
    id: "pem-001",
    projectId: "prj-001",
    employeeCode: "EMP001",
    role: "Developer",
    createdAt: "2026-07-10T09:00:00",
    updatedAt: "2026-07-10T09:00:00",
  },
  {
    id: "pem-002",
    projectId: "prj-001",
    employeeCode: "EMP003",
    role: "Team Lead",
    createdAt: "2026-07-10T09:00:00",
    updatedAt: "2026-07-10T09:00:00",
  },
  {
    id: "pem-003",
    projectId: "prj-002",
    employeeCode: "EMP002",
    role: "Tester",
    createdAt: "2026-07-10T09:00:00",
    updatedAt: "2026-07-10T09:00:00",
  },
];

function initProjectEmployees() {
  const stored = getAllProjectEmployees();

  if (stored.length === 0) {
    saveProjectEmployees(DEFAULT_PROJECT_EMPLOYEES);
  }
}

function getAllProjectEmployees() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROJECT_EMPLOYEES));
    const allEmployee = getAllEmployees();
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveProjectEmployees(projectEmployees) {
  localStorage.setItem(PROJECT_EMPLOYEES, JSON.stringify(projectEmployees));
}

function findProjectEmployeesByProjectId(projectId) {
  return getAllProjectEmployees().filter((item) => item.projectId === projectId);
}

function addProjectEmployee(projectId, employeeCode, role = "Member") {
  const allLinks = getAllProjectEmployees();
  const employeeExists = employees.some((employee) => employee.MaNhanVien === employeeCode);

  if (!employeeExists) {
    return null;
  }

  const duplicate = allLinks.some(
    (item) => item.projectId === projectId && item.employeeCode === employeeCode,
  );

  if (duplicate) {
    return null;
  }

  const now = new Date().toISOString();
  const newLink = {
    id: `pem-${Date.now()}`,
    projectId,
    employeeCode,
    role,
    createdAt: now,
    updatedAt: now,
  };

  allLinks.push(newLink);
  saveProjectEmployees(allLinks);

  return newLink;
}

function upsertProjectEmployee(projectId, employeeCode, role = "Member") {
  const allLinks = getAllProjectEmployees();
  const employeeExists = employees.some((employee) => employee.MaNhanVien === employeeCode);

  if (!employeeExists) {
    return null;
  }

  const existingIndex = allLinks.findIndex(
    (item) => item.projectId === projectId && item.employeeCode === employeeCode,
  );

  if (existingIndex !== -1) {
    const updatedLink = {
      ...allLinks[existingIndex],
      role: role || allLinks[existingIndex].role || "Member",
      updatedAt: new Date().toISOString(),
    };

    allLinks[existingIndex] = updatedLink;
    saveProjectEmployees(allLinks);

    return updatedLink;
  }

  return addProjectEmployee(projectId, employeeCode, role);
}

function removeProjectEmployee(projectId, employeeCode) {
  const allLinks = getAllProjectEmployees();
  const nextLinks = allLinks.filter(
    (item) => !(item.projectId === projectId && item.employeeCode === employeeCode),
  );

  if (nextLinks.length === allLinks.length) {
    return false;
  }

  saveProjectEmployees(nextLinks);
  return true;
}

function getEmployeeByCode(employeeCode) {
  return employees.find((employee) => employee.MaNhanVien === employeeCode) || null;
}

function getProjectEmployeeDetails(projectId) {
  return findProjectEmployeesByProjectId(projectId)
    .map((link) => {
      const employee = getEmployeeByCode(link.employeeCode);

      if (!employee) {
        return null;
      }

      return {
        employeeCode: link.employeeCode,
        role: link.role || employee.Level || "Member",
        fullName: employee.HoTen,
        avatar: employee.Avatar || "../../assets/images/account-icon.png",
      };
    })
    .filter(Boolean);
}

export {
  DEFAULT_PROJECT_EMPLOYEES,
  initProjectEmployees,
  getAllProjectEmployees,
  saveProjectEmployees,
  findProjectEmployeesByProjectId,
  addProjectEmployee,
  upsertProjectEmployee,
  removeProjectEmployee,
  getEmployeeByCode,
  getProjectEmployeeDetails,
};
