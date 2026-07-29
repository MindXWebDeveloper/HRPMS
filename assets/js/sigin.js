import {
   initUsers
} from "../../database/user.js";
import {
   getCurrentUser,
   saveCurrentUser,
   signinUser
} from "./services/authService.js";
import { INFO_TEMP } from "./common/storageKeys.js";

document.addEventListener("DOMContentLoaded", function() {
    const currentUser = getCurrentUser();

    if (currentUser) {
        window.location.replace("./pages/accountdashboard/accountdashboard.html");
        return;
    }

    initUsers();
});
// async function login(){
//    let account = document.getElementById("account").value.trim();
//    let inputPassword = document.getElementById("password").value.trim();
//    let foundUser = await loginUser(account, inputPassword);

//    if (!foundUser) {
//       alert("Tài khoản hoặc mật khẩu không chính xác");
//       return;
//    }

//    const currentUser = {
//       account: foundUser.account,
//       name: foundUser.name,
//       role: (foundUser.role || "EMPLOYEE").toUpperCase()
//    };

//    saveCurrentUser(currentUser);
//    window.location.replace("pages/accountdashboard/accountdashboard.html");
// };

// window.init = init;
// window.login = login;

function showError(inputId, message) {
        const input = document.getElementById(inputId);
        // Thay đổi viền dưới của input sang màu đỏ (red)
        input.classList.remove('border-slate-300');
        input.classList.add('border-red-300');
        
        // Lấy container chứa input (xử lý cả trường hợp input nằm trong thẻ .relative của nút mắt)
        const container = input.closest('.input') ? input.closest('.input').parentNode : input.parentNode;
        
        // Tìm xem đã có thẻ thông báo lỗi chưa, nếu chưa có thì tạo mới
        let errorSpan = container.querySelector('.error-msg');
        if (!errorSpan) {
            errorSpan = document.createElement('span');
            errorSpan.className = 'error-msg text-xs text-red-600 mt-1 block';
            container.appendChild(errorSpan);
        }
        errorSpan.innerText = message; // Ghi đè thông điệp lỗi mới
    }


 // HÀM XÓA TRẠNG THÁI BÁO LỖI
function clearError(inputId) {
    const input = document.getElementById(inputId);
    // Trả lại viền xám mặc định cho input
    input.classList.remove('border-red-300');
    input.classList.add('border-slate-300');
        
    const container = input.closest('.input') ? input.closest('.input').parentNode : input.parentNode;
    const errorSpan = container.querySelector('.error-msg');
    if (errorSpan) {
        errorSpan.remove(); // Xóa thẻ span lỗi
    }
}

['account', 'password'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => clearError(id));
});


//Lấy ta id của form và lắng nghe sự kiện submit
document.getElementById("login-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // không tải lại trang khi submit form

    let account = document.getElementById("account").value.trim().toLowerCase();
    let inputPassword = document.getElementById("password").value.trim();
    let btn = event.currentTarget.querySelector("button[type='submit']");
    let hasError = false;
    
    clearError("account");
    clearError("password");
    if(!account) {
        showError("account", "Vui lòng nhập tài khoản");
        hasError = true;
    } else {
        const accountRegex = /^(?!.*\s)[a-z0-9]{5,20}$/;
        if(!accountRegex.test(account)) {
            showError("account", "Vui lòng nhập tài khoản hợp lệ (5-20 ký tự, chỉ gồm chữ cái và số, không có khoảng trắng)");
            hasError = true;
        }
    }
    if(!inputPassword) {
        showError("password", "Vui lòng nhập mật khẩu");
        hasError = true;
    } else {
        const passwordRegex = /^\S{12,}$/;
        if(!passwordRegex.test(inputPassword)) {
            showError("password", "Mật khẩu phải có ít nhất 12 ký tự và không được có khoảng trắng");
            hasError = true;
        }
    }

    if(hasError) return; // Nếu có lỗi, không tiếp tục xử lý đăng nhập

    btn.disabled = true; // Vô hiệu hóa nút submit để tránh gửi nhiều lần
    let foundUser =  await signinUser(account, inputPassword);

    if(foundUser) {
        if(!foundUser.resetPass) {
            saveCurrentUser(foundUser);
            // Chuyển hướng đến trang chính hoặc trang dashboard
            window.location.href = "./pages/accountdashboard/accountdashboard.html";
            btn.disabled = true; // Tắt submit sau khi xử lý xong
        }else{
            const data = {
                account: account,
                password: inputPassword,
                resetPass: true
            };
            localStorage.setItem(INFO_TEMP, JSON.stringify(data));
            window.location.href = "./pages/employee-management/reset-password.html";
        }
        
    }else{
        showError("account", "Tài khoản hoặc mật khẩu không chính xác");
         btn.disabled = false; // Kích hoạt lại nút submit sau khi xử lý xong
    }
   

});
