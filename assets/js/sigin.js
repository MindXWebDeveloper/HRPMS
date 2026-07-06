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
        alert("Tài khoản hoặc mật khẩu không chính xác");
    }else{
        const user = {
            account: "ADM001",
            role: "ADMIN"
        };


        sessionStorage.setItem(
            "user",
            JSON.stringify(user)
        );
        window.location.replace("./dashboard.html");
    }
};

window.init = init;
window.login = login;