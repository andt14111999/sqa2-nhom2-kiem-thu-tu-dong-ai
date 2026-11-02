import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { inspect } from "node:util";
import { tinhDiemHocPhan } from "../src/diem.js";

const TEN_TRUONG = ["chuyenCan", "baiTap", "kiemTra", "thi"];

const GIA_TRI_SAI = [
  -0.1, -1, 10.1, 11,
  5.55, 7.25, 0.01, 3.14159,
  NaN, Infinity, -Infinity,
  "5", "", null, undefined, true, [5], {}, 5n,
];

function diem(ghiDe = {}) {
  return { chuyenCan: 10, baiTap: 10, kiemTra: 10, thi: 10, ...ghiDe };
}

function kiemTraNem(dauVao, truongMongDoi) {
  assert.throws(
    () => tinhDiemHocPhan(dauVao),
    (loi) => {
      assert.ok(loi instanceof RangeError, "phải là RangeError");
      assert.equal(loi.code, "DIEM_KHONG_HOP_LE");
      assert.equal(loi.truong, truongMongDoi);
      return true;
    },
  );
}

function sinhCa(bang) {
  for (const [chuyenCan, baiTap, kiemTra, thi, tongKet, diemChu, trangThai] of bang) {
    test(`cc=${chuyenCan} bt=${baiTap} kt=${kiemTra} thi=${thi} cho tongKet=${tongKet} ${diemChu} ${trangThai}`, () => {
      assert.deepEqual(
        tinhDiemHocPhan({ chuyenCan, baiTap, kiemTra, thi }),
        { tongKet, diemChu, trangThai },
      );
    });
  }
}

const BANG_CAM_THI = [
  [4.9, 10, 10, 10, 0, "F", "CAM_THI"],
  [0, 10, 10, 10, 0, "F", "CAM_THI"],
  [4, 10, 10, 0, 0, "F", "CAM_THI"],
  [4.9, 0, 0, 0, 0, "F", "CAM_THI"],
  [1, 9, 9, 9, 0, "F", "CAM_THI"],
  [4.5, 8, 8, 8, 0, "F", "CAM_THI"],
];

const BANG_BIEN_CHUYEN_CAN = [
  [5, 10, 10, 10, 9.5, "A+", "DAT"],
  [5, 0, 0, 10, 5.5, "C", "DAT"],
];

const BANG_DIEM_CHU = [
  [5, "D+"], [5.4, "D+"],
  [5.5, "C"], [6.4, "C"],
  [6.5, "C+"], [6.9, "C+"],
  [7, "B"], [7.9, "B"],
  [8, "B+"], [8.4, "B+"],
  [8.5, "A"], [8.9, "A"],
  [9, "A+"], [10, "A+"],
].map(([v, diemChu]) => [v, v, v, v, v, diemChu, "DAT"]);

const BANG_TRONG_SO = [
  [6, 7, 8, 9, 8.1, "B+", "DAT"],
  [9, 8, 7, 6, 6.9, "C+", "DAT"],
  [5, 10, 10, 5, 7, "B", "DAT"],
  [5, 10, 0, 10, 7.5, "B", "DAT"],
  [5, 0, 10, 10, 7.5, "B", "DAT"],
  [10, 0, 10, 10, 8, "B+", "DAT"],
  [10, 0, 0, 10, 6, "C", "DAT"],
];

const BANG_DIEM_THAP = [
  [5, 6, 6, 4, 4.9, "D", "DAT"],
  [5, 5, 5, 3, 4, "D", "DAT"],
  [5, 5, 4.5, 3, 3.9, "F", "KHONG_DAT"],
  [5, 5, 5, 4, 4.5, "D", "DAT"],
  [5, 5, 5, 3.5, 4.3, "D", "DAT"],
];

const BANG_LAM_TRON = [
  [7.5, 7.5, 7.5, 7, 7.3, "B", "DAT"],
  [7.4, 7.5, 7.5, 7, 7.2, "B", "DAT"],
  [5.5, 5, 4.5, 3, 4, "D", "DAT"],
  [5.4, 5, 4.5, 3, 3.9, "F", "KHONG_DAT"],
  [5.5, 6, 6, 4, 5, "D+", "DAT"],
  [5.4, 6, 6, 4, 4.9, "D", "DAT"],
  [5.5, 6, 6, 5, 5.5, "C", "DAT"],
  [5.4, 6, 6, 5, 5.4, "D+", "DAT"],
  [6.5, 7, 7, 6, 6.5, "C+", "DAT"],
  [6.4, 7, 7, 6, 6.4, "C", "DAT"],
  [6.5, 7, 7, 7, 7, "B", "DAT"],
  [6.4, 7, 7, 7, 6.9, "C+", "DAT"],
  [7.5, 8, 8, 8, 8, "B+", "DAT"],
  [7.4, 8, 8, 8, 7.9, "B", "DAT"],
  [8.5, 9, 9, 8, 8.5, "A", "DAT"],
  [8.4, 9, 9, 8, 8.4, "B+", "DAT"],
  [8.5, 9, 9, 9, 9, "A+", "DAT"],
  [8.4, 9, 9, 9, 8.9, "A", "DAT"],
  [9.5, 10, 10, 10, 10, "A+", "DAT"],
  [9.4, 10, 10, 10, 9.9, "A+", "DAT"],
  [7.6, 7.5, 7.5, 7, 7.3, "B", "DAT"],
  [7.1, 7.5, 7.5, 7, 7.2, "B", "DAT"],
  [7, 7, 7, 7.5, 7.3, "B", "DAT"],
  [7, 7, 7, 7.3, 7.2, "B", "DAT"],
  [6.9, 7, 7, 7.3, 7.1, "B", "DAT"],
];

const BANG_THI_DUOI_3 = [
  [10, 10, 10, 2.9, 6.5, "F", "KHONG_DAT"],
  [10, 10, 10, 0, 5, "F", "KHONG_DAT"],
  [10, 0, 0, 0, 1, "F", "KHONG_DAT"],
  [5, 10, 0, 0, 2.5, "F", "KHONG_DAT"],
  [5, 0, 10, 0, 2.5, "F", "KHONG_DAT"],
  [5, 0, 0, 2.9, 2, "F", "KHONG_DAT"],
  [10, 10, 10, 1, 5.5, "F", "KHONG_DAT"],
  [10, 10, 10, 2, 6, "F", "KHONG_DAT"],
  [9, 9, 9, 2.9, 6, "F", "KHONG_DAT"],
  [10, 10, 10, 3, 6.5, "C+", "DAT"],
];

const CC = [0, 4.9, 5, 5.5, 6.4, 7.5, 8.4, 9, 10];
const BT = [0, 3.5, 5, 6.5, 8, 9.5, 10];
const KT = [0, 2.5, 5, 7.5, 9, 10];
const THI = [0, 1, 2.9, 3, 3.5, 4, 5.5, 6.5, 7, 8.5, 9, 10];

function luoi() {
  const danhSach = [];
  for (const chuyenCan of CC) {
    for (const baiTap of BT) {
      for (const kiemTra of KT) {
        for (const thi of THI) {
          danhSach.push({ chuyenCan, baiTap, kiemTra, thi });
        }
      }
    }
  }
  return danhSach;
}

function moPhong({ chuyenCan, baiTap, kiemTra, thi }) {
  const cc = Math.round(chuyenCan * 10);
  const bt = Math.round(baiTap * 10);
  const kt = Math.round(kiemTra * 10);
  const th = Math.round(thi * 10);
  if (cc < 50) {
    return { tongKet: 0, diemChu: "F", trangThai: "CAM_THI" };
  }
  const phanMuoi = Math.floor((cc + 2 * bt + 2 * kt + 5 * th + 5) / 10);
  let diemChu = "F";
  if (th >= 30) {
    if (phanMuoi >= 90) diemChu = "A+";
    else if (phanMuoi >= 85) diemChu = "A";
    else if (phanMuoi >= 80) diemChu = "B+";
    else if (phanMuoi >= 70) diemChu = "B";
    else if (phanMuoi >= 65) diemChu = "C+";
    else if (phanMuoi >= 55) diemChu = "C";
    else if (phanMuoi >= 50) diemChu = "D+";
    else if (phanMuoi >= 40) diemChu = "D";
  }
  return {
    tongKet: phanMuoi / 10,
    diemChu,
    trangThai: diemChu === "F" ? "KHONG_DAT" : "DAT",
  };
}

describe("điểm thành phần không hợp lệ", () => {
  for (const truong of TEN_TRUONG) {
    for (const giaTri of GIA_TRI_SAI) {
      test(`${truong} = ${inspect(giaTri)} ném RangeError DIEM_KHONG_HOP_LE`, () => {
        kiemTraNem(diem({ [truong]: giaTri }), truong);
      });
    }
  }
});

describe("thứ tự báo trường sai", () => {
  test("mọi trường đều sai thì báo chuyenCan", () => {
    kiemTraNem({ chuyenCan: -1, baiTap: -1, kiemTra: -1, thi: -1 }, "chuyenCan");
  });

  test("baiTap, kiemTra, thi sai thì báo baiTap", () => {
    kiemTraNem(diem({ baiTap: 11, kiemTra: 11, thi: 11 }), "baiTap");
  });

  test("kiemTra và thi sai thì báo kiemTra", () => {
    kiemTraNem(diem({ kiemTra: "x", thi: NaN }), "kiemTra");
  });

  test("chuyenCan và thi sai thì báo chuyenCan", () => {
    kiemTraNem(diem({ chuyenCan: 5.55, thi: -1 }), "chuyenCan");
  });

  test("chuyenCan dưới 5 nhưng thi sai vẫn ném lỗi cho thi", () => {
    kiemTraNem(diem({ chuyenCan: 4, thi: 10.5 }), "thi");
  });

  test("chuyenCan bằng 0 nhưng baiTap sai vẫn ném lỗi cho baiTap", () => {
    kiemTraNem(diem({ chuyenCan: 0, baiTap: 7.25 }), "baiTap");
  });
});

describe("thiếu trường", () => {
  for (const truong of TEN_TRUONG) {
    test(`thiếu ${truong} thì ném lỗi cho ${truong}`, () => {
      const dauVao = diem();
      delete dauVao[truong];
      kiemTraNem(dauVao, truong);
    });
  }
});

describe("điểm thành phần hợp lệ", () => {
  for (const truong of TEN_TRUONG) {
    test(`${truong} nhận biên 0 và 10`, () => {
      for (const giaTri of [0, 10]) {
        assert.doesNotThrow(
          () => tinhDiemHocPhan(diem({ [truong]: giaTri })),
          `${truong} = ${giaTri}`,
        );
      }
    });

    test(`${truong} nhận mọi giá trị một chữ số thập phân từ 0.0 đến 10.0`, () => {
      for (let i = 0; i <= 100; i++) {
        const giaTri = i / 10;
        assert.doesNotThrow(
          () => tinhDiemHocPhan(diem({ [truong]: giaTri })),
          `${truong} = ${giaTri}`,
        );
      }
    });
  }
});

describe("cấm thi khi chuyên cần dưới 5", () => {
  sinhCa(BANG_CAM_THI);
});

describe("chuyên cần đúng bằng 5 không bị cấm thi", () => {
  sinhCa(BANG_BIEN_CHUYEN_CAN);
});

describe("điểm chữ theo tổng kết", () => {
  sinhCa(BANG_DIEM_CHU);
});

describe("trọng số các thành phần", () => {
  sinhCa(BANG_TRONG_SO);
});

describe("tổng kết thấp", () => {
  sinhCa(BANG_DIEM_THAP);
});

describe("làm tròn nửa lên", () => {
  sinhCa(BANG_LAM_TRON);
});

describe("điểm thi dưới 3", () => {
  sinhCa(BANG_THI_DUOI_3);
});

describe("đối chiếu trên lưới đầu vào", () => {
  test("kết quả khớp mô phỏng bằng số nguyên trên toàn bộ lưới", () => {
    for (const dauVao of luoi()) {
      assert.deepEqual(
        tinhDiemHocPhan(dauVao),
        moPhong(dauVao),
        `đầu vào ${JSON.stringify(dauVao)}`,
      );
    }
  });

  test("trangThai, diemChu và tongKet nhất quán trên toàn bộ lưới", () => {
    const diemChuHopLe = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"];
    for (const dauVao of luoi()) {
      const ketQua = tinhDiemHocPhan(dauVao);
      const nhan = `đầu vào ${JSON.stringify(dauVao)}`;
      assert.ok(diemChuHopLe.includes(ketQua.diemChu), nhan);
      assert.ok(ketQua.tongKet >= 0 && ketQua.tongKet <= 10, nhan);
      assert.ok(
        Math.abs(ketQua.tongKet * 10 - Math.round(ketQua.tongKet * 10)) < 1e-9,
        nhan,
      );
      if (dauVao.chuyenCan < 5) {
        assert.equal(ketQua.trangThai, "CAM_THI", nhan);
        assert.equal(ketQua.diemChu, "F", nhan);
      } else {
        assert.equal(
          ketQua.trangThai,
          ketQua.diemChu === "F" ? "KHONG_DAT" : "DAT",
          nhan,
        );
      }
    }
  });
});

describe("hình dạng kết quả", () => {
  test("kết quả chỉ có ba khóa tongKet, diemChu, trangThai", () => {
    const dauVaoMau = [diem(), diem({ chuyenCan: 0 }), diem({ thi: 0 })];
    for (const dauVao of dauVaoMau) {
      assert.deepEqual(
        Object.keys(tinhDiemHocPhan(dauVao)).sort(),
        ["diemChu", "tongKet", "trangThai"],
      );
    }
  });

  test("không làm thay đổi đối tượng đầu vào", () => {
    const dauVao = Object.freeze(diem({ chuyenCan: 7.5, thi: 7 }));
    const banSao = { ...dauVao };
    tinhDiemHocPhan(dauVao);
    assert.deepEqual(dauVao, banSao);
  });
});
