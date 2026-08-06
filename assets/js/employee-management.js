import { employees as defaultEmployees } from "../../database/employeedata.js";

const EMPLOYEES_KEY = "EMPLOYEES";
const PAGE_SIZE = 10;
const tbody = document.getElementById("employeeTableBody");
const searchInput = document.getElementById("employee-search-input");
const searchButton = document.getElementById("employee-search-btn");
const paginationSummary = document.getElementById("employee-pagination-summary");
const paginationControls = document.getElementById("employee-pagination-controls");
let currentSearchKeyword = "";
let currentPage = 1;

function initEmployeeData() {
  if (!localStorage.getItem(EMPLOYEES_KEY)) {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(defaultEmployees));
  }
}

function getEmployees() {
  return JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || [];
}

function filterEmployeesByName(employees, keyword) {
  const query = String(keyword || "").trim().toLowerCase();

  if (!query) {
    return Array.isArray(employees) ? employees : [];
  }

  return (Array.isArray(employees) ? employees : []).filter((employee) =>
    String(employee.HoTen || "").toLowerCase().includes(query),
  );
}

function paginateEmployees(employees, page, pageSize) {
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || PAGE_SIZE);
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  return safeEmployees.slice(start, end);
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

  const baseClass =
    "flex items-center justify-center box-border border border-default-medium font-medium text-sm h-9 focus:outline-none";
  const activeClass = "text-fg-brand bg-brand-softer hover:bg-brand-soft px-3";
  const normalClass =
    "text-body bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium hover:text-heading px-3";
  const disabledClass = "opacity-50 cursor-not-allowed";

  button.className = `${baseClass} ${isActive ? activeClass : normalClass} ${
    isDisabled ? disabledClass : ""
  }`.trim();

  li.appendChild(button);
  return li;
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
      createPaginationItem(
        String(pageNumber),
        "page",
        false,
        pageNumber === safeCurrentPage,
        pageNumber,
      ),
    );
  }

  paginationControls.appendChild(
    createPaginationItem("Next", "next", safeCurrentPage === safeTotalPages, false),
  );
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
      renderEmployee();
      return;
    }

    if (action === "next") {
      currentPage += 1;
      renderEmployee();
      return;
    }

    if (action === "page" && Number.isFinite(value) && value > 0) {
      currentPage = value;
      renderEmployee();
    }
  });
}

function bindSearchEmployeeByName() {
  if (!searchInput || !searchButton) {
    return;
  }

  const triggerSearch = () => {
    currentSearchKeyword = String(searchInput.value || "").trim();
    currentPage = 1;
    renderEmployee();
  };

  searchButton.addEventListener("click", triggerSearch);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      triggerSearch();
    }
  });
}

function renderEmployee() {
  const allEmployees = getEmployees();
  const filteredEmployees = filterEmployeesByName(allEmployees, currentSearchKeyword);
  const totalRecords = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  if (currentPage < 1) {
    currentPage = 1;
  }

  const visibleEmployees = paginateEmployees(filteredEmployees, currentPage, PAGE_SIZE);

  tbody.innerHTML = "";

  visibleEmployees.forEach((employee) => {
    const tr = document.createElement("tr");
    tr.className = "bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium";

    tr.innerHTML = `
      <td scope="row" class="px-6 py-4 font-medium text-heading whitespace-nowrap">${employee.MaNhanVien}</td>
      <td class="px-6 py-4">${employee.HoTen}</td>
      <td class="px-6 py-4">${employee.PhongBan}</td>
      <td class="px-6 py-4">${employee.ChucVu}</td>
      <td class="px-6 py-4">
        <div class="flex items-center">
          <div>
            ${
              employee.TrangThai === "Hoạt động"
                ? `<span class="h-2.5 w-2.5 rounded-full text-green-500 me-2">● Hoạt động</span>`
                : `<span class="h-2.5 w-2.5 rounded-full text-red-500 me-2">● Ngưng hoạt động</span>`
            }
          </div>
        </div>
      </td>
      <td class="px-6 py-4">
        <div class="flex">
          <div class="relative group" data-role="admin">
            <a href="../accountedit/AccountEdit.html?maNV=${employee.MaNhanVien}" class="text-blue-500">
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                />
              </svg>
            </a>

            <div class="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block rounded bg-gray-800 px-2 py-1 text-sm text-white whitespace-nowrap">
              Edit
            </div>
          </div>

          <div class="relative group">
            <a href="../accountedit/accountview.html?maNV=${employee.MaNhanVien}" class="text-blue-500">
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 9h3m-3 3h3m-3 3h3m-6 1c-.306-.613-.933-1-1.618-1H7.618c-.685 0-1.312.387-1.618 1M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
                />
              </svg>
            </a>

            <div class="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block rounded bg-gray-800 px-2 py-1 text-sm text-white whitespace-nowrap">
              View
            </div>
          </div>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });

  updatePaginationSummary(totalRecords, currentPage, PAGE_SIZE);
  renderPaginationControls(totalPages, currentPage);
}

document.addEventListener("DOMContentLoaded", () => {
  initEmployeeData();
  bindPaginationControls();
  bindSearchEmployeeByName();
  renderEmployee();
});