import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("resultados", { recursive: true });
const URL = "https://build-your-world-853.lovable.app/?t=" + Date.now();
const browser = await chromium.launch();
for (const [nombre, vp] of [["celular", { width: 390, height: 844 }], ["escritorio", { width: 1280, height: 900 }]]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: "networkidle" });
  const h2 = page.getByText("Lo que cuentan las familias");
  await h2.waitFor({ timeout: 30000 });
  const sec = h2.locator("xpath=ancestor::section[1]");
  await sec.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await sec.screenshot({ path: `resultados/testimonios-${nombre}.png` });
  const box = await sec.boundingBox();
  // Contexto: el final de "Listo en 3 pasos", los testimonios y el inicio del precio.
  await page.screenshot({ path: `resultados/contexto-${nombre}.png`, clip: { x: 0, y: Math.max(0, box.y - 260 + (await page.evaluate(() => window.scrollY))), width: vp.width, height: Math.min(box.height + 620, 2400) }, fullPage: true });
  const datos = await page.evaluate(() => ({ scrollX: document.documentElement.scrollWidth > window.innerWidth, tarjetas: document.querySelectorAll("section li.rounded-2xl").length }));
  console.log(`::notice title=${nombre}::alto=${Math.round(box.height)} desbordaHorizontal=${datos.scrollX} tarjetas=${datos.tarjetas}`);
  await page.close();
}
await browser.close();
