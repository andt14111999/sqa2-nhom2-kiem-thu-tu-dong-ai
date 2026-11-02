import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { tinhDiemHocPhan } from "../src/diem.js";

const CAC_TRUONG = ["chuyenCan", "baiTap", "kiemTra", "thi"];

function diem(chuyenCan, baiTap, kiemTra, thi) {
  return { chuyenCan, baiTap, kiemTra, thi };
}

function laLoiDiem(truong) {
  return (loi) => {
    assert.ok(loi instanceof RangeError);
    assert.equal(loi.code, "DIEM_KHONG_HOP_LE");
    assert.equal(loi.truong, truong);
    return true;
  };
}

const GIA_TRI_SAI = [
  ['chuỗi "8"', "8"],
  ["null", null],
  ["undefined", undefined],
  ["true", true],
  ["đối tượng rỗng", {}],
  ["mảng rỗng", []],
  ["bigint 8n", 8n],
  ["NaN", NaN],
  ["Infinity", Infinity],
  ["-Infinity", -Infinity],
  ["-0,1 (dưới 0)", -0.1],
  ["10,1 (trên 10)", 10.1],
  ["11", 11],
  ["-1", -1],
  ["7,25 (2 chữ số thập phân)", 7.25],
  ["0,01 (2 chữ số thập phân)", 0.01],
  ["9,99 (2 chữ số thập phân)", 9.99],
  ["5,123 (3 chữ số thập phân)", 5.123],
];

describe("kiểm tra điểm thành phần", () => {
  for (const truong of CAC_TRUONG) {
    for (const [nhan, giaTri] of GIA_TRI_SAI) {
      it(`${truong} = ${nhan} ném RangeError DIEM_KHONG_HOP_LE với truong "${truong}"`, () => {
        const dauVao = { ...diem(8, 8, 8, 8), [truong]: giaTri };
        assert.throws(() => tinhDiemHocPhan(dauVao), laLoiDiem(truong));
      });
    }
  }

  for (const truong of CAC_TRUONG) {
    it(`${truong} nhận các giá trị hợp lệ 0; 0,1; 5; 5,5; 9,9; 10 mà không ném lỗi`, () => {
      for (const giaTri of [0, 0.1, 5, 5.5, 9.9, 10]) {
        assert.doesNotThrow(
          () => tinhDiemHocPhan({ ...diem(8, 8, 8, 8), [truong]: giaTri }),
          `${truong} = ${giaTri}`,
        );
      }
    });
  }
});

describe("thứ tự báo trường sai", () => {
  it("chuyenCan và baiTap cùng sai: báo chuyenCan", () => {
    assert.throws(() => tinhDiemHocPhan(diem(-1, 11, 8, 8)), laLoiDiem("chuyenCan"));
  });

  it("baiTap và kiemTra cùng sai: báo baiTap", () => {
    assert.throws(() => tinhDiemHocPhan(diem(8, 11, NaN, 8)), laLoiDiem("baiTap"));
  });

  it("kiemTra và thi cùng sai: báo kiemTra", () => {
    assert.throws(() => tinhDiemHocPhan(diem(8, 8, 10.5, -3)), laLoiDiem("kiemTra"));
  });

  it("baiTap và thi cùng sai, kiemTra hợp lệ: báo baiTap", () => {
    assert.throws(() => tinhDiemHocPhan(diem(8, "9", 8, 11)), laLoiDiem("baiTap"));
  });

  it("cả bốn trường cùng sai: báo chuyenCan", () => {
    assert.throws(() => tinhDiemHocPhan(diem(-1, -1, -1, -1)), laLoiDiem("chuyenCan"));
  });

  it("thứ tự báo lỗi không phụ thuộc thứ tự khóa trong đối tượng: báo chuyenCan", () => {
    assert.throws(
      () => tinhDiemHocPhan({ thi: 11, kiemTra: 11, baiTap: 11, chuyenCan: 11 }),
      laLoiDiem("chuyenCan"),
    );
  });

  it("thứ tự báo lỗi không phụ thuộc thứ tự khóa trong đối tượng: báo kiemTra trước thi", () => {
    assert.throws(
      () => tinhDiemHocPhan({ thi: 11, kiemTra: 11, chuyenCan: 8, baiTap: 8 }),
      laLoiDiem("kiemTra"),
    );
  });

  it("chuyenCan = 4 (đáng cấm thi) nhưng thi sai: vẫn ném lỗi về thi", () => {
    assert.throws(() => tinhDiemHocPhan(diem(4, 8, 8, 11)), laLoiDiem("thi"));
  });

  it("chuyenCan = 4,95 có 2 chữ số thập phân: ném lỗi chứ không cấm thi", () => {
    assert.throws(() => tinhDiemHocPhan(diem(4.95, 8, 8, 8)), laLoiDiem("chuyenCan"));
  });

  it("thiếu thi: báo thi", () => {
    assert.throws(
      () => tinhDiemHocPhan({ chuyenCan: 8, baiTap: 8, kiemTra: 8 }),
      laLoiDiem("thi"),
    );
  });

  it("đối tượng rỗng: báo chuyenCan", () => {
    assert.throws(() => tinhDiemHocPhan({}), laLoiDiem("chuyenCan"));
  });
});

const CAM_THI = [
  [4.9, 10, 10, 10],
  [0, 10, 10, 10],
  [0, 0, 0, 0],
  [4.9, 10, 10, 2.9],
  [2.5, 7, 8, 9],
];

describe("cấm thi khi chuyenCan nhỏ hơn 5", () => {
  for (const [chuyenCan, baiTap, kiemTra, thi] of CAM_THI) {
    it(`chuyenCan = ${chuyenCan}, baiTap = ${baiTap}, kiemTra = ${kiemTra}, thi = ${thi} -> 0, F, CAM_THI`, () => {
      assert.deepEqual(tinhDiemHocPhan(diem(chuyenCan, baiTap, kiemTra, thi)), {
        tongKet: 0,
        diemChu: "F",
        trangThai: "CAM_THI",
      });
    });
  }
});

const DIEM_HOC_PHAN = [
  [10, 10, 10, 10, 10, "A+", "DAT"],
  [10, 10, 10, 8, 9, "A+", "DAT"],
  [5, 10, 10, 8.9, 9, "A+", "DAT"],
  [5.4, 10, 10, 8.8, 8.9, "A", "DAT"],
  [5, 10, 10, 8.8, 8.9, "A", "DAT"],
  [5, 10, 10, 8, 8.5, "A", "DAT"],
  [5, 8, 8, 9.5, 8.5, "A", "DAT"],
  [5.4, 8, 8, 9.4, 8.4, "B+", "DAT"],
  [5, 8, 8, 9.4, 8.4, "B+", "DAT"],
  [5, 8, 8, 8.6, 8, "B+", "DAT"],
  [5.5, 8, 8, 8.4, 8, "B+", "DAT"],
  [5.4, 8, 8, 8.4, 7.9, "B", "DAT"],
  [5, 8, 8, 8.4, 7.9, "B", "DAT"],
  [5, 7, 7, 7.4, 7, "B", "DAT"],
  [5.5, 7, 7, 7.2, 7, "B", "DAT"],
  [5.4, 7, 7, 7.2, 6.9, "C+", "DAT"],
  [5, 7, 7, 7.2, 6.9, "C+", "DAT"],
  [5, 7, 7, 6.4, 6.5, "C+", "DAT"],
  [5.5, 7, 7, 6.2, 6.5, "C+", "DAT"],
  [5.4, 7, 7, 6.2, 6.4, "C", "DAT"],
  [5, 7, 7, 6.2, 6.4, "C", "DAT"],
  [5, 5, 5, 6, 5.5, "C", "DAT"],
  [5.5, 5, 5, 5.8, 5.5, "C", "DAT"],
  [5.4, 5, 5, 5.8, 5.4, "D+", "DAT"],
  [5, 5, 5, 5.8, 5.4, "D+", "DAT"],
  [5, 5, 5, 5, 5, "D+", "DAT"],
  [5.5, 5, 5, 4.8, 5, "D+", "DAT"],
  [5.4, 5, 5, 4.8, 4.9, "D", "DAT"],
  [5, 5, 5, 4.8, 4.9, "D", "DAT"],
  [5, 5, 5, 3, 4, "D", "DAT"],
  [5.5, 4.7, 4.8, 3, 4, "D", "DAT"],
  [5.4, 4.7, 4.8, 3, 3.9, "F", "KHONG_DAT"],
  [5, 0, 0, 3, 2, "F", "KHONG_DAT"],
  [5, 0, 0, 10, 5.5, "C", "DAT"],
  [5.5, 7, 7, 7.8, 7.3, "B", "DAT"],
  [5.4, 7, 7, 7.8, 7.2, "B", "DAT"],
  [5.6, 7, 7, 7.8, 7.3, "B", "DAT"],
  [10, 10, 10, 3, 6.5, "C+", "DAT"],
  [5, 10, 10, 10, 9.5, "A+", "DAT"],
  [10, 10, 10, 2.9, 6.5, "F", "KHONG_DAT"],
  [10, 10, 10, 2, 6, "F", "KHONG_DAT"],
  [10, 10, 10, 0, 5, "F", "KHONG_DAT"],
  [5, 5, 5, 2.9, 4, "F", "KHONG_DAT"],
  [5, 0, 0, 0, 0.5, "F", "KHONG_DAT"],
  [5, 10, 10, 2.9, 6, "F", "KHONG_DAT"],
];

describe("tổng kết, làm tròn nửa lên, điểm chữ và trạng thái", () => {
  for (const [chuyenCan, baiTap, kiemTra, thi, tongKet, diemChu, trangThai] of DIEM_HOC_PHAN) {
    it(`0,1x${chuyenCan} + 0,2x${baiTap} + 0,2x${kiemTra} + 0,5x${thi} -> ${tongKet}, ${diemChu}, ${trangThai}`, () => {
      assert.deepEqual(tinhDiemHocPhan(diem(chuyenCan, baiTap, kiemTra, thi)), {
        tongKet,
        diemChu,
        trangThai,
      });
    });
  }
});

function kyVong(chuyenCan, baiTap, kiemTra, thi) {
  const cc = Math.round(chuyenCan * 10);
  const bt = Math.round(baiTap * 10);
  const kt = Math.round(kiemTra * 10);
  const t = Math.round(thi * 10);
  if (cc < 50) {
    return { tongKet: 0, diemChu: "F", trangThai: "CAM_THI" };
  }
  const phan = Math.floor((cc + 2 * bt + 2 * kt + 5 * t + 5) / 10);
  let diemChu;
  if (t < 30) diemChu = "F";
  else if (phan >= 90) diemChu = "A+";
  else if (phan >= 85) diemChu = "A";
  else if (phan >= 80) diemChu = "B+";
  else if (phan >= 70) diemChu = "B";
  else if (phan >= 65) diemChu = "C+";
  else if (phan >= 55) diemChu = "C";
  else if (phan >= 50) diemChu = "D+";
  else if (phan >= 40) diemChu = "D";
  else diemChu = "F";
  return {
    tongKet: phan / 10,
    diemChu,
    trangThai: diemChu === "F" ? "KHONG_DAT" : "DAT",
  };
}

const LUOI = [0, 0.3, 1, 2.9, 3, 4.9, 5, 5.5, 6.7, 7.8, 8.4, 9.9, 10];

describe("hình dạng kết quả và tính nhất quán", () => {
  it("kết quả chỉ có ba thuộc tính tongKet, diemChu, trangThai với kiểu đúng", () => {
    const ketQua = tinhDiemHocPhan(diem(8, 8, 8, 8));
    assert.deepEqual(Object.keys(ketQua).sort(), ["diemChu", "tongKet", "trangThai"]);
    assert.equal(typeof ketQua.tongKet, "number");
    assert.equal(typeof ketQua.diemChu, "string");
    assert.equal(typeof ketQua.trangThai, "string");
    assert.deepEqual(ketQua, { tongKet: 8, diemChu: "B+", trangThai: "DAT" });
  });

  it("kết quả không phụ thuộc thứ tự khóa của đối tượng đầu vào", () => {
    const xuoi = tinhDiemHocPhan({ chuyenCan: 5.5, baiTap: 7, kiemTra: 7, thi: 7.8 });
    const nguoc = tinhDiemHocPhan({ thi: 7.8, kiemTra: 7, baiTap: 7, chuyenCan: 5.5 });
    assert.deepEqual(nguoc, xuoi);
    assert.deepEqual(xuoi, { tongKet: 7.3, diemChu: "B", trangThai: "DAT" });
  });

  it("khớp mô hình tính bằng số nguyên trên lưới 13 x 13 x 13 x 13 điểm", () => {
    for (const chuyenCan of LUOI) {
      for (const baiTap of LUOI) {
        for (const kiemTra of LUOI) {
          for (const thi of LUOI) {
            assert.deepEqual(
              tinhDiemHocPhan(diem(chuyenCan, baiTap, kiemTra, thi)),
              kyVong(chuyenCan, baiTap, kiemTra, thi),
              `chuyenCan = ${chuyenCan}, baiTap = ${baiTap}, kiemTra = ${kiemTra}, thi = ${thi}`,
            );
          }
        }
      }
    }
  });
});
