const TRUONG = ["chuyenCan", "baiTap", "kiemTra", "thi"];

const THANG_DIEM = [
  [9, "A+"],
  [8.5, "A"],
  [8, "B+"],
  [7, "B"],
  [6.5, "C+"],
  [5.5, "C"],
  [5, "D+"],
  [4, "D"],
];

function hopLe(diem) {
  return (
    typeof diem === "number" &&
    Number.isFinite(diem) &&
    diem >= 0 &&
    diem <= 10 &&
    Number.isInteger(Number((diem * 10).toFixed(6)))
  );
}

function loi(truong) {
  const e = new RangeError(`Diem khong hop le: ${truong}`);
  e.code = "DIEM_KHONG_HOP_LE";
  e.truong = truong;
  return e;
}

function tinhTongKet({ chuyenCan, baiTap, kiemTra, thi }) {
  const phanTram = [chuyenCan * 10, baiTap * 20, kiemTra * 20, thi * 50]
    .map((x) => Math.round(x * 10))
    .reduce((a, b) => a + b, 0);
  return Math.floor((phanTram + 50) / 100) / 10;
}

function diemChuTheoThang(tongKet) {
  const muc = THANG_DIEM.find(([nguong]) => tongKet >= nguong);
  return muc ? muc[1] : "F";
}

export function tinhDiemHocPhan(diem) {
  for (const truong of TRUONG) {
    if (!hopLe(diem[truong])) throw loi(truong);
  }
  if (diem.chuyenCan < 5) {
    return { tongKet: 0, diemChu: "F", trangThai: "CAM_THI" };
  }
  const tongKet = tinhTongKet(diem);
  if (diem.thi < 3) {
    return { tongKet, diemChu: "F", trangThai: "KHONG_DAT" };
  }
  const diemChu = diemChuTheoThang(tongKet);
  return { tongKet, diemChu, trangThai: diemChu === "F" ? "KHONG_DAT" : "DAT" };
}
