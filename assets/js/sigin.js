import {
   initUsers,
    getAll,
    findById,
    findByName,
    insertUser,
    updateUser,
    signin
} from "../../database/user.js";
import {
   hashPassword
} from "./cryptoService.js";

function init(){
    initUsers();
};

async function login(){
    let account = document.getElementById("account").value.trim();
    let password = await hashPassword(document.getElementById("password").value.trim());
    let user = signin(account, password);
    if (!user) {
        alert(password);
    }else{
        window.location.replace("./dashboard.html");
    }
};

window.init = init;
window.login = login;