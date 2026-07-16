import { USERS } from "../assets/js/common/storageKeys.js";

let defaultUsers = [
    {
        id: "ad001",

        account: "adm001",
        password: "admin1234567",
        role: "admin",
        status: "active",

        profile: {
            fullName: "lương văn thanh",
            email: "thanh.lv10041999@gmail.com",
            phone: "0912345678",
            avatar: "assets/images/avatar/default-avatar.png",

            dateOfBirth: "1999-04-10",
            gender: "male",

            citizenId: "079099001234",
            issueDate: "2021-05-10",
            issuePlace: "cục cảnh sát qlhc về ttxh",

            nationality: "việt nam",

            permanentAddress: "123 nguyễn huệ, quận 1, tp. hồ chí minh",
            currentAddress: "25 lê lợi, quận 1, tp. hồ chí minh",

            emergencyContact: {
                fullName: "lương văn a",
                phone: "0909123456",
                relationship: "cha",
                address: "123 nguyễn huệ, quận 1, tp. hồ chí minh"
            },

            education: "đại học",

            languages: [
                "tiếng việt",
                "tiếng anh"
            ],

            skills: [
                "html",
                "css",
                "javascript",
                "tailwind css",
                "git",
                "responsive design"
            ],

            note: "quản trị viên hệ thống."
        },

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
