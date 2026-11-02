import { test } from "node:test";
import assert from "node:assert/strict";
import { tinhDiemHocPhan } from "../src/diem.js";

const TRUONG = ["chuyenCan", "baiTap", "kiemTra", "thi"];

function diem(chuyenCan, baiTap, kiemTra, thi) {
  return { chuyenCan, baiTap, kiemTra, thi };
}

function ketQua(tongKet, diemChu, trangThai) {
  return { tongKet, diemChu, trangThai };
}

function loiDiem(truong) {
  return (e) => {
    assert.ok(e instanceof RangeError);
    assert.equal(e.code, "DIEM_KHONG_HOP_LE");
    assert.equal(e.truong, truong);
    assert.equal(e.message, `Diem khong hop le: ${truong}`);
    return true;
  };
}

const NGUONG_CHINH_XAC = [
  [diem(9, 9, 9, 9), 9, "A+"],
  [diem(8.5, 8.5, 8.5, 8.5), 8.5, "A"],
  [diem(8, 8, 8, 8), 8, "B+"],
  [diem(7, 7, 7, 7), 7, "B"],
  [diem(6.5, 6.5, 6.5, 6.5), 6.5, "C+"],
  [diem(5.5, 5.5, 5.5, 5.5), 5.5, "C"],
  [diem(5, 5, 5, 5), 5, "D+"],
  [diem(5, 5, 5, 3), 4, "D"],
];

for (const [d, tongKet, diemChu] of NGUONG_CHINH_XAC) {
  test(`tong ket ${tongKet} dung nguong -> ${diemChu}`, () => {
    assert.deepEqual(tinhDiemHocPhan(d), ketQua(tongKet, diemChu, "DAT"));
  });
}

const SAT_DUOI_NGUONG = [
  [diem(10, 10, 10, 7.8), 8.9, "A", "DAT"],
  [diem(10, 10, 10, 6.8), 8.4, "B+", "DAT"],
  [diem(10, 10, 10, 5.8), 7.9, "B", "DAT"],
  [diem(10, 10, 10, 3.8), 6.9, "C+", "DAT"],
  [diem(6, 6, 6, 6.8), 6.4, "C", "DAT"],
  [diem(5, 0, 0, 9.8), 5.4, "D+", "DAT"],
  [diem(5, 0, 0, 8.8), 4.9, "D", "DAT"],
  [diem(5, 0, 0, 6.8), 3.9, "F", "KHONG_DAT"],
];

for (const [d, tongKet, diemChu, trangThai] of SAT_DUOI_NGUONG) {
  test(`tong ket ${tongKet} sat duoi nguong -> ${diemChu} (${trangThai})`, () => {
    assert.deepEqual(tinhDiemHocPhan(d), ketQua(tongKet, diemChu, trangThai));
  });
}

const LAM_TRON = [
  [diem(9.7, 10, 10, 8), 9, "A+", "DAT"],
  [diem(9.4, 10, 10, 8), 8.9, "A", "DAT"],
  [diem(5.6, 0, 0, 9.8), 5.5, "C", "DAT"],
  [diem(5.6, 0, 0, 8.8), 5, "D+", "DAT"],
  [diem(5.6, 0, 0, 6.8), 4, "D", "DAT"],
];

for (const [d, tongKet, diemChu, trangThai] of LAM_TRON) {
  test(`lam tron ve ${tongKet} truoc khi xep loai -> ${diemChu}`, () => {
    assert.deepEqual(tinhDiemHocPhan(d), ketQua(tongKet, diemChu, trangThai));
  });
}

test("trong so chuyenCan la 0.1", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(10, 0, 0, 3)), ketQua(2.5, "F", "KHONG_DAT"));
});

test("trong so baiTap la 0.2", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(5, 10, 0, 3)), ketQua(4, "D", "DAT"));
});

test("trong so kiemTra la 0.2", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(5, 0, 10, 3)), ketQua(4, "D", "DAT"));
});

test("trong so thi la 0.5", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(5, 0, 0, 10)), ketQua(5.5, "C", "DAT"));
});

test("tat ca diem 10 -> tong ket 10, A+, DAT", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(10, 10, 10, 10)), ketQua(10, "A+", "DAT"));
});

test("chuyenCan dung 5 khong bi cam thi", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(5, 10, 10, 10)), ketQua(9.5, "A+", "DAT"));
});

test("chuyenCan 4.9 -> CAM_THI, tong ket 0, F", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(4.9, 10, 10, 10)), ketQua(0, "F", "CAM_THI"));
});

test("chuyenCan 0 -> CAM_THI", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(0, 10, 10, 10)), ketQua(0, "F", "CAM_THI"));
});

test("CAM_THI uu tien hon thi duoi 3", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(4, 10, 10, 0)), ketQua(0, "F", "CAM_THI"));
});

test("thi 2.8 -> KHONG_DAT, F, van giu tong ket 6.4", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(10, 10, 10, 2.8)), ketQua(6.4, "F", "KHONG_DAT"));
});

test("thi 0 -> KHONG_DAT, F, van giu tong ket 5", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(10, 10, 10, 0)), ketQua(5, "F", "KHONG_DAT"));
});

test("thi dung 3 khong bi loai -> C+ DAT", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(10, 10, 10, 3)), ketQua(6.5, "C+", "DAT"));
});

test("thi tu 3 tro len nhung tong ket duoi 4 -> F, KHONG_DAT", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(5, 0, 0, 3)), ketQua(2, "F", "KHONG_DAT"));
});

const GIA_TRI_SAI = [
  ["am", -0.1],
  ["lon hon 10", 10.1],
  ["NaN", NaN],
  ["Infinity", Infinity],
  ["-Infinity", -Infinity],
  ["chuoi so", "7"],
  ["null", null],
  ["undefined", undefined],
  ["hai chu so thap phan", 7.25],
  ["boolean", true],
];

for (const truong of TRUONG) {
  for (const [ten, giaTri] of GIA_TRI_SAI) {
    test(`${truong} ${ten} -> nem RangeError DIEM_KHONG_HOP_LE`, () => {
      const d = { ...diem(8, 8, 8, 8), [truong]: giaTri };
      assert.throws(() => tinhDiemHocPhan(d), loiDiem(truong));
    });
  }
}

test("thieu truong thi -> bao loi truong thi", () => {
  assert.throws(
    () => tinhDiemHocPhan({ chuyenCan: 8, baiTap: 8, kiemTra: 8 }),
    loiDiem("thi"),
  );
});

test("doi tuong rong -> bao loi truong chuyenCan", () => {
  assert.throws(() => tinhDiemHocPhan({}), loiDiem("chuyenCan"));
});

test("nhieu truong sai -> bao chuyenCan truoc", () => {
  assert.throws(() => tinhDiemHocPhan(diem(-1, -1, -1, -1)), loiDiem("chuyenCan"));
});

test("baiTap, kiemTra, thi cung sai -> bao baiTap truoc", () => {
  assert.throws(() => tinhDiemHocPhan(diem(8, 11, 11, 11)), loiDiem("baiTap"));
});

test("kiemTra va thi cung sai -> bao kiemTra truoc", () => {
  assert.throws(() => tinhDiemHocPhan(diem(8, 8, 11, 11)), loiDiem("kiemTra"));
});

test("diem sai van bi bao loi ke ca khi chuyenCan duoi 5", () => {
  assert.throws(() => tinhDiemHocPhan(diem(4, 10, 10, 11)), loiDiem("thi"));
  assert.throws(() => tinhDiemHocPhan(diem(4, NaN, 10, 10)), loiDiem("baiTap"));
});

test("0 va 10 la gia tri hop le o moi truong", () => {
  assert.doesNotThrow(() => tinhDiemHocPhan(diem(0, 0, 0, 0)));
  assert.doesNotThrow(() => tinhDiemHocPhan(diem(10, 10, 10, 10)));
});

test("so nguyen va so mot chu so thap phan deu hop le", () => {
  assert.doesNotThrow(() => tinhDiemHocPhan(diem(7, 7.5, 8, 8.5)));
});

test("khong thay doi doi tuong dau vao", () => {
  const d = Object.freeze(diem(8, 7, 9, 6));
  tinhDiemHocPhan(d);
  assert.deepEqual(d, diem(8, 7, 9, 6));
});

test("bo qua cac truong thua trong dau vao", () => {
  const d = { ...diem(10, 10, 10, 10), hoTen: "Nguyen Van A", ghiChu: 1 };
  assert.deepEqual(tinhDiemHocPhan(d), ketQua(10, "A+", "DAT"));
});

test("ca thuc te 8, 7, 9, 6 -> 7, B, DAT", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(8, 7, 9, 6)), ketQua(7, "B", "DAT"));
});

test("ca thuc te 7, 8, 9, 6 -> 7.1, B, DAT", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(7, 8, 9, 6)), ketQua(7.1, "B", "DAT"));
});

test("ca thuc te 9, 8, 7, 10 -> 8.9, A, DAT", () => {
  assert.deepEqual(tinhDiemHocPhan(diem(9, 8, 7, 10)), ketQua(8.9, "A", "DAT"));
});
