import test from "node:test";
import assert from "node:assert/strict";
import { tinhDiemHocPhan } from "../src/diem.js";

const TRUONG = ["chuyenCan", "baiTap", "kiemTra", "thi"];

function hopLe(ghiDe = {}) {
  return { chuyenCan: 8, baiTap: 8, kiemTra: 8, thi: 8, ...ghiDe };
}

function ketQua(tongKet, diemChu, trangThai) {
  return { tongKet, diemChu, trangThai };
}

function kiemTraNemLoi(dauVao, truong) {
  assert.throws(
    () => tinhDiemHocPhan(dauVao),
    (loi) => {
      assert.ok(loi instanceof RangeError);
      assert.equal(loi.code, "DIEM_KHONG_HOP_LE");
      assert.equal(loi.truong, truong);
      return true;
    }
  );
}

const GIA_TRI_SAI = [
  ["chuỗi \"7\"", "7"],
  ["null", null],
  ["undefined", undefined],
  ["NaN", NaN],
  ["Infinity", Infinity],
  ["-Infinity", -Infinity],
  ["số âm -0.1", -0.1],
  ["lớn hơn 10: 10.1", 10.1],
  ["lớn hơn nhiều: 100", 100],
  ["2 chữ số thập phân: 7.25", 7.25],
  ["2 chữ số thập phân: 0.05", 0.05],
  ["nhiều chữ số thập phân: 1e-7", 1e-7],
  ["boolean true", true],
  ["bigint 7n", 7n],
];

for (const truong of TRUONG) {
  for (const [ten, giaTri] of GIA_TRI_SAI) {
    test(`${truong} = ${ten} ném RangeError DIEM_KHONG_HOP_LE với truong = ${truong}`, () => {
      kiemTraNemLoi(hopLe({ [truong]: giaTri }), truong);
    });
  }
}

test("nhiều trường sai: báo chuyenCan đầu tiên dù khóa khai báo theo thứ tự ngược", () => {
  kiemTraNemLoi({ thi: "x", kiemTra: "x", baiTap: "x", chuyenCan: "x" }, "chuyenCan");
});

test("nhiều trường sai: bỏ qua chuyenCan hợp lệ, báo baiTap trước kiemTra và thi", () => {
  kiemTraNemLoi({ chuyenCan: 8, baiTap: 11, kiemTra: "x", thi: NaN }, "baiTap");
});

test("nhiều trường sai: báo kiemTra trước thi", () => {
  kiemTraNemLoi({ chuyenCan: 8, baiTap: 8, kiemTra: 10.5, thi: undefined }, "kiemTra");
});

test("chuyenCan = 4 (đáng lẽ cấm thi) nhưng baiTap sai vẫn ném lỗi baiTap", () => {
  kiemTraNemLoi({ chuyenCan: 4, baiTap: 11, kiemTra: 8, thi: 8 }, "baiTap");
});

test("chuyenCan = 4 (đáng lẽ cấm thi) nhưng thi sai vẫn ném lỗi thi", () => {
  kiemTraNemLoi({ chuyenCan: 4, baiTap: 8, kiemTra: 8, thi: 11 }, "thi");
});

test("chuyenCan = 4 với chuyenCan sai kiểu vẫn ưu tiên báo chuyenCan", () => {
  kiemTraNemLoi({ chuyenCan: "4", baiTap: 8, kiemTra: 8, thi: 11 }, "chuyenCan");
});

const HOP_LE_MOT_CHU_SO = [0, 0.1, 0.3, 0.6, 0.7, 1.1, 1.4, 2.3, 2.9, 4.1, 4.6, 5.1, 5.7, 7.1, 8.7, 9.9, 10];

for (const truong of TRUONG) {
  test(`${truong} chấp nhận mọi điểm có tối đa 1 chữ số thập phân trong [0; 10]`, () => {
    for (const x of HOP_LE_MOT_CHU_SO) {
      assert.doesNotThrow(() => tinhDiemHocPhan(hopLe({ [truong]: x })), `${truong} = ${x}`);
    }
  });
}

test("chuyenCan 4.9 bị cấm thi dù các điểm khác tối đa", () => {
  assert.deepEqual(
    tinhDiemHocPhan({ chuyenCan: 4.9, baiTap: 10, kiemTra: 10, thi: 10 }),
    ketQua(0, "F", "CAM_THI")
  );
});

test("chuyenCan 0 bị cấm thi", () => {
  assert.deepEqual(
    tinhDiemHocPhan({ chuyenCan: 0, baiTap: 10, kiemTra: 10, thi: 10 }),
    ketQua(0, "F", "CAM_THI")
  );
});

test("cấm thi được ưu tiên hơn thi dưới 3", () => {
  assert.deepEqual(
    tinhDiemHocPhan({ chuyenCan: 4.9, baiTap: 0, kiemTra: 0, thi: 0 }),
    ketQua(0, "F", "CAM_THI")
  );
});

test("chuyenCan đúng 5 không bị cấm thi", () => {
  assert.deepEqual(
    tinhDiemHocPhan({ chuyenCan: 5, baiTap: 10, kiemTra: 10, thi: 10 }),
    ketQua(9.5, "A+", "DAT")
  );
});

test("mọi chuyenCan từ 0 đến 4.9 đều cấm thi, bất kể điểm khác", () => {
  for (let i = 0; i <= 49; i++) {
    for (const thi of [0, 2.9, 3, 10]) {
      const dauVao = { chuyenCan: i / 10, baiTap: 10, kiemTra: 10, thi };
      assert.deepEqual(tinhDiemHocPhan(dauVao), ketQua(0, "F", "CAM_THI"), JSON.stringify(dauVao));
    }
  }
});

const deu = (x) => ({ chuyenCan: x, baiTap: x, kiemTra: x, thi: x });

const THANG_DIEM = [
  ["điểm đều 10 là A+", deu(10), ketQua(10, "A+", "DAT")],
  ["tổng kết 9.0 là A+ (biên dưới A+)", deu(9), ketQua(9, "A+", "DAT")],
  ["tổng kết 8.9 là A (biên trên A)", deu(8.9), ketQua(8.9, "A", "DAT")],
  ["tổng kết 8.5 là A (biên dưới A)", deu(8.5), ketQua(8.5, "A", "DAT")],
  ["tổng kết 8.4 là B+ (biên trên B+)", deu(8.4), ketQua(8.4, "B+", "DAT")],
  ["tổng kết 8.0 là B+ (biên dưới B+)", deu(8), ketQua(8, "B+", "DAT")],
  ["tổng kết 7.9 là B (biên trên B)", deu(7.9), ketQua(7.9, "B", "DAT")],
  ["tổng kết 7.0 là B (biên dưới B)", deu(7), ketQua(7, "B", "DAT")],
  ["tổng kết 6.9 là C+ (biên trên C+)", deu(6.9), ketQua(6.9, "C+", "DAT")],
  ["tổng kết 6.5 là C+ (biên dưới C+)", deu(6.5), ketQua(6.5, "C+", "DAT")],
  ["tổng kết 6.4 là C (biên trên C)", deu(6.4), ketQua(6.4, "C", "DAT")],
  ["tổng kết 5.5 là C (biên dưới C)", deu(5.5), ketQua(5.5, "C", "DAT")],
  ["tổng kết 5.4 là D+ (biên trên D+)", deu(5.4), ketQua(5.4, "D+", "DAT")],
  ["tổng kết 5.0 là D+ (biên dưới D+)", deu(5), ketQua(5, "D+", "DAT")],
  ["tổng kết 4.0 là D (biên dưới D)", { chuyenCan: 5, baiTap: 0, kiemTra: 0, thi: 7 }, ketQua(4, "D", "DAT")],
  ["tổng kết 4.9 là D (biên trên D)", { chuyenCan: 5, baiTap: 0, kiemTra: 0, thi: 8.8 }, ketQua(4.9, "D", "DAT")],
  ["tổng kết 5.0 từ chuyenCan 5, thi 9 là D+", { chuyenCan: 5, baiTap: 0, kiemTra: 0, thi: 9 }, ketQua(5, "D+", "DAT")],
  ["tổng kết 3.9 là F và KHONG_DAT dù thi từ 3 trở lên", { chuyenCan: 5, baiTap: 0, kiemTra: 0, thi: 6.8 }, ketQua(3.9, "F", "KHONG_DAT")],
  ["thi đúng 3 không bị F vì thi, nhưng tổng kết 2.0 vẫn F và KHONG_DAT", { chuyenCan: 5, baiTap: 0, kiemTra: 0, thi: 3 }, ketQua(2, "F", "KHONG_DAT")],
];

for (const [ten, dauVao, mong] of THANG_DIEM) {
  test(`thang điểm: ${ten}`, () => {
    assert.deepEqual(tinhDiemHocPhan(dauVao), mong);
  });
}

const LAM_TRON = [
  ["7.25 làm tròn lên 7.3", { chuyenCan: 5, baiTap: 7, kiemTra: 7, thi: 7.9 }, ketQua(7.3, "B", "DAT")],
  ["7.24 làm tròn xuống 7.2", { chuyenCan: 5.4, baiTap: 7, kiemTra: 7, thi: 7.8 }, ketQua(7.2, "B", "DAT")],
  ["7.05 làm tròn lên 7.1", { chuyenCan: 5, baiTap: 7, kiemTra: 7, thi: 7.5 }, ketQua(7.1, "B", "DAT")],
  ["8.45 làm tròn lên 8.5 nên là A", { chuyenCan: 5, baiTap: 10, kiemTra: 10, thi: 7.9 }, ketQua(8.5, "A", "DAT")],
  ["8.44 làm tròn xuống 8.4 nên là B+", { chuyenCan: 5.4, baiTap: 10, kiemTra: 10, thi: 7.8 }, ketQua(8.4, "B+", "DAT")],
  ["6.95 làm tròn lên 7.0 nên là B", { chuyenCan: 5, baiTap: 5, kiemTra: 5, thi: 8.9 }, ketQua(7, "B", "DAT")],
  ["6.94 làm tròn xuống 6.9 nên là C+", { chuyenCan: 5.4, baiTap: 5, kiemTra: 5, thi: 8.8 }, ketQua(6.9, "C+", "DAT")],
  ["8.95 làm tròn lên 9.0 nên là A+", { chuyenCan: 5, baiTap: 10, kiemTra: 10, thi: 8.9 }, ketQua(9, "A+", "DAT")],
  ["8.94 làm tròn xuống 8.9 nên là A", { chuyenCan: 5.4, baiTap: 10, kiemTra: 10, thi: 8.8 }, ketQua(8.9, "A", "DAT")],
  ["5.55 làm tròn lên 5.6", { chuyenCan: 5, baiTap: 5, kiemTra: 5, thi: 6.1 }, ketQua(5.6, "C", "DAT")],
  ["6.45 làm tròn lên 6.5 nên là C+", { chuyenCan: 5, baiTap: 5, kiemTra: 5, thi: 7.9 }, ketQua(6.5, "C+", "DAT")],
  ["6.44 làm tròn xuống 6.4 nên là C", { chuyenCan: 5.4, baiTap: 5, kiemTra: 5, thi: 7.8 }, ketQua(6.4, "C", "DAT")],
  ["4.95 làm tròn lên 5.0 nên là D+ chứ không phải D", { chuyenCan: 5, baiTap: 0, kiemTra: 0, thi: 8.9 }, ketQua(5, "D+", "DAT")],
  ["4.94 làm tròn xuống 4.9 nên là D", { chuyenCan: 5.4, baiTap: 0, kiemTra: 0, thi: 8.8 }, ketQua(4.9, "D", "DAT")],
  ["3.95 làm tròn lên 4.0 nên là D chứ không phải F", { chuyenCan: 5, baiTap: 0, kiemTra: 0, thi: 6.9 }, ketQua(4, "D", "DAT")],
  ["3.99 làm tròn lên 4.0 nên là D", { chuyenCan: 5.4, baiTap: 0, kiemTra: 0, thi: 6.9 }, ketQua(4, "D", "DAT")],
  ["5.45 làm tròn lên 5.5 nên là C chứ không phải D+", { chuyenCan: 5, baiTap: 0, kiemTra: 0, thi: 9.9 }, ketQua(5.5, "C", "DAT")],
  ["5.49 làm tròn lên 5.5 nên là C", { chuyenCan: 5.4, baiTap: 0, kiemTra: 0, thi: 9.9 }, ketQua(5.5, "C", "DAT")],
  ["5.05 làm tròn lên 5.1 nên là D+", { chuyenCan: 5, baiTap: 0, kiemTra: 0, thi: 9.1 }, ketQua(5.1, "D+", "DAT")],
  ["8.99 làm tròn lên 9.0 nên là A+", { chuyenCan: 5.4, baiTap: 10, kiemTra: 10, thi: 8.9 }, ketQua(9, "A+", "DAT")],
  ["8.49 làm tròn lên 8.5 nên là A", { chuyenCan: 5.4, baiTap: 10, kiemTra: 10, thi: 7.9 }, ketQua(8.5, "A", "DAT")],
];

for (const [ten, dauVao, mong] of LAM_TRON) {
  test(`làm tròn nửa lên theo số học thập phân: ${ten}`, () => {
    assert.deepEqual(tinhDiemHocPhan(dauVao), mong);
  });
}

const THI_DUOI_3 = [
  ["thi 2.9 là F và KHONG_DAT, tổng kết 6.45 vẫn tính và làm tròn thành 6.5", { chuyenCan: 10, baiTap: 10, kiemTra: 10, thi: 2.9 }, ketQua(6.5, "F", "KHONG_DAT")],
  ["thi đúng 3 với cùng điểm khác thì xếp loại theo tổng kết 6.5 là C+ và DAT", { chuyenCan: 10, baiTap: 10, kiemTra: 10, thi: 3 }, ketQua(6.5, "C+", "DAT")],
  ["thi 0 là F và KHONG_DAT, tổng kết vẫn là 5", { chuyenCan: 10, baiTap: 10, kiemTra: 10, thi: 0 }, ketQua(5, "F", "KHONG_DAT")],
  ["thi 2.9 với tổng kết 5.95 làm tròn 6.0 vẫn là F và KHONG_DAT", { chuyenCan: 5, baiTap: 10, kiemTra: 10, thi: 2.9 }, ketQua(6, "F", "KHONG_DAT")],
  ["thi 0.1 với tổng kết 5.05 làm tròn 5.1 vẫn là F và KHONG_DAT", { chuyenCan: 10, baiTap: 10, kiemTra: 10, thi: 0.1 }, ketQua(5.1, "F", "KHONG_DAT")],
];

for (const [ten, dauVao, mong] of THI_DUOI_3) {
  test(`thi dưới 3: ${ten}`, () => {
    assert.deepEqual(tinhDiemHocPhan(dauVao), mong);
  });
}

function chuanTheoSoNguyen(chuyenCan, baiTap, kiemTra, thi) {
  const phanMuoi = (x) => Math.round(x * 10);
  if (phanMuoi(chuyenCan) < 50) return ketQua(0, "F", "CAM_THI");
  const tongPhanTram =
    phanMuoi(chuyenCan) + 2 * phanMuoi(baiTap) + 2 * phanMuoi(kiemTra) + 5 * phanMuoi(thi);
  const lamTron = Math.floor((tongPhanTram + 5) / 10);
  let diemChu;
  if (phanMuoi(thi) < 30) diemChu = "F";
  else if (lamTron >= 90) diemChu = "A+";
  else if (lamTron >= 85) diemChu = "A";
  else if (lamTron >= 80) diemChu = "B+";
  else if (lamTron >= 70) diemChu = "B";
  else if (lamTron >= 65) diemChu = "C+";
  else if (lamTron >= 55) diemChu = "C";
  else if (lamTron >= 50) diemChu = "D+";
  else if (lamTron >= 40) diemChu = "D";
  else diemChu = "F";
  return ketQua(lamTron / 10, diemChu, diemChu === "F" ? "KHONG_DAT" : "DAT");
}

test("quét tổ hợp điểm: khớp với phép tính số nguyên chính xác ở mọi giá trị thi từ 0 đến 10", () => {
  for (const chuyenCan of [5, 5.3, 7.7, 10]) {
    for (const baiTap of [0, 4.1, 8.8]) {
      for (const kiemTra of [1.1, 6.6, 9.9, 10]) {
        for (let i = 0; i <= 100; i++) {
          const dauVao = { chuyenCan, baiTap, kiemTra, thi: i / 10 };
          assert.deepEqual(
            tinhDiemHocPhan(dauVao),
            chuanTheoSoNguyen(chuyenCan, baiTap, kiemTra, i / 10),
            JSON.stringify(dauVao)
          );
        }
      }
    }
  }
});

test("kết quả chỉ gồm đúng ba thuộc tính tongKet, diemChu, trangThai với kiểu đúng", () => {
  const kq = tinhDiemHocPhan({ chuyenCan: 7, baiTap: 6.5, kiemTra: 8, thi: 7.5 });
  assert.deepEqual(Object.keys(kq).sort(), ["diemChu", "tongKet", "trangThai"]);
  assert.equal(typeof kq.tongKet, "number");
  assert.equal(typeof kq.diemChu, "string");
  assert.equal(typeof kq.trangThai, "string");
});

test("không làm thay đổi đối tượng đầu vào và cho kết quả lặp lại giống nhau", () => {
  const vao = Object.freeze({ chuyenCan: 7, baiTap: 6.5, kiemTra: 8, thi: 7.5 });
  const lanMot = tinhDiemHocPhan(vao);
  const lanHai = tinhDiemHocPhan(vao);
  assert.deepEqual(lanMot, ketQua(7.4, "B", "DAT"));
  assert.deepEqual(lanHai, lanMot);
  assert.deepEqual(vao, { chuyenCan: 7, baiTap: 6.5, kiemTra: 8, thi: 7.5 });
});
