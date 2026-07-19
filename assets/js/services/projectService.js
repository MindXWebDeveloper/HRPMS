import {
  initProjects,
  renderProjects,
  createProject,
} from "../../../database/project.js";

function createNewProject(values) {
  return createProject({
    projectName: values.projectName,
    leadId: values.leadId,
    memberCount: values.memberCount,
    status: values.status,
    createdAt: values.createdAt,
    endDate: values.endDate,
  });
}

export { initProjects, renderProjects, createNewProject };
