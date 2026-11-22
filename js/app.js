// VK мини-приложение (app.html): вкладки, контакты, ссылки общих скриптов ведут на вкладки, а не на страницы сайта.
// Нужны js/main.js, js/booking.js, js/mk-page.js; подключается последним.

const TABS = ["afisha", "mk", "tarify", "prazdniki"];
// страницы сайта, на которые ссылаются общие скрипты, → вкладка приложения
const PAGE_TAB = { "index.html": "afisha", "mk.html": "mk", "prazdniki.html": "prazdniki", "tarify.html": "tarify", "kontakty.html": "tarify" };

// Фон вкладки уходит в сливу (css/app.css, .app). Надписи прямо на фоне берут тёмный или светлый цвет —
// какой контрастнее с фоном в их месте. Точки — те же, что в CSS: число = px, строка = доля высоты страницы.
const BG_STOPS = [[0, "#F1DCAD"], [420, "#F6E7EC"], ["30%", "#EAD2E6"], ["100%", "#711E7B"]];
const ON_BG = ".app-tab > .app-title, .app-tab > .app-sub, .app-tab > p, .app-tab > ul > li, .diary-list > p";
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (rgb) => { const [r, g, b] = rgb.map((c) => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
function bgAt(y, h) {
  let last = 0;
  const pts = BG_STOPS.map(([p, c]) => [(last = Math.max(last, typeof p === "number" ? p : (parseFloat(p) / 100) * h)), hex(c)]);
  for (let i = 1; i < pts.length; i++) {
    const [y0, c0] = pts[i - 1], [y1, c1] = pts[i];
    if (y <= y1) { const t = y1 > y0 ? Math.max(0, (y - y0) / (y1 - y0)) : 1; return c0.map((v, k) => v + (c1[k] - v) * t); }
  }
  return pts[pts.length - 1][1];
}
const INK = lum(hex("#330C4B")), MAIZE = lum(hex("#FBF1D9")); // --deep и --card: цвета тёмной и светлой надписи
console.assert(contrast(lum(bgAt(0, 3000)), INK) > contrast(lum(bgAt(0, 3000)), MAIZE), "верх фона — тёмный текст");
console.assert(contrast(lum(bgAt(3000, 3000)), MAIZE) > contrast(lum(bgAt(3000, 3000)), INK), "низ фона — светлый текст");
function paintText() {
  const h = document.documentElement.scrollHeight;
  document.querySelectorAll(ON_BG).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.height) return; // скрытая вкладка
    const bg = lum(bgAt(r.top + scrollY + r.height / 2, h));
    el.classList.toggle("on-dark", contrast(bg, MAIZE) > contrast(bg, INK));
  });
}
// высота страницы меняется при смене вкладки, фильтрах афиши и каталога — тогда и пересчитываем
new ResizeObserver(() => requestAnimationFrame(paintText)).observe(document.body);

function showTab(id) {
  if (!TABS.includes(id)) id = TABS[0];
  TABS.forEach((t) => { document.getElementById(t).hidden = t !== id; });
  document.body.dataset.tab = id; // оформление отдельных вкладок в css/app.css
  document.querySelectorAll(".app-nav a").forEach((a) => (a.hash === "#" + id ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  // шапку с совой видно при открытии; дальше вкладка открывается сразу с начала своего содержимого
  if (location.hash) document.getElementById("app-main").scrollIntoView();
  dispatchEvent(new Event("resize")); // гирлянда каталога считает размеры сетки, а в скрытой вкладке они нулевые
}

addEventListener("hashchange", () => showTab(location.hash.slice(1)));
showTab(location.hash.slice(1));

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a) return;
  // ссылка на уже открытую вкладку: hashchange не сработает, а прокрутить к содержимому всё равно нужно
  if (a.getAttribute("href") === location.hash && TABS.includes(location.hash.slice(1))) { e.preventDefault(); showTab(location.hash.slice(1)); return; }
  if (a.closest(".app-nav") || a.target === "_blank") return;
  const [page, hash] = a.getAttribute("href").split("#");
  const tab = PAGE_TAB[page];
  if (!tab) return;
  e.preventDefault();
  closeModal();
  location.hash = tab;
  const mk = page === "mk.html" && MK.find((m) => m.id === hash);
  if (mk) mkDetail(mk);
});

const day = new Date().getDay();
document.querySelector("[data-today]").textContent = "сегодня " + (day >= 1 && day <= 4 ? SITE.hours[0] : SITE.hours[1]).replace(/^\S+\s/, "");
document.querySelector("[data-contacts]").innerHTML = `
  <p><b>${SITE.address}</b></p>
  ${SITE.hours.map((h) => `<p>${h}</p>`).join("")}
  <p><a class="tel" href="tel:${SITE.tel}">${SITE.phone}</a></p>
  <p><a href="https://yandex.ru/maps/?text=${encodeURIComponent(SITE.mapQuery)}" target="_blank" rel="noopener">Открыть на карте ↗</a></p>
  <p><a href="${SITE.vk}" target="_blank" rel="noopener">Группа ВКонтакте ↗</a></p>`;

// Внутри ВК сообщаем клиенту, что приложение готово; в обычном браузере bridge просто не найдёт ВК.
window.vkBridge?.send("VKWebAppInit").catch(() => {});
