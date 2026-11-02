import test from "node:test";
import assert from "node:assert/strict";
import { tinhDiemHocPhan } from "../src/diem.js";

const TRUONG = ["chuyenCan", "baiTap", "kiemTra", "thi"];

const diem = (chuyenCan, baiTap, kiemTra, thi) => ({ chuyenCan, baiTap, kiemTra, thi });

const nhan = (v) => (typeof v === "string" ? JSON.stringify(v) : String(v));

function kiemTraLoi(truong) {
  return (e) => {
    assert.ok(e instanceof RangeError);
    assert.equal(e.name, "RangeError");
    assert.equal(e.code, "DIEM_KHONG_HOP_LE");
    assert.equal(e.truong, truong);
    assert.equal(e.message, `Diem khong hop le: ${truong}`);
    return true;
  };
}

function nhomCa(tenNhom, bang) {
  for (const [ten, d, tongKet, diemChu, trangThai] of bang) {
    test(`${tenNhom}: ${ten}`, () => {
      assert.deepEqual(tinhDiemHocPhan(diem(...d)), { tongKet, diemChu, trangThai });
    });
  }
}

function chuMongDoi(tongKet) {
  if (tongKet >= 9) return "A+";
  if (tongKet >= 8.5) return "A";
  if (tongKet >= 8) return "B+";
  if (tongKet >= 7) return "B";
  if (tongKet >= 6.5) return "C+";
  if (tongKet >= 5.5) return "C";
  if (tongKet >= 5) return "D+";
  if (tongKet >= 4) return "D";
  return "F";
}

nhomCa("thang diem", [
  ["tong ket 10 toi da la A+", [10, 10, 10, 10], 10, "A+", "DAT"],
  ["tong ket 9.0 dung bien la A+", [10, 10, 10, 8], 9, "A+", "DAT"],
  ["tong ket 8.9 sat duoi bien A+ la A", [10, 10, 10, 7.8], 8.9, "A", "DAT"],
  ["tong ket 8.5 dung bien la A", [10, 10, 10, 7], 8.5, "A", "DAT"],
  ["tong ket 8.4 sat duoi bien A la B+", [10, 10, 10, 6.8], 8.4, "B+", "DAT"],
  ["tong ket 8.0 dung bien la B+", [10, 10, 10, 6], 8, "B+", "DAT"],
  ["tong ket 7.9 sat duoi bien B+ la B", [10, 10, 10, 5.8], 7.9, "B", "DAT"],
  ["tong ket 7.0 dung bien la B", [10, 10, 10, 4], 7, "B", "DAT"],
  ["tong ket 6.9 sat duoi bien B la C+", [10, 10, 10, 3.8], 6.9, "C+", "DAT"],
  ["tong ket 6.5 dung bien la C+ voi diem thi dung 3", [10, 10, 10, 3], 6.5, "C+", "DAT"],
  ["tong ket 6.4 sat duoi bien C+ la C", [5, 5, 5, 7.8], 6.4, "C", "DAT"],
  ["tong ket 5.5 dung bien la C", [5, 5, 5, 6], 5.5, "C", "DAT"],
  ["tong ket 5.4 sat duoi bien C la D+", [5, 5, 5, 5.8], 5.4, "D+", "DAT"],
  ["tong ket 5.0 dung bien la D+", [5, 5, 5, 5], 5, "D+", "DAT"],
  ["tong ket 4.9 sat duoi bien D+ la D", [5, 5, 5, 4.8], 4.9, "D", "DAT"],
  ["tong ket 4.0 dung bien la D dat toi thieu", [5, 5, 5, 3], 4, "D", "DAT"],
  ["tong ket 3.9 sat duoi bien D la F khong dat", [5, 0, 0, 6.8], 3.9, "F", "KHONG_DAT"],
]);

nhomCa("lam tron va trong so", [
  ["7.11 lam tron xuong thanh 7.1", [7.3, 6.1, 5.3, 8.2], 7.1, "B", "DAT"],
  ["7.19 lam tron len thanh 7.2", [7.3, 6.1, 5.7, 8.2], 7.2, "B", "DAT"],
  ["8.96 lam tron len thanh 9 nen duoc A+", [9.6, 9, 9, 8.8], 9, "A+", "DAT"],
  ["8.94 lam tron xuong thanh 8.9 nen van la A", [9.4, 9, 9, 8.8], 8.9, "A", "DAT"],
  ["3.96 lam tron len thanh 4 nen dat D", [5.6, 0, 0, 6.8], 4, "D", "DAT"],
  ["3.94 lam tron xuong thanh 3.9 nen khong dat", [5.4, 0, 0, 6.8], 3.9, "F", "KHONG_DAT"],
  ["trong so 10 20 20 50", [6, 7, 8, 9], 8.1, "B+", "DAT"],
]);

nhomCa("cam thi", [
  ["chuyen can 0", [0, 10, 10, 10], 0, "F", "CAM_THI"],
  ["chuyen can 4.9 sat duoi nguong 5", [4.9, 10, 10, 10], 0, "F", "CAM_THI"],
  ["chuyen can dung 5 khong bi cam thi", [5, 10, 10, 10], 9.5, "A+", "DAT"],
  ["cam thi uu tien hon diem thi duoi 3", [4, 0, 0, 2], 0, "F", "CAM_THI"],
]);

nhomCa("diem thi duoi 3", [
  ["thi 2.8 van rot du tong ket 6.4", [10, 10, 10, 2.8], 6.4, "F", "KHONG_DAT"],
  ["thi 0 van rot du tong ket 5", [10, 10, 10, 0], 5, "F", "KHONG_DAT"],
  ["thi 2.9 sat duoi nguong 3 rot", [9.9, 10, 10, 2.9], 6.4, "F", "KHONG_DAT"],
  ["thi 0 voi bai tap va kiem tra 10 rot", [5, 10, 10, 0], 4.5, "F", "KHONG_DAT"],
  ["chi co chuyen can 10 rot voi tong ket 1", [10, 0, 0, 0], 1, "F", "KHONG_DAT"],
]);

const GIA_TRI_SAI = [-0.1, 10.1, 7.25, 9.99, NaN, Infinity, -Infinity, "7", null, undefined];
const NEN = diem(8, 8, 8, 8);

for (const truong of TRUONG) {
  for (const gia of GIA_TRI_SAI) {
    test(`nem RangeError khi ${truong} = ${nhan(gia)}`, () => {
      assert.throws(() => tinhDiemHocPhan({ ...NEN, [truong]: gia }), kiemTraLoi(truong));
    });
  }
}

for (const truong of TRUONG) {
  test(`nem RangeError khi thieu truong ${truong}`, () => {
    const d = { ...NEN };
    delete d[truong];
    assert.throws(() => tinhDiemHocPhan(d), kiemTraLoi(truong));
  });
}

test("bao loi truong dau tien theo thu tu chuyenCan, baiTap, kiemTra, thi khi ca bon deu sai", () => {
  assert.throws(
    () => tinhDiemHocPhan(diem(-1, -1, -1, -1)),
    kiemTraLoi("chuyenCan"),
  );
});

test("bao loi baiTap khi baiTap, kiemTra, thi cung sai", () => {
  assert.throws(() => tinhDiemHocPhan(diem(8, 11, 11, 11)), kiemTraLoi("baiTap"));
});

test("bao loi kiemTra khi kiemTra, thi cung sai", () => {
  assert.throws(() => tinhDiemHocPhan(diem(8, 8, "x", NaN)), kiemTraLoi("kiemTra"));
});

test("doi tuong rong bao loi chuyenCan", () => {
  assert.throws(() => tinhDiemHocPhan({}), kiemTraLoi("chuyenCan"));
});

test("kiem tra hop le chay truoc cam thi", () => {
  assert.throws(() => tinhDiemHocPhan(diem(0, 5, 5, 11)), kiemTraLoi("thi"));
});

test("tong cua 0.1 va 0.2 co sai so dau phay dong bi tu choi o baiTap", () => {
  assert.throws(() => tinhDiemHocPhan(diem(8, 0.1 + 0.2, 8, 8)), kiemTraLoi("baiTap"));
});

test("dau vao undefined hoac null nem TypeError", () => {
  assert.throws(() => tinhDiemHocPhan(undefined), TypeError);
  assert.throws(() => tinhDiemHocPhan(null), TypeError);
});

test("bo qua cac truong thua trong dau vao", () => {
  assert.deepEqual(
    tinhDiemHocPhan({ ...NEN, ghiChu: "abc", maSinhVien: 1 }),
    { tongKet: 8, diemChu: "B+", trangThai: "DAT" },
  );
});

test("khong thay doi doi tuong dau vao", () => {
  const goc = { chuyenCan: 7.3, baiTap: 6.1, kiemTra: 5.3, thi: 8.2 };
  const dongBang = Object.freeze({ ...goc });
  tinhDiemHocPhan(dongBang);
  assert.deepEqual(dongBang, goc);
});

test("tinh chat bat bien tren luoi nhieu to hop diem", () => {
  const chuyenCan = [0, 4.9, 5, 7.5, 10];
  const baiTap = [0, 5.5, 10];
  const kiemTra = [0, 6.5, 10];
  const thi = [0, 2.9, 3, 5, 7.5, 10];
  for (const a of chuyenCan) {
    for (const b of baiTap) {
      for (const c of kiemTra) {
        for (const d of thi) {
          const dauVao = diem(a, b, c, d);
          const ngu = JSON.stringify(dauVao);
          const kq = tinhDiemHocPhan(dauVao);
          assert.deepEqual(Object.keys(kq).sort(), ["diemChu", "tongKet", "trangThai"], ngu);
          assert.ok(kq.tongKet >= 0 && kq.tongKet <= 10, ngu);
          assert.equal(Math.round(kq.tongKet * 10) / 10, kq.tongKet, ngu);
          if (a < 5) {
            assert.deepEqual(kq, { tongKet: 0, diemChu: "F", trangThai: "CAM_THI" }, ngu);
          } else if (d < 3) {
            assert.equal(kq.diemChu, "F", ngu);
            assert.equal(kq.trangThai, "KHONG_DAT", ngu);
          } else {
            assert.equal(kq.diemChu, chuMongDoi(kq.tongKet), ngu);
            assert.equal(kq.trangThai, kq.diemChu === "F" ? "KHONG_DAT" : "DAT", ngu);
          }
        }
      }
    }
  }
});

test("tong ket khong giam khi diem thi tang", () => {
  for (const chuyenCan of [0, 5, 10]) {
    let truoc = -Infinity;
    for (let i = 0; i <= 100; i++) {
      const thi = i / 10;
      const { tongKet } = tinhDiemHocPhan(diem(chuyenCan, 6, 7, thi));
      assert.ok(tongKet >= truoc, `chuyenCan=${chuyenCan} thi=${thi}`);
      truoc = tongKet;
    }
  }
});
