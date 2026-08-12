import {
  calculateProjectProgress,
  initProjects,
  getProjectDetailFromQuery,
  updateProjectById,
} from "../../database/project.js";
import {
  findProjectPhaseById,
  findProjectPhasesByProjectId,
  insertProjectPhase,
} from "../../database/project_phase.js";
import { deleteTask, insertTask, updateTask } from "../../database/task.js";
import {
  insertProjectTask,
  findProjectTasksByProjectId,
  removeProjectTaskByTaskId,
  updateProjectTaskByTaskId,
} from "../../database/projet_task.js";
import { getAllEmployees, getEmployeeID, getEmployeeFullName, getEmployeeJobLevel, getEmployeeAvatarUrl } from "../../database/employeedata.js";
import { getAll } from "../../database/user.js";
import {
  addProjectEmployee,
  getProjectEmployeeDetails,
  findProjectEmployeesByProjectId,
  removeProjectEmployee,
  upsertProjectEmployee,
} from "../../database/project-employees.js";
import { CURRENT_USER } from "./common/storageKeys.js";

let currentProjectDetail = null;
let pendingDeleteEmployeeCode = "";
let employees = getAllEmployees();
let users     = getAll();
const collapsedPhaseIds = new Set();
document.addEventListener("DOMContentLoaded", initializeProjectDetailPage);

function initializeProjectDetailPage() {
  initProjects();

  const projectDetail = getProjectDetailFromQuery(window.location.search);

  if (!projectDetail) {
    showUnauthorizedProjectAlertAndRedirect();
    return;
  }

  if (!canAccessProjectDetail(projectDetail)) {
    showUnauthorizedProjectAlertAndRedirect();
    return;
  }

  currentProjectDetail = projectDetail;
  bindProjectDetail(projectDetail);
  const canEdit = canEditProjectDetail();
  const canCreateWork = canCreateProjectWork();
  const canManageEmployees = canManageProjectEmployees();
  const canViewTask = canViewProjectTask();

  if (canEdit) {
    bindEditProjectModal();
  }

  if (canCreateWork) {
    bindCreatePhaseModal();
    bindCreateTaskModal();
  }

  if (canManageEmployees) {
    bindAddProjectEmployeeModal();
    bindDeleteEmployeeConfirmModal();
  }

  bindEmployeeSearchFilter();
  renderProjectEmployees(projectDetail.id);
  renderProjectPhases(projectDetail);
  applyProjectDetailPermission();
}

function bindProjectDetail(project) {
  setTextById("detail-project-name", project.projectName || "Chi tiet du an");
  setTextById(
    "detail-project-description",
    `Mã dự án ${project.projectCode || "N/A"}. Tên quản lý: ${project.leadName || "N/A"}.`,
  );
  setTextById("detail-project-code", project.projectCode || "N/A");
  setTextById("detail-project-manager", project.leadName || "N/A");
  setTextById("detail-project-start-date", formatDate(project.createdAt));
  setTextById("detail-project-end-date", formatDate(project.endDate));
  setTextById(
    "detail-project-progress-value",
    `${normalizeProgress(project.progress)}%`,
  );
  setTextById(
    "detail-project-status-inline",
    `● ${project.status || "Đang tiến hành"}`,
  );

  updateStatusPill(project.status);
  updateProgressBar(project.progress);
  updateMemberCount(project.memberCount);
}

function setTextById(elementId, value) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.textContent = value;
}

function normalizeProgress(progress) {
  const numericProgress = Number(progress);

  if (Number.isNaN(numericProgress)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numericProgress));
}

function updateProgressBar(progress) {
  const progressBar = document.getElementById("detail-project-progress-bar");

  if (!progressBar) {
    return;
  }

  const normalized = normalizeProgress(progress);
  progressBar.style.width = `${normalized}%`;
}

function updateMemberCount(memberCount) {
  const titleElement = document.getElementById("detail-project-member-count");

  if (!titleElement) {
    return;
  }

  const count = Number(memberCount);
  const safeCount = Number.isNaN(count) ? 0 : count;

  titleElement.textContent = `Danh sách nhân viên (${safeCount})`;
}

function updateStatusPill(status) {
  const pillElement = document.getElementById("detail-project-status-pill");
  const inlineStatusElement = document.getElementById(
    "detail-project-status-inline",
  );

  if (!pillElement || !inlineStatusElement) {
    return;
  }

  const normalizedStatus = normalizeStatus(status);

  pillElement.textContent = normalizedStatus.label;
  pillElement.className = `${normalizedStatus.pillClass} px-4 py-1 rounded-full text-sm`;

  inlineStatusElement.textContent = `● ${normalizedStatus.label}`;
  inlineStatusElement.className = normalizedStatus.inlineClass;
}

function normalizeStatus(status) {
  if (status === "Hoàn thành") {
    return {
      label: "Hoàn thành",
      pillClass: "bg-green-100 text-green-600",
      inlineClass: "text-green-600",
    };
  }

  if (status === "Tạm dừng") {
    return {
      label: "Tạm dừng",
      pillClass: "bg-red-100 text-red-600",
      inlineClass: "text-red-600",
    };
  }

  return {
    label: "Đang tiến hành",
    pillClass: "bg-yellow-100 text-yellow-700",
    inlineClass: "text-yellow-700",
  };
}

function formatDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function renderProjectNotFound() {
  setTextById("detail-project-name", "Không tìm thấy dự án");
  setTextById(
    "detail-project-description",
    "Không có dữ liệu phù hợp với dự án được chọn. Vui lòng quay lại danh sách dự án.",
  );
  setTextById("detail-project-code", "N/A");
  setTextById("detail-project-manager", "N/A");
  setTextById("detail-project-start-date", "N/A");
  setTextById("detail-project-end-date", "N/A");
  setTextById("detail-project-progress-value", "0%");
  setTextById("detail-project-status-inline", "● N/A");

  updateProgressBar(0);

  const pillElement = document.getElementById("detail-project-status-pill");

  if (pillElement) {
    pillElement.textContent = "N/A";
    pillElement.className =
      "bg-gray-100 text-gray-600 px-4 py-1 rounded-full text-sm";
  }

  const phaseListElement = document.getElementById("detail-phase-list");

  if (phaseListElement) {
    phaseListElement.innerHTML = "";
  }
}

function bindCreatePhaseModal() {
  const openButton = document.getElementById("detail-create-phase-btn");
  const modal = document.getElementById("create-phase-modal");
  const closeButton = document.getElementById("create-phase-close-btn");
  const cancelButton = document.getElementById("create-phase-cancel-btn");
  const form = document.getElementById("create-phase-form");

  if (!openButton || !modal || !closeButton || !cancelButton || !form) {
    return;
  }

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    form.reset();
  };

  const openModal = () => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  };

  openButton.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);
  cancelButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!currentProjectDetail) {
      return;
    }

    const phaseNameInput = document.getElementById("phaseNameInput");
    const phaseColorInput = document.getElementById("phaseColorInput");

    const phaseName = String(phaseNameInput?.value || "").trim();
    const phaseColor = String(phaseColorInput?.value || "blue").trim();

    if (!phaseName) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Vui lòng nhập tên giai đoạn.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    insertProjectPhase({
      projectId: currentProjectDetail.id,
      phaseName,
      color: phaseColor,
    });

    closeModal();

    const refreshedProject = getProjectDetailFromQuery(window.location.search);

    if (!refreshedProject) {
      return;
    }

    currentProjectDetail = refreshedProject;
    renderProjectPhases(refreshedProject);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Đã tạo thành công 1 giai đoạn",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  });
}

function bindEmployeeSearchFilter() {
  const searchInput = document.getElementById("detail-employee-search-input");

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener("input", () => {
    if (!currentProjectDetail) {
      return;
    }

    renderProjectEmployees(currentProjectDetail.id, searchInput.value);
  });
}

function bindAddProjectEmployeeModal() {
  const openButton = document.getElementById("detail-add-employee-btn");
  const modal = document.getElementById("add-employee-modal");
  const closeButton = document.getElementById("add-employee-close-btn");
  const cancelButton = document.getElementById("add-employee-cancel-btn");
  const form = document.getElementById("add-employee-form");
  const nameInput = document.getElementById("projectEmployeeNameInput");
  const codeInput = document.getElementById("projectEmployeeCodeInput");
  const roleInput = document.getElementById("projectEmployeeRoleInput");

  if (
    !openButton ||
    !modal ||
    !closeButton ||
    !cancelButton ||
    !form ||
    !nameInput ||
    !codeInput ||
    !roleInput
  ) {
    return;
  }

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    form.reset();
    codeInput.value = "";
    hideEmployeeSuggestions();
  };

  const openModal = () => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    showEmployeeSuggestions("");
  };

  openButton.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);
  cancelButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  nameInput.addEventListener("input", () => {
    codeInput.value = "";
    showEmployeeSuggestions(nameInput.value);
  });

  nameInput.addEventListener("focus", () => {
    showEmployeeSuggestions(nameInput.value);
  });

  document.addEventListener("click", (event) => {
    const suggestionBox = document.getElementById(
      "project-employee-suggest-list",
    );

    if (!suggestionBox) {
      return;
    }

    if (event.target === nameInput || suggestionBox.contains(event.target)) {
      return;
    }

    hideEmployeeSuggestions();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!currentProjectDetail) {
      return;
    }

    const employeeCode = String(codeInput.value || "").trim();
    const role = String(roleInput.value || "").trim() || "Member";

    if (!employeeCode) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Vui lòng chọn nhân viên từ danh sách gợi ý.",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
      });
      return;
    }

    const createdLink = addProjectEmployee(
      currentProjectDetail.id,
      employeeCode,
      role,
    );

    if (!createdLink) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title:
          "Không thể thêm nhân viên. Có thể nhân viên đã tồn tại trong dự án.",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
      });
      return;
    }

    closeModal();
    refreshCurrentProjectAndRender();
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Thêm nhân viên thành công.",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    });
  });
}

function showEmployeeSuggestions(keyword) {
  const suggestionBox = document.getElementById(
    "project-employee-suggest-list",
  );
  const codeInput = document.getElementById("projectEmployeeCodeInput");
  const nameInput = document.getElementById("projectEmployeeNameInput");
  const roleInput = document.getElementById("projectEmployeeRoleInput");

  if (
    !suggestionBox ||
    !currentProjectDetail ||
    !codeInput ||
    !nameInput ||
    !roleInput
  ) {
    return;
  }

  const projectEmployees = getProjectEmployeeDetails(currentProjectDetail.id);
  const currentCodes = new Set(
    projectEmployees.map((item) => item.employeeCode),
  );

  const query = normalizeKeyword(keyword);
  const matchedEmployees = employees
    .filter((employee) => !currentCodes.has(getEmployeeID(employee)))
    .filter((employee) => {
      if (!query) {
        return true;
      }

      return normalizeKeyword(getEmployeeFullName(employee)).includes(query);
    })
    .slice(0, 8);

  if (matchedEmployees.length === 0) {
    suggestionBox.innerHTML = `<div class="px-3 py-2 text-sm text-gray-500">Không tìm thấy nhân viên phù hợp.</div>`;
    suggestionBox.classList.remove("hidden");
    return;
  }

  suggestionBox.innerHTML = matchedEmployees
    .map(
      (employee) => `
      <button
        type="button"
        class="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
        data-employee-code="${escapeHtml(getEmployeeID(employee))}"
        data-employee-name="${escapeHtml(getEmployeeFullName(employee))}"
        data-employee-role="${escapeHtml(getEmployeeJobLevel(employee) || "Member")}" 
      >
        <span>${escapeHtml(getEmployeeFullName(employee))}</span>
        <span class="text-xs text-gray-500">${escapeHtml(getEmployeeID(employee))}</span>
      </button>
    `,
    )
    .join("");

  suggestionBox.classList.remove("hidden");

  suggestionBox
    .querySelectorAll("button[data-employee-code]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const selectedCode = String(
          button.getAttribute("data-employee-code") || "",
        );
        const selectedName = String(
          button.getAttribute("data-employee-name") || "",
        );
        const selectedRole = String(
          button.getAttribute("data-employee-role") || "Member",
        );

        codeInput.value = selectedCode;
        nameInput.value = selectedName;

        if (!roleInput.value.trim()) {
          roleInput.value = selectedRole;
        }

        hideEmployeeSuggestions();
      });
    });
}

function hideEmployeeSuggestions() {
  const suggestionBox = document.getElementById(
    "project-employee-suggest-list",
  );

  if (!suggestionBox) {
    return;
  }

  suggestionBox.classList.add("hidden");
}

function renderProjectEmployees(projectId, keyword = "") {
  const tbody = document.getElementById("detail-project-employee-table-body");

  if (!tbody) {
    return;
  }

  const allEmployees = getProjectEmployeeDetails(projectId);
  const canManage = canManageProjectEmployees();
  const query = normalizeKeyword(keyword);

  const filteredEmployees = allEmployees.filter((item) => {
    if (!query) {
      return true;
    }

    return normalizeKeyword(item.fullName).includes(query);
  });

  updateMemberCount(allEmployees.length);

  if (filteredEmployees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="px-2 py-6 text-center text-sm text-gray-500">Không có nhân viên phù hợp.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredEmployees
    .map(
      (item) => `
      <tr class="border-b">
        <td class="py-4">
          <div class="flex items-center gap-3">
            <img class="h-9 w-9 rounded-full" src="../../assets/images/account-icon.png" alt="avatar" />
            <div>
              <div>${escapeHtml(item.fullName)}</div>
              <div class="text-xs text-gray-500">${escapeHtml(item.employeeCode)}</div>
            </div>
          </div>
        </td>
        <td class="text-center">
          <span class="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600">${escapeHtml(item.role)}</span>
        </td>
        <td class="text-center">${
          canManage
            ? `<button
            type="button"
            class="rounded-md border border-red-200 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
            data-delete-employee-code="${escapeHtml(item.employeeCode)}"
          >
            -
          </button>`
            : "-"
        }</td>
      </tr>
    `,
    )
    .join("");

  if (canManage) {
    bindProjectEmployeeDeleteButtons();
  }
}

function bindProjectEmployeeDeleteButtons() {
  document.querySelectorAll("[data-delete-employee-code]").forEach((button) => {
    button.addEventListener("click", () => {
      const employeeCode = String(
        button.getAttribute("data-delete-employee-code") || "",
      ).trim();

      if (!employeeCode || !currentProjectDetail) {
        return;
      }

      pendingDeleteEmployeeCode = employeeCode;
      openDeleteEmployeeConfirmModal();
    });
  });
}

function bindDeleteEmployeeConfirmModal() {
  const modal = document.getElementById("delete-employee-confirm-modal");
  const cancelButton = document.getElementById("delete-employee-cancel-btn");
  const okButton = document.getElementById("delete-employee-ok-btn");

  if (!modal || !cancelButton || !okButton) {
    return;
  }

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    pendingDeleteEmployeeCode = "";
  };

  cancelButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  okButton.addEventListener("click", () => {
    if (!pendingDeleteEmployeeCode || !currentProjectDetail) {
      closeModal();
      return;
    }

    const employeeCode = pendingDeleteEmployeeCode;

    const employeeInProject = getProjectEmployeeDetails(
      currentProjectDetail.id,
    ).find((employee) => employee.employeeCode === employeeCode);

    if (!employeeInProject) {
      closeModal();
      return;
    }

    const employeeTasks = (currentProjectDetail.tasks || []).filter((task) => {
      if (task.assigneeCode) {
        return task.assigneeCode === employeeCode;
      }

      return (
        normalizeKeyword(task.assigneeName) ===
        normalizeKeyword(employeeInProject.fullName)
      );
    });

    employeeTasks.forEach((task) => {
      deleteTask(task.id);
      removeProjectTaskByTaskId(task.id, currentProjectDetail.id);
    });

    removeProjectEmployee(currentProjectDetail.id, employeeCode);
    closeModal();
    refreshCurrentProjectAndRender();
  });
}

function openDeleteEmployeeConfirmModal() {
  const modal = document.getElementById("delete-employee-confirm-modal");

  if (!modal) {
    return;
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function normalizeKeyword(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function bindEditProjectModal() {
  const openButton = document.getElementById("detail-edit-project-btn");
  const modal = document.getElementById("edit-project-modal");
  const closeButton = document.getElementById("edit-project-close-btn");
  const cancelButton = document.getElementById("edit-project-cancel-btn");
  const form = document.getElementById("edit-project-form");
  const leadNameInput = document.getElementById("editLeadNameInput");
  const leadCodeInput = document.getElementById("editLeadCodeInput");
  const startDateInput = document.getElementById("editCreatedAtInput");
  const endDateInput = document.getElementById("editEndDateInput");

  if (
    !openButton ||
    !modal ||
    !closeButton ||
    !cancelButton ||
    !form ||
    !leadNameInput ||
    !leadCodeInput ||
    !startDateInput ||
    !endDateInput
  ) {
    return;
  }

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };

  const openModal = () => {
    if (!currentProjectDetail) {
      return;
    }

    fillEditProjectForm(currentProjectDetail);
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  };

  openButton.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);
  cancelButton.addEventListener("click", closeModal);

  leadNameInput.addEventListener("focus", () => {
    showProjectManagerSuggestions(leadNameInput.value);
  });

  leadNameInput.addEventListener("input", () => {
    leadCodeInput.value = "";
    showProjectManagerSuggestions(leadNameInput.value);
  });

  startDateInput.addEventListener("input", updateEditProgressPreview);
  endDateInput.addEventListener("input", updateEditProgressPreview);

  document.addEventListener("click", (event) => {
    const suggestBox = document.getElementById("edit-lead-suggest-list");

    if (!suggestBox) {
      return;
    }

    if (event.target === leadNameInput || suggestBox.contains(event.target)) {
      return;
    }

    hideProjectManagerSuggestions();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!currentProjectDetail) {
      return;
    }

    const projectName = String(
      document.getElementById("editProjectNameInput")?.value || "",
    ).trim();
    const leadCode = String(
      document.getElementById("editLeadCodeInput")?.value || "",
    ).trim();
    const createdAtDate = String(
      document.getElementById("editCreatedAtInput")?.value || "",
    ).trim();
    const endDateValue = String(
      document.getElementById("editEndDateInput")?.value || "",
    ).trim();
    const status = String(
      document.getElementById("editStatusInput")?.value || "Đang tiến hành",
    ).trim();

    if (!projectName || !createdAtDate || !endDateValue) {
      alert("Vui lòng nhập đầy đủ thông tin hợp lệ.");
      return;
    }

    if (!leadCode) {
      alert("Vui lòng chọn quản lý dự án từ danh sách nhân viên.");
      return;
    }

    const leadIsValid = employees.some(
      (employee) => getEmployeeID(employee) === leadCode,
    );

    if (!leadIsValid) {
      alert(
        "Quản lý dự án không hợp lệ. Vui lòng chọn từ danh sách nhân viên.",
      );
      return;
    }

    const createdAt = new Date(`${createdAtDate}T00:00:00`).toISOString();
    const endDate = new Date(`${endDateValue}T23:59:59`).toISOString();

    if (new Date(endDate).getTime() <= new Date(createdAt).getTime()) {
      alert("Ngày kết thúc phải lớn hơn ngày bắt đầu.");
      return;
    }

    const updatedProject = updateProjectById(currentProjectDetail.id, {
      projectName,
      leadId: leadCode,
      createdAt,
      endDate,
      status,
    });

    if (!updatedProject) {
      alert("Không cập nhật được dự án.");
      return;
    }

    upsertProjectEmployee(currentProjectDetail.id, leadCode, "Project Manager");

    closeModal();
    refreshCurrentProjectAndRender();
  });
}

function fillEditProjectForm(project) {
  const nameInput = document.getElementById("editProjectNameInput");
  const leadInput = document.getElementById("editLeadNameInput");
  const leadCodeInput = document.getElementById("editLeadCodeInput");
  const createdAtInput = document.getElementById("editCreatedAtInput");
  const endDateInput = document.getElementById("editEndDateInput");
  const progressPreviewInput = document.getElementById(
    "editProgressPreviewInput",
  );
  const statusInput = document.getElementById("editStatusInput");

  if (
    !nameInput ||
    !leadInput ||
    !leadCodeInput ||
    !createdAtInput ||
    !endDateInput ||
    !progressPreviewInput ||
    !statusInput
  ) {
    return;
  }

  const matchedLead =
    employees.find((employee) => getEmployeeID(employee) === String(project.leadId || "").trim()) ||
    employees.find(
      (employee) =>
        normalizeKeyword(getEmployeeFullName(employee)) === normalizeKeyword(project.leadName),
    );

  nameInput.value = project.projectName || "";
  leadInput.value = getEmployeeFullName(matchedLead) || project.leadName || "";
  leadCodeInput.value = project.leadId || getEmployeeID(matchedLead) || "";
  createdAtInput.value = formatDateForInput(project.createdAt);
  endDateInput.value = formatDateForInput(project.endDate);
  progressPreviewInput.value = `${normalizeProgress(project.progress)}%`;
  statusInput.value = project.status || "Đang tiến hành";
}

function showProjectManagerSuggestions(keyword) {
  const suggestBox = document.getElementById("edit-lead-suggest-list");
  const leadInput = document.getElementById("editLeadNameInput");
  const leadCodeInput = document.getElementById("editLeadCodeInput");

  if (!suggestBox || !leadInput || !leadCodeInput) {
    return;
  }

  const query = normalizeKeyword(keyword);
  const matchedEmployees = employees
    .filter((employee) => {
      if (!query) {
        return true;
      }

      return normalizeKeyword(getEmployeeFullName(employee)).includes(query);
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
        data-lead-code="${escapeHtml(getEmployeeID(employee))}"
        data-lead-name="${escapeHtml(getEmployeeFullName(employee))}"
      >
        <span>${escapeHtml(getEmployeeFullName(employee))}</span>
        <span class="text-xs text-gray-500">${escapeHtml(getEmployeeID(employee))}</span>
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
      leadInput.value = selectedName;
      hideProjectManagerSuggestions();
    });
  });
}

function hideProjectManagerSuggestions() {
  const suggestBox = document.getElementById("edit-lead-suggest-list");

  if (!suggestBox) {
    return;
  }

  suggestBox.classList.add("hidden");
}

function updateEditProgressPreview() {
  const startDateInput = document.getElementById("editCreatedAtInput");
  const endDateInput = document.getElementById("editEndDateInput");
  const progressPreviewInput = document.getElementById(
    "editProgressPreviewInput",
  );

  if (!startDateInput || !endDateInput || !progressPreviewInput) {
    return;
  }

  if (!startDateInput.value || !endDateInput.value) {
    progressPreviewInput.value = "0%";
    return;
  }

  const startDate = new Date(`${startDateInput.value}T00:00:00`);
  const endDate = new Date(`${endDateInput.value}T23:59:59`);

  if (endDate.getTime() <= startDate.getTime()) {
    progressPreviewInput.value = "Ngày không hợp lệ";
    return;
  }

  progressPreviewInput.value = `${calculateProjectProgress(startDate, endDate)}%`;
}

function formatDateForInput(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function bindCreateTaskModal() {
  const openButton = document.getElementById("detail-create-task-btn");
  const modal = document.getElementById("create-task-modal");
  const closeButton = document.getElementById("create-task-close-btn");
  const cancelButton = document.getElementById("create-task-cancel-btn");
  const form = document.getElementById("create-task-form");
  const assigneeInput = document.getElementById("taskAssigneeInput");
  const assigneeCodeInput = document.getElementById("taskAssigneeCodeInput");

  if (
    !openButton ||
    !modal ||
    !closeButton ||
    !cancelButton ||
    !form ||
    !assigneeInput ||
    !assigneeCodeInput
  ) {
    return;
  }

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    form.reset();
    assigneeCodeInput.value = "";
    hideTaskAssigneeSuggestions();
  };

  const openModal = () => {
    if (!currentProjectDetail) {
      return;
    }

    fillTaskPhaseOptions(currentProjectDetail.id);
    showTaskAssigneeSuggestions(currentProjectDetail.id, "");

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  };

  openButton.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);
  cancelButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  assigneeInput.addEventListener("focus", () => {
    if (!currentProjectDetail) {
      return;
    }

    showTaskAssigneeSuggestions(currentProjectDetail.id, assigneeInput.value);
  });

  assigneeInput.addEventListener("input", () => {
    if (!currentProjectDetail) {
      return;
    }

    assigneeCodeInput.value = "";
    showTaskAssigneeSuggestions(currentProjectDetail.id, assigneeInput.value);
  });

  document.addEventListener("click", (event) => {
    const suggestBox = document.getElementById("task-assignee-suggest-list");

    if (!suggestBox) {
      return;
    }

    if (event.target === assigneeInput || suggestBox.contains(event.target)) {
      return;
    }

    hideTaskAssigneeSuggestions();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!currentProjectDetail) {
      return;
    }

    const title = String(
      document.getElementById("taskTitleInput")?.value || "",
    ).trim();
    const assigneeName = String(
      document.getElementById("taskAssigneeInput")?.value || "",
    ).trim();
    const assigneeCode = String(
      document.getElementById("taskAssigneeCodeInput")?.value || "",
    ).trim();
    const phaseId = String(
      document.getElementById("taskPhaseInput")?.value || "",
    ).trim();
    const priority = String(
      document.getElementById("taskPriorityInput")?.value || "medium",
    ).trim();
    const status = String(
      document.getElementById("taskStatusInput")?.value || "todo",
    ).trim();
    const description = String(
      document.getElementById("taskDescriptionInput")?.value || "",
    ).trim();

    if (!title || !phaseId) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Vui lòng nhập tên task và chọn giai đoạn.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    if (!assigneeCode || !assigneeName) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Vui lòng chọn người phụ trách từ danh sách nhân viên của dự án.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    const validAssignee = getProjectEmployeeDetails(
      currentProjectDetail.id,
    ).some((employee) => employee.employeeCode === assigneeCode);

    if (!validAssignee) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Người phụ trách không thuộc dự án hiện tại.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    const selectedPhase = findProjectPhaseById(phaseId);

    if (!selectedPhase || selectedPhase.projectId !== currentProjectDetail.id) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Giai đoạn không hợp lệ cho dự án hiện tại.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    const newTask = insertTask({
      title,
      description,
      assigneeCode,
      assigneeName,
      priority,
      status,
      phaseId,
    });

    const projectTaskCount = findProjectTasksByProjectId(
      currentProjectDetail.id,
    ).length;

    insertProjectTask({
      projectId: currentProjectDetail.id,
      taskId: newTask.id,
      phaseId,
      phaseName: selectedPhase.phaseName,
      sortOrder: projectTaskCount + 1,
    });

    closeModal();
    refreshCurrentProjectAndRender();
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Tạo mới task thành công",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
  });
}

function showTaskAssigneeSuggestions(projectId, keyword) {
  const suggestBox = document.getElementById("task-assignee-suggest-list");
  const assigneeInput = document.getElementById("taskAssigneeInput");
  const assigneeCodeInput = document.getElementById("taskAssigneeCodeInput");

  if (!suggestBox || !assigneeInput || !assigneeCodeInput) {
    return;
  }

  const query = normalizeKeyword(keyword);
  const projectEmployees = getProjectEmployeeDetails(projectId)
    .filter((employee) => {
      if (!query) {
        return true;
      }

      return normalizeKeyword(employee.fullName).includes(query);
    })
    .slice(0, 8);

  if (projectEmployees.length === 0) {
    suggestBox.innerHTML = `<div class="px-3 py-2 text-sm text-gray-500">Không có nhân viên phù hợp trong dự án.</div>`;
    suggestBox.classList.remove("hidden");
    return;
  }

  suggestBox.innerHTML = projectEmployees
    .map(
      (employee) => `
      <button
        type="button"
        class="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
        data-employee-code="${escapeHtml(employee.employeeCode)}"
        data-employee-name="${escapeHtml(employee.fullName)}"
      >
        <span>${escapeHtml(employee.fullName)}</span>
        <span class="text-xs text-gray-500">${escapeHtml(employee.employeeCode)}</span>
      </button>
    `,
    )
    .join("");

  suggestBox.classList.remove("hidden");

  suggestBox
    .querySelectorAll("button[data-employee-code]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const selectedCode = String(
          button.getAttribute("data-employee-code") || "",
        );
        const selectedName = String(
          button.getAttribute("data-employee-name") || "",
        );

        assigneeCodeInput.value = selectedCode;
        assigneeInput.value = selectedName;
        hideTaskAssigneeSuggestions();
      });
    });
}

function hideTaskAssigneeSuggestions() {
  const suggestBox = document.getElementById("task-assignee-suggest-list");

  if (!suggestBox) {
    return;
  }

  suggestBox.classList.add("hidden");
}

function fillTaskPhaseOptions(projectId) {
  const phaseSelect = document.getElementById("taskPhaseInput");

  if (!phaseSelect) {
    return;
  }

  const phases = findProjectPhasesByProjectId(projectId);

  if (phases.length === 0) {
    phaseSelect.innerHTML = `<option value="">Chưa có giai đoạn</option>`;
    return;
  }

  phaseSelect.innerHTML = phases
    .map(
      (phase) =>
        `<option value="${escapeHtml(phase.id)}">${escapeHtml(phase.phaseName)}</option>`,
    )
    .join("");
}

function refreshCurrentProjectAndRender() {
  const refreshedProject = getProjectDetailFromQuery(window.location.search);

  if (!refreshedProject) {
    return;
  }

  currentProjectDetail = refreshedProject;
  bindProjectDetail(refreshedProject);
  renderProjectEmployees(refreshedProject.id, "");
  renderProjectPhases(refreshedProject);
}

function renderProjectPhases(projectDetail) {
  const phaseListElement = document.getElementById("detail-phase-list");

  if (!phaseListElement) {
    return;
  }

  const phases = findProjectPhasesByProjectId(projectDetail.id);
  const canViewTask = canViewProjectTask();

  if (phases.length === 0) {
    phaseListElement.innerHTML = `
      <div class="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
        Chưa có giai đoạn. Bấm "Tạo giai đoạn" để thêm mới.
      </div>
    `;
    return;
  }

  const allTasks = Array.isArray(projectDetail.tasks)
    ? projectDetail.tasks
    : [];
  const tasks = getVisibleTasksByRole(allTasks);

  phaseListElement.innerHTML = phases
    .map((phase, index) => {
      const phaseTasks = tasks.filter((task) => task.phaseId === phase.id);
      return createPhaseCard(
        phase,
        phaseTasks,
        index + 1,
        canViewTask,
        projectDetail.id,
      );
    })
    .join("");

  bindPhaseToggleButtons();
}

function bindPhaseToggleButtons() {
  document.querySelectorAll("[data-phase-toggle-id]").forEach((header) => {
    header.addEventListener("click", () => {
      const phaseId = String(header.getAttribute("data-phase-toggle-id") || "").trim();

      if (!phaseId) {
        return;
      }

      const content = document.querySelector(`[data-phase-content-id="${phaseId}"]`);
      const icon = header.querySelector("[data-phase-chevron]");

      if (!content) {
        return;
      }

      const isCollapsed = content.classList.toggle("hidden");

      if (isCollapsed) {
        collapsedPhaseIds.add(phaseId);
      } else {
        collapsedPhaseIds.delete(phaseId);
      }

      if (icon) {
        icon.classList.toggle("rotate-180", !isCollapsed);
      }
    });
  });
}

function getVisibleTasksByRole(tasks) {
  if (!Array.isArray(tasks)) {
    return [];
  }

  if (getCurrentUserRoleLower() !== "employee") {
    return tasks;
  }

  const currentEmployeeCode = getCurrentUserEmployeeCode();

  if (!currentEmployeeCode) {
    return [];
  }

  const currentEmployee = employees.find(
    (employee) =>
      getEmployeeID(employee) === currentEmployeeCode,
  );
  const currentEmployeeName = normalizeKeyword(currentEmployee?.HoTen || "");

  return tasks.filter((task) => {
    const assigneeCode = String(task?.assigneeCode || "").trim();

    if (assigneeCode) {
      return assigneeCode === currentEmployeeCode;
    }

    const assigneeName = normalizeKeyword(task?.assigneeName || "");
    return Boolean(currentEmployeeName) && assigneeName === currentEmployeeName;
  });
}

function createPhaseCard(phase, tasks, orderNumber, canViewTask, projectId) {
  const progress = calculatePhaseProgress(tasks);
  const totalTasks = tasks.length;
  const colorClasses = getPhaseColorClasses(phase.color);
  const phaseId = String(phase.id || "").trim();
  const isCollapsed = collapsedPhaseIds.has(phaseId);
  const contentClass = isCollapsed ? "hidden" : "";
  const chevronClass = isCollapsed ? "" : "rotate-180";

  const taskTable = totalTasks
    ? `
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b text-gray-500">
            <th class="px-5 py-3 text-left">Task</th>
            <th>Người phụ trách</th>
            <th>Ưu tiên</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${tasks
            .map(
              (task) => `
            <tr class="border-b last:border-b-0">
              <td class="px-5 py-4">${
                canViewTask
                  ? `<a
                  href="${getTaskDetailUrl(task.id, projectId)}"
                  class="font-medium text-blue-700 hover:text-blue-800 hover:underline"
                >
                  ${escapeHtml(task.title || "N/A")}
                </a>`
                  : `<span class="font-medium text-gray-800">${escapeHtml(task.title || "N/A")}</span>`
              }</td>
              <td class="text-center">${escapeHtml(task.assigneeName || "-")}</td>
              <td class="text-center">
                <span class="rounded-full px-3 py-1 text-xs ${priorityBadgeClass(task.priority)}">
                  ${priorityLabel(task.priority)}
                </span>
              </td>
              <td class="text-center">
                <span class="rounded-full px-3 py-1 text-xs ${statusBadgeClass(task.status)}">
                  ${statusLabel(task.status)}
                </span>
              </td>
              <td class="text-center">${
                canViewTask
                  ? `<a
                  href="${getTaskDetailUrl(task.id, projectId)}"
                  class="rounded-md border border-blue-200 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                >
                  View
                </a>`
                  : "-"
              }</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `
    : `
      <div class="px-5 py-6 text-sm text-gray-500">Giai đoạn này chưa có task.</div>
    `;

  return `
    <div class="overflow-hidden rounded-xl border">
      <div class="flex cursor-pointer items-center justify-between border-b bg-gray-50 px-5 py-4" data-phase-toggle-id="${escapeHtml(phaseId)}">
        <div class="flex items-center gap-3">
          <span class="h-3 w-3 rounded-full ${colorClasses.dotClass}"></span>
          <h3 class="font-bold">
            ${orderNumber}. ${escapeHtml(phase.phaseName)}
            <span class="text-gray-400"> (${totalTasks}) </span>
          </h3>
        </div>
        <div class="flex items-center gap-3">
          <span>${progress}%</span>
          <div class="h-2 w-24 rounded-full bg-gray-200">
            <div class="h-2 rounded-full ${colorClasses.barClass}" style="width:${progress}%"></div>
          </div>
          <svg class="h-4 w-4 transform transition-transform ${chevronClass}" data-phase-chevron viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <div class="${contentClass}" data-phase-content-id="${escapeHtml(phaseId)}">
        ${taskTable}
      </div>
    </div>
  `;
}

function getTaskDetailUrl(taskId, projectId) {
  const encodedTaskId = encodeURIComponent(String(taskId || "").trim());
  const encodedProjectId = encodeURIComponent(String(projectId || "").trim());

  return `./task-detail.html?taskId=${encodedTaskId}&projectId=${encodedProjectId}`;
}

function calculatePhaseProgress(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return 0;
  }

  const doneCount = tasks.filter((task) => task.status === "done").length;
  return Math.round((doneCount / tasks.length) * 100);
}

function getPhaseColorClasses(color) {
  const normalizedColor = String(color || "blue").toLowerCase();

  switch (normalizedColor) {
    case "purple":
      return { dotClass: "bg-purple-500", barClass: "bg-purple-500" };
    case "green":
      return { dotClass: "bg-green-500", barClass: "bg-green-500" };
    case "orange":
      return { dotClass: "bg-orange-500", barClass: "bg-orange-500" };
    case "red":
      return { dotClass: "bg-red-500", barClass: "bg-red-500" };
    default:
      return { dotClass: "bg-blue-500", barClass: "bg-blue-500" };
  }
}

function priorityLabel(priority) {
  switch (priority) {
    case "high":
      return "Cao";
    case "low":
      return "Thấp";
    default:
      return "Trung bình";
  }
}

function priorityBadgeClass(priority) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-600";
    case "low":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-orange-100 text-orange-600";
  }
}

function statusLabel(status) {
  switch (status) {
    case "done":
      return "Hoàn thành";
    case "in_progress":
      return "Đang làm";
    default:
      return "Chưa làm";
  }
}

function statusBadgeClass(status) {
  switch (status) {
    case "done":
      return "bg-green-100 text-green-600";
    case "in_progress":
      return "bg-blue-100 text-blue-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function canEditProjectDetail() {
  return getCurrentUserRoleLower() === "hr_manager";
}

function canCreateProjectWork() {
  return getCurrentUserRoleLower() === "project_manager";
}

function canViewProjectTask() {
  const role = getCurrentUserRoleLower();
  return role === "employee" || role === "project_manager";
}

function canManageProjectEmployees() {
  const role = getCurrentUserRoleLower();
  return role === "hr_manager" || role === "project_manager";
}

function canAccessProjectDetail(projectDetail) {
  const projectId = String(projectDetail?.id || "").trim();

  if (!projectId) {
    return false;
  }

  const role = getCurrentUserRoleLower();

  if (role === "hr_manager") {
    return true;
  }

  const currentEmployeeCode = getCurrentUserEmployeeCode();

  if (!currentEmployeeCode) {
    return false;
  }

  if (role === "project_manager") {
    const ownerCode = String(
      projectDetail?.createdByEmployeeCode || projectDetail?.leadId || "",
    ).trim();
    return ownerCode === currentEmployeeCode;
  }

  return findProjectEmployeesByProjectId(projectId).some(
    (item) => String(item.employeeCode || "").trim() === currentEmployeeCode,
  );
}

function getCurrentUserEmployeeCode() {
  try {
    const rawCurrentUser = localStorage.getItem(CURRENT_USER);

    if (!rawCurrentUser) {
      return "";
    }

    const currentUser = JSON.parse(rawCurrentUser);

    return String(
      currentUser?.employeeID ||
      currentUser?.employeeCode ||
        "",
    ).trim();
  } catch {
    return "";
  }
}

function getCurrentUserRoleLower() {
  try {
    const rawCurrentUser = localStorage.getItem(CURRENT_USER);

    if (!rawCurrentUser) {
      return "";
    }

    const currentUser = JSON.parse(rawCurrentUser);
    const role = String(currentUser?.role || "")
      .toLowerCase()
      .trim();
    return role === "admin" ? "project_manager" : role;
  } catch {
    return "";
  }
}

function applyProjectDetailPermission() {
  if (!canEditProjectDetail()) {
    hideButtonById("detail-edit-project-btn");
  }

  if (!canCreateProjectWork()) {
    hideButtonById("detail-create-phase-btn");
    hideButtonById("detail-create-task-btn");
  }

  if (!canManageProjectEmployees()) {
    hideButtonById("detail-add-employee-btn");
  }
}

function hideButtonById(buttonId) {
  const button = document.getElementById(buttonId);

  if (!button) {
    return;
  }

  button.classList.add("hidden");
  button.setAttribute("aria-hidden", "true");
}

function showUnauthorizedProjectAlertAndRedirect() {
  const body = document.body;
  const html = document.documentElement;
  const redirectPath = "../accountdashboard/accountdashboard.html";

  if (body) {
    body.innerHTML = "";
    body.style.background = "#ffffff";
    body.style.margin = "0";
    body.style.minHeight = "100vh";
  }

  if (html) {
    html.style.background = "#ffffff";
  }

  const showAlertThenRedirect = () => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Bạn không phải là nhân viên thuộc dự án này.",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then(() => {
      window.location.replace(redirectPath);
    });
  };

  // Let the browser paint the blank body before showing the toast.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(showAlertThenRedirect);
  });
}
