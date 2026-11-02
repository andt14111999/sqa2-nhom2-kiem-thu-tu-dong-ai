import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";

const tep = fileURLToPath(new URL("../KetQua/playwright-report/index.html", import.meta.url));
const trinhDuyet = await chromium.launch({ channel: "chrome" });
const trang = await trinhDuyet.newPage({ viewport: { width: 1000, height: 700 }, deviceScaleFactor: 2 });
await trang.goto(`file://${tep}`);
await trang.waitForSelector("text=Kết quả hợp lệ");
await trang.screenshot({ path: fileURLToPath(new URL("../KetQua/anh_bao_cao_playwright.png", import.meta.url)) });
await trinhDuyet.close();
