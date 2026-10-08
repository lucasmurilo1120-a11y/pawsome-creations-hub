// Prueba de punta a punta en los sitios publicados: página de códigos -> app -> canje -> foto -> personaje.
import { chromium } from "playwright";
import fs from "node:fs";

const APP = "https://pawsome-creations-hub.lovable.app";
const UNA = "https://papelitos-carita.lovable.app";
const FAMILIA = "https://papelitos-familia.lovable.app";
const OUT = "resultados";
fs.mkdirSync(OUT, { recursive: true });
const log = [];
const anota = (k, v) => { log.push({ k, v, t: new Date().toISOString() }); console.log(k, JSON.stringify(v)); };
const guardarLog = () => fs.writeFileSync(`${OUT}/log.json`, JSON.stringify(log, null, 2));

const browser = await chromium.launch();
const movil = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "es-419" };

async function leerCodigo(url, nombre) {
  const ctx = await browser.newContext(movil);
  const p = await ctx.newPage();
  const errores = [];
  p.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  await p.goto(url, { waitUntil: "networkidle" });
  let codigo = null;
  try {
    const el = p.locator('[aria-label^="Código "]').first();
    await el.waitFor({ timeout: 30000 });
    codigo = (await el.getAttribute("aria-label")).replace("Código ", "").replace(/\s/g, "");
  } catch (e) { anota(`${nombre}:sin_codigo`, String(e).slice(0, 300)); }
  await p.screenshot({ path: `${OUT}/${nombre}.png`, fullPage: true });
  anota(`${nombre}:codigo`, { codigo, errores });
  // Recarga: debe devolver el mismo código pendiente
  await p.reload({ waitUntil: "networkidle" });
  try {
    const el = p.locator('[aria-label^="Código "]').first();
    await el.waitFor({ timeout: 30000 });
    anota(`${nombre}:recarga`, (await el.getAttribute("aria-label")).replace("Código ", "").replace(/\s/g, ""));
  } catch (e) { anota(`${nombre}:recarga_error`, String(e).slice(0, 200)); }
  await ctx.close();
  return codigo;
}

async function canjear(p, codigo) {
  await p.getByRole("button", { name: /Tengo un código/ }).click();
  await p.fill("#codigo-carita", codigo);
  await p.getByRole("button", { name: "Canjear" }).click();
  const r = p.locator('#panel-codigo [role="status"], #panel-codigo [role="alert"]').first();
  await r.waitFor({ timeout: 30000 });
  return (await r.innerText()).trim();
}

try {
  const codigoUna = await leerCodigo(UNA, "pagina-una");
  const codigoFam = await leerCodigo(FAMILIA, "pagina-familia");
  guardarLog();

  const ctx = await browser.newContext(movil);
  const p = await ctx.newPage();
  const errores = [];
  p.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  p.on("pageerror", (e) => errores.push(String(e)));
  await p.goto(APP, { waitUntil: "networkidle" });
  await p.screenshot({ path: `${OUT}/app-inicio.png` });

  // 1) código incorrecto
  anota("canje:incorrecto", await canjear(p, "ABC234"));
  await p.screenshot({ path: `${OUT}/app-codigo-incorrecto.png` });
  // 2) código correcto
  await p.fill("#codigo-carita", codigoUna ?? "");
  await p.getByRole("button", { name: "Canjear" }).click();
  await p.locator('#panel-codigo [role="status"]').first().waitFor({ timeout: 30000 }).catch(() => {});
  const ok = await p.locator('#panel-codigo [role="status"], #panel-codigo [role="alert"]').first().innerText().catch(() => "");
  anota("canje:correcto", ok.trim());
  await p.screenshot({ path: `${OUT}/app-codigo-correcto.png` });
  guardarLog();

  // 3) foto
  await p.getByRole("button", { name: /Crear su personaje con una foto/ }).click();
  await p.getByText("Antes de la foto").waitFor({ timeout: 15000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/app-antes-de-la-foto.png` });
  await p.fill('input[id^="nombre-"]', "Mateo");
  await p.getByRole("button", { name: "Niño", exact: true }).last().click();
  await p.locator('input[type="checkbox"]').first().check();
  await p.getByRole("button", { name: "Continuar" }).click();
  await p.locator('input[type="file"]:not([capture])').setInputFiles("foto.jpg");
  await p.getByRole("button", { name: "Crear el personaje" }).waitFor({ timeout: 15000 });
  await p.screenshot({ path: `${OUT}/app-foto-elegida.png` });
  const t0 = Date.now();
  await p.getByRole("button", { name: "Crear el personaje" }).click();
  await p.waitForTimeout(3000);
  await p.screenshot({ path: `${OUT}/app-creando.png` });
  // espera: listo con 7 looks, o error
  const fin = await Promise.race([
    p.getByText("Listo, con sus 7 looks").waitFor({ timeout: 420000 }).then(() => "listo"),
    p.getByText("No salió esta vez").waitFor({ timeout: 420000 }).then(() => "error"),
  ]).catch((e) => "timeout " + String(e).slice(0, 100));
  anota("creacion", { fin, segundos: Math.round((Date.now() - t0) / 1000) });
  if (fin === "error") anota("creacion:mensaje", await p.locator('[role="alert"]').last().innerText().catch(() => ""));
  await p.screenshot({ path: `${OUT}/app-resultado.png`, fullPage: true });
  guardarLog();

  // 4) imágenes generadas (URLs firmadas de Storage)
  const srcs = await p.$$eval("img", (imgs) => [...new Set(imgs.map((i) => i.currentSrc || i.src).filter((s) => /supabase|storage/.test(s)))]);
  anota("imagenes", srcs.length);
  let n = 0;
  for (const s of srcs) {
    try {
      const r = await fetch(s);
      const b = Buffer.from(await r.arrayBuffer());
      const nombre = (s.split("?")[0].split("/").pop() || `img${n}`).replace(/[^a-z0-9._-]/gi, "_");
      fs.writeFileSync(`${OUT}/gen-${n++}-${nombre}`, b);
    } catch (e) { anota("descarga_error", String(e).slice(0, 200)); }
  }
  // 5) el personaje aparece en "Elige su personaje" y en la vista previa
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: `${OUT}/app-arriba.png`, fullPage: false });

  // 5b) enlace /?codigo= con el código del Pack familia en el mismo celular: debe sumar 4
  await p.goto(`${APP}/?codigo=${codigoFam}`, { waitUntil: "networkidle" });
  const auto = p.locator('#panel-codigo [role="status"], #panel-codigo [role="alert"]').first();
  await auto.waitFor({ timeout: 30000 }).catch(() => {});
  anota("canje:enlace_familia", (await auto.innerText().catch(() => "")).trim());
  anota("badge", (await p.getByRole("button", { name: /Tengo un código/ }).innerText().catch(() => "")).trim());
  await p.screenshot({ path: `${OUT}/app-enlace-familia.png` });
  await p.keyboard.press("Escape");
  await p.locator("#carita").scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(1000);
  await p.screenshot({ path: `${OUT}/app-carita-5.png`, fullPage: true });

  // 6) mismo código en otro navegador: recupera los personajes
  const ctx2 = await browser.newContext(movil);
  const p2 = await ctx2.newPage();
  await p2.goto(APP, { waitUntil: "networkidle" });
  anota("canje:otro_navegador", await canjear(p2, codigoUna ?? ""));
  anota("badge_otro_navegador", (await p2.getByRole("button", { name: /Tengo un código/ }).innerText().catch(() => "")).trim());
  await ctx2.close();
  // 7) PDF del kit (medios de impresión) con un nombre
  try {
    const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p3 = await ctx3.newPage();
    await p3.goto(APP, { waitUntil: "networkidle" });
    await p3.fill("#hero-name", "Valentina");
    await p3.getByRole("button", { name: "Niña", exact: true }).first().click();
    await p3.waitForTimeout(800);
    await p3.emulateMedia({ media: "print" });
    await p3.pdf({ path: `${OUT}/kit-valentina.pdf`, format: "A4", printBackground: true });
    anota("pdf", "ok");
    await ctx3.close();
  } catch (e) { anota("pdf_error", String(e).slice(0, 300)); }
  // 8) navegador de Instagram: el botón del PDF muestra el aviso
  try {
    const ctx4 = await browser.newContext({ ...movil, userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0 Mobile Safari/537.36 Instagram 350.0.0.0" });
    const p4 = await ctx4.newPage();
    await p4.goto(APP, { waitUntil: "networkidle" });
    await p4.fill("#hero-name", "Mateo");
    await p4.locator("div.fixed button").filter({ hasText: /Descargar/ }).first().click();
    await p4.waitForTimeout(800);
    anota("aviso_app", (await p4.locator('[role="dialog"][aria-label="Abrir en el navegador"]').innerText().catch(() => "sin aviso")).slice(0, 200));
    await p4.screenshot({ path: `${OUT}/app-aviso-instagram.png` });
    await ctx4.close();
  } catch (e) { anota("aviso_error", String(e).slice(0, 300)); }
  anota("errores_consola", errores.slice(0, 20));
  anota("codigo_familia_sin_usar", codigoFam);
} catch (e) {
  anota("excepcion", String(e).slice(0, 800));
} finally {
  guardarLog();
  await browser.close();
}
