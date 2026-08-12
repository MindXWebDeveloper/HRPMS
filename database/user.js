import { USERS } from "../assets/js/common/storageKeys.js";

let defaultUsers = [
    {
        id: "ad001",

        account: "thanhlv",
        email: "thanh.luong@company.com",
        password: "admin1234567",
        role: "project_manager",
        status: "active",
        employeeID: "thanhlv",
        resetPass: false,
        createdAt: "2026-07-10T09:00:00",
        updatedAt: "2026-07-10T09:00:00"
    },
    {
        id: "us002",
        account: "linhnh",
        email: "linh.nguyen@company.com",
        password: "V@nth@nh10041999",
        role: "hr_manager",
        status: "active",
        employeeID: "linhnh",
        resetPass: false,
        createdAt: "2026-07-10T09:00:00",
        updatedAt: "2026-07-10T09:00:00"
    },
    {
        id: "us003",
        account: "cuonglm",
        email: "cuong.le@company.com",
        password: "V@nth@nh10041999",
        role: "employee",
        status: "active",
        employeeID: "cuonglm",
        resetPass: false,
        createdAt: "2026-07-10T09:00:00",
        updatedAt: "2026-07-10T09:00:00"
    },
    {
        id: "us004",
        account: "hapt",
        email: "ha.pham@company.com",
        password: "user1234567",
        role: "employee",
        status: "active",
        employeeID: "hapt",
        resetPass: false,
        createdAt: "2026-07-10T09:00:00",
        updatedAt: "2026-07-10T09:00:00"
    },
    {
        id: "us005",
        account: "viethq",
        email: "viet.hoang@company.com",
        password: "user1234567",
        role: "employee",
        status: "inactive",
        employeeID: "viethq",
        resetPass: false,       
        createdAt: "2026-07-10T09:00:00",
        updatedAt: "2026-07-10T09:00:00"
    }
];

function normalizeUserRecord(user) {
    const employeeID = String(user?.employeeID || user?.account || "").trim();

    return {
        ...user,
        employeeID,
        role: String(user?.role || "").toLowerCase() === "admin"
            ? "project_manager"
            : user?.role,
    };
}

// Khởi tạo data
function initUsers() {
    const storedUsers = getAll();

    if (!Array.isArray(storedUsers) || storedUsers.length === 0) {
        localStorage.setItem(USERS, JSON.stringify(defaultUsers.map(normalizeUserRecord)));
        return;
    }

    const nextUsers = storedUsers.map((user) => {
        const matchedDefault = defaultUsers.find((item) =>
            item.id === user?.id ||
            item.account === user?.account ||
            item.employeeID === user?.employeeID
        );

        return normalizeUserRecord({
            ...user,
            email: user?.email || matchedDefault?.email || ""
        });
    });

    saveUsers(nextUsers);
}

//Lấy all data từ localStorage
function getAll() {
    const users = JSON.parse(localStorage.getItem(USERS));

    return Array.isArray(users) ? users.map(normalizeUserRecord) : users;
}

//save new user
function saveUsers(users) {
    const nextUsers = Array.isArray(users) ? users.map(normalizeUserRecord) : [];

    return localStorage.setItem(USERS, JSON.stringify(nextUsers));
}

//sigin
async function findUserSignin(account, password){
    const users = getAll() || [];

    return users.find(user => user.account === account && user.password === password && user.status === "active") || null;
}

export {
    initUsers,
    getAll,
    findUserSignin
};
console.log(JSON.parse(localStorage.getItem("USERS")));
