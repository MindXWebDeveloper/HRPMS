import {
  initProjects,
  renderProjects,
  createNewProject,
} from "./services/projectService.js";

document.addEventListener("render", initializeProjectPage);

document.addEventListener("DOMContentLoaded", () => {
  document.dispatchEvent(new Event("render"));
});

function initializeProjectPage() {
  initProjects();
  renderProjects();

  const projectForm = document.getElementById("project-form");

  if (projectForm) {
    projectForm.addEventListener("submit", handleCreateProject);
  }
}

function handleCreateProject(event) {
  event.preventDefault();

  const projectNameInput = document.getElementById("projectName");
  const leadNameInput = document.getElementById("leadName");
  const memberCountInput = document.getElementById("memberCount");
  const projectStatusInput = document.getElementById("projectStatus");

  if (
    !projectNameInput ||
    !leadNameInput ||
    !memberCountInput ||
    !projectStatusInput
  ) {
    alert("Không tìm thấy form nhập dự án.");
    return;
  }

  const projectName = projectNameInput.value.trim();
  const leadName = leadNameInput.value.trim();
  const memberCountValue = memberCountInput.value.trim();
  const projectStatus = projectStatusInput.value.trim();
  const memberCount = Number(memberCountValue);

  if (
    !projectName ||
    !leadName ||
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

  createNewProject({
    projectName,
    leadName,
    memberCount,
    status: projectStatus,
  });

  renderProjects();
  event.currentTarget.reset();

  const addProjectModal = document.getElementById("add-project");

  if (addProjectModal) {
    addProjectModal.classList.add("hidden");
    addProjectModal.setAttribute("aria-hidden", "true");
  }
}
