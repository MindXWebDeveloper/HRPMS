import { findTaskById, updateTask } from "../../database/task.js";
import { getProjectByTaskId } from "../../database/projet_task.js";
import { getProjectDetail } from "../../database/project.js";
import { getProjectEmployeeDetails } from "../../database/project-employees.js";
import { CURRENT_USER } from "./common/storageKeys.js";
import {
  getCommentsByTaskId,
  insertComment,
  deleteComment,
} from "../../database/comments.js";
import {
  findEmployeeByEmployeeID,
  getEmployeeFullName,
  getEmployeeAvatarUrl,
} from "../../database/employeedata.js";

const params = new URLSearchParams(window.location.search);
const taskId = String(params.get("taskId") || "").trim();
const queryProjectId = String(params.get("projectId") || "").trim();
const resolvedProjectId = queryProjectId || getProjectByTaskId(taskId) || "";

let currentTask = null;
let currentProjectEmployees = [];
const assigneeOptionsMap = new Map();
let currentSubtasks = [];
let editingSubtaskId = "";
let isHydratingForm = false;
let currentComments = [];

initializeTaskDetailPage();

function initializeTaskDetailPage() {
  if (!taskId) {
    showNotFound("Thiếu taskId trong đường dẫn.");
    return;
  }

  const task = findTaskById(taskId);

  if (!task) {
    showNotFound("Không tìm thấy task.");
    return;
  }

  currentTask = task;
  if (resolvedProjectId) {
    currentProjectEmployees = getProjectEmployeeDetails(resolvedProjectId);
  }

  currentSubtasks = normalizeSubtasks(task.checklist);
  currentComments = getCommentsByTaskId(task.id);
  bindTaskDetail(task);
  bindPageActions();
}

function bindTaskDetail(task) {
  const projectDetail = resolvedProjectId
    ? getProjectDetail(resolvedProjectId)
    : null;

  setTextById("task-detail-title", task.title || "Chi tiết task");
  setTextById("task-detail-code", task.taskCode || task.id || "N/A");
  setTextById(
    "task-detail-start-date",
    formatDate(task.startDate || task.createdAt),
  );

  const titleElement = document.getElementById("task-detail-title");
  if (titleElement && projectDetail?.projectName) {
    titleElement.textContent = `${task.title || "Task"} - ${projectDetail.projectName}`;
  }

  applyPriorityBadge(task.priority);
  applyStatusBadge(task.status);
  renderSubtasks(currentSubtasks);
  renderComments(currentComments);
  fillAssigneeOptions();
  fillEditForm(task);
}

function bindPageActions() {
  const backButton = document.getElementById("task-back-project-btn");
  const editForm = document.getElementById("task-edit-form");
  const subtaskList = document.getElementById("task-detail-checklist");
  const commentList = document.getElementById("task-comment-list");
  const commentForm = document.getElementById("task-comment-form");
  const estimateValueInput = document.getElementById(
    "task-plan-estimate-value-input",
  );
  const estimateUnitSelect = document.getElementById(
    "task-plan-estimate-unit-select",
  );

  if (backButton) {
    backButton.addEventListener("click", () => {
      navigateToProjectDetail();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveTaskDetail();
    });
  }

  bindTaskDraftAutoSave();

  if (estimateValueInput && estimateUnitSelect) {
    const normalizeAndPreview = () => {
      normalizeEstimateInput();
      updateEstimatePreviewFromInputs();
    };

    estimateValueInput.addEventListener("input", normalizeAndPreview);
    estimateUnitSelect.addEventListener("change", normalizeAndPreview);
  }

  bindSubtaskModal();

  if (subtaskList) {
    subtaskList.addEventListener("click", (event) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const editButton = target.closest("[data-subtask-edit-id]");
      if (editButton instanceof HTMLElement) {
        const subtaskId = String(
          editButton.getAttribute("data-subtask-edit-id") || "",
        ).trim();
        openSubtaskModalForEdit(subtaskId);
        return;
      }

      const deleteButton = target.closest("[data-subtask-delete-id]");
      if (deleteButton instanceof HTMLElement) {
        const subtaskId = String(
          deleteButton.getAttribute("data-subtask-delete-id") || "",
        ).trim();
        removeSubtask(subtaskId);
      }
    });
  }

  if (commentForm) {
    commentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitTaskComment();
    });
  }

  if (commentList) {
    commentList.addEventListener("click", (event) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const replyButton = target.closest("[data-reply-comment-id]");
      if (replyButton instanceof HTMLElement) {
        const commentId = String(
          replyButton.getAttribute("data-reply-comment-id") || "",
        ).trim();
        toggleReplyEditor(commentId);
        return;
      }

      const submitReplyButton = target.closest("[data-submit-reply-id]");
      if (submitReplyButton instanceof HTMLElement) {
        const parentCommentId = String(
          submitReplyButton.getAttribute("data-submit-reply-id") || "",
        ).trim();
        submitReplyComment(parentCommentId);
        return;
      }

      const deleteButton = target.closest("[data-delete-comment-id]");
      if (deleteButton instanceof HTMLElement) {
        const commentId = String(
          deleteButton.getAttribute("data-delete-comment-id") || "",
        ).trim();
        removeComment(commentId);
      }
    });
  }
}

function fillEditForm(task) {
  isHydratingForm = true;
  try {
    setInputValue("task-edit-title-input", task.title || "");
    setTextareaValue("task-edit-description-input", task.description || "");
    setSelectValue(
      "task-edit-priority-select",
      normalizePriorityValue(task.priority),
    );
    setSelectValue("task-edit-status-select", normalizeStatusValue(task.status));
    setInputValue("task-plan-due-date-input", formatDateForInput(task.dueDate));
    setInputValue(
      "task-plan-requester-input",
      String(task.requesterName || task.requestorName || ""),
    );
    setSelectValue(
      "task-plan-point-select",
      task.storyPoints || task.point ? String(task.storyPoints || task.point) : "",
    );

    fillEstimateInputs(task.estimateHours);

    const assigneeSelect = document.getElementById("task-edit-assignee-select");
    if (!assigneeSelect) {
      return;
    }

    const selectedAssigneeOption = Array.from(assigneeOptionsMap.entries()).find(
      ([, data]) =>
        data.code === String(task.assigneeCode || "") &&
        data.name === String(task.assigneeName || ""),
    );

    if (selectedAssigneeOption) {
      assigneeSelect.value = selectedAssigneeOption[0];
      return;
    }

    if (task.assigneeCode || task.assigneeName) {
      const legacyValue = "legacy";
      assigneeOptionsMap.set(legacyValue, {
        code: String(task.assigneeCode || ""),
        name: String(task.assigneeName || ""),
      });

      const legacyOption = document.createElement("option");
      legacyOption.value = legacyValue;
      legacyOption.textContent = `${task.assigneeName || "Chưa rõ"} (ngoài dự án)`;
      assigneeSelect.appendChild(legacyOption);
      assigneeSelect.value = legacyValue;
      return;
    }

    assigneeSelect.value = "unassigned";
  } finally {
    isHydratingForm = false;
  }
}

function fillAssigneeOptions() {
  const assigneeSelect = document.getElementById("task-edit-assignee-select");
  const subtaskAssigneeSelect = document.getElementById(
    "subtask-assignee-select",
  );

  if (!assigneeSelect && !subtaskAssigneeSelect) {
    return;
  }

  assigneeOptionsMap.clear();

  const optionRows = [
    `<option value="unassigned">Chưa phân công</option>`,
  ];

  assigneeOptionsMap.set("unassigned", { code: "", name: "" });

  currentProjectEmployees.forEach((employee) => {
    const code = String(employee.employeeCode || "").trim();
    const name = String(employee.fullName || "").trim();

    if (!code || !name) {
      return;
    }

    const value = `member:${code}`;
    assigneeOptionsMap.set(value, { code, name });
    optionRows.push(
      `<option value="${escapeHtml(value)}">${escapeHtml(name)} (${escapeHtml(code)})</option>`,
    );
  });

  if (assigneeSelect) {
    assigneeSelect.innerHTML = optionRows.join("");
  }

  if (subtaskAssigneeSelect) {
    subtaskAssigneeSelect.innerHTML = optionRows.join("");
  }
}

function navigateToProjectDetail() {
  if (resolvedProjectId) {
    window.location.href = `./project-detail.html?projectId=${encodeURIComponent(resolvedProjectId)}`;
    return;
  }

  window.history.back();
}

function saveTaskDetail() {
  const persistedTask = persistTaskSnapshot({ strict: true });

  if (!persistedTask) {
    return;
  }

  currentTask = persistedTask;
  bindTaskDetail(persistedTask);

  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: "Đã lưu thay đổi task.",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
}

function bindTaskDraftAutoSave() {
  const autosaveFieldIds = [
    "task-edit-title-input",
    "task-edit-assignee-select",
    "task-edit-priority-select",
    "task-edit-status-select",
    "task-edit-description-input",
    "task-plan-due-date-input",
    "task-plan-requester-input",
    "task-plan-point-select",
    "task-plan-estimate-value-input",
    "task-plan-estimate-unit-select",
  ];

  autosaveFieldIds.forEach((fieldId) => {
    const field = document.getElementById(fieldId);

    if (!field) {
      return;
    }

    const handler = () => {
      if (isHydratingForm) {
        return;
      }

      persistTaskSnapshot({ strict: false, silent: true });
    };

    field.addEventListener("change", handler);

    if (field.tagName === "INPUT" || field.tagName === "TEXTAREA") {
      field.addEventListener("input", handler);
    }
  });
}

function persistTaskSnapshot(options = {}) {
  if (!currentTask) {
    return null;
  }

  const { strict = false, silent = false } = options;
  const formData = collectTaskFormData();

  if (strict && !formData.title) {
    if (!silent) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Tiêu đề task không được để trống.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
    return null;
  }

  if (
    strict &&
    formData.dueDate &&
    currentTask.startDate &&
    formData.dueDate < currentTask.startDate.slice(0, 10)
  ) {
    if (!silent) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Ngày kết thúc không được sớm hơn ngày bắt đầu.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
    return null;
  }

  if (strict && formData.storyPointsInput && Number.isNaN(formData.storyPoints)) {
    if (!silent) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Point không hợp lệ.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
    return null;
  }

  if (
    strict &&
    formData.estimateValueInput &&
    (formData.estimateHours === null || Number.isNaN(formData.estimateHours))
  ) {
    if (!silent) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Estimate không hợp lệ.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
    return null;
  }

  const payload = {
    title: formData.title,
    assigneeCode: formData.assigneeValue.code,
    assigneeName: formData.assigneeValue.name,
    priority: formData.priority,
    dueDate: formData.dueDate || null,
    description: formData.description,
    status: formData.status,
    requesterName: formData.requesterName,
    storyPoints: formData.storyPoints,
    estimateHours: formData.estimateHours,
    checklist: currentSubtasks,
    completedAt:
      formData.status === "done"
        ? currentTask.completedAt || new Date().toISOString()
        : null,
  };

  const updatedTask = updateTask(currentTask.id, payload);

  if (!updatedTask) {
    if (!silent) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Không lưu được thay đổi task.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
    return null;
  }

  currentTask = updatedTask;
  return updatedTask;
}

function collectTaskFormData() {
  const title = String(
    document.getElementById("task-edit-title-input")?.value ||
      currentTask?.title ||
      "",
  ).trim();
  const description = String(
    document.getElementById("task-edit-description-input")?.value ||
      currentTask?.description ||
      "",
  ).trim();
  const dueDate = String(
    document.getElementById("task-plan-due-date-input")?.value ||
      formatDateForInput(currentTask?.dueDate) ||
      "",
  ).trim();
  const requesterName = String(
    document.getElementById("task-plan-requester-input")?.value ||
      currentTask?.requesterName ||
      currentTask?.requestorName ||
      "",
  ).trim();
  const storyPointsInput = String(
    document.getElementById("task-plan-point-select")?.value ||
      (currentTask?.storyPoints ? String(currentTask.storyPoints) : "") ||
      "",
  ).trim();
  const estimateValueInput = String(
    document.getElementById("task-plan-estimate-value-input")?.value ||
      "",
  ).trim();
  const estimateUnitInput = String(
    document.getElementById("task-plan-estimate-unit-select")?.value || "h",
  ).trim();
  const priority = normalizePriorityValue(
    document.getElementById("task-edit-priority-select")?.value ||
      currentTask?.priority ||
      "medium",
  );
  const status = normalizeStatusValue(
    document.getElementById("task-edit-status-select")?.value ||
      currentTask?.status ||
      "todo",
  );
  const assigneeKey = String(
    document.getElementById("task-edit-assignee-select")?.value || "unassigned",
  ).trim();
  const assigneeValue = assigneeOptionsMap.get(assigneeKey) || {
    code: String(currentTask?.assigneeCode || ""),
    name: String(currentTask?.assigneeName || ""),
  };
  const storyPoints = storyPointsInput ? Number(storyPointsInput) : null;
  const estimateHours = toEstimateHours(estimateValueInput, estimateUnitInput);

  return {
    title,
    description,
    dueDate,
    requesterName,
    storyPointsInput,
    estimateValueInput,
    estimateUnitInput,
    priority,
    status,
    assigneeValue,
    storyPoints,
    estimateHours,
  };
}

function showNotFound(message) {
  const titleElement = document.getElementById("task-detail-title");
  if (titleElement) {
    titleElement.textContent = "Không tìm thấy task";
  }

  const form = document.getElementById("task-edit-form");
  if (form) {
    form.classList.add("pointer-events-none", "opacity-60");
  }

  const checklistContainer = document.getElementById("task-detail-checklist");
  if (checklistContainer) {
    checklistContainer.innerHTML = `<p class="text-sm text-slate-500">${escapeHtml(message || "Không tìm thấy dữ liệu task.")}</p>`;
  }

  const addSubtaskButton = document.getElementById("task-add-subtask-btn");
  if (addSubtaskButton) {
    addSubtaskButton.setAttribute("disabled", "true");
    addSubtaskButton.classList.add("cursor-not-allowed", "opacity-60");
  }

  const commentInput = document.getElementById("task-comment-input");
  if (commentInput) {
    commentInput.setAttribute("disabled", "true");
  }
}

function submitTaskComment() {
  const currentUser = getCurrentUserIdentity();

  if (!currentTask || !currentUser.employeeID) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Không xác định được người bình luận.",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
    return;
  }

  const contentInput = document.getElementById("task-comment-input");
  const content = String(contentInput?.value || "").trim();

  if (!content) {
    return;
  }

  const inserted = insertComment({
    employeeID: currentUser.employeeID,
    taskId: currentTask.id,
    content,
    parentCommentId: null,
  });

  if (!inserted) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Không lưu được comment.",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
    return;
  }

  if (contentInput) {
    contentInput.value = "";
  }

  reloadComments();
}

function submitReplyComment(parentCommentId) {
  const currentUser = getCurrentUserIdentity();

  if (!currentTask || !currentUser.employeeID || !parentCommentId) {
    return;
  }

  const replyInput = document.getElementById(`reply-input-${parentCommentId}`);
  const content = String(replyInput?.value || "").trim();

  if (!content) {
    return;
  }

  const inserted = insertComment({
    employeeID: currentUser.employeeID,
    taskId: currentTask.id,
    content,
    parentCommentId,
  });

  if (!inserted) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Không lưu được reply.",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
    return;
  }

  reloadComments();
}

function removeComment(commentId) {
  if (!commentId) {
    return;
  }

  Swal.fire({
    title: "Xóa comment?",
    text: "Comment và các reply con sẽ bị xóa.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
    confirmButtonColor: "#dc2626",
  }).then((result) => {
    if (!result.isConfirmed) {
      return;
    }

    const deleted = deleteComment(commentId);

    if (!deleted) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Không xóa được comment.",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return;
    }

    reloadComments();
  });
}

function reloadComments() {
  if (!currentTask) {
    return;
  }

  currentComments = getCommentsByTaskId(currentTask.id);
  renderComments(currentComments);
}

function toggleReplyEditor(commentId) {
  const editor = document.getElementById(`reply-editor-${commentId}`);

  if (!editor) {
    return;
  }

  editor.classList.toggle("hidden");
}

function renderComments(comments) {
  const listElement = document.getElementById("task-comment-list");

  if (!listElement) {
    return;
  }

  const roots = comments.filter((comment) => !comment.parentCommentId);

  if (!roots.length) {
    listElement.innerHTML = `
      <div class="rounded-lg border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
        Chưa có comment nào cho task này.
      </div>
    `;
    return;
  }

  listElement.innerHTML = roots
    .map((comment) => renderCommentCard(comment, comments, 0))
    .join("");
}

function renderCommentCard(comment, allComments, level) {
  const profile = getCommentAuthorProfile(comment.employeeID);
  const childComments = allComments.filter(
    (item) => item.parentCommentId === comment.id,
  );

  const indentClass = level > 0 ? "ml-8 mt-3" : "";
  const actions = `
    <div class="mt-2 flex items-center gap-3 text-xs">
      <button
        type="button"
        data-reply-comment-id="${escapeHtml(comment.id)}"
        class="font-medium text-blue-600 hover:underline"
      >
        Trả lời
      </button>
      <button
        type="button"
        data-delete-comment-id="${escapeHtml(comment.id)}"
        class="font-medium text-red-600 hover:underline"
      >
        Xóa
      </button>
    </div>
  `;

  const replyEditor = `
    <div id="reply-editor-${escapeHtml(comment.id)}" class="mt-3 hidden rounded-lg border border-slate-200 p-3">
      <textarea
        id="reply-input-${escapeHtml(comment.id)}"
        rows="2"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        placeholder="Viết phản hồi..."
      ></textarea>
      <div class="mt-2 flex justify-end">
        <button
          type="button"
          data-submit-reply-id="${escapeHtml(comment.id)}"
          class="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
        >
          Gửi phản hồi
        </button>
      </div>
    </div>
  `;

  return `
    <div class="${indentClass}">
      <div class="rounded-lg border border-slate-200 p-3">
        <div class="flex items-start gap-3">
          ${renderCommentAvatar(profile.avatarUrl, profile.fullName)}
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm font-semibold text-slate-800">${escapeHtml(profile.fullName || comment.employeeID)}</p>
              <span class="text-xs text-slate-500">${escapeHtml(formatDateTime(comment.createdAt))}</span>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">${escapeHtml(comment.employeeID)}</span>
            </div>
            <p class="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">${escapeHtml(comment.content)}</p>
            ${actions}
            ${replyEditor}
          </div>
        </div>
      </div>
      ${childComments.map((child) => renderCommentCard(child, allComments, level + 1)).join("")}
    </div>
  `;
}

function renderCommentAvatar(avatarUrl, fullName) {
  if (avatarUrl) {
    return `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(fullName || "Avatar")}" class="h-9 w-9 rounded-full object-cover" />`;
  }

  const letter = String(fullName || "?").trim().charAt(0).toUpperCase() || "?";
  return `<div class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">${escapeHtml(letter)}</div>`;
}

function getCommentAuthorProfile(employeeID) {
  const employee = findEmployeeByEmployeeID(employeeID);

  if (!employee) {
    return {
      fullName: employeeID || "Người dùng",
      avatarUrl: "",
    };
  }

  return {
    fullName: getEmployeeFullName(employee) || employeeID,
    avatarUrl: getEmployeeAvatarUrl(employee),
  };
}

function getCurrentUserIdentity() {
  try {
    const raw = localStorage.getItem(CURRENT_USER);

    if (!raw) {
      return { employeeID: "", role: "" };
    }

    const currentUser = JSON.parse(raw);
    return {
      employeeID: String(
        currentUser?.employeeID || currentUser?.employeeCode || "",
      ).trim(),
      role: String(currentUser?.role || "").trim().toLowerCase(),
    };
  } catch {
    return { employeeID: "", role: "" };
  }
}

function applyPriorityBadge(priority) {
  const badge = document.getElementById("task-detail-priority");
  if (!badge) {
    return;
  }

  const normalized = normalizePriorityValue(priority);

  badge.className = `inline-flex rounded-full px-3 py-1 text-xs ${priorityBadgeClass(normalized)}`;
  badge.textContent = priorityLabel(normalized);
}

function applyStatusBadge(status) {
  const badge = document.getElementById("task-detail-status");
  if (!badge) {
    return;
  }

  const normalized = normalizeStatusValue(status);

  badge.className = `inline-flex rounded-full px-3 py-1 text-xs ${statusBadgeClass(normalized)}`;
  badge.textContent = statusLabel(normalized);
}

function renderSubtasks(subtasks) {
  const checklistContainer = document.getElementById("task-detail-checklist");
  const statsElement = document.getElementById("task-subtask-stats");

  if (!checklistContainer) {
    return;
  }

  if (!Array.isArray(subtasks) || subtasks.length === 0) {
    checklistContainer.innerHTML = `
      <div class="rounded-lg border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
        Chưa có subtask. Bấm "Tạo subtask" để thêm công việc con.
      </div>
    `;
    if (statsElement) {
      statsElement.textContent = "0/0 hoàn thành";
    }
    return;
  }

  const completedCount = subtasks.filter(
    (subtask) => normalizeStatusValue(subtask.status) === "done",
  ).length;

  if (statsElement) {
    statsElement.textContent = `${completedCount}/${subtasks.length} hoàn thành`;
  }

  checklistContainer.innerHTML = subtasks
    .map((subtask) => {
      const assigneeLabel = subtask.assigneeName || "Chưa phân công";
      const dueDateLabel = subtask.dueDate ? formatDate(subtask.dueDate) : "Chưa có hạn";

      return `
        <div class="rounded-lg border border-slate-200 p-3">
          <div class="mb-2 flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-800">${escapeHtml(subtask.title || "Subtask")}</p>
              <p class="text-xs text-slate-500">${escapeHtml(assigneeLabel)} • ${escapeHtml(dueDateLabel)}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="rounded-full px-2.5 py-1 text-[11px] ${priorityBadgeClass(subtask.priority)}">${priorityLabel(subtask.priority)}</span>
              <span class="rounded-full px-2.5 py-1 text-[11px] ${statusBadgeClass(subtask.status)}">${statusLabel(subtask.status)}</span>
            </div>
          </div>
          <p class="mb-3 text-sm text-slate-700">${escapeHtml(subtask.description || "Không có mô tả")}</p>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              data-subtask-edit-id="${escapeHtml(subtask.id)}"
              class="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Sửa
            </button>
            <button
              type="button"
              data-subtask-delete-id="${escapeHtml(subtask.id)}"
              class="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Xóa
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function bindSubtaskModal() {
  const addButton = document.getElementById("task-add-subtask-btn");
  const modal = document.getElementById("subtask-modal");
  const closeButton = document.getElementById("subtask-modal-close-btn");
  const cancelButton = document.getElementById("subtask-modal-cancel-btn");
  const form = document.getElementById("subtask-form");

  if (!addButton || !modal || !closeButton || !cancelButton || !form) {
    return;
  }

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    form.reset();
    editingSubtaskId = "";
  };

  addButton.addEventListener("click", () => {
    editingSubtaskId = "";
    setTextById("subtask-modal-title", "Tạo subtask");
    setSelectValue("subtask-assignee-select", "unassigned");
    setSelectValue("subtask-priority-select", "medium");
    setSelectValue("subtask-status-select", "todo");
    setInputValue("subtask-due-date-input", "");
    setInputValue("subtask-title-input", "");
    setTextareaValue("subtask-description-input", "");

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  });

  closeButton.addEventListener("click", closeModal);
  cancelButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const isSaved = saveSubtaskFromModal();

    if (isSaved) {
      closeModal();
    }
  });
}

function saveSubtaskFromModal() {
  if (!currentTask) {
    return false;
  }

  const title = String(
    document.getElementById("subtask-title-input")?.value || "",
  ).trim();
  const description = String(
    document.getElementById("subtask-description-input")?.value || "",
  ).trim();
  const dueDate = String(
    document.getElementById("subtask-due-date-input")?.value || "",
  ).trim();
  const priority = normalizePriorityValue(
    document.getElementById("subtask-priority-select")?.value || "medium",
  );
  const status = normalizeStatusValue(
    document.getElementById("subtask-status-select")?.value || "todo",
  );
  const assigneeKey = String(
    document.getElementById("subtask-assignee-select")?.value || "unassigned",
  ).trim();
  const assigneeValue = assigneeOptionsMap.get(assigneeKey) || {
    code: "",
    name: "",
  };

  if (!title) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Tiêu đề subtask không được để trống.",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
    return false;
  }

  if (dueDate && currentTask.startDate && dueDate < currentTask.startDate.slice(0, 10)) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Hạn subtask không được sớm hơn ngày bắt đầu task.",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
    return false;
  }

  if (editingSubtaskId) {
    currentSubtasks = currentSubtasks.map((subtask) => {
      if (subtask.id !== editingSubtaskId) {
        return subtask;
      }

      return {
        ...subtask,
        title,
        assigneeCode: assigneeValue.code,
        assigneeName: assigneeValue.name,
        priority,
        status,
        dueDate: dueDate || null,
        description,
        completedAt:
          status === "done"
            ? subtask.completedAt || new Date().toISOString()
            : null,
        updatedAt: new Date().toISOString(),
      };
    });
  } else {
    currentSubtasks = [
      ...currentSubtasks,
      {
        id: `subtask-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title,
        assigneeCode: assigneeValue.code,
        assigneeName: assigneeValue.name,
        priority,
        status,
        dueDate: dueDate || null,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  persistSubtasks();
  return true;
}

function openSubtaskModalForEdit(subtaskId) {
  const modal = document.getElementById("subtask-modal");
  if (!modal) {
    return;
  }

  const subtask = currentSubtasks.find((item) => item.id === subtaskId);
  if (!subtask) {
    return;
  }

  editingSubtaskId = subtaskId;
  setTextById("subtask-modal-title", "Sửa subtask");
  setInputValue("subtask-title-input", subtask.title || "");
  setTextareaValue("subtask-description-input", subtask.description || "");
  setInputValue("subtask-due-date-input", formatDateForInput(subtask.dueDate));
  setSelectValue("subtask-priority-select", normalizePriorityValue(subtask.priority));
  setSelectValue("subtask-status-select", normalizeStatusValue(subtask.status));

  const subtaskAssigneeSelect = document.getElementById("subtask-assignee-select");
  if (subtaskAssigneeSelect) {
    const assigneeOption = Array.from(assigneeOptionsMap.entries()).find(
      ([, data]) =>
        data.code === String(subtask.assigneeCode || "") &&
        data.name === String(subtask.assigneeName || ""),
    );

    subtaskAssigneeSelect.value = assigneeOption ? assigneeOption[0] : "unassigned";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function removeSubtask(subtaskId) {
  const subtask = currentSubtasks.find((item) => item.id === subtaskId);
  if (!subtask) {
    return;
  }

  Swal.fire({
    title: "Xóa subtask?",
    text: `Subtask "${subtask.title || "N/A"}" sẽ bị xóa khỏi task này.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
    confirmButtonColor: "#dc2626",
  }).then((result) => {
    if (!result.isConfirmed) {
      return;
    }

    currentSubtasks = currentSubtasks.filter((item) => item.id !== subtaskId);
    persistSubtasks();
  });
}

function persistSubtasks() {
  if (!currentTask) {
    return;
  }

  const updatedTask = persistTaskSnapshot({ strict: false, silent: true });

  if (!updatedTask) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Không lưu được subtask.",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
    return;
  }

  currentTask = updatedTask;
  renderSubtasks(currentSubtasks);

  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: "Đã cập nhật subtask.",
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
  });
}

function normalizeSubtasks(rawChecklist) {
  if (!Array.isArray(rawChecklist)) {
    return [];
  }

  return rawChecklist
    .map((item, index) => normalizeSubtaskItem(item, index))
    .filter(Boolean);
}

function normalizeSubtaskItem(item, index) {
  if (typeof item === "string") {
    return {
      id: `subtask-legacy-${index + 1}`,
      title: item,
      description: "",
      assigneeCode: "",
      assigneeName: "",
      priority: "medium",
      status: "todo",
      dueDate: null,
      createdAt: null,
      updatedAt: null,
      completedAt: null,
    };
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  return {
    id: String(item.id || `subtask-legacy-${index + 1}`),
    title: String(item.title || item.label || "Subtask"),
    description: String(item.description || ""),
    assigneeCode: String(item.assigneeCode || ""),
    assigneeName: String(item.assigneeName || ""),
    priority: normalizePriorityValue(item.priority),
    status: normalizeStatusValue(
      item.status || (item.done || item.checked ? "done" : "todo"),
    ),
    dueDate: item.dueDate || null,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    completedAt: item.completedAt || null,
  };
}

function normalizePriorityValue(priority) {
  const value = String(priority || "medium").toLowerCase();

  if (value === "high") {
    return "high";
  }

  if (value === "low") {
    return "low";
  }

  return "medium";
}

function normalizeStatusValue(status) {
  const value = String(status || "todo").toLowerCase();

  if (value === "done" || value === "hoàn thành") {
    return "done";
  }

  if (value === "in_progress" || value === "in progress" || value === "đang làm") {
    return "in_progress";
  }

  if (value === "blocked" || value === "tạm dừng") {
    return "blocked";
  }

  return "todo";
}

function priorityLabel(priority) {
  if (priority === "high") {
    return "Cao";
  }

  if (priority === "low") {
    return "Thấp";
  }

  return "Trung bình";
}

function priorityBadgeClass(priority) {
  if (priority === "high") {
    return "bg-red-100 text-red-600";
  }

  if (priority === "low") {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-orange-100 text-orange-600";
}

function statusLabel(status) {
  if (status === "done") {
    return "Hoàn thành";
  }

  if (status === "in_progress") {
    return "Đang làm";
  }

  if (status === "blocked") {
    return "Tạm dừng";
  }

  return "Chưa làm";
}

function statusBadgeClass(status) {
  if (status === "done") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "in_progress") {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "blocked") {
    return "bg-red-100 text-red-600";
  }

  return "bg-gray-100 text-gray-700";
}

function setTextById(elementId, value) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.textContent = value;
}

function setInputValue(elementId, value) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.value = value;
}

function setTextareaValue(elementId, value) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.value = value;
}

function setSelectValue(elementId, value) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.value = value;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "N/A";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function formatDateForInput(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "Vừa xong";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Vừa xong";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatHours(value) {
  if (value === undefined || value === null || value === "") {
    return "N/A";
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return "N/A";
  }

  return `${numeric}h`;
}

function fillEstimateInputs(hours) {
  const estimateValueInput = document.getElementById("task-plan-estimate-value-input");
  const estimateUnitSelect = document.getElementById("task-plan-estimate-unit-select");

  if (!estimateValueInput || !estimateUnitSelect) {
    return;
  }

  const normalized = normalizeEstimateFromHours(hours);

  estimateValueInput.value = normalized.value;
  estimateUnitSelect.value = normalized.unit;
  updateEstimatePreviewFromInputs();
}

function normalizeEstimateFromHours(hours) {
  const numeric = Number(hours);

  if (Number.isNaN(numeric) || numeric <= 0) {
    return { value: "", unit: "h" };
  }

  if (numeric % 40 === 0) {
    return { value: String(numeric / 40), unit: "w" };
  }

  if (numeric % 8 === 0) {
    return { value: String(numeric / 8), unit: "d" };
  }

  return { value: String(numeric), unit: "h" };
}

function normalizeEstimateInput() {
  const estimateValueInput = document.getElementById("task-plan-estimate-value-input");
  const estimateUnitSelect = document.getElementById("task-plan-estimate-unit-select");

  if (!estimateValueInput || !estimateUnitSelect) {
    return;
  }

  const value = Number(estimateValueInput.value || 0);
  let unit = String(estimateUnitSelect.value || "h");

  if (!Number.isFinite(value) || value <= 0) {
    return;
  }

  let normalizedValue = value;

  if (unit === "h" && normalizedValue % 8 === 0) {
    normalizedValue = normalizedValue / 8;
    unit = "d";
  }

  if (unit === "d" && normalizedValue % 5 === 0) {
    normalizedValue = normalizedValue / 5;
    unit = "w";
  }

  estimateValueInput.value = String(normalizedValue);
  estimateUnitSelect.value = unit;
}

function updateEstimatePreviewFromInputs() {
  const estimateValueInput = document.getElementById("task-plan-estimate-value-input");
  const estimateUnitSelect = document.getElementById("task-plan-estimate-unit-select");
  const estimatePreview = document.getElementById("task-plan-estimate-display");

  if (!estimateValueInput || !estimateUnitSelect || !estimatePreview) {
    return;
  }

  const hours = toEstimateHours(
    estimateValueInput.value,
    estimateUnitSelect.value,
  );

  if (hours === null || Number.isNaN(hours) || hours <= 0) {
    estimatePreview.textContent = "N/A";
    return;
  }

  const normalized = normalizeEstimateFromHours(hours);
  estimatePreview.textContent = `Tương đương: ${hours}h (${normalized.value}${normalized.unit})`;
}

function toEstimateHours(valueInput, unitInput) {
  const value = Number(valueInput);
  const unit = String(unitInput || "h");

  if (!valueInput || Number.isNaN(value) || value < 0) {
    return null;
  }

  if (unit === "w") {
    return value * 40;
  }

  if (unit === "d") {
    return value * 8;
  }

  return value;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
