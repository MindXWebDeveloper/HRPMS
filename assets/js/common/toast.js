const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

function showSuccess(message) {
    Toast.fire({
        icon: "success",
        title: message
    });
}

function showError(message) {
    Toast.fire({
        icon: "error",
        title: message
    });
}

function showWarning(message) {
    Toast.fire({
        icon: "warning",
        title: message
    });
}

function showInfo(message) {
    Toast.fire({
        icon: "info",
        title: message
    });
}

export { showSuccess, showError, showWarning, showInfo};
