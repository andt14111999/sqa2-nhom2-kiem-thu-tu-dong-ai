import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { tinhDiemHocPhan } from "../src/diem.js";

const TRUONG = ["chuyenCan", "baiTap", "kiemTra", "thi"];

const diem = (chuyenCan, baiTap, kiemTra, thi) => ({ chuyenCan, baiTap, kiemTra, thi });
const diemDeu = (v) => diem(v, v, v, v);
const diemHopLe = () => diem(8, 8, 8, 8);
const ketQua = (tongKet, diemChu, trangThai) => ({ tongKet, diemChu, trangThai });
const CAM_THI = ketQua(0, "F", "CAM_THI");

function kiemTraLoiDiem(fn, truong) {
  assert.throws(fn, (e) => {
    assert.ok(e instanceof RangeError);
    assert.equal(e.name, "RangeError");
    assert.equal(e.code, "DIEM_KHONG_HOP_LE");
    assert.equal(e.truong, truong);
    assert.equal(e.message, `Diem khong hop le: ${truong}`);
    return true;
  });
}

describe("thang diem chu va ranh gioi", () => {
  const BANG = [
    { ten: "10 -> A+", vao: diemDeu(10), ra: ketQua(10, "A+", "DAT") },
    { ten: "9 -> A+ (bien duoi cua A+)", vao: diemDeu(9), ra: ketQua(9, "A+", "DAT") },
    { ten: "8.9 -> A", vao: diemDeu(8.9), ra: ketQua(8.9, "A", "DAT") },
    { ten: "8.5 -> A (bien duoi cua A)", vao: diemDeu(8.5), ra: ketQua(8.5, "A", "DAT") },
    { ten: "8.4 -> B+", vao: diemDeu(8.4), ra: ketQua(8.4, "B+", "DAT") },
    { ten: "8 -> B+ (bien duoi cua B+)", vao: diemDeu(8), ra: ketQua(8, "B+", "DAT") },
    { ten: "7.9 -> B", vao: diemDeu(7.9), ra: ketQua(7.9, "B", "DAT") },
    { ten: "7 -> B (bien duoi cua B)", vao: diemDeu(7), ra: ketQua(7, "B", "DAT") },
    { ten: "6.9 -> C+", vao: diemDeu(6.9), ra: ketQua(6.9, "C+", "DAT") },
    { ten: "6.5 -> C+ (bien duoi cua C+)", vao: diemDeu(6.5), ra: ketQua(6.5, "C+", "DAT") },
    { ten: "6.4 -> C", vao: diemDeu(6.4), ra: ketQua(6.4, "C", "DAT") },
    { ten: "5.5 -> C (bien duoi cua C)", vao: diemDeu(5.5), ra: ketQua(5.5, "C", "DAT") },
    { ten: "5.4 -> D+", vao: diemDeu(5.4), ra: ketQua(5.4, "D+", "DAT") },
    { ten: "5 -> D+ (bien duoi cua D+)", vao: diemDeu(5), ra: ketQua(5, "D+", "DAT") },
    { ten: "4.9 -> D", vao: diem(5, 0, 0, 8.8), ra: ketQua(4.9, "D", "DAT") },
    { ten: "4 -> D (bien duoi cua D, van DAT)", vao: diem(5, 0, 0, 7), ra: ketQua(4, "D", "DAT") },
    { ten: "3.9 -> F va KHONG_DAT", vao: diem(5, 0, 0, 6.8), ra: ketQua(3.9, "F", "KHONG_DAT") },
  ];

  for (const { ten, vao, ra } of BANG) {
    test(`tong ket ${ten}`, () => {
      assert.deepEqual(tinhDiemHocPhan(vao), ra);
    });
  }
});

describe("cam thi khi chuyen can duoi 5", () => {
  test("chuyen can 4.9 bi cam thi du cac diem khac toi da", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(4.9, 10, 10, 10)), CAM_THI);
  });

  test("chuyen can 0 bi cam thi", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(0, 10, 10, 10)), CAM_THI);
  });

  test("cam thi uu tien hon viec thi duoi 3", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(4, 10, 10, 2)), CAM_THI);
  });

  test("chuyen can dung 5 khong bi cam thi", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(5, 10, 10, 10)), ketQua(9.5, "A+", "DAT"));
  });
});

describe("diem thi duoi 3 bi KHONG_DAT", () => {
  test("thi 2.9 van giu tong ket that va xep F", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(9.9, 10, 10, 2.9)), ketQua(6.4, "F", "KHONG_DAT"));
  });

  test("thi dung 3 khong bi ep xuong F", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(10, 10, 10, 3)), ketQua(6.5, "C+", "DAT"));
  });

  test("thi 2 xep F du tong ket dat 6", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(10, 10, 10, 2)), ketQua(6, "F", "KHONG_DAT"));
  });

  test("thi 0 xep F du tong ket dat 5", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(10, 10, 10, 0)), ketQua(5, "F", "KHONG_DAT"));
  });

  test("chuyen can dung 5 va thi dung 3 deu qua hai dieu kien chan", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(5, 10, 10, 3)), ketQua(6, "C", "DAT"));
  });
});

describe("trong so 10/20/20/50", () => {
  test("diem nen chuyen can 5, thi 3 cho tong ket 2", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(5, 0, 0, 3)), ketQua(2, "F", "KHONG_DAT"));
  });

  test("chuyen can tang 5 diem thi tong ket tang 0.5", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(10, 0, 0, 3)), ketQua(2.5, "F", "KHONG_DAT"));
  });

  test("bai tap tang 10 diem thi tong ket tang 2", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(5, 10, 0, 3)), ketQua(4, "D", "DAT"));
  });

  test("kiem tra tang 10 diem thi tong ket tang 2", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(5, 0, 10, 3)), ketQua(4, "D", "DAT"));
  });

  test("thi tang 7 diem thi tong ket tang 3.5", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(5, 0, 0, 10)), ketQua(5.5, "C", "DAT"));
  });

  test("bon diem khac nhau 6, 7, 8, 9", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(6, 7, 8, 9)), ketQua(8.1, "B+", "DAT"));
  });

  test("bon diem khac nhau 9, 6, 7, 8", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(9, 6, 7, 8)), ketQua(7.5, "B", "DAT"));
  });
});

describe("lam tron tong ket den mot chu so thap phan", () => {
  test("7.63 lam tron xuong 7.6", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(9.3, 8, 8, 7)), ketQua(7.6, "B", "DAT"));
  });

  test("7.67 lam tron len 7.7", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(9.7, 8, 8, 7)), ketQua(7.7, "B", "DAT"));
  });

  test("6.43 lam tron xuong 6.4 va xep C", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(5.3, 8, 8, 5.4)), ketQua(6.4, "C", "DAT"));
  });

  test("6.47 lam tron len 6.5 va xep C+", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(5.7, 8, 8, 5.4)), ketQua(6.5, "C+", "DAT"));
  });

  test("8.97 lam tron len 9 va xep A+", () => {
    assert.deepEqual(tinhDiemHocPhan(diem(6.7, 10, 10, 8.6)), ketQua(9, "A+", "DAT"));
  });
});

describe("kiem tra tinh hop le cua diem", () => {
  const GIA_TRI_SAI = [-0.1, 10.1, NaN, Infinity, -Infinity, "8", null, undefined, 8.55, 7.25];

  for (const truong of TRUONG) {
    for (const giaTri of GIA_TRI_SAI) {
      test(`nem RangeError khi ${truong} = ${inspect(giaTri)}`, () => {
        kiemTraLoiDiem(() => tinhDiemHocPhan({ ...diemHopLe(), [truong]: giaTri }), truong);
      });
    }
  }

  for (const truong of TRUONG) {
    test(`nem RangeError khi thieu truong ${truong}`, () => {
      const vao = diemHopLe();
      delete vao[truong];
      kiemTraLoiDiem(() => tinhDiemHocPhan(vao), truong);
    });
  }

  test("doi tuong rong bao loi o truong dau tien la chuyenCan", () => {
    kiemTraLoiDiem(() => tinhDiemHocPhan({}), "chuyenCan");
  });

  TRUONG.forEach((truong, i) => {
    test(`nhieu truong sai thi bao truong dau tien theo thu tu: ${truong}`, () => {
      const vao = diemHopLe();
      for (const sau of TRUONG.slice(i)) vao[sau] = -1;
      kiemTraLoiDiem(() => tinhDiemHocPhan(vao), truong);
    });
  });

  test("thu tu bao loi theo danh sach truong, khong theo thu tu khoa cua doi tuong", () => {
    kiemTraLoiDiem(
      () => tinhDiemHocPhan({ thi: 99, kiemTra: -1, baiTap: 8, chuyenCan: 8 }),
      "kiemTra",
    );
  });

  test("kiem tra hop le chay truoc luat cam thi: thi sai van nem loi du chuyen can 3", () => {
    kiemTraLoiDiem(() => tinhDiemHocPhan(diem(3, 8, 8, 11)), "thi");
  });

  test("kiem tra hop le chay truoc luat cam thi: bai tap sai van nem loi du chuyen can 3", () => {
    kiemTraLoiDiem(() => tinhDiemHocPhan(diem(3, -1, 8, 8)), "baiTap");
  });

  for (const vao of [undefined, null]) {
    test(`nem TypeError khi dau vao la ${inspect(vao)}`, () => {
      assert.throws(() => tinhDiemHocPhan(vao), TypeError);
    });
  }

  for (const truong of TRUONG) {
    for (const bien of [0, 10]) {
      test(`chap nhan ${truong} = ${bien}`, () => {
        assert.doesNotThrow(() => tinhDiemHocPhan({ ...diemHopLe(), [truong]: bien }));
      });
    }
  }
});

describe("tinh chat cua dau vao va ket qua", () => {
  test("bo qua cac thuoc tinh du thua", () => {
    const vao = { ...diemHopLe(), ghiChu: "x", maSV: 123 };
    assert.deepEqual(tinhDiemHocPhan(vao), ketQua(8, "B+", "DAT"));
  });

  test("khong sua doi doi tuong dau vao", () => {
    const vao = Object.freeze(diem(8, 8, 8, 8));
    assert.deepEqual(tinhDiemHocPhan(vao), ketQua(8, "B+", "DAT"));
    assert.deepEqual(vao, diem(8, 8, 8, 8));
  });
});
