import { TASKS } from "../assets/js/common/storageKeys.js";

const DEFAULT_TASKS = [
  {
    id: "task-001",
    taskCode: "TSK001",
    phaseId: "phase-001",
    title: "Thu thap yeu cau khach hang",
    description: "Tong hop yeu cau nghiep vu tu phong ban",
    assigneeCode: "thanhlv",
    assigneeName: "Lương Văn Thanh",
    priority: "High",
    status: "Done",
    createdAt: "2026-07-01T08:00:00",
    updatedAt: "2026-07-01T08:00:00",
  },
  {
    id: "task-002",
    taskCode: "TSK002",
    phaseId: "phase-001",
    title: "Phan tich dac ta yeu cau",
    description: "Lap danh sach user story va acceptance criteria",
    assigneeCode: "thanhlv",
    assigneeName: "Lương Văn Thanh",
    priority: "Medium",
    status: "In progress",
    createdAt: "2026-07-02T08:00:00",
    updatedAt: "2026-07-02T08:00:00",
  },
  {
    id: "task-003",
    taskCode: "TSK003",
    phaseId: "phase-002",
    title: "Thiet ke giao dien mobile",
    description: "Tao wireframe cho cac man hinh chinh",
    assigneeCode: "linhnh",
    assigneeName: "Nguyễn Hữu Linh",
    priority: "Medium",
    status: "To do",
    createdAt: "2026-07-03T08:00:00",
    updatedAt: "2026-07-03T08:00:00",
  },
 {
    id: "task-004",
    taskCode: "TSK004",
    phaseId: "phase-002",
    title: "Phat trien chuc nang dang nhap",
    description: "Lap trinh man hinh dang nhap va xac thuc nguoi dung",
    assigneeCode: "viethq",
    assigneeName: "Hoàng Quốc Việt",
    priority: "High",
    status: "In progress",
    createdAt: "2026-07-04T08:00:00",
    updatedAt: "2026-07-05T10:30:00",
},
{
    id: "task-005",
    taskCode: "TSK005",
    phaseId: "phase-002",
    title: "Thiet ke co so du lieu",
    description: "Xay dung bang va moi quan he trong he thong",
    assigneeCode: "hapt",
    assigneeName: "Phạm Thu Hà",
    priority: "High",
    status: "Done",
    createdAt: "2026-07-05T08:00:00",
    updatedAt: "2026-07-06T16:20:00",
},
{
    id: "task-006",
    taskCode: "TSK006",
    phaseId: "phase-003",
    title: "Xay dung API quan ly nhan vien",
    description: "Phat trien cac API CRUD cho module nhan vien",
    assigneeCode: "cuonglm",
    assigneeName: "Lê Minh Cường",
    priority: "Low",
    status: "To do",
    createdAt: "2026-07-06T08:00:00",
    updatedAt: "2026-07-06T08:00:00",
}, 
];

function initTasks() {
  const storedTasks = getAllTasks();

  if (storedTasks.length === 0) {
    saveTasks(DEFAULT_TASKS);
  }
}

function getAllTasks() {
  try {
    const storedTasks = JSON.parse(localStorage.getItem(TASKS));

    return Array.isArray(storedTasks) ? storedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(TASKS, JSON.stringify(tasks));
}

function findTaskById(taskId) {
  return getAllTasks().find((task) => task.id === taskId) || null;
}

function findTasksByIds(taskIds) {
  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return [];
  }

  const taskIdSet = new Set(taskIds);
  return getAllTasks().filter((task) => taskIdSet.has(task.id));
}

function findTasksByPhaseId(phaseId) {
  if (!phaseId) {
    return [];
  }

  return getAllTasks().filter((task) => task.phaseId === phaseId);
}

function getPhaseIds() {
  return [...new Set(getAllTasks().map((task) => task.phaseId).filter(Boolean))];
}

function nextTaskCode(tasks) {
  const nextNumber = tasks.reduce((currentMax, task) => {
    const match = String(task.taskCode || "").match(/TSK(\d+)/);

    if (!match) {
      return currentMax;
    }

    return Math.max(currentMax, Number(match[1]));
  }, 0);

  return `TSK${String(nextNumber + 1).padStart(3, "0")}`;
}

function insertTask(taskJson) {
  const tasks = getAllTasks();
  const now = new Date().toISOString();

  const newTask = {
    id: taskJson.id || `task-${Date.now()}`,
    taskCode: taskJson.taskCode || nextTaskCode(tasks),
    phaseId: taskJson.phaseId || "phase-001",
    title: taskJson.title,
    description: taskJson.description || "",
    assigneeCode: taskJson.assigneeCode || "",
    assigneeName: taskJson.assigneeName || "",
    priority: taskJson.priority || "medium",
    status: taskJson.status || "todo",
    createdAt: taskJson.createdAt || now,
    updatedAt: taskJson.updatedAt || now,
  };

  tasks.push(newTask);
  saveTasks(tasks);

  return newTask;
}

function updateTask(taskId, updatedData) {
  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  const updatedTask = {
    ...tasks[taskIndex],
    ...updatedData,
    phaseId: updatedData.phaseId || tasks[taskIndex].phaseId || "phase-001",
    assigneeCode: updatedData.assigneeCode || tasks[taskIndex].assigneeCode || "",
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;
  saveTasks(tasks);

  return updatedTask;
}

function deleteTask(taskId) {
  const tasks = getAllTasks();
  const nextTasks = tasks.filter((task) => task.id !== taskId);

  if (nextTasks.length === tasks.length) {
    return false;
  }

  saveTasks(nextTasks);
  return true;
}

export {
  DEFAULT_TASKS,
  initTasks,
  getAllTasks,
  saveTasks,
  findTaskById,
  findTasksByIds,
  findTasksByPhaseId,
  getPhaseIds,
  insertTask,
  updateTask,
  deleteTask,
};
