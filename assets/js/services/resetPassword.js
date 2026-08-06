import { getCurrentUser,
        saveCurrentUser,
        signinUser 
} from "./authService.js";
import { getAll } from "../../../database/user.js";
import { USERS, INFO_TEMP } from "../common/storageKeys.js";

function isValidPassword(password) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=\S+$).{12,}$/.test(String(password || ""));
}

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

['error'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => clearError(id));
});

document.getElementById("reset-password").addEventListener("submit", async function(event){
    event.preventDefault(); // không tải lại trang khi submit form

    let newPassword = document.getElementById("newPassword").value.trim();
    let confirmPassword = document.getElementById("confirmPassword").value.trim();
    let btn = event.currentTarget.querySelector("button[type='submit']");
    let hasError = false;
    
    clearError("error");
    if(!newPassword) {
        showError("error", "Vui lòng nhập mật khẩu");
        hasError = true;
    } else {
        if(!isValidPassword(newPassword)) {
            showError("error", "Mật khẩu tối thiểu 12 ký tự, có chữ in hoa, số, ký tự đặc biệt và không chứa khoảng trắng.");
            hasError = true;
        }
    }

    if(hasError) return; // Nếu có lỗi, không tiếp tục xử lý tiếp

    if(!confirmPassword) {
        showError("error", "Vui lòng nhập xác nhận mật khẩu");
        hasError = true;
    } else {
        if(!isValidPassword(confirmPassword)) {
            showError("error", "Mật khẩu tối thiểu 12 ký tự, có chữ in hoa, số, ký tự đặc biệt và không chứa khoảng trắng.");
            hasError = true;
        }
        if(newPassword !== confirmPassword) {
            showError("error", "Mật khẩu xác nhận không khớp");
            hasError = true;
        }
    }

    if(hasError) return; // Nếu có lỗi, không tiếp tục xử lý tiếp
    const users = getAll() || [];
    let currentUser = getCurrentUser();
    if(!currentUser){
        let tempUser = localStorage.getItem(INFO_TEMP) || "null";
        currentUser =JSON.parse(tempUser);
    }
    const userIndex = users.findIndex((item) => String(item.account || "").trim() === currentUser.account);
    
    if (userIndex < 0) {
      alert("Không tìm thấy tài khoản để lưu.");
      return;
    }

    const currentUserInfo = users[userIndex];
    if(users[userIndex].password === newPassword){
        showError("error", "Mật khẩu mới không được trùng với mật khẩu cũ");
        return;
    }
    const now = new Date().toISOString();

    users[userIndex] = {
      ...currentUserInfo,
      password:newPassword,
      resetPass: false
    };
    
    localStorage.setItem(USERS, JSON.stringify(users));
    let foundUser =  await signinUser(currentUser.account, newPassword);
    saveCurrentUser(foundUser);
    localStorage.removeItem(INFO_TEMP);
    window.location.href = new URL("../accountdashboard/accountdashboard.html", window.location.href).href;
});