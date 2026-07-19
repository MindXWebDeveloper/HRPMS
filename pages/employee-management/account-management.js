import { initUsers, getAll } from "../../database/user.js";
import { findEmployeeByMaNV, initEmployees, getAllEmployees } from "../../database/employeedata.js";
import { USERS, EMPLOYEES } from "../../assets/js/common/storageKeys.js";

const tbody = document.getElementById("accountTableBody");
const searchInput = document.getElementById("account-search-input");
const searchButton = document.getElementById("account-search-btn");
let currentSearchKeyword = "";

bindAddAccountModal();
bindEditAccountModal();
bindSearchAccountByName();

function renderAccounts() {
  initUsers();
  initEmployees();
  const users = getAll() || [];
  const filteredUsers = filterUsersByName(users, currentSearchKeyword);

    tbody.innerHTML = "";

  filteredUsers.forEach(user => {
      const employee = findEmployeeByMaNV(user.MaNhanVien);
      const fullName = employee?.HoTen || user.MaNhanVien || "-";

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

}

renderAccounts();

function bindSearchAccountByName() {
  if (!searchInput || !searchButton) {
    return;
  }

  const triggerSearch = () => {
    currentSearchKeyword = String(searchInput.value || "").trim().toLowerCase();
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

function filterUsersByName(users, keyword) {
  const searchKeyword = String(keyword || "").trim().toLowerCase();

  if (!searchKeyword) {
    return users;
  }

  return (users || []).filter((user) => {
    const employee = findEmployeeByMaNV(user.MaNhanVien);
    const fullName = String(employee?.HoTen || "").toLowerCase();

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
      alert("Vui lòng nhập đầy đủ họ tên, email và vai trò.");
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
      password: "user12345671234",
      role,
      status: "active",
      MaNhanVien: account,
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);
    localStorage.setItem(USERS, JSON.stringify(users));

    const employeeData = getAllEmployees() || [];
    employeeData.push(createEmployeeSkeleton(fullName, email, account));
    localStorage.setItem(EMPLOYEES, JSON.stringify(employeeData));

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
      alert("Không tìm thấy tài khoản để chỉnh sửa.");
      return;
    }

    const employee = findEmployeeByMaNV(user.MaNhanVien);

    if (accountIdInput) accountIdInput.value = user.id || "";
    if (accountNameInput) accountNameInput.value = String(user.account || "").toUpperCase();
    if (fullNameInput) fullNameInput.value = employee?.HoTen || user.MaNhanVien || "";
    if (emailInput) emailInput.value = user.email || "";
    if (roleInput) roleInput.value = user.role || "employee";
    if (passwordInput) passwordInput.value = "";
    if (confirmPasswordInput) confirmPasswordInput.value = "";
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

    if (!password) {
      setFieldError(passwordInput, passwordError, "Vui lòng nhập mật khẩu.");
      hasValidationError = true;
    } else if (!isValidPassword(password)) {
      setFieldError(passwordInput, passwordError, "Mật khẩu tối thiểu 12 ký tự, có chữ in hoa, số, ký tự đặc biệt và không chứa khoảng trắng.");
      hasValidationError = true;
    }

    if (!confirmPassword) {
      setFieldError(confirmPasswordInput, confirmPasswordError, "Vui lòng nhập xác nhận mật khẩu.");
      hasValidationError = true;
    } else if (password !== confirmPassword) {
      setFieldError(confirmPasswordInput, confirmPasswordError, "Xác nhận mật khẩu không khớp.");
      hasValidationError = true;
    }

    if (hasValidationError) {
      return;
    }

    if (!accountId) {
      alert("Không tìm thấy tài khoản để lưu.");
      return;
    }

    const users = getAll() || [];
    const userIndex = users.findIndex((item) => String(item.id || "").trim() === accountId);

    if (userIndex < 0) {
      alert("Không tìm thấy tài khoản để lưu.");
      return;
    }

    const currentUser = users[userIndex];
    const now = new Date().toISOString();

    users[userIndex] = {
      ...currentUser,
      email,
      role,
      password,
      updatedAt: now,
    };

    localStorage.setItem(USERS, JSON.stringify(users));

    upsertEmployeeData(currentUser.MaNhanVien, fullName, email);

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

function upsertEmployeeData(maNhanVien, fullName, email) {
  const employeeCode = String(maNhanVien || "").trim();
  const employees = getAllEmployees() || [];
  const employeeIndex = employees.findIndex(
    (item) => String(item?.MaNhanVien || "").trim() === employeeCode,
  );

  if (employeeIndex >= 0) {
    employees[employeeIndex] = {
      ...employees[employeeIndex],
      HoTen: fullName,
      DcEmail: email,
    };
  } else {
    employees.push(createEmployeeSkeleton(fullName, email, employeeCode));
  }

  localStorage.setItem(EMPLOYEES, JSON.stringify(employees));
}

function createEmployeeSkeleton(fullName, email, maNhanVien) {
  return {
    HoTen: fullName,
    NgaySinh: "",
    SoDienThoai: "",
    NgayCap: "",
    DcEmail: email,
    NoiCap: "",
    GioiTinh: "",
    SoCccd: "",
    QuocTich: "",
    MaNhanVien: maNhanVien,
    Level: "",
    PhongBan: "",
    DCTtru: "",
    DCHtai: "",
    NgLienHe: "",
    SDTNgLienHe: "",
    QuanHe: "",
    DCNgLienHe: "",
    TenDangNhap: "",
    EmailDangNhap: "",
    HocVan: "",
    NgoaiNgu: "",
    KyNang: "",
    GhiChu: "",
    Avatar: "",
    Vaitro: "",
    ChucVu: "",
    TrangThai: "",
  };
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
