import { PROJECTS } from "../assets/js/common/storageKeys.js";
import { initTasks } from "./task.js";
import { initProjectTasks, getTasksByProjectId } from "./projet_task.js";
import { initProjectPhases } from "./project_phase.js";
import { initProjectEmployees, getAllProjectEmployees } from "./project-employees.js";
import { employees } from "./employeedata.js";
import { CURRENT_USER } from "../assets/js/common/storageKeys.js";

const DEFAULT_PROJECTS = [
  {
    id: "prj-001",
    projectCode: "PRJ001",
    projectName: "HRPMS",
    leadId: "EMP001",
    createdByEmployeeCode: "EMP001",
    memberCount: 5,
    status: "Hoàn thành",
    createdAt: "2026-07-10T09:00:00",
    endDate: "2026-08-10T09:00:00",
    updatedAt: "2026-07-10T09:00:00",
  },
  {
    id: "prj-002",
    projectCode: "PRJ002",
    projectName: "Mobile App",
    leadId: "EMP002",
    createdByEmployeeCode: "EMP002",
    memberCount: 5,
    status: "Tạm dừng",
    createdAt: "2026-07-10T09:00:00",
    endDate: "2026-08-25T09:00:00",
    updatedAt: "2026-07-10T09:00:00",
  },
];

function initProjects() {
  initTasks();
  initProjectTasks();
  initProjectPhases();
  initProjectEmployees();

  const storedProjects = getAll();

  if (storedProjects.length === 0) {
    saveProjects(DEFAULT_PROJECTS);
    return;
  }

  saveProjects(storedProjects);
}

function getAll() {
  try {
    const storedProjects = JSON.parse(localStorage.getItem(PROJECTS));

    return Array.isArray(storedProjects) ? storedProjects.map(normalizeProjectRecord) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects) {
  localStorage.setItem(PROJECTS, JSON.stringify(projects.map(toStoredProjectRecord)));
}

function insertProject(project) {
  const projects = getAll();
  projects.push(project);
  saveProjects(projects);
}

function nextProjectCode(projects) {
  const nextNumber = projects.reduce((currentMax, project) => {
    const match = String(project.projectCode || "").match(/PRJ(\d+)/);

    if (!match) {
      return currentMax;
    }

    return Math.max(currentMax, Number(match[1]));
  }, 0);

  return `PRJ${String(nextNumber + 1).padStart(3, "0")}`;
}

function renderProjects(keyword = "") {
  const tbody = document.getElementById("project-table-body");

  if (!tbody) {
    return;
  }

  const projects = getFilteredProjectsByName(keyword);
  tbody.innerHTML = "";

  if (projects.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.className =
      "bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium";

    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 7;
    emptyCell.className = "px-6 py-8 text-center text-body";
    emptyCell.textContent = "Chưa có dự án nào.";

    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
    return;
  }

  projects.forEach((project) => {
    tbody.appendChild(createProjectRow(project));
  });
}

function getFilteredProjectsByName(keyword) {
  const projects = getVisibleProjectsForCurrentUser();
  const query = normalizeKeyword(keyword);

  if (!query) {
    return projects;
  }

  return projects.filter((project) => normalizeKeyword(project.projectName).includes(query));
}

function getVisibleProjectsForCurrentUser() {
  const projects = getAll();
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return projects;
  }

  const role = getCurrentUserRoleLower(currentUser);
  const currentEmployeeCode = getCurrentUserEmployeeCode(currentUser);

  if (role === "hr_manager") {
    return projects;
  }

  if (!currentEmployeeCode) {
    return [];
  }

  if (role === "project_manager") {
    return projects.filter((project) => {
      const ownerCode = String(project.createdByEmployeeCode || project.leadId || "").trim();
      return ownerCode === currentEmployeeCode;
    });
  }

  const assignedProjectIds = new Set(
    getAllProjectEmployees()
      .filter((link) => String(link.employeeCode || "").trim() === currentEmployeeCode)
      .map((link) => link.projectId),
  );

  return projects.filter((project) => assignedProjectIds.has(project.id));
}

function getCurrentUser() {
  try {
    const rawCurrentUser = localStorage.getItem(CURRENT_USER);

    if (!rawCurrentUser) {
      return null;
    }

    return JSON.parse(rawCurrentUser);
  } catch {
    return null;
  }
}

function createProjectRow(project) {
  const row = document.createElement("tr");
  row.className =
    "bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium";

  row.appendChild(
    createCell(project.projectCode, "px-6 py-4 font-medium text-heading whitespace-nowrap", true),
  );
  row.appendChild(createCell(project.projectName, "px-6 py-4"));
  row.appendChild(createCell(project.leadName, "px-6 py-4"));
  row.appendChild(createCell(String(project.memberCount ?? 0), "px-6 py-4"));
  row.appendChild(createCell(`${project.progress ?? 0}%`, "px-6 py-4"));
  row.appendChild(createStatusCell(project.status));
  row.appendChild(createActionCell(project));

  return row;
}

function createCell(value, className, nowrap = false) {
  const cell = document.createElement(nowrap ? "th" : "td");
  cell.className = className;

  if (nowrap) {
    cell.setAttribute("scope", "row");
  }

  cell.textContent = value ?? "";
  return cell;
}

function createStatusCell(status) {
  const cell = document.createElement("td");
  cell.className = "px-6 py-4";

  const wrapper = document.createElement("div");
  wrapper.className = "flex items-center";

  const dot = document.createElement("div");
  dot.className = `h-2.5 w-2.5 rounded-full me-2 ${getStatusDotClass(status)}`;

  const label = document.createElement("span");
  label.textContent = status || "Đang tiến hành";

  wrapper.appendChild(dot);
  wrapper.appendChild(label);
  cell.appendChild(wrapper);

  return cell;
}

function createActionCell(project) {
  const cell = document.createElement("td");
  cell.className = "px-6 py-4";

  const actions = document.createElement("div");
  actions.className = "flex";
  const projectIdParam = encodeURIComponent(project?.id || "");
  const detailHref = `./project-detail.html?projectId=${projectIdParam}`;

  actions.appendChild(
    createActionLink(
      "Edit",
      detailHref,
      "m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z",
    ),
  );

  cell.appendChild(actions);
  return cell;
}

function createActionLink(label, href, pathData) {
  const wrapper = document.createElement("div");
  wrapper.className = "relative group";

  const link = document.createElement("a");
  link.href = href;
  link.className = "text-blue-500";
  link.innerHTML = `
    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${pathData}" />
    </svg>
  `;

  const tooltip = document.createElement("div");
  tooltip.className =
    "absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block rounded bg-gray-800 px-2 py-1 text-sm text-white whitespace-nowrap";
  tooltip.textContent = label;

  wrapper.appendChild(link);
  wrapper.appendChild(tooltip);

  return wrapper;
}

function getStatusDotClass(status) {
  switch (status) {
    case "Hoàn thành":
      return "bg-green-500";
    case "Tạm dừng":
      return "bg-red-500";
    case "Đang tiến hành":
    case "Đang thực hiện":
      return "bg-yellow-500";
    default:
      return "bg-yellow-500";
  }
}

function createProject(projectJson) {
  const projects = getAll();
  const now = new Date().toISOString();
  const startDate = projectJson.createdAt || now;
  const endDate = projectJson.endDate || addDays(startDate, 30);

  const newProject = normalizeProjectRecord({
    id: projectJson.id || `prj-${Date.now()}`,
    projectCode: projectJson.projectCode || nextProjectCode(projects),
    projectName: projectJson.projectName,
    leadId: projectJson.leadId,
    createdByEmployeeCode: projectJson.createdByEmployeeCode,
    memberCount: projectJson.memberCount,
    status: projectJson.status,
    createdAt: startDate,
    endDate,
    updatedAt: projectJson.updatedAt || now,
  });

  insertProject(newProject);
  return newProject;
}

function updateProjectById(projectId, updatedData) {
  const projects = getAll();
  const projectIndex = projects.findIndex((project) => project.id === projectId);

  if (projectIndex === -1) {
    return null;
  }

  const currentProject = projects[projectIndex];

  const updatedProject = normalizeProjectRecord({
    ...currentProject,
    ...updatedData,
    updatedAt: new Date().toISOString(),
  });

  projects[projectIndex] = updatedProject;
  saveProjects(projects);

  return updatedProject;
}

function findProjectById(projectId) {
  return getAll().find((project) => project.id === projectId) || null;
}

function findProjectByCode(projectCode) {
  const normalizedProjectCode = String(projectCode || "").trim().toLowerCase();

  if (!normalizedProjectCode) {
    return null;
  }

  return (
    getAll().find(
      (project) => String(project.projectCode || "").trim().toLowerCase() === normalizedProjectCode,
    ) || null
  );
}

function getProjectByReference(projectReference) {
  if (!projectReference) {
    return null;
  }

  return findProjectById(projectReference) || findProjectByCode(projectReference);
}

function getProjectDetail(projectReference) {
  const project = getProjectByReference(projectReference);

  if (!project) {
    return null;
  }

  return {
    ...project,
    tasks: getTasksByProjectId(project.id),
  };
}

function getProjectDetailFromQuery(search = window.location.search) {
  const params = new URLSearchParams(search || "");
  const projectId = params.get("projectId");
  const projectCode = params.get("projectCode");

  return getProjectDetail(projectId || projectCode);
}

function normalizeProjectRecord(project) {
  const createdAt = project.createdAt || new Date().toISOString();
  const endDate = project.endDate || addDays(createdAt, 30);
  const matchedLead = findLeadEmployee(project.leadId, project.leadName);
  const normalizedLeadId = String(matchedLead?.MaNhanVien || project.leadId || "").trim();
  const normalizedLeadName = String(matchedLead?.HoTen || project.leadName || "").trim();
  const createdByEmployeeCode = String(
    project.createdByEmployeeCode || normalizedLeadId || "",
  ).trim();

  return {
    ...project,
    leadId: normalizedLeadId,
    leadName: normalizedLeadName,
    createdByEmployeeCode,
    createdAt,
    endDate,
    progress: calculateProjectProgress(createdAt, endDate),
  };
}

function toStoredProjectRecord(project) {
  const normalized = normalizeProjectRecord(project);

  return {
    id: normalized.id,
    projectCode: normalized.projectCode,
    projectName: normalized.projectName,
    leadId: normalized.leadId,
    createdByEmployeeCode: normalized.createdByEmployeeCode,
    memberCount: normalized.memberCount,
    status: normalized.status,
    createdAt: normalized.createdAt,
    endDate: normalized.endDate,
    updatedAt: normalized.updatedAt,
  };
}

function findLeadEmployee(leadId, leadName) {
  const normalizedLeadId = String(leadId || "").trim();

  if (normalizedLeadId) {
    const byId = employees.find(
      (employee) => String(employee.MaNhanVien || "").trim() === normalizedLeadId,
    );

    if (byId) {
      return byId;
    }
  }

  const normalizedLeadName = normalizeKeyword(leadName);

  if (!normalizedLeadName) {
    return null;
  }

  return (
    employees.find((employee) => normalizeKeyword(employee.HoTen) === normalizedLeadName) || null
  );
}

function normalizeKeyword(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function getCurrentUserRoleLower(currentUser) {
  const role = String(currentUser?.role || "").trim().toLowerCase();
  return role === "admin" ? "project_manager" : role;
}

function getCurrentUserEmployeeCode(currentUser) {
  return String(
    currentUser?.employeeCode || currentUser?.MaNhanVien || currentUser?.maNhanVien || "",
  ).trim();
}

function calculateProjectProgress(startDateValue, endDateValue, currentDateValue = new Date()) {
  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);
  const currentDate = new Date(currentDateValue);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    Number.isNaN(currentDate.getTime())
  ) {
    return 0;
  }

  const totalDuration = endDate.getTime() - startDate.getTime();

  if (totalDuration <= 0) {
    return currentDate.getTime() >= endDate.getTime() ? 100 : 0;
  }

  if (currentDate.getTime() <= startDate.getTime()) {
    return 0;
  }

  if (currentDate.getTime() >= endDate.getTime()) {
    return 100;
  }

  const elapsedDuration = currentDate.getTime() - startDate.getTime();
  return Math.round((elapsedDuration / totalDuration) * 100);
}

function addDays(dateValue, days) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export {
  calculateProjectProgress,
  initProjects,
  getAll,
  saveProjects,
  insertProject,
  nextProjectCode,
  renderProjects,
  createProject,
  updateProjectById,
  findProjectById,
  findProjectByCode,
  getProjectByReference,
  getProjectDetail,
  getProjectDetailFromQuery,
  getStatusDotClass,
  DEFAULT_PROJECTS,
};
