import { getAll, findUserSignin } from "../../../database/user.js";
import { CURRENT_USER } from "../common/storageKeys.js";
import { findEmployeeByMaNV } from "../../../database/employeedata.js";

function saveCurrentUser(user) {
  const employeeCode = String(user?.MaNhanVien || user?.employeeCode || "").trim();
  const employee = employeeCode ? findEmployeeByMaNV(employeeCode) : null;
  const data = {
    id: user?.id || "",
    account: user.account,
    fullName: employee ? employee.HoTen: "",
    role: (user.role || "EMPLOYEE").toLowerCase(),
    MaNhanVien: employeeCode
  };
  localStorage.setItem(CURRENT_USER, JSON.stringify(data));
}

function getCurrentUser() {
  try {
    const currentUser =
      localStorage.getItem(CURRENT_USER) ||
      "null";

    return JSON.parse(currentUser);
  } catch (error) {
    console.error("Cannot parse current user", error);
    return null;
  }
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER);
}

async function signinUser(account, password) {
  let   currentUser;
  
  currentUser = await findUserSignin(account, password);

  return currentUser;
}

export { saveCurrentUser, getCurrentUser, signinUser, clearCurrentUser };
