import {
  initProjects,
  renderProjects,
  createNewProject,
} from "./services/projectService.js";
import { employees } from "../../database/employeedata.js";
import { upsertProjectEmployee } from "../../database/project-employees.js";
import { CURRENT_USER } from "./common/storageKeys.js";

const PAGE_SIZE = 10;
let currentSearchKeyword = "";
let currentPage = 1;

const paginationSummary = document.getElementById("project-pagination-summary");
const paginationControls = document.getElementById("project-pagination-controls");

document.addEventListener("render", initializeProjectPage);

document.addEventListener("DOMContentLoaded", () => {
  document.dispatchEvent(new Event("render"));
});

function initializeProjectPage() {
  initProjects();
  bindPaginationControls();
  renderProjectList();
  applyCreateProjectPermission();
  bindLeadNameAutocomplete();
  bindProjectSearch();

  const projectForm = document.getElementById("project-form");

  if (projectForm) {
    projectForm.addEventListener("submit", handleCreateProject);
  }
}

function bindProjectSearch() {
  const searchInput = document.getElementById("input-group-1");
  const searchButton = document.getElementById("project-search-btn");

  if (!searchInput || !searchButton) {
    return;
  }

  const runSearch = () => {
    currentSearchKeyword = String(searchInput.value || "").trim();
    currentPage = 1;
    renderProjectList();
  };

  searchButton.addEventListener("click", runSearch);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    runSearch();
  });
}

function renderProjectList() {
  const pagination =
    renderProjects(currentSearchKeyword, { page: currentPage, pageSize: PAGE_SIZE }) || {};

  const nextPage = Number(pagination.currentPage || 1);
  const totalPages = Number(pagination.totalPages || 1);
  const totalRecords = Number(pagination.totalRecords || 0);

  currentPage = Math.min(Math.max(1, nextPage), Math.max(1, totalPages));

  updatePaginationSummary(totalRecords, currentPage, PAGE_SIZE);
  renderPaginationControls(totalPages, currentPage);
}

function bindPaginationControls() {
  if (!paginationControls) {
    return;
  }

  paginationControls.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-page-action]");

    if (!actionButton) {
      return;
    }

    const action = String(actionButton.dataset.pageAction || "").trim();
    const value = Number(actionButton.dataset.pageValue || "");

    if (action === "previous") {
      currentPage = Math.max(1, currentPage - 1);
      renderProjectList();
      return;
    }

    if (action === "next") {
      currentPage = currentPage + 1;
      renderProjectList();
      return;
    }

    if (action === "page" && Number.isFinite(value) && value > 0) {
      currentPage = value;
      renderProjectList();
    }
  });
}

function updatePaginationSummary(totalRecords, page, pageSize) {
  if (!paginationSummary) {
    return;
  }

  const total = Math.max(0, Number(totalRecords) || 0);

  if (total === 0) {
    paginationSummary.textContent = "Hiển thị 0-0 of 0";
    return;
  }

  const start = (Math.max(1, page) - 1) * pageSize + 1;
  const end = Math.min(total, start + pageSize - 1);

  paginationSummary.textContent = `Hiển thị ${start}-${end} of ${total}`;
}

function renderPaginationControls(totalPages, page) {
  if (!paginationControls) {
    return;
  }

  paginationControls.innerHTML = "";

  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const safeCurrentPage = Math.min(Math.max(1, Number(page) || 1), safeTotalPages);

  paginationControls.appendChild(
    createPaginationItem("Previous", "previous", safeCurrentPage === 1, false),
  );

  for (let pageNumber = 1; pageNumber <= safeTotalPages; pageNumber += 1) {
    paginationControls.appendChild(
      createPaginationItem(String(pageNumber), "page", false, pageNumber === safeCurrentPage, pageNumber),
    );
  }

  paginationControls.appendChild(
    createPaginationItem("Next", "next", safeCurrentPage === safeTotalPages, false),
  );
}

function createPaginationItem(label, action, isDisabled, isActive, pageValue) {
  const li = document.createElement("li");
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = label;
  button.dataset.pageAction = action;

  if (pageValue) {
    button.dataset.pageValue = String(pageValue);
  }

  if (isDisabled) {
    button.disabled = true;
  }

  const baseClass = "flex items-center justify-center box-border border border-default-medium font-medium text-sm h-9 focus:outline-none";
  const activeClass = "text-fg-brand bg-brand-softer hover:bg-brand-soft px-3";
  const normalClass = "text-body bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium hover:text-heading px-3";
  const disabledClass = "opacity-50 cursor-not-allowed";

  button.className = `${baseClass} ${isActive ? activeClass : normalClass} ${isDisabled ? disabledClass : ""}`.trim();

  li.appendChild(button);
  return li;
}

function handleCreateProject(event) {
  event.preventDefault();

  if (!canCreateProject()) {
    alert("Bạn không có quyền thêm dự án.");
    return;
  }

  const projectNameInput = document.getElementById("projectName");
  const leadNameInput = document.getElementById("leadName");
  const leadCodeInput = document.getElementById("leadCode");
  const memberCountInput = document.getElementById("memberCount");
  const projectStatusInput = document.getElementById("projectStatus");

  if (
    !projectNameInput ||
    !leadNameInput ||
    !leadCodeInput ||
    !memberCountInput ||
    !projectStatusInput
  ) {
    alert("Không tìm thấy form nhập dự án.");
    return;
  }

  const projectName = projectNameInput.value.trim();
  const leadName = leadNameInput.value.trim();
  const leadCode = String(leadCodeInput.value || "").trim();
  const memberCountValue = memberCountInput.value.trim();
  const projectStatus = projectStatusInput.value.trim();
  const memberCount = Number(memberCountValue);

  if (
    !projectName ||
    !memberCountValue ||
    !projectStatus ||
    Number.isNaN(memberCount) ||
    memberCount <= 0
  ) {
    alert(
      "Vui lòng nhập đầy đủ tên dự án, tên quản lý, số thành viên và trạng thái. Không được để trống hoặc chỉ nhập khoảng trắng.",
    );
    return;
  }

  if (!leadCode) {
    alert("Vui lòng chọn tên quản lý từ danh sách nhân viên gợi ý.");
    return;
  }

  const isValidLead = employees.some((employee) => employee.MaNhanVien === leadCode);

  if (!isValidLead) {
    alert("Tên quản lý không hợp lệ.");
    return;
  }

  const currentEmployeeCode = getCurrentUserEmployeeCode();

  if (!currentEmployeeCode) {
    alert("Không xác định được mã nhân viên hiện tại.");
    return;
  }

  const createdProject = createNewProject({
    projectName,
    leadId: leadCode,
    createdByEmployeeCode: currentEmployeeCode,
    memberCount,
    status: projectStatus,
  });

  if (createdProject?.id) {
    upsertProjectEmployee(createdProject.id, leadCode, "Project Manager");
  }

  const searchInput = document.getElementById("input-group-1");
  currentSearchKeyword = String(searchInput?.value || "").trim();
  renderProjectList();
  event.currentTarget.reset();
  leadCodeInput.value = "";
  hideLeadNameSuggestions();

  const addProjectModal = document.getElementById("add-project");

  if (addProjectModal) {
    addProjectModal.classList.add("hidden");
    addProjectModal.setAttribute("aria-hidden", "true");
  }
}

function applyCreateProjectPermission() {
  const createProjectButton = document.querySelector('[data-modal-target="add-project"]');

  if (!createProjectButton) {
    return;
  }

  if (canCreateProject()) {
    createProjectButton.classList.remove("hidden");
    createProjectButton.removeAttribute("aria-hidden");
    return;
  }

  createProjectButton.classList.add("hidden");
  createProjectButton.setAttribute("aria-hidden", "true");
}

function canCreateProject() {
  return getCurrentUserRoleLower() === "project_manager";
}

function getCurrentUserRoleLower() {
  try {
    const rawCurrentUser = localStorage.getItem(CURRENT_USER);

    if (!rawCurrentUser) {
      return "";
    }

    const currentUser = JSON.parse(rawCurrentUser);
    const role = String(currentUser?.role || "").toLowerCase().trim();
    return role === "admin" ? "project_manager" : role;
  } catch {
    return "";
  }
}

function getCurrentUserEmployeeCode() {
  try {
    const rawCurrentUser = localStorage.getItem(CURRENT_USER);

    if (!rawCurrentUser) {
      return "";
    }

    const currentUser = JSON.parse(rawCurrentUser);

    return String(
      currentUser?.employeeCode || currentUser?.MaNhanVien || currentUser?.maNhanVien || "",
    ).trim();
  } catch {
    return "";
  }
}

function bindLeadNameAutocomplete() {
  const leadNameInput = document.getElementById("leadName");
  const leadCodeInput = document.getElementById("leadCode");

  if (!leadNameInput || !leadCodeInput) {
    return;
  }

  leadNameInput.addEventListener("focus", () => {
    showLeadNameSuggestions(leadNameInput.value);
  });

  leadNameInput.addEventListener("input", () => {
    leadCodeInput.value = "";
    showLeadNameSuggestions(leadNameInput.value);
  });

  document.addEventListener("click", (event) => {
    const suggestBox = document.getElementById("lead-name-suggest-list");

    if (!suggestBox) {
      return;
    }

    if (event.target === leadNameInput || suggestBox.contains(event.target)) {
      return;
    }

    hideLeadNameSuggestions();
  });
}

function showLeadNameSuggestions(keyword) {
  const suggestBox = document.getElementById("lead-name-suggest-list");
  const leadNameInput = document.getElementById("leadName");
  const leadCodeInput = document.getElementById("leadCode");

  if (!suggestBox || !leadNameInput || !leadCodeInput) {
    return;
  }

  const query = normalizeKeyword(keyword);
  const matchedEmployees = employees
    .filter((employee) => {
      if (!query) {
        return true;
      }

      return normalizeKeyword(employee.HoTen).includes(query);
    })
    .slice(0, 8);

  if (matchedEmployees.length === 0) {
    suggestBox.innerHTML = `<div class="px-3 py-2 text-sm text-gray-500">Không tìm thấy nhân viên phù hợp.</div>`;
    suggestBox.classList.remove("hidden");
    return;
  }

  suggestBox.innerHTML = matchedEmployees
    .map(
      (employee) => `
      <button
        type="button"
        class="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
        data-lead-code="${escapeHtml(employee.MaNhanVien)}"
        data-lead-name="${escapeHtml(employee.HoTen)}"
      >
        <span>${escapeHtml(employee.HoTen)}</span>
        <span class="text-xs text-gray-500">${escapeHtml(employee.MaNhanVien)}</span>
      </button>
    `,
    )
    .join("");

  suggestBox.classList.remove("hidden");

  suggestBox.querySelectorAll("button[data-lead-code]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCode = String(button.getAttribute("data-lead-code") || "");
      const selectedName = String(button.getAttribute("data-lead-name") || "");

      leadCodeInput.value = selectedCode;
      leadNameInput.value = selectedName;
      hideLeadNameSuggestions();
    });
  });
}

function hideLeadNameSuggestions() {
  const suggestBox = document.getElementById("lead-name-suggest-list");

  if (!suggestBox) {
    return;
  }

  suggestBox.classList.add("hidden");
}

function normalizeKeyword(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
