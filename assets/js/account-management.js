import { initUsers, getAll } from "../../database/user.js";
import { findEmployeeByEmployeeID, initEmployees, getAllEmployees, getEmployeeFullName, updateEmployee } from "../../database/employeedata.js";
import { USERS, EMPLOYEES } from "../../assets/js/common/storageKeys.js";
import { sendPasswordUpdateMail } from "./services/sendMail.js";

const tbody = document.getElementById("accountTableBody");
const searchInput = document.getElementById("account-search-input");
const searchButton = document.getElementById("account-search-btn");
const paginationSummary = document.getElementById("account-pagination-summary");
const paginationControls = document.getElementById("account-pagination-controls");
const PAGE_SIZE = 10;
let currentSearchKeyword = "";
let currentPage = 1;

bindAddAccountModal();
bindEditAccountModal();
bindSearchAccountByName();
bindPaginationControls();

function renderAccounts() {
  initUsers();
  initEmployees();
  const users = getAll() || [];
  const filteredUsers = filterUsersByName(users, currentSearchKeyword);
  const totalRecords = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  if (currentPage < 1) {
    currentPage = 1;
  }

  const visibleUsers = paginateUsers(filteredUsers, currentPage, PAGE_SIZE);

    tbody.innerHTML = "";

  visibleUsers.forEach(user => {
      const employeeID = user.employeeID;
      const employee = findEmployeeByEmployeeID(employeeID);
      const fullName = getEmployeeFullName(employee) || employeeID || "-";

        const tr = document.createElement("tr");
        tr.className = "bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium";

        tr.innerHTML = `
            <td scope="row"
          class="px-6 py-4 font-medium text-heading whitespace-nowrap">${String(user.account || "-").toUpperCase()}</td>

      <td class="px-6 py-4">${fullName}</td>

      <td class="px-6 py-4">${user.email || "-"}</td>

      <td class="px-6 py-4">${getRoleLabel(user.role)}</td>

            <td class="px-6 py-4">
                <div class="flex items-center">
                <div>
                ${
                  String(user.status || "").toLowerCase() === "active"
                    ?
                    `<span class="h-2.5 w-2.5 rounded-full text-green-500 me-2">● Hoạt động</span>`
                    :
                    `<span class="h-2.5 w-2.5 rounded-full text-red-500 me-2"">● Ngưng hoạt động</span>`
                }
                </div>
                </div>
            </td>
            <td class ="px-6 py-4">
                <div class="flex">
                    <div class="relative group">
                      <button type="button" class="edit-account-btn text-blue-500" data-account-id="${user.id}">
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
                      </button>

                      <div
                        class="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block rounded bg-gray-800 px-2 py-1 text-sm text-white whitespace-nowrap"
                      >
                        Edit
                      </div>
                    </div>
                  </div>   
            </td>             
            </tr>
        `;

        tbody.appendChild(tr);

    });

  updatePaginationSummary(totalRecords, currentPage, PAGE_SIZE);
  renderPaginationControls(totalPages, currentPage);

}

renderAccounts();

function bindSearchAccountByName() {
  if (!searchInput || !searchButton) {
    return;
  }

  const triggerSearch = () => {
    currentSearchKeyword = String(searchInput.value || "").trim().toLowerCase();
    currentPage = 1;
    renderAccounts();
  };

  searchButton.addEventListener("click", triggerSearch);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      triggerSearch();
    }
  });
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
      renderAccounts();
      return;
    }

    if (action === "next") {
      currentPage = currentPage + 1;
      renderAccounts();
      return;
    }

    if (action === "page" && Number.isFinite(value) && value > 0) {
      currentPage = value;
      renderAccounts();
    }
  });
}

function paginateUsers(users, page, pageSize) {
  const safeUsers = Array.isArray(users) ? users : [];
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || PAGE_SIZE);
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  return safeUsers.slice(start, end);
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

function filterUsersByName(users, keyword) {
  const searchKeyword = String(keyword || "").trim().toLowerCase();

  if (!searchKeyword) {
    return users;
  }

  return (users || []).filter((user) => {
    const employee = findEmployeeByEmployeeID(user.employeeID);
    const fullName = String(getEmployeeFullName(employee) || "").toLowerCase();

    return fullName.includes(searchKeyword);
  });
}

function getRoleLabel(role) {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "employee") {
    return "Nhân viên";
  }

  if (normalizedRole === "hr_manager") {
    return "Quản lý nhân sự";
  }

  if (normalizedRole === "project_manager") {
    return "Quản lý dự án";
  }

  return role || "-";
}

function bindAddAccountModal() {
  const openButton = document.getElementById("open-add-account-modal-btn");
  const modal = document.getElementById("add-account-modal");
  const closeButton = document.getElementById("close-add-account-modal-btn");
  const cancelButton = document.getElementById("cancel-add-account-btn");
  const form = document.getElementById("add-account-form");

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

    const fullNameInput = document.getElementById("new-account-full-name");
    const emailInput = document.getElementById("new-account-email");
    const roleInput = document.getElementById("new-account-role");

    const fullName = String(fullNameInput?.value || "").trim();
    const email = String(emailInput?.value || "").trim().toLowerCase();
    const role = String(roleInput?.value || "employee").trim().toLowerCase();

    if (!fullName || !email || !role) {
      Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Vui lòng nhập đầy đủ họ tên, email và vai trò.",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
      return;
    }

    const users = getAll() || [];
    const accountBase = generateAccountBase(fullName);
    const account = generateUniqueAccount(accountBase, users);
    const now = new Date().toISOString();

    const newUser = {
      id: `us-${Date.now()}`,
      account,
      email,
      password: "User123456712389!",
      role,
      status: "active",
      employeeID: account,
      resetPass: true,
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);
    localStorage.setItem(USERS, JSON.stringify(users));

    const employeeData = getAllEmployees() || [];
    updateEmployee({
      job: {
        employeeID: account,
        status: mapUserStatusToEmployeeStatus(newUser.status),
      },
      profile: {
        fullName,
        email,
      },
      meta: {
        updatedAt: now,
      },
    });

    closeModal();
    renderAccounts();
  });
}

function bindEditAccountModal() {
  const modal = document.getElementById("edit-account-modal");
  const closeButton = document.getElementById("close-edit-account-modal-btn");
  const cancelButton = document.getElementById("cancel-edit-account-btn");
  const form = document.getElementById("edit-account-form");

  if (!tbody || !modal || !closeButton || !cancelButton || !form) {
    return;
  }

  const accountIdInput = document.getElementById("edit-account-id");
  const accountNameInput = document.getElementById("edit-account-name");
  const fullNameInput = document.getElementById("edit-account-full-name");
  const emailInput = document.getElementById("edit-account-email");
  const roleInput = document.getElementById("edit-account-role");
  const statusInput = document.getElementById("edit-account-status");
  const passwordInput = document.getElementById("edit-account-password");
  const confirmPasswordInput = document.getElementById("edit-account-confirm-password");
  const fullNameError = document.getElementById("edit-account-full-name-error");
  const emailError = document.getElementById("edit-account-email-error");
  const roleError = document.getElementById("edit-account-role-error");
  const passwordError = document.getElementById("edit-account-password-error");
  const confirmPasswordError = document.getElementById("edit-account-confirm-password-error");

  const fieldValidationMap = [
    { input: fullNameInput, error: fullNameError },
    { input: emailInput, error: emailError },
    { input: roleInput, error: roleError },
    { input: passwordInput, error: passwordError },
    { input: confirmPasswordInput, error: confirmPasswordError },
  ];

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    clearFormErrors(fieldValidationMap);
    form.reset();
  };

  const openModal = () => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  };

  closeButton.addEventListener("click", closeModal);
  cancelButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  tbody.addEventListener("click", (event) => {
    const editButton = event.target.closest(".edit-account-btn");

    if (!editButton) {
      return;
    }

    const accountId = String(editButton.dataset.accountId || "").trim();
    const users = getAll() || [];
    const user = users.find((item) => String(item.id || "").trim() === accountId);

    if (!user) {
      Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Không tìm thấy tài khoản để chỉnh sửa.",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
      return;
    }

    const employee = findEmployeeByEmployeeID(user.employeeID);

    if (accountIdInput) accountIdInput.value = user.account || "";
    if (accountNameInput) accountNameInput.value = String(user.account || "").toUpperCase();
    if (fullNameInput) fullNameInput.value = getEmployeeFullName(employee) || user.employeeID || "";
    if (emailInput) emailInput.value = user.email || "";
    if (roleInput) roleInput.value = user.role || "employee";
    //if (passwordInput) passwordInput.value = user.password|| "";
    //if (confirmPasswordInput) confirmPasswordInput.value = user.password|| "";
    if (statusInput) statusInput.value = user.status|| "active";
    clearFormErrors(fieldValidationMap);

    openModal();
  });

  fieldValidationMap.forEach(({ input, error }) => {
    input?.addEventListener("input", () => {
      clearFieldError(input, error);
    });

    input?.addEventListener("change", () => {
      clearFieldError(input, error);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const accountId = String(accountIdInput?.value || "").trim();
    const fullName = String(fullNameInput?.value || "").trim();
    const email = String(emailInput?.value || "").trim().toLowerCase();
    const role = String(roleInput?.value || "employee").trim().toLowerCase();
    const password = String(passwordInput?.value || "");
    const confirmPassword = String(confirmPasswordInput?.value || "");
    const status = String(statusInput?.value || "active");

    clearFormErrors(fieldValidationMap);

    let hasValidationError = false;

    if (!fullName) {
      setFieldError(fullNameInput, fullNameError, "Vui lòng nhập họ và tên.");
      hasValidationError = true;
    }

    if (!email) {
      setFieldError(emailInput, emailError, "Vui lòng nhập email.");
      hasValidationError = true;
    } else if (!isValidEmail(email)) {
      setFieldError(emailInput, emailError, "Email không đúng định dạng.");
      hasValidationError = true;
    }

    if (!role) {
      setFieldError(roleInput, roleError, "Vui lòng chọn vai trò.");
      hasValidationError = true;
    }

    if(password.trim() !== "" && password.trim() !== "") {
      if (!isValidPassword(password)) {
      setFieldError(passwordInput, passwordError, "Mật khẩu tối thiểu 12 ký tự, có chữ in hoa, số, ký tự đặc biệt và không chứa khoảng trắng.");
      hasValidationError = true;
      }

      if (password !== confirmPassword) {
        setFieldError(confirmPasswordInput, confirmPasswordError, "Xác nhận mật khẩu không khớp.");
        hasValidationError = true;
      }
    }
    

    if (hasValidationError) {
      return;
    }

    if (!accountId) {
      Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Không tìm thấy tài khoản để lưu.",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
      return;
    }

    const users = getAll() || [];
    const userIndex = users.findIndex((item) => String(item.account || "").trim() === accountId);

    if (userIndex < 0) {
      Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Không tìm thấy tài khoản để lưu.",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
      return;
    }

    const currentUser = users[userIndex];
    const now = new Date().toISOString();

    if(password.trim() === "" && confirmPassword.trim() === "") {
       users[userIndex] = {
      ...currentUser,
      email,
      role,
      status,
      updatedAt: now,
    };
    } else {
       users[userIndex] = {
      ...currentUser,
      email,
      role,
      password,
      resetPass: true,
      status,
      updatedAt: now
    };

      const recipientEmail = email;
      const recipientFullName = fullName;
      const recipientPassword = password;

      void sendPasswordUpdateMail({
        email: recipientEmail,
        fullName: recipientFullName,
        password: recipientPassword,
      })
        .then(() => {
          Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Mail thông báo thay đổi mật khẩu đã được gửi.",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        })
        .catch((error) => {
          console.error("Gửi mail thất bại:", error);
          Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Cập nhật mật khẩu thành công nhưng gửi mail thất bại.",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        });
    }
   
    localStorage.setItem(USERS, JSON.stringify(users));

    upsertEmployeeData(currentUser.employeeID, fullName, email, status);

    closeModal();
    renderAccounts();
  });
}

function setFieldError(input, errorElement, message) {
  if (!input || !errorElement) {
    return;
  }

  input.classList.add("border-red-500", "focus:border-red-500");
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
}

function clearFieldError(input, errorElement) {
  if (!input || !errorElement) {
    return;
  }

  input.classList.remove("border-red-500", "focus:border-red-500");
  errorElement.textContent = "";
  errorElement.classList.add("hidden");
}

function clearFormErrors(fieldValidationMap) {
  (fieldValidationMap || []).forEach(({ input, error }) => {
    clearFieldError(input, error);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

function isValidPassword(password) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=\S+$).{12,}$/.test(String(password || ""));
}

function upsertEmployeeData(employeeID, fullName, email, userStatus) {
  const employeeCode = String(employeeID || "").trim();
  const mappedStatus = mapUserStatusToEmployeeStatus(userStatus);

  updateEmployee({
    job: {
      employeeID: employeeCode,
      status: mappedStatus,
    },
    profile: {
      fullName,
      email,
    },
    meta: {
      updatedAt: new Date().toISOString(),
    },
  });
}

function mapUserStatusToEmployeeStatus(userStatus) {
  return String(userStatus || "").trim().toLowerCase() === "active"
    ? "Hoạt động"
    : "Ngưng hoạt động";
}

function generateAccountBase(fullName) {
  const normalized = String(fullName || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z\s]/g, " ")
    .trim()
    .toLowerCase();

  const parts = normalized.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "user";
  }

  const lastName = parts[parts.length - 1];
  const initials = parts.slice(0, -1).map((part) => part[0] || "").join("");
  const accountBase = `${lastName}${initials}`;

  return accountBase || "user";
}

function generateUniqueAccount(baseAccount, users) {
  const existingAccounts = new Set(
    (users || []).map((user) => String(user.account || "").trim().toLowerCase()),
  );

  let candidate = String(baseAccount || "user").toLowerCase();
  let suffix = 1;

  while (existingAccounts.has(candidate)) {
    candidate = `${baseAccount}${suffix}`;
    suffix += 1;
  }

  return candidate;
}
