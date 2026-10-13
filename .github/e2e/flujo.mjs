import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("resultados", { recursive: true });
const PIXEL = "3164583463733404";
const URL = "https://build-your-world-853.lovable.app/?t=" + Date.now();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const eventos = [];
page.on("request", (r) => {
  const u = r.url();
  if (u.includes("facebook.com/tr")) {
    const p = new URL(u).searchParams;
    eventos.push(`${p.get("ev")} id=${p.get("id")}`);
  }
  if (u.includes("connect.facebook.net")) eventos.push("script fbevents.js");
});
// No salir a Hotmart: solo queremos ver el evento al hacer clic.
await page.route("**pay.hotmart.com/**", (route) => route.abort());
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const fbq = await page.evaluate(() => typeof window.fbq);
await page.locator("#demo-name").scrollIntoViewIfNeeded();
await page.locator("#demo-name").fill("Mateo");
await page.waitForTimeout(3000);
const btn = page.locator("#planes a[href*='hotmart']").first();
await btn.scrollIntoViewIfNeeded();
await btn.click({ noWaitAfter: true }).catch(() => {});
await page.waitForTimeout(4000);
fs.writeFileSync("resultados/eventos.txt", eventos.join("\n"));
console.log(`::notice title=pixel::fbq=${fbq} pixel=${PIXEL} eventos=${eventos.join(" | ") || "ninguno"}`);
await browser.close();
