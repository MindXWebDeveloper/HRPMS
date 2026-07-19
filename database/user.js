import { USERS } from "../assets/js/common/storageKeys.js";

let defaultUsers = [
    {
        id: "ad001",

        account: "adm001",
        email: "thanh.luong@company.com",
        password: "admin1234567",
        role: "project_manager",
        status: "active",
        MaNhanVien: "EMP001",
        
        createdAt: "2026-07-10T09:00:00",
        updatedAt: "2026-07-10T09:00:00"
    },
    {
        id: "us002",
        account: "user002",
        email: "linh.nguyen@company.com",
        password: "user12345671234",
        role: "hr_manager",
        status: "active",
        MaNhanVien: "EMP002",
        createdAt: "2026-07-10T09:00:00",
        updatedAt: "2026-07-10T09:00:00"
    },
    {
        id: "us003",
        account: "user003",
        email: "cuong.le@company.com",
        password: "user1234567",
        role: "employee",
        status: "active",
        MaNhanVien: "EMP003",
        createdAt: "2026-07-10T09:00:00",
        updatedAt: "2026-07-10T09:00:00"
    },
    {
        id: "us004",
        account: "user004",
        email: "ha.pham@company.com",
        password: "user1234567",
        role: "employee",
        status: "active",
        MaNhanVien: "EMP004",
        createdAt: "2026-07-10T09:00:00",
        updatedAt: "2026-07-10T09:00:00"
    },
    {
        id: "us005",
        account: "user005",
        email: "viet.hoang@company.com",
        password: "user1234567",
        role: "employee",
        status: "inactive",
        MaNhanVien: "EMP005",
        createdAt: "2026-07-10T09:00:00",
        updatedAt: "2026-07-10T09:00:00"
    }
];

// Khởi tạo data
function initUsers() {
    const storedUsers = getAll();

    if (!Array.isArray(storedUsers) || storedUsers.length === 0) {
        localStorage.setItem(USERS, JSON.stringify(defaultUsers));
        return;
    }

    const nextUsers = storedUsers.map((user) => {
        const normalizedRole = String(user?.role || "").toLowerCase() === "admin"
            ? "project_manager"
            : user?.role;

        if (user?.email) {
            return {
                ...user,
                role: normalizedRole
            };
        }

        const matchedDefault = defaultUsers.find((item) =>
            item.id === user?.id ||
            item.account === user?.account ||
            item.MaNhanVien === user?.MaNhanVien
        );

        return {
            ...user,
            role: normalizedRole,
            email: matchedDefault?.email || ""
        };
    });

    saveUsers(nextUsers);
}

//Lấy all data từ localStorage
function getAll() {
    return JSON.parse(localStorage.getItem(USERS));
}

//save new user
function saveUsers(users) {
    return localStorage.setItem(USERS, JSON.stringify(users));
}

//sigin
async function findUserSignin(account, password){
    const users = getAll() || [];

    return users.find(user => user.account === account && user.password === password);
}

export {
    initUsers,
    getAll,
    findUserSignin
};
console.log(JSON.parse(localStorage.getItem("USERS")));
