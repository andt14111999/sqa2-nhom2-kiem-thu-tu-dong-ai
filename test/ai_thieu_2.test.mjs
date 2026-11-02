import { test } from "node:test";
import assert from "node:assert/strict";
import { tinhDiemHocPhan } from "../src/diem.js";

const TRUONG = ["chuyenCan", "baiTap", "kiemTra", "thi"];

const diem = (chuyenCan, baiTap, kiemTra, thi) => ({ chuyenCan, baiTap, kiemTra, thi });
const hop = (ghiDe = {}) => ({ ...diem(8, 8, 8, 8), ...ghiDe });
const kq = (tongKet, diemChu, trangThai) => ({ tongKet, diemChu, trangThai });

const loiDiem = (truong) => (loi) => {
  assert.ok(loi instanceof RangeError, "phải là RangeError");
  assert.equal(loi.code, "DIEM_KHONG_HOP_LE");
  assert.equal(loi.truong, truong);
  return true;
};

const mauTenth = (x) => Math.round(x * 10);

const moHinh = ({ chuyenCan, baiTap, kiemTra, thi }) => {
  const cc = mauTenth(chuyenCan);
  const bt = mauTenth(baiTap);
  const kt = mauTenth(kiemTra);
  const t = mauTenth(thi);
  if (cc < 50) return kq(0, "F", "CAM_THI");
  const tong = Math.floor((cc + 2 * bt + 2 * kt + 5 * t + 5) / 10);
  let diemChu = "F";
  if (t >= 30) {
    if (tong >= 90) diemChu = "A+";
    else if (tong >= 85) diemChu = "A";
    else if (tong >= 80) diemChu = "B+";
    else if (tong >= 70) diemChu = "B";
    else if (tong >= 65) diemChu = "C+";
    else if (tong >= 55) diemChu = "C";
    else if (tong >= 50) diemChu = "D+";
    else if (tong >= 40) diemChu = "D";
  }
  return kq(tong / 10, diemChu, diemChu === "F" ? "KHONG_DAT" : "DAT");
};

const luoi = () => {
  const ds = [];
  for (const cc of [4.9, 5, 6.3, 8, 10]) {
    for (const bt of [0, 2.5, 5, 7.7, 10]) {
      for (const kt of [0, 3.3, 6, 9.1, 10]) {
        for (const thi of [0, 1.5, 2.9, 3, 3.1, 4.5, 6.2, 8.7, 10]) {
          ds.push(diem(cc, bt, kt, thi));
        }
      }
    }
  }
  return ds;
};

const giaTriKhongHopLe = [
  ['chuỗi "8"', "8"],
  ["null", null],
  ["undefined", undefined],
  ["boolean true", true],
  ["mảng [8]", [8]],
  ["đối tượng rỗng", {}],
  ["NaN", NaN],
  ["Infinity", Infinity],
  ["-Infinity", -Infinity],
  ["-0.1 (âm)", -0.1],
  ["10.1 (vượt 10)", 10.1],
  ["100 (vượt 10)", 100],
  ["7.25 (2 chữ số thập phân)", 7.25],
  ["9.99 (2 chữ số thập phân)", 9.99],
  ["0.01 (2 chữ số thập phân)", 0.01],
];

for (const truong of TRUONG) {
  for (const [nhan, giaTri] of giaTriKhongHopLe) {
    test(`${truong} = ${nhan} - ném RangeError DIEM_KHONG_HOP_LE với truong ${truong}`, () => {
      assert.throws(() => tinhDiemHocPhan(hop({ [truong]: giaTri })), loiDiem(truong));
    });
  }
}

for (const truong of TRUONG) {
  test(`thiếu hẳn trường ${truong} - ném RangeError DIEM_KHONG_HOP_LE với truong ${truong}`, () => {
    const dauVao = hop();
    delete dauVao[truong];
    assert.throws(() => tinhDiemHocPhan(dauVao), loiDiem(truong));
  });
}

test("nhiều trường sai - báo trường đầu tiên theo thứ tự chuyenCan", () => {
  assert.throws(() => tinhDiemHocPhan(diem(-1, "x", NaN, 11)), loiDiem("chuyenCan"));
});

test("chuyenCan hợp lệ, ba trường sau sai - báo baiTap", () => {
  assert.throws(() => tinhDiemHocPhan(diem(5, 11, NaN, 11)), loiDiem("baiTap"));
});

test("chuyenCan và baiTap hợp lệ, kiemTra và thi sai - báo kiemTra", () => {
  assert.throws(() => tinhDiemHocPhan(diem(5, 5, NaN, 11)), loiDiem("kiemTra"));
});

test("thứ tự báo lỗi không phụ thuộc thứ tự khóa trong đối tượng", () => {
  const dauVao = { thi: 11, kiemTra: 11, baiTap: 11, chuyenCan: 11 };
  assert.throws(() => tinhDiemHocPhan(dauVao), loiDiem("chuyenCan"));
});

test("chuyenCan < 5 nhưng thi sai - vẫn kiểm tra hợp lệ trước và báo thi", () => {
  assert.throws(() => tinhDiemHocPhan(diem(4, 8, 8, 11)), loiDiem("thi"));
});

test("chuyenCan < 5 nhưng baiTap sai - vẫn kiểm tra hợp lệ trước và báo baiTap", () => {
  assert.throws(() => tinhDiemHocPhan(diem(4, NaN, 8, 8)), loiDiem("baiTap"));
});

test("chuyenCan sai (4.55) cùng thi < 3 - báo chuyenCan", () => {
  assert.throws(() => tinhDiemHocPhan(diem(4.55, 8, 8, 2)), loiDiem("chuyenCan"));
});

for (const truong of TRUONG) {
  test(`${truong} - mọi giá trị 1 chữ số thập phân từ 0.0 đến 10.0 đều hợp lệ`, () => {
    for (let i = 0; i <= 100; i++) {
      assert.doesNotThrow(() => tinhDiemHocPhan(hop({ [truong]: i / 10 })), `${truong} = ${i / 10}`);
    }
  });
}

for (const truong of TRUONG) {
  test(`${truong} - mọi giá trị có 2 chữ số thập phân từ 0.01 đến 9.99 đều bị từ chối`, () => {
    for (let i = 1; i < 1000; i++) {
      if (i % 10 === 0) continue;
      assert.throws(
        () => tinhDiemHocPhan(hop({ [truong]: i / 100 })),
        loiDiem(truong),
        `${truong} = ${i / 100}`,
      );
    }
  });
}

test("chuyenCan = 4.9 (sát ngưỡng) - cấm thi dù các điểm khác tối đa", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(4.9, 10, 10, 10)), kq(0, "F", "CAM_THI"));
});

test("chuyenCan = 0 - cấm thi dù các điểm khác tối đa", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(0, 10, 10, 10)), kq(0, "F", "CAM_THI"));
});

test("tất cả điểm bằng 0 - cấm thi", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(0, 0, 0, 0)), kq(0, "F", "CAM_THI"));
});

test("chuyenCan = 4.5 và các điểm khác 8 - cấm thi, tongKet là 0 chứ không tính theo công thức", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(4.5, 8, 8, 8)), kq(0, "F", "CAM_THI"));
});

test("chuyenCan = 4.9 và thi = 2 (< 3) - ưu tiên CAM_THI hơn KHONG_DAT", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(4.9, 8, 8, 2)), kq(0, "F", "CAM_THI"));
});

test("chuyenCan = 5 (đúng ngưỡng) - không bị cấm thi, tongKet 9.5 là A+", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(5, 10, 10, 10)), kq(9.5, "A+", "DAT"));
});

test("chuyenCan = 5, các điểm khác 0 - không bị cấm thi, tongKet 0.5 và KHONG_DAT", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(5, 0, 0, 0)), kq(0.5, "F", "KHONG_DAT"));
});

test("trọng số chuyenCan là 0,1", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(10, 0, 0, 0)), kq(1, "F", "KHONG_DAT"));
});

test("trọng số baiTap là 0,2", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(5, 10, 0, 0)), kq(2.5, "F", "KHONG_DAT"));
});

test("trọng số kiemTra là 0,2", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(5, 0, 10, 0)), kq(2.5, "F", "KHONG_DAT"));
});

test("trọng số thi là 0,5", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(5, 0, 0, 10)), kq(5.5, "C", "DAT"));
});

test("điểm (6; 7; 8; 9) cho tongKet 8.1 là B+", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(6, 7, 8, 9)), kq(8.1, "B+", "DAT"));
});

test("điểm (7.5; 6.5; 8; 5.5) cho tongKet 6.4 là C", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(7.5, 6.5, 8, 5.5)), kq(6.4, "C", "DAT"));
});

test("điểm (5; 5; 5; 5) cho tongKet 5 là D+", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(5, 5, 5, 5)), kq(5, "D+", "DAT"));
});

test("điểm (10; 10; 10; 3) cho tongKet 6.5 là C+", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(10, 10, 10, 3)), kq(6.5, "C+", "DAT"));
});

test("điểm (8; 2; 3; 6) cho tongKet 4.8 là D", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(8, 2, 3, 6)), kq(4.8, "D", "DAT"));
});

const bangLamTron = [
  ["7,25 làm tròn lên 7,3", diem(10, 7, 7, 6.9), kq(7.3, "B", "DAT")],
  ["7,24 làm tròn xuống 7,2", diem(9.9, 7, 7, 6.9), kq(7.2, "B", "DAT")],
  ["7,35 làm tròn lên 7,4", diem(5, 7, 7, 8.1), kq(7.4, "B", "DAT")],
  ["8,95 làm tròn lên 9,0 nên A+", diem(10, 9, 9, 8.7), kq(9, "A+", "DAT")],
  ["8,94 làm tròn xuống 8,9 nên A", diem(9.9, 9, 9, 8.7), kq(8.9, "A", "DAT")],
  ["8,45 làm tròn lên 8,5 nên A", diem(10, 8, 8, 8.5), kq(8.5, "A", "DAT")],
  ["8,44 làm tròn xuống 8,4 nên B+", diem(9.9, 8, 8, 8.5), kq(8.4, "B+", "DAT")],
  ["7,95 làm tròn lên 8,0 nên B+", diem(10, 8, 8, 7.5), kq(8, "B+", "DAT")],
  ["7,94 làm tròn xuống 7,9 nên B", diem(9.9, 8, 8, 7.5), kq(7.9, "B", "DAT")],
  ["6,95 làm tròn lên 7,0 nên B", diem(10, 7, 7, 6.3), kq(7, "B", "DAT")],
  ["6,94 làm tròn xuống 6,9 nên C+", diem(9.9, 7, 7, 6.3), kq(6.9, "C+", "DAT")],
  ["6,45 làm tròn lên 6,5 nên C+", diem(10, 6, 6, 6.1), kq(6.5, "C+", "DAT")],
  ["6,44 làm tròn xuống 6,4 nên C", diem(9.9, 6, 6, 6.1), kq(6.4, "C", "DAT")],
  ["5,45 làm tròn lên 5,5 nên C", diem(10, 5, 5, 4.9), kq(5.5, "C", "DAT")],
  ["5,44 làm tròn xuống 5,4 nên D+", diem(9.9, 5, 5, 4.9), kq(5.4, "D+", "DAT")],
  ["4,95 làm tròn lên 5,0 nên D+", diem(10, 5, 5, 3.9), kq(5, "D+", "DAT")],
  ["4,94 làm tròn xuống 4,9 nên D", diem(9.9, 5, 5, 3.9), kq(4.9, "D", "DAT")],
  ["3,95 làm tròn lên 4,0 nên D", diem(5, 5, 4, 3.3), kq(4, "D", "DAT")],
  ["3,94 làm tròn xuống 3,9 nên F", diem(5.4, 5, 4, 3.2), kq(3.9, "F", "KHONG_DAT")],
];

for (const [moTa, dauVao, mongDoi] of bangLamTron) {
  test(`làm tròn nửa lên - ${moTa}`, () => {
    assert.deepStrictEqual(tinhDiemHocPhan(dauVao), mongDoi);
  });
}

const bangDiemChu = [
  ["tongKet 10", diem(10, 10, 10, 10), kq(10, "A+", "DAT")],
  ["tongKet 9.0 (biên dưới A+)", diem(9, 9, 9, 9), kq(9, "A+", "DAT")],
  ["tongKet 8.9 (biên trên A)", diem(8.9, 8.9, 8.9, 8.9), kq(8.9, "A", "DAT")],
  ["tongKet 8.5 (biên dưới A)", diem(8.5, 8.5, 8.5, 8.5), kq(8.5, "A", "DAT")],
  ["tongKet 8.4 (biên trên B+)", diem(8.4, 8.4, 8.4, 8.4), kq(8.4, "B+", "DAT")],
  ["tongKet 8.0 (biên dưới B+)", diem(8, 8, 8, 8), kq(8, "B+", "DAT")],
  ["tongKet 7.9 (biên trên B)", diem(7.9, 7.9, 7.9, 7.9), kq(7.9, "B", "DAT")],
  ["tongKet 7.0 (biên dưới B)", diem(7, 7, 7, 7), kq(7, "B", "DAT")],
  ["tongKet 6.9 (biên trên C+)", diem(6.9, 6.9, 6.9, 6.9), kq(6.9, "C+", "DAT")],
  ["tongKet 6.5 (biên dưới C+)", diem(6.5, 6.5, 6.5, 6.5), kq(6.5, "C+", "DAT")],
  ["tongKet 6.4 (biên trên C)", diem(6.4, 6.4, 6.4, 6.4), kq(6.4, "C", "DAT")],
  ["tongKet 5.5 (biên dưới C)", diem(5.5, 5.5, 5.5, 5.5), kq(5.5, "C", "DAT")],
  ["tongKet 5.4 (biên trên D+)", diem(5.4, 5.4, 5.4, 5.4), kq(5.4, "D+", "DAT")],
  ["tongKet 5.0 (biên dưới D+)", diem(5, 5, 5, 5), kq(5, "D+", "DAT")],
  ["tongKet 9.5 (giữa A+)", diem(9.5, 9.5, 9.5, 9.5), kq(9.5, "A+", "DAT")],
  ["tongKet 8.7 (giữa A)", diem(8.7, 8.7, 8.7, 8.7), kq(8.7, "A", "DAT")],
  ["tongKet 8.2 (giữa B+)", diem(8.2, 8.2, 8.2, 8.2), kq(8.2, "B+", "DAT")],
  ["tongKet 7.5 (giữa B)", diem(7.5, 7.5, 7.5, 7.5), kq(7.5, "B", "DAT")],
  ["tongKet 6.7 (giữa C+)", diem(6.7, 6.7, 6.7, 6.7), kq(6.7, "C+", "DAT")],
  ["tongKet 6.0 (giữa C)", diem(6, 6, 6, 6), kq(6, "C", "DAT")],
  ["tongKet 5.2 (giữa D+)", diem(5.2, 5.2, 5.2, 5.2), kq(5.2, "D+", "DAT")],
  ["tongKet 4.9 (biên trên D)", diem(5, 7.3, 7.2, 3), kq(4.9, "D", "DAT")],
  ["tongKet 4.0 (biên dưới D)", diem(5, 5, 5, 3), kq(4, "D", "DAT")],
  ["tongKet 4.5 (giữa D)", diem(5, 6, 4, 4), kq(4.5, "D", "DAT")],
  ["tongKet 3.9 (ngay dưới 4.0) là F", diem(5, 5, 4.5, 3), kq(3.9, "F", "KHONG_DAT")],
  ["tongKet 2.0 là F", diem(5, 0, 0, 3), kq(2, "F", "KHONG_DAT")],
];

for (const [moTa, dauVao, mongDoi] of bangDiemChu) {
  test(`xếp loại theo tongKet - ${moTa}`, () => {
    assert.deepStrictEqual(tinhDiemHocPhan(dauVao), mongDoi);
  });
}

test("thi = 2.9 dù tongKet 6.5 - diemChu F và KHONG_DAT, tongKet vẫn tính theo công thức", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(10, 10, 10, 2.9)), kq(6.5, "F", "KHONG_DAT"));
});

test("thi = 0, các điểm khác 10 - tongKet 5, diemChu F, KHONG_DAT", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(10, 10, 10, 0)), kq(5, "F", "KHONG_DAT"));
});

test("thi = 2, chuyenCan = 5, hai điểm giữa 10 - tongKet 5.5 nhưng vẫn F và KHONG_DAT", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(5, 10, 10, 2)), kq(5.5, "F", "KHONG_DAT"));
});

test("thi = 2.9, chuyenCan = 5, hai điểm giữa 10 - tongKet 5.95 làm tròn 6, vẫn F và KHONG_DAT", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(5, 10, 10, 2.9)), kq(6, "F", "KHONG_DAT"));
});

test("thi = 1, các điểm khác 10 - tongKet 5.5 nhưng vẫn F và KHONG_DAT", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(10, 10, 10, 1)), kq(5.5, "F", "KHONG_DAT"));
});

test("thi = 3 (đúng ngưỡng) - không bị ép F, tongKet 6.5 là C+ và DAT", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(10, 10, 10, 3)), kq(6.5, "C+", "DAT"));
});

test("thi = 3.1, các điểm khác 10 - tongKet 6.55 làm tròn 6.6 là C+ và DAT", () => {
  assert.deepStrictEqual(tinhDiemHocPhan(diem(10, 10, 10, 3.1)), kq(6.6, "C+", "DAT"));
});

test("lưới giá trị - kết quả khớp mô hình tham chiếu rút ra từ đặc tả", () => {
  for (const dauVao of luoi()) {
    assert.deepStrictEqual(tinhDiemHocPhan(dauVao), moHinh(dauVao), JSON.stringify(dauVao));
  }
});

test("2000 bộ điểm ngẫu nhiên với seed cố định - kết quả khớp mô hình tham chiếu", () => {
  let hatGiong = 123456789;
  const tiep = () => {
    hatGiong = (Math.imul(hatGiong, 1664525) + 1013904223) >>> 0;
    return hatGiong;
  };
  const ngauNhien = () => ((tiep() >>> 8) % 101) / 10;
  for (let i = 0; i < 2000; i++) {
    const dauVao = diem(ngauNhien(), ngauNhien(), ngauNhien(), ngauNhien());
    assert.deepStrictEqual(tinhDiemHocPhan(dauVao), moHinh(dauVao), JSON.stringify(dauVao));
  }
});

test("bất biến - trangThai, diemChu, tongKet nhất quán với nhau trên lưới giá trị", () => {
  const diemChuHopLe = new Set(["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"]);
  for (const dauVao of luoi()) {
    const ketQua = tinhDiemHocPhan(dauVao);
    const ghiChu = JSON.stringify(dauVao);
    assert.equal(typeof ketQua.tongKet, "number", ghiChu);
    assert.ok(ketQua.tongKet >= 0 && ketQua.tongKet <= 10, ghiChu);
    assert.equal(ketQua.tongKet, Math.round(ketQua.tongKet * 10) / 10, ghiChu);
    assert.ok(diemChuHopLe.has(ketQua.diemChu), ghiChu);
    if (dauVao.chuyenCan < 5) {
      assert.deepStrictEqual(ketQua, kq(0, "F", "CAM_THI"), ghiChu);
    } else {
      assert.equal(ketQua.trangThai, ketQua.diemChu === "F" ? "KHONG_DAT" : "DAT", ghiChu);
      if (dauVao.thi < 3) {
        assert.equal(ketQua.diemChu, "F", ghiChu);
        assert.equal(ketQua.trangThai, "KHONG_DAT", ghiChu);
      }
    }
  }
});
