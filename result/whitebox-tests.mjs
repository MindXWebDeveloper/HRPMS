class LocalStorageMock {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(String(key), String(value));
  }

  removeItem(key) {
    this.store.delete(String(key));
  }

  clear() {
    this.store.clear();
  }
}

function assert(testId, title, condition, details = "") {
  return {
    testId,
    title,
    status: condition ? "PASS" : "FAIL",
    details,
  };
}

async function run() {
  globalThis.localStorage = new LocalStorageMock();

  const userDb = await import("../database/user.js");
  const auth = await import("../assets/js/services/authService.js");
  const author = await import("../assets/js/common/author.js");
  const taskDb = await import("../database/task.js");
  const projectEmployeeDb = await import("../database/project-employees.js");

  const results = [];

  userDb.initUsers();
  taskDb.initTasks();
  projectEmployeeDb.initProjectEmployees();

  const activeUser = await userDb.findUserSignin("thanhlv", "admin1234567");
  results.push(
    assert(
      "WB-LOGIN-001",
      "findUserSignin tra ve user active dung thong tin",
      Boolean(activeUser && activeUser.account === "thanhlv"),
      `actual=${activeUser ? activeUser.account : null}`,
    ),
  );

  const inactiveUser = await userDb.findUserSignin("viethq", "user1234567");
  results.push(
    assert(
      "WB-LOGIN-002",
      "findUserSignin khong cho user inactive dang nhap",
      inactiveUser === null,
      `actual=${inactiveUser ? JSON.stringify(inactiveUser) : null}`,
    ),
  );

  auth.saveCurrentUser(activeUser);
  const currentUser = auth.getCurrentUser();
  results.push(
    assert(
      "WB-AUTH-001",
      "saveCurrentUser + getCurrentUser luu va doc du lieu hien tai",
      Boolean(currentUser && currentUser.account === "thanhlv" && currentUser.role === "project_manager"),
      `actual=${JSON.stringify(currentUser)}`,
    ),
  );

  auth.clearCurrentUser();
  results.push(
    assert(
      "WB-AUTH-002",
      "clearCurrentUser xoa du lieu current user",
      auth.getCurrentUser() === null,
      `actual=${JSON.stringify(auth.getCurrentUser())}`,
    ),
  );

  results.push(
    assert(
      "WB-ROLE-001",
      "canAccess cho phep HR_MANAGER truy cap route ADMIN alias",
      author.canAccess(["ADMIN"], { role: "HR_MANAGER" }) === true,
      "expected=true for ADMIN alias",
    ),
  );

  results.push(
    assert(
      "WB-ROLE-002",
      "canAccess chan EMPLOYEE truy cap route PROJECT_MANAGER",
      author.canAccess(["PROJECT_MANAGER"], { role: "EMPLOYEE" }) === false,
      "expected=false",
    ),
  );

  const insertedTask = taskDb.insertTask({
    title: "tmp task",
    description: "tmp",
    assigneeCode: "cuonglm",
    assigneeName: "Le Minh Cuong",
    priority: "High",
    status: "To do",
  });
  results.push(
    assert(
      "WB-TASK-001",
      "insertTask tao task moi va auto sinh taskCode",
      Boolean(insertedTask && String(insertedTask.taskCode || "").startsWith("TSK")),
      `actual=${JSON.stringify(insertedTask)}`,
    ),
  );

  const updatedTask = taskDb.updateTask(insertedTask.id, { status: "Done" });
  results.push(
    assert(
      "WB-TASK-002",
      "updateTask cap nhat task theo id",
      Boolean(updatedTask && updatedTask.status === "Done"),
      `actual=${JSON.stringify(updatedTask)}`,
    ),
  );

  const deletedTask = taskDb.deleteTask(insertedTask.id);
  results.push(
    assert(
      "WB-TASK-003",
      "deleteTask xoa task ton tai",
      deletedTask === true,
      `actual=${deletedTask}`,
    ),
  );

  const deletedNonExistent = taskDb.deleteTask("task-not-found");
  results.push(
    assert(
      "WB-TASK-004",
      "deleteTask tra ve false khi task khong ton tai",
      deletedNonExistent === false,
      `actual=${deletedNonExistent}`,
    ),
  );

  const projectLink1 = projectEmployeeDb.addProjectEmployee("prj-001", "cuonglm", "Member");
  const projectLinkDuplicate = projectEmployeeDb.addProjectEmployee("prj-001", "cuonglm", "Member");
  results.push(
    assert(
      "WB-PE-001",
      "addProjectEmployee chan duplicate employee trong cung project",
      projectLink1 !== null && projectLinkDuplicate === null,
      `first=${projectLink1 ? "created" : "null"}, duplicate=${projectLinkDuplicate}`,
    ),
  );

  const invalidEmployeeLink = projectEmployeeDb.addProjectEmployee("prj-001", "EMP-XXX", "Member");
  results.push(
    assert(
      "WB-PE-002",
      "addProjectEmployee tra ve null neu employeeCode khong ton tai",
      invalidEmployeeLink === null,
      `actual=${invalidEmployeeLink}`,
    ),
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    total: results.length,
    pass: results.filter((item) => item.status === "PASS").length,
    fail: results.filter((item) => item.status === "FAIL").length,
    results,
  };

  console.log(JSON.stringify(summary, null, 2));
}

run().catch((error) => {
  console.error("White-box test runner failed", error);
  process.exitCode = 1;
});
