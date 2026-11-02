import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("..", import.meta.url));
const KIEU = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

createServer(async (req, res) => {
  const duongDan = new URL(req.url, "http://localhost").pathname;
  const tep = normalize(duongDan === "/" ? "web/index.html" : `.${duongDan}`);
  try {
    if (tep.startsWith("..")) throw new Error("ngoai thu muc");
    const noiDung = await readFile(join(GOC, tep));
    res.writeHead(200, { "content-type": KIEU[extname(tep)] ?? "application/octet-stream" });
    res.end(noiDung);
  } catch {
    res.writeHead(404);
    res.end("Khong tim thay");
  }
}).listen(4173, "127.0.0.1");
