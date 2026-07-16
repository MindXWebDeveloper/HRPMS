import { PROJECTS } from "../assets/js/common/storageKeys.js";

const DEFAULT_PROJECTS = [
  {
    id: "prj-001",
    projectCode: "PRJ001",
    projectName: "HRPMS",
    leadName: "Trần Văn Nghĩa",
    memberCount: 5,
    progress: 100,
    status: "Hoàn thành",
    createdAt: "2026-07-10T09:00:00",
    updatedAt: "2026-07-10T09:00:00",
  },
  {
    id: "prj-002",
    projectCode: "PRJ002",
    projectName: "Mobile App",
    leadName: "Lê Thị Hồng",
    memberCount: 5,
    progress: 70,
    status: "Tạm dừng",
    createdAt: "2026-07-10T09:00:00",
    updatedAt: "2026-07-10T09:00:00",
  },
];

function initProjects() {
  const storedProjects = getAll();

  if (storedProjects.length === 0) {
    saveProjects(DEFAULT_PROJECTS);
  }
}

function getAll() {
  try {
    const storedProjects = JSON.parse(localStorage.getItem(PROJECTS));

    return Array.isArray(storedProjects) ? storedProjects : [];
  } catch {
    return [];
  }
}

function saveProjects(projects) {
  localStorage.setItem(PROJECTS, JSON.stringify(projects));
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

function renderProjects() {
  const tbody = document.getElementById("project-table-body");

  if (!tbody) {
    return;
  }

  const projects = getAll();
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
  row.appendChild(createActionCell());

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

function createActionCell() {
  const cell = document.createElement("td");
  cell.className = "px-6 py-4";

  const actions = document.createElement("div");
  actions.className = "flex";

  actions.appendChild(
    createActionLink(
      "Edit",
      "./project-detail.html",
      "m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z",
    ),
  );
  actions.appendChild(
    createActionLink(
      "View",
      "./project-detail.html",
      "M15 9h3m-3 3h3m-3 3h3m-6 1c-.306-.613-.933-1-1.618-1H7.618c-.685 0-1.312.387-1.618 1M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
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

  const newProject = {
    id: projectJson.id || `prj-${Date.now()}`,
    projectCode: projectJson.projectCode || nextProjectCode(projects),
    projectName: projectJson.projectName,
    leadName: projectJson.leadName,
    memberCount: projectJson.memberCount,
    progress: projectJson.progress ?? 0,
    status: projectJson.status,
    createdAt: projectJson.createdAt || now,
    updatedAt: projectJson.updatedAt || now,
  };

  insertProject(newProject);
  return newProject;
}

export {
  initProjects,
  getAll,
  saveProjects,
  insertProject,
  nextProjectCode,
  renderProjects,
  createProject,
  getStatusDotClass,
  DEFAULT_PROJECTS,
};
