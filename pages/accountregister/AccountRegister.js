const btnTiepTuc = document.getElementById('btnTiepTuc');
const modal = document.getElementById('confirmationModal');
const btnBack = document.getElementById('btnBack');
const btnConfirm = document.getElementById('btnConfirm');
const avatarInput = document.getElementById('Avatar');
const uploadBtn = document.getElementById('AvatarUploadBtn');
let avatarUrl ="";

uploadBtn.addEventListener ('click',()=>
{avatarInput.click();

});

avatarInput.addEventListener('change',()=>{
    const file = avatarInput.files[0];
    if (!file) return;
    const preview = document.getElementById('AvatarPreview');
    avatarUrl = URL.createObjectURL(file);
    preview.src = avatarUrl

    preview.hidden =false;
});

btnTiepTuc.addEventListener ('click',()=>
{modal.style.display = "flex";
const HoTen1 = document.getElementById('HoTen').value; 
const SoDienThoai1 = document.getElementById('SoDienThoai').value;
const NgayCap1 = document.getElementById('NgayCap').value;
const NgaySinh1 = document.getElementById('NgaySinh').value;
const DcEmail1 = document.getElementById('DcEmail').value;
const NoiCap1 = document.getElementById('NoiCap').value;
const GioiTinh1 = document.getElementById('GioiTinh').value;
const SoCccd1 = document.getElementById('SoCccd').value;
const QuocTich1 = document.getElementById('QuocTich').value;
const DCTtru1 = document.getElementById('DCTtru').value;
const DCHtai1 = document.getElementById('DCHtai').value;
const NgLienHe1 = document.getElementById('NgLienHe').value;
const SDTNgLienHe1 = document.getElementById('SDTNgLienHe').value;
const QuanHe1 = document.getElementById('QuanHe').value;
const DCNgLienHe1 = document.getElementById('DCNgLienHe').value;
const TenDangNhap1 = document.getElementById('TenDangNhap').value;
const EmailDangNhap1 = document.getElementById('EmailDangNhap').value;
const MatKhauTam1 = document.getElementById('MatKhauTam').value;
const NhapLaiMK1 = document.getElementById('NhapLaiMK').value;
const HocVan1 = document.getElementById('HocVan').value;
const NgoaiNgu1 = document.getElementById('NgoaiNgu').value;
const KyNang1 = document.getElementById('KyNang').value;
const GhiChu1 = document.getElementById('GhiChu').value;

document.getElementById('Re_HoTen').textContent = HoTen1 || "Chưa nhập";
document.getElementById('Re_NgaySinh').textContent = NgaySinh1 || "Chưa nhập";
document.getElementById('Re_SoDienThoai').textContent = SoDienThoai1 || "Chưa nhập";
document.getElementById('Re_NgayCap').textContent = NgayCap1 || "Chưa nhập";
document.getElementById('Re_DcEmail').textContent = DcEmail1 || "Chưa nhập";
document.getElementById('Re_NoiCap').textContent = NoiCap1 || "Chưa nhập";
document.getElementById('Re_GioiTinh').textContent = GioiTinh1 || "Chưa nhập";
document.getElementById('Re_SoCccd').textContent = SoCccd1 || "Chưa nhập";
document.getElementById('Re_QuocTich').textContent = QuocTich1 || "Chưa nhập";
document.getElementById('Re_DCTtru').textContent = DCTtru1 || "Chưa nhập";
document.getElementById('Re_DCHtai').textContent = DCHtai1 || "Chưa nhập";
document.getElementById('Re_NgLienHe').textContent = NgLienHe1 || "Chưa nhập";
document.getElementById('Re_SDTNgLienHe').textContent = SDTNgLienHe1 || "Chưa nhập";
document.getElementById('Re_QuanHe').textContent = QuanHe1 || "Chưa nhập";
document.getElementById('Re_DCNgLienHe').textContent = DCNgLienHe1 || "Chưa nhập";
document.getElementById('Re_TenDangNhap').textContent = TenDangNhap1 || "Chưa nhập";
document.getElementById('Re_EmailDangNhap').textContent = EmailDangNhap1 || "Chưa nhập";
document.getElementById('Re_MatKhauTam').textContent = MatKhauTam1 || "Chưa nhập";
document.getElementById('Re_NhapLaiMK').textContent = NhapLaiMK1 || "Chưa nhập";
document.getElementById('Re_HocVan').textContent = HocVan1 || "Chưa nhập";
document.getElementById('Re_NgoaiNgu').textContent = NgoaiNgu1 || "Chưa nhập";
document.getElementById('Re_KyNang').textContent = KyNang1 || "Chưa nhập";
document.getElementById('Re_GhiChu').textContent = GhiChu1 || "Chưa nhập";
document.getElementById('Re_Avatar').src = avatarUrl || "Chưa có avatar";

});
btnBack.addEventListener('click',()=>{modal.style.display= "none";});
