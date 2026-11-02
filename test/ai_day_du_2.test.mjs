import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { tinhDiemHocPhan } from "../src/diem.js";

const TRUONG = ["chuyenCan", "baiTap", "kiemTra", "thi"];
const HOP_LE = { chuyenCan: 8, baiTap: 8, kiemTra: 8, thi: 8 };

function de(chuyenCan, baiTap, kiemTra, thi) {
  return { chuyenCan, baiTap, kiemTra, thi };
}

function thayTruong(truong, giaTri) {
  return { ...HOP_LE, [truong]: giaTri };
}

function assertKetQua(dauVao, tongKet, diemChu, trangThai) {
  assert.deepEqual(tinhDiemHocPhan(dauVao), { tongKet, diemChu, trangThai });
}

function assertDiemKhongHopLe(dauVao, truong, nhan) {
  assert.throws(
    () => tinhDiemHocPhan(dauVao),
    (loi) => {
      assert.ok(loi instanceof RangeError, `${nhan}: phải là RangeError`);
      assert.equal(loi.code, "DIEM_KHONG_HOP_LE", `${nhan}: sai code`);
      assert.equal(loi.truong, truong, `${nhan}: sai truong`);
      return true;
    },
    `${nhan}: phải ném RangeError`,
  );
}

function chuaMuoi(x) {
  return Math.round(x * 10);
}

function diemChuTheoTongKet(t10) {
  if (t10 >= 90) return "A+";
  if (t10 >= 85) return "A";
  if (t10 >= 80) return "B+";
  if (t10 >= 70) return "B";
  if (t10 >= 65) return "C+";
  if (t10 >= 55) return "C";
  if (t10 >= 50) return "D+";
  if (t10 >= 40) return "D";
  return "F";
}

function tinhKyVong(dauVao) {
  const cc = chuaMuoi(dauVao.chuyenCan);
  const bt = chuaMuoi(dauVao.baiTap);
  const kt = chuaMuoi(dauVao.kiemTra);
  const thi = chuaMuoi(dauVao.thi);
  if (cc < 50) return { tongKet: 0, diemChu: "F", trangThai: "CAM_THI" };
  const t10 = Math.floor((cc + 2 * bt + 2 * kt + 5 * thi + 5) / 10);
  const tongKet = t10 / 10;
  if (thi < 30) return { tongKet, diemChu: "F", trangThai: "KHONG_DAT" };
  const diemChu = diemChuTheoTongKet(t10);
  return { tongKet, diemChu, trangThai: diemChu === "F" ? "KHONG_DAT" : "DAT" };
}

describe("cấu trúc kết quả", () => {
  test("kết quả có đúng ba thuộc tính tongKet, diemChu, trangThai", () => {
    const ketQua = tinhDiemHocPhan(de(8, 7, 6, 9));
    assert.deepEqual(Object.keys(ketQua).sort(), ["diemChu", "tongKet", "trangThai"]);
  });

  test("tongKet là số hữu hạn, diemChu và trangThai là chuỗi", () => {
    const ketQua = tinhDiemHocPhan(de(8, 7, 6, 9));
    assert.equal(typeof ketQua.tongKet, "number");
    assert.ok(Number.isFinite(ketQua.tongKet));
    assert.equal(typeof ketQua.diemChu, "string");
    assert.equal(typeof ketQua.trangThai, "string");
  });
});

describe("điểm chữ tại các ranh giới (điểm thành phần đều bằng nhau nên tongKet bằng chính giá trị đó)", () => {
  const BIEN_DIEM_CHU = [
    [10, "A+"],
    [9, "A+"],
    [8.9, "A"],
    [8.5, "A"],
    [8.4, "B+"],
    [8, "B+"],
    [7.9, "B"],
    [7, "B"],
    [6.9, "C+"],
    [6.5, "C+"],
    [6.4, "C"],
    [5.5, "C"],
    [5.4, "D+"],
    [5, "D+"],
  ];
  for (const [v, chu] of BIEN_DIEM_CHU) {
    test(`bốn điểm đều ${v}: tongKet ${v}, diemChu ${chu}, DAT`, () => {
      assertKetQua(de(v, v, v, v), v, chu, "DAT");
    });
  }
});

describe("làm tròn nửa lên theo số học thập phân và điểm chữ theo tongKet đã làm tròn", () => {
  const LAM_TRON = [
    [de(10, 10, 2.5, 7.5), 7.3, "B", "DAT"],
    [de(10, 6.8, 6.9, 7), 7.2, "B", "DAT"],
    [de(5.5, 9.5, 10, 8), 8.5, "A", "DAT"],
    [de(5.4, 9.5, 10, 8), 8.4, "B+", "DAT"],
    [de(9.5, 8.5, 9, 9), 9, "A+", "DAT"],
    [de(9.4, 8.5, 9, 9), 8.9, "A", "DAT"],
    [de(7.5, 8, 8, 8), 8, "B+", "DAT"],
    [de(7.4, 8, 8, 8), 7.9, "B", "DAT"],
    [de(6.5, 7, 7, 7), 7, "B", "DAT"],
    [de(6.4, 7, 7, 7), 6.9, "C+", "DAT"],
    [de(5.5, 7.5, 7, 6), 6.5, "C+", "DAT"],
    [de(5.4, 7.5, 7, 6), 6.4, "C", "DAT"],
    [de(5.5, 6, 6, 5), 5.5, "C", "DAT"],
    [de(5, 6.1, 6.1, 5), 5.4, "D+", "DAT"],
    [de(5.1, 7.5, 7.2, 3), 5, "D+", "DAT"],
    [de(5, 7.5, 7.2, 3), 4.9, "D", "DAT"],
    [de(5.1, 5, 4.7, 3), 4, "D", "DAT"],
    [de(5, 5, 4.7, 3), 3.9, "F", "KHONG_DAT"],
    [de(5, 7.5, 7, 3), 4.9, "D", "DAT"],
    [de(5, 5, 5, 3), 4, "D", "DAT"],
    [de(5, 5, 4.5, 3), 3.9, "F", "KHONG_DAT"],
  ];
  for (const [dauVao, tongKet, diemChu, trangThai] of LAM_TRON) {
    test(`${inspect(dauVao, { breakLength: Infinity })} cho tongKet ${tongKet}, ${diemChu}, ${trangThai}`, () => {
      assertKetQua(dauVao, tongKet, diemChu, trangThai);
    });
  }
});

describe("các ca tiêu biểu", () => {
  const TIEU_BIEU = [
    [de(10, 10, 10, 10), 10, "A+", "DAT"],
    [de(8, 7, 6, 9), 7.9, "B", "DAT"],
    [de(9, 8, 7, 6), 6.9, "C+", "DAT"],
    [de(10, 9, 8, 9), 8.9, "A", "DAT"],
    [de(5, 10, 10, 10), 9.5, "A+", "DAT"],
  ];
  for (const [dauVao, tongKet, diemChu, trangThai] of TIEU_BIEU) {
    test(`${inspect(dauVao, { breakLength: Infinity })} cho tongKet ${tongKet}, ${diemChu}, ${trangThai}`, () => {
      assertKetQua(dauVao, tongKet, diemChu, trangThai);
    });
  }
});

describe("cấm thi khi chuyenCan nhỏ hơn 5", () => {
  const CAM_THI = [
    de(0, 0, 0, 0),
    de(4.9, 10, 10, 10),
    de(4, 8, 8, 2),
    de(4.5, 9.5, 9, 9),
    de(3, 10, 10, 2.9),
  ];
  for (const dauVao of CAM_THI) {
    test(`${inspect(dauVao, { breakLength: Infinity })} bị CAM_THI`, () => {
      assertKetQua(dauVao, 0, "F", "CAM_THI");
    });
  }
});

describe("thi nhỏ hơn 3 thì F và KHONG_DAT, tongKet vẫn tính bình thường", () => {
  const THI_DUOI_3 = [
    [de(10, 10, 10, 2.9), 6.5, "F", "KHONG_DAT"],
    [de(10, 10, 10, 0), 5, "F", "KHONG_DAT"],
    [de(9, 9, 9, 2.9), 6, "F", "KHONG_DAT"],
    [de(5, 0, 0, 2), 1.5, "F", "KHONG_DAT"],
    [de(5, 0, 0, 0), 0.5, "F", "KHONG_DAT"],
    [de(5, 0, 0, 3), 2, "F", "KHONG_DAT"],
    [de(10, 10, 10, 3), 6.5, "C+", "DAT"],
  ];
  for (const [dauVao, tongKet, diemChu, trangThai] of THI_DUOI_3) {
    test(`${inspect(dauVao, { breakLength: Infinity })} cho tongKet ${tongKet}, ${diemChu}, ${trangThai}`, () => {
      assertKetQua(dauVao, tongKet, diemChu, trangThai);
    });
  }
});

describe("điểm thành phần không hợp lệ", () => {
  const NGOAI_DOAN = [-0.1, -1, -10, 10.1, 11, 100];
  const KHONG_HUU_HAN = [NaN, Infinity, -Infinity];
  const SAI_KIEU = ["7", "", "abc", null, undefined, true, false, [], [7], {}, 7n];
  const NHIEU_CHU_SO = [7.55, 7.25, 0.01, 0.05, 0.15, 9.95, 5.05, 3.14159, 2.999, 5.0000001];
  const LOAI_SAI = [
    ["ngoài đoạn [0; 10]", NGOAI_DOAN],
    ["không hữu hạn", KHONG_HUU_HAN],
    ["sai kiểu dữ liệu", SAI_KIEU],
    ["quá 1 chữ số thập phân", NHIEU_CHU_SO],
  ];

  for (const truong of TRUONG) {
    for (const [loai, danhSach] of LOAI_SAI) {
      test(`${truong}: ${loai}`, () => {
        for (const giaTri of danhSach) {
          assertDiemKhongHopLe(thayTruong(truong, giaTri), truong, `${truong} = ${inspect(giaTri)}`);
        }
      });
    }
  }

  for (const truong of TRUONG) {
    test(`thiếu hẳn trường ${truong}`, () => {
      const dauVao = { ...HOP_LE };
      delete dauVao[truong];
      assertDiemKhongHopLe(dauVao, truong, `thiếu ${truong}`);
    });
  }
});

describe("trường được báo là trường sai đầu tiên theo thứ tự chuyenCan, baiTap, kiemTra, thi", () => {
  const THU_TU = [
    ["mọi trường đều sai thì báo chuyenCan", de(-1, 11, NaN, "x"), "chuyenCan"],
    ["chuyenCan hợp lệ, ba trường sau sai thì báo baiTap", de(8, 10.5, -1, NaN), "baiTap"],
    ["hai trường đầu hợp lệ thì báo kiemTra", de(8, 8, 11, -2), "kiemTra"],
    ["chỉ thi sai thì báo thi", de(8, 8, 8, 10.1), "thi"],
    ["chuyenCan thấp nhưng thi sai thì vẫn báo thi, không trả CAM_THI", de(3, 8, 8, 11), "thi"],
    ["chuyenCan thấp, kiemTra có 2 chữ số thập phân thì báo kiemTra", de(3, 8, 7.55, 2), "kiemTra"],
    ["chuyenCan có 2 chữ số thập phân và baiTap ngoài đoạn thì báo chuyenCan", de(5.55, 11, 8, 8), "chuyenCan"],
  ];
  for (const [ten, dauVao, truong] of THU_TU) {
    test(ten, () => {
      assertDiemKhongHopLe(dauVao, truong, ten);
    });
  }
});

describe("điểm hợp lệ không bị từ chối nhầm", () => {
  const HOP_LE_MOT_CHU_SO = [0, 0.1, 0.3, 0.7, 1.1, 2.3, 2.9, 3, 4.1, 5.7, 6.6, 8.2, 9.9, 10];
  for (const truong of TRUONG) {
    test(`${truong}: chấp nhận các giá trị 0 đến 10 có tối đa 1 chữ số thập phân`, () => {
      for (const giaTri of HOP_LE_MOT_CHU_SO) {
        let ketQua;
        try {
          ketQua = tinhDiemHocPhan(thayTruong(truong, giaTri));
        } catch (loi) {
          assert.fail(`${truong} = ${giaTri} bị từ chối nhầm: ${loi}`);
        }
        assert.equal(typeof ketQua.tongKet, "number", `${truong} = ${giaTri}`);
        assert.ok(Number.isFinite(ketQua.tongKet), `${truong} = ${giaTri}`);
      }
    });
  }
});

describe("quét toàn bộ so với phép tính số nguyên theo đặc tả", () => {
  function quet(ten, taoDauVao) {
    test(ten, () => {
      for (let i = 0; i <= 100; i++) {
        const dauVao = taoDauVao(i / 10);
        assert.deepEqual(
          tinhDiemHocPhan(dauVao),
          tinhKyVong(dauVao),
          `đầu vào ${inspect(dauVao, { breakLength: Infinity })}`,
        );
      }
    });
  }

  quet("quét chuyenCan từ 0 đến 10 bước 0,1", (v) => de(v, 7, 6.5, 7.5));
  quet("quét baiTap từ 0 đến 10 bước 0,1", (v) => de(6, v, 7.5, 5));
  quet("quét kiemTra từ 0 đến 10 bước 0,1", (v) => de(5, 8.5, v, 3.5));
  quet("quét thi từ 0 đến 10 bước 0,1", (v) => de(5.5, 5, 5.5, v));

  const LUOI_CC = [0, 4.9, 5, 5.1, 6.5, 7.5, 9.9, 10];
  const LUOI_BT = [0, 2.5, 5, 6.1, 7.7, 10];
  const LUOI_KT = [0, 3.5, 5.5, 8.3, 10];
  const LUOI_THI = [0, 2.9, 3, 3.1, 4.5, 6.5, 7.5, 8.5, 10];
  const SO_TO_HOP = LUOI_CC.length * LUOI_BT.length * LUOI_KT.length * LUOI_THI.length;

  test(`lưới tổ hợp ${SO_TO_HOP} đầu vào`, () => {
    for (const cc of LUOI_CC) {
      for (const bt of LUOI_BT) {
        for (const kt of LUOI_KT) {
          for (const thi of LUOI_THI) {
            const dauVao = de(cc, bt, kt, thi);
            assert.deepEqual(
              tinhDiemHocPhan(dauVao),
              tinhKyVong(dauVao),
              `đầu vào ${inspect(dauVao, { breakLength: Infinity })}`,
            );
          }
        }
      }
    }
  });
});
