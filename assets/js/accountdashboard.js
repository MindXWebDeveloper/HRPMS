import { PROJECTS, PROJECT_TASKS, EMPLOYEES, TASKS } from "../../assets/js/common/storageKeys.js";
import { getAll, initProjects } from "../../database/project.js";
import { getAllTasks, initTasks } from "../../database/task.js";
import { initProjectTasks, getAllProjectTasks, getProjectByTaskId } from "../../database/projet_task.js";
import { initEmployees, getEmployeeAvatarUrl, getEmployeeFullName, getEmployeeJobTitle, getEmployeePoints, getEmployeeID } from "../../database/employeedata.js";
const tbody = document.getElementById("ProjectTableBody");
const tbodytask = document.getElementById("TaskTableBody");
const PROJECTS_KEY = "PROJECTS";
const TASKS_KEY = "TASKS";


document.addEventListener("DOMContentLoaded", () => {
    initProjects();
    renderProjects();
    initTasks();
    renderTask();
    initProjectTasks();
    initEmployees();
    renderTopEmployees();
    renderEmployeeWorkload();
});
function getStatusClass(status) {
    switch (status) {
        case "Hoàn thành":
            return "bg-green-50 text-green-600 border border-green-100";

        case "Đúng tiến độ":
            return "bg-blue-50 text-blue-600 border border-blue-100";

        case "Tạm dừng":
            return "bg-yellow-50 text-yellow-600 border border-yellow-100";

        case "Chậm tiến độ":
            return "bg-red-50 text-red-600 border border-red-100";

        case "Hủy":
            return "bg-gray-50 text-gray-600 border border-gray-100";
    }
}

function getTStatusClass(status) {
    switch (status) {
        case "Done":
            return "bg-green-50 text-green-600 border border-green-100";

        case "To do":
            return "bg-blue-50 text-blue-600 border border-blue-100";

        case "In progress":
            return "bg-yellow-50 text-yellow-600 border border-yellow-100";
    }
}

function getPriorityClass(priority) {
    switch (priority) {
        case "High":
            return "text-red-600";

        case "Medium":
            return "text-yellow-600" ;

        case "Low":
            return "text-blue-600";
    }
}

function renderProjects() {
    const projects =getAll()
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
        .slice(0, 5);

    tbody.innerHTML;
    projects.forEach(project => {
        const pace = Math.max(0, Math.min(100, project.pace));
        const tr = document.createElement("tr");
        tr.className = "gap-4 hover:bg-blue-100 transition-colors";
            
        tr.innerHTML = `
        <td class="py-4 pl-4 font-medium flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            ${project.projectName}
                </td>
                <td class="py-4 text-gray-500 text-center">${project.customer}</td>
                <td class="py-4 text-center">${project.leadId}</td>
                <td class="py-4">
                <div class="flex justify-center gap-2">
                    <div class="mana1 w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div class="mana2 bg-blue-600 h-full rounded-full" style="width:${pace}%" ></div>
                    </div>
                    <span class="text-xs text-gray-500">${pace}%</span>
                </div>
                </td>
                <td class="py-4 text-center">
                  <span class="px-2.5 py-1 text-xs font-medium rounded-full ${getStatusClass(project.status)}">
                    ${project.status}
                  </span>
                </td>
                <td class="py-4 text-gray-500 text-center">${project.endDate}</td>
                <td class="py-4 pr-4 text-right">
                <a href = "../projects-management/project-detail.html?projectId=${project.id}" class="group">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6a7ec2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-kanban-icon lucide-folder-kanban group-hover:stroke-[3]"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/></svg>
                </a>
                </td>
        `;
        tbody.appendChild(tr)
    });
}


function renderTask() {
    const tasks =getAllTasks()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);;
    const projectTasks = JSON.parse(localStorage.getItem(PROJECT_TASKS));
    const projects = JSON.parse(localStorage.getItem(PROJECTS));
    const projectIdByTaskId = new Map(
        projectTasks.map(item => [item.taskId, item.projectId])
    );
    const projectById = new Map(
        projects.map(project => [project.id, project])
    );
    tbodytask.innerHTML ="";
    tasks.forEach(task => {
        const projectId = projectIdByTaskId.get(task.id);
        const projectName = projectById.get(projectId)?.projectName;
        const tr = document.createElement("tr");
        tr.className = "gap-4 hover:bg-blue-100 transition-colors";
            
        tr.innerHTML = `
        <td class="py-4 pl-4 font-medium flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            ${task.title}
                </td>
                <td class="py-4 text-gray-500 text-center">${projectName}</td>
                <td class="py-4 text-center">${task.assigneeName}</td>
                <td class="py-4 text-center font-bold ${getPriorityClass(task.priority)}"> ${task.priority}</td>
                <td class="py-4 text-center">
                  <span class="px-2.5 py-1 text-xs font-medium rounded-full ${getTStatusClass(task.status)}">
                    ${task.status}
                  </span>
                </td>
                <td class="py-4 text-gray-500 text-center">${task.updatedAt}</td>
                <td class="py-4 pr-4 text-right">
                <button class="material-symbols-outlined text-gray-400 hover:text-gray-600 align-middle">more_vert</button>
                </td>
        `;
        tbodytask.appendChild(tr)
    });
}


function renderTopEmployees() {
    const container = document.getElementById("TopEmp");

    const employees = JSON.parse(localStorage.getItem(EMPLOYEES)) || [];

    const topEmployees = [...employees]
        .sort((a, b) => getEmployeePoints(b) - getEmployeePoints(a))
        .slice(0, 5);


    const maxPoint = topEmployees.length ? getEmployeePoints(topEmployees[0]) : 1;

    container.innerHTML = topEmployees.map((emp, index) => {
        const percent = Math.max((getEmployeePoints(emp) / maxPoint) * 100, 5);

        return `
            <div class="flex items-center gap-4 py-3">
                
                <div class="w-5 font-bold text-slate-800">
                    ${index + 1}
                </div>

                <img
                    src="${getEmployeeAvatarUrl(emp)}"
                    class="w-10 h-10 rounded-full object-cover"
                >

                <div class="w-40">
                    <p class="font-semibold text-sm text-slate-900">
                        ${getEmployeeFullName(emp)}
                    </p>
                    <p class="text-xs text-slate-500">
                        ${getEmployeeJobTitle(emp) || ""}
                    </p>
                </div>

                <div class="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        class="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style="width:${percent}%"
                    ></div>
                </div>

                <div class="w-24 text-right text-sm font-medium text-slate-700">
                    ${getEmployeePoints(emp).toLocaleString()} điểm
                </div>

            </div>
        `;
    }).join("");
}

function renderEmployeeWorkload() {

    const employees = JSON.parse(localStorage.getItem(EMPLOYEES));
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY));

    const workloadMap = {};

    tasks.forEach(task => {
        if (!task.assigneeCode) return;

        workloadMap[task.assigneeCode] =
            (workloadMap[task.assigneeCode] || 0) + 1;
    });

    const workloadList = employees.map(emp => ({
        ...emp,
        workload: workloadMap[getEmployeeID(emp)] 
    }));

    workloadList.sort((a, b) => b.workload - a.workload);

    const top5 = workloadList.slice(0, 5);

    const maxWorkload = Math.max(...top5.map(e => e.workload), 1);

    document.getElementById("employeeWorkloadList").innerHTML =
        top5.map((emp, index) => {

            const percent = (emp.workload / maxWorkload) * 100;

            return `
            <div class="flex items-center gap-4">

                <div class="w-5 text-center font-bold text-slate-800">
                    ${index + 1}
                </div>

                <img
                    src="${getEmployeeAvatarUrl(emp)}"
                    class="w-11 h-11 rounded-full object-cover"
                >

                <div class="w-44">
                    <p class="font-semibold text-sm text-slate-800">
                        ${getEmployeeFullName(emp)}
                    </p>

                    <p class="text-xs text-slate-500">
                        ${getEmployeeJobTitle(emp)}
                    </p>
                </div>

                <div class="flex-1">
                    <div class="w-full h-2 bg-slate-200 rounded-full">

                        <div
                            class="h-2 rounded-full bg-blue-600 transition-all duration-500"
                            style="width:${percent}%"
                        ></div>

                    </div>
                </div>

                <div class="w-20 text-right font-semibold text-slate-700">
                    ${emp.workload} task
                </div>

            </div>
            `;

        }).join("");
}


