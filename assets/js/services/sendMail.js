emailjs.init({
    publicKey: "k-XMnuXIfuCGDJE5W"
});

export function sendPasswordUpdateMail({ email, fullName, password }) {
    if (!email) {
        return Promise.reject(new Error("Email người nhận không hợp lệ."));
    }
    return null;
    // return emailjs.send(
    //     "service_hrpms",
    //     "template_8bdjom9",
    //     {
    //         fullName: fullName || "Người dùng",
    //         email: email || "",
    //         password: password || "",
    //         message: "Mật khẩu của bạn đã được cập nhật thành công."
    //     }
    // );
}
