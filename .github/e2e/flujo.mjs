import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("resultados", { recursive: true });
const PIXEL = "3164583463733404";
const URL = "https://build-your-world-853.lovable.app/?t=" + Date.now();
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36", locale: "es-MX" });
await ctx.addInitScript(() => { Object.defineProperty(navigator, "webdriver", { get: () => false }); });
const page = await ctx.newPage();
const eventos = [];
page.on("request", (r) => {
  const u = r.url();
  if (u.includes("facebook.com/tr")) {
    const p = new URL(u).searchParams;
    const body = r.postData() || "";
    const ev = p.get("ev") || (body.match(/ev=([A-Za-z]+)/) || [])[1];
    eventos.push(`${ev} id=${p.get("id") || (body.match(/id=(\d+)/) || [])[1]} ${r.method()}`);
  } else if (u.includes("facebook")) eventos.push("outro " + u.slice(0, 90));
});
// No salir a Hotmart: solo queremos ver el evento al hacer clic.
await page.route("**pay.hotmart.com/**", (route) => route.abort());
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const fbq = await page.evaluate(() => typeof window.fbq + " pixels=" + Object.keys((window._fbq && window._fbq.instance && window._fbq.instance.pixelsByID) || {}).join(","));
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
