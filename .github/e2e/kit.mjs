// Genera el PDF real del kit de Mateo desde el sitio publicado.
import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("resultados", { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
await p.goto("https://pawsome-creations-hub.lovable.app", { waitUntil: "networkidle" });
await p.fill("#hero-name", "Mateo");
await p.getByRole("button", { name: "Niño", exact: true }).first().click();
await p.waitForTimeout(1500);
await p.emulateMedia({ media: "print" });
await p.pdf({ path: "resultados/kit-mateo.pdf", format: "A4", printBackground: true });
await browser.close();
console.log("ok");
