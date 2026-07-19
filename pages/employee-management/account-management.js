import { initUsers, getAll } from "../../database/user.js";
import { findEmployeeByMaNV } from "../../database/employeedata.js";

const tbody = document.getElementById("accountTableBody");

function renderAccounts() {
  initUsers();
  const users = getAll() || [];

    tbody.innerHTML = "";

  users.forEach(user => {
      const employee = findEmployeeByMaNV(user.MaNhanVien);
      const fullName = employee?.HoTen || user.MaNhanVien || "-";

        const tr = document.createElement("tr");
        tr.className = "bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium";

        tr.innerHTML = `
            <td scope="row"
          class="px-6 py-4 font-medium text-heading whitespace-nowrap">${String(user.account || "-").toUpperCase()}</td>

      <td class="px-6 py-4">${fullName}</td>

      <td class="px-6 py-4">${user.email || "-"}</td>

      <td class="px-6 py-4">${user.role || "-"}</td>

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
                    <div class="relative group" data-role="admin">
                      <a href="../accountedit/AccountEdit.html" class="text-blue-500">
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

                      <div
                        class="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block rounded bg-gray-800 px-2 py-1 text-sm text-white whitespace-nowrap"
                      >
                        Edit
                      </div>
                    </div>

                    <div class="relative group">
                      <a href="../accountedit/accountview.html" class="text-blue-500">
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

                      <div
                        class="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block rounded bg-gray-800 px-2 py-1 text-sm text-white whitespace-nowrap"
                      >
                        View
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