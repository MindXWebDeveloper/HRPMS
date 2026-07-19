import { PROJECT_TASKS } from "../assets/js/common/storageKeys.js";
import { findTasksByIds } from "./task.js";

const DEFAULT_PROJECT_TASKS = [
  {
    id: "pt-001",
    projectId: "prj-001",
    taskId: "task-001",
    phaseId: "phase-001",
    phaseName: "Phan tich yeu cau",
    sortOrder: 1,
    createdAt: "2026-07-01T08:00:00",
    updatedAt: "2026-07-01T08:00:00",
  },
  {
    id: "pt-002",
    projectId: "prj-001",
    taskId: "task-002",
    phaseId: "phase-001",
    phaseName: "Phan tich yeu cau",
    sortOrder: 2,
    createdAt: "2026-07-02T08:00:00",
    updatedAt: "2026-07-02T08:00:00",
  },
  {
    id: "pt-003",
    projectId: "prj-002",
    taskId: "task-003",
    phaseId: "phase-004",
    phaseName: "Thiet ke he thong",
    sortOrder: 1,
    createdAt: "2026-07-03T08:00:00",
    updatedAt: "2026-07-03T08:00:00",
  },
];

function initProjectTasks() {
  const storedProjectTasks = getAllProjectTasks();

  if (storedProjectTasks.length === 0) {
    saveProjectTasks(DEFAULT_PROJECT_TASKS);
  }
}

function getAllProjectTasks() {
  try {
    const storedProjectTasks = JSON.parse(localStorage.getItem(PROJECT_TASKS));

    return Array.isArray(storedProjectTasks) ? storedProjectTasks : [];
  } catch {
    return [];
  }
}

function saveProjectTasks(projectTasks) {
  localStorage.setItem(PROJECT_TASKS, JSON.stringify(projectTasks));
}

function insertProjectTask(projectTaskJson) {
  const projectTasks = getAllProjectTasks();
  const now = new Date().toISOString();

  const newProjectTask = {
    id: projectTaskJson.id || `pt-${Date.now()}`,
    projectId: projectTaskJson.projectId,
    taskId: projectTaskJson.taskId,
    phaseId: projectTaskJson.phaseId || "",
    phaseName: projectTaskJson.phaseName || "",
    sortOrder: Number(projectTaskJson.sortOrder || 0),
    createdAt: projectTaskJson.createdAt || now,
    updatedAt: projectTaskJson.updatedAt || now,
  };

  projectTasks.push(newProjectTask);
  saveProjectTasks(projectTasks);

  return newProjectTask;
}

function findProjectTasksByProjectId(projectId) {
  return getAllProjectTasks()
    .filter((item) => item.projectId === projectId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function findTaskIdsByProjectId(projectId) {
  return findProjectTasksByProjectId(projectId).map((item) => item.taskId);
}

function getTasksByProjectId(projectId) {
  const projectTasks = findProjectTasksByProjectId(projectId);
  const taskIds = projectTasks.map((item) => item.taskId);
  const tasks = findTasksByIds(taskIds);

  const taskById = new Map(tasks.map((task) => [task.id, task]));

  const mappingByTaskId = new Map(projectTasks.map((item) => [item.taskId, item]));

  return taskIds
    .map((taskId) => {
      const task = taskById.get(taskId);

      if (!task) {
        return null;
      }

      const mapping = mappingByTaskId.get(taskId);

      return {
        ...task,
        phaseId: mapping?.phaseId || task.phaseId || "",
      };
    })
    .filter(Boolean);
}

function removeProjectTask(projectTaskId) {
  const projectTasks = getAllProjectTasks();
  const nextProjectTasks = projectTasks.filter((item) => item.id !== projectTaskId);

  if (nextProjectTasks.length === projectTasks.length) {
    return false;
  }

  saveProjectTasks(nextProjectTasks);
  return true;
}

function removeProjectTaskByTaskId(taskId, projectId) {
  const projectTasks = getAllProjectTasks();
  const nextProjectTasks = projectTasks.filter((item) => {
    if (projectId) {
      return !(item.taskId === taskId && item.projectId === projectId);
    }

    return item.taskId !== taskId;
  });

  if (nextProjectTasks.length === projectTasks.length) {
    return false;
  }

  saveProjectTasks(nextProjectTasks);
  return true;
}

function updateProjectTaskByTaskId(taskId, updatedData) {
  const projectTasks = getAllProjectTasks();
  const mappingIndex = projectTasks.findIndex((item) => item.taskId === taskId);

  if (mappingIndex === -1) {
    return null;
  }

  const updatedMapping = {
    ...projectTasks[mappingIndex],
    ...updatedData,
    updatedAt: new Date().toISOString(),
  };

  projectTasks[mappingIndex] = updatedMapping;
  saveProjectTasks(projectTasks);

  return updatedMapping;
}

export {
  DEFAULT_PROJECT_TASKS,
  initProjectTasks,
  getAllProjectTasks,
  saveProjectTasks,
  insertProjectTask,
  findProjectTasksByProjectId,
  findTaskIdsByProjectId,
  getTasksByProjectId,
  removeProjectTask,
  removeProjectTaskByTaskId,
  updateProjectTaskByTaskId,
};
