import { USERS } from "../assets/js/common/storageKeys.js";

let defaultUsers = [
    {
        id: "ad001",

        account: "adm001",
        password: "admin1234567",
        role: "admin",
        status: "active",
        MaNhanVien: "EMP001",
        
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
}

//Lấy all data từ localStorage
function getAll() {
    return JSON.parse(localStorage.getItem(USERS));
}

//save new user
function saveUsers(users) {
    return localStorage.setItem(USERS, JSON.stringify(users));
}

//find user
function findById(id) {
    const users = getAll();

    return user.find(user => user.id === id);
}

//find user by Name
function findByName(name) {
    const users = getAll();

    return users.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
}

//insert user
function insertUser(user) {
    const users = getAll();

    users.push(user);
    saveUsers(users);
}

//update user
function updateUser(id, data) {
    const users = getAll();

    let index = users.findIndex(u => u.id === id);
    users[index] = {
        ...users[index],
        ...data
    };
    saveUsers(users);
}

//sigin
async function findUserSignin(account, password){
    const users = getAll() || [];

    return users.find(user => user.account === account && user.password === password);
}

export {
    initUsers,
    getAll,
    findById,
    findByName,
    insertUser,
    updateUser,
    findUserSignin
};
console.log(JSON.parse(localStorage.getItem("USERS")));
