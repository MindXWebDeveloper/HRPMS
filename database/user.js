import {
   hashPassword
} from "../assets/js/cryptoService.js";
const KEY = "user";

let defaultUsers = [{
    id: "AD001",
    name: "Lương Văn Thanh",
    account: "ADM001",
    //password: "Admin1",
    password: "0afb00138d8e73348ec1fe41fd3d3a8fcbd90156b263bfa5791ba0e095f42cfc",
    role: "Admin"
}]

// Khởi tạo data
function initUsers() {
    if(!localStorage.key(KEY)) {
        localStorage.setItem(KEY, JSON.stringify(defaultUsers));
    }
}

//Lấy all data từ localStorage
function getAll() {
    return JSON.parse(localStorage.getItem(KEY));
}

//save new user
function saveUsers(users) {
    return localStorage.setItem(KEY, users);
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
}

//sigin
function signin(account, password){
    const users = getAll();

    return users.find(user => user.account === account && user.password === password);
}

export {
    initUsers,
    getAll,
    findById,
    findByName,
    insertUser,
    updateUser,
    signin
};