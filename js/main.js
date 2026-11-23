// Общий скрипт: шапка, меню, подвал, декор, окна, проверка форм.
// Подключается последним на каждой странице.

const SITE = {
  phone: "+7 982 453-43-58",
  tel: "+79824534358",
  // Группа ВК: id взят из ссылки на товар «Киновечер» в базе знаний.
  vk: "https://vk.com/club233037297",
  address: "ул. Ушинского, 10, Пермь",
  hours: ["ПН–ЧТ 12:00–21:30", "ПТ–ВС 14:00–21:30"],
  mapQuery: "Пермь, улица Ушинского, 10",
};

const NAV = [
  ["index.html", "Главная"],
  ["mk.html", "Мастер-классы"],
  ["prazdniki.html", "Праздники"],
  ["tarify.html", "Тарифы"],
  ["zanyatiya.html", "Досуг"],
  ["galereya.html", "Галерея"],
  ["kontakty.html", "Контакты"],
  ["sotrudnichestvo.html", "Сотрудничество"],
];

// Кромки (волна, трава) — картинки-фоны с цветом внутри SVG: тёмный режим браузера (Dark Reader, «тёмная тема сайтов»)
// перекрашивает CSS-цвета и currentColor в чёрный/серый, а цвет внутри фоновой картинки не трогает
const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const WAVE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 34" preserveAspectRatio="none"><path d="M0 34V18c80-14 160-16 240-6s170 18 260 6 170-22 260-12 160 18 240 10 140-14 200-6v24z"/></svg>';
const wave = (color, cls = "") => `<div class="wave${cls}" aria-hidden="true" style='background-image:${svgUrl(WAVE_SVG.replace("<svg ", `<svg fill="${color}" `))}'></div>`;
const SPRIG = '<svg viewBox="0 0 60 140" aria-hidden="true"><path d="M30 138C30 100 31 60 34 8" stroke="#7d9a6a" stroke-width="2.4" fill="none"/><g fill="currentColor">' +
  [12, 22, 32, 42, 52, 62, 74].map((y, i) => `<ellipse cx="${i % 2 ? 39 : 27}" cy="${y}" rx="6" ry="9" transform="rotate(${i % 2 ? 28 : -28} ${i % 2 ? 39 : 27} ${y})"/>`).join("") +
  '</g><path d="M30 110c-10-8-16-20-18-30M31 96c9-6 14-16 15-26" stroke="#7d9a6a" stroke-width="2" fill="none"/></svg>';

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
// Пометка [уточнить] в данных превращается в жёлтую плашку.
const fill = (s) => esc(s).replace(/\[уточнить[^\]]*\]/g, (m) => `<span class="todo">${m}</span>`);

function renderHeader() {
  const here = location.pathname.split("/").pop() || "index.html";
  const el = document.getElementById("site-header");
  if (!el) return;
  el.className = "site-header";
  el.innerHTML = `
    <div class="wrap header-in">
      <a class="logo" href="index.html"><img src="img/art/logo-mark.jpg" alt="" width="46" height="46"><span>Лавандовая ветвь</span></a>
      <a class="btn btn-small header-cta" href="index.html#afisha">Записаться на МК</a>
      <button class="burger" type="button" aria-label="Меню" aria-expanded="false" aria-controls="nav"><span></span></button>
      <nav class="nav" id="nav" aria-label="Главное меню">
        <ul>
          ${NAV.map(([href, name]) => `<li><a href="${href}"${href === here ? ' aria-current="page"' : ""}>${name}</a></li>`).join("")}
          <li class="nav-cta"><a class="btn" href="index.html#afisha">Записаться</a></li>
        </ul>
      </nav>
    </div>`;
  const burger = el.querySelector(".burger");
  const nav = el.querySelector(".nav");
  const toggle = (open) => { nav.classList.toggle("open", open); burger.setAttribute("aria-expanded", open); };
  burger.addEventListener("click", () => toggle(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) toggle(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggle(false); });
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.insertAdjacentHTML("beforebegin", wave(getComputedStyle(document.documentElement).getPropertyValue("--deep").trim(), " footer-wave"));
  el.className = "site-footer";
  el.innerHTML = `
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <div class="footer-logo">Лавандовая ветвь</div>
          <p>Творческое пространство в Перми</p>
          <p>${SITE.address}</p>
        </div>
        <div>
          <h3>Часы работы</h3>
          ${SITE.hours.map((h) => `<p>${h}</p>`).join("")}
        </div>
        <div>
          <h3>Связаться</h3>
          <p><a class="tel" href="tel:${SITE.tel}">${SITE.phone}</a></p>
          <p><a href="${SITE.vk}" target="_blank" rel="noopener">Группа ВКонтакте</a></p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>Демо-версия сайта: заявки не отправляются, оплата не списывается.</span>
        <a href="oferta.html">Договор-оферта</a>
        <a href="privacy.html">Политика конфиденциальности</a>
        <a href="soglasie.html">Согласие на обработку ПДн</a>
      </div>
    </div>`;
}

// Травяная кромка (страницы с <body data-edge="grass">): плитка травинок 240×48, повторяется по ширине;
// цвет задаёт фон элемента, форму — маска, поэтому трава всегда в цвет соседнего блока.
const GRASS_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48" width="240" height="48"><path d="M2.0 45Q2.9 23.2 2.9 5.4Q6.2 25.2 8.0 45ZM7.6 45Q9.3 29.6 10.4 17.0Q14.3 31.0 16.5 45ZM14.9 45Q17.7 29.4 21.2 16.7Q22.7 30.9 23.9 45ZM21.8 45Q23.7 34.4 25.2 25.7Q28.8 35.4 31.1 45ZM28.9 45Q31.7 37.5 35.2 31.4Q36.5 38.2 37.7 45ZM35.3 45Q36.6 25.1 36.4 8.8Q41.9 26.9 45.0 45ZM41.9 45Q44.7 27.0 48.1 12.3Q50.0 28.7 51.6 45ZM48.6 45Q50.6 23.4 52.1 5.7Q55.9 25.4 58.2 45ZM54.6 45Q55.9 32.9 55.8 23.0Q61.0 34.0 63.9 45ZM60.5 45Q63.7 33.5 68.7 24.2Q68.0 34.6 68.2 45ZM67.2 45Q68.1 23.9 67.2 6.7Q73.0 25.8 76.1 45ZM73.0 45Q74.8 30.0 76.3 17.7Q79.3 31.4 81.2 45ZM78.6 45Q80.6 37.5 82.0 31.4Q85.9 38.2 88.2 45ZM84.6 45Q86.8 23.1 89.1 5.3Q91.6 25.1 93.3 45ZM90.1 45Q91.6 33.7 92.5 24.5Q95.8 34.7 97.7 45ZM96.4 45Q98.5 29.6 101.2 17.1Q102.6 31.0 103.7 45ZM102.1 45Q105.6 30.8 110.5 19.3Q110.9 32.1 111.7 45ZM109.0 45Q111.1 29.9 113.3 17.5Q115.8 31.3 117.5 45ZM116.0 45Q119.1 31.9 123.0 21.1Q124.5 33.0 125.8 45ZM121.8 45Q123.4 32.6 124.3 22.5Q128.0 33.7 130.1 45ZM128.0 45Q129.1 23.9 128.7 6.7Q134.1 25.8 137.1 45ZM135.4 45Q136.0 31.7 135.1 20.8Q139.4 32.9 141.7 45ZM140.7 45Q143.6 34.8 147.0 26.4Q149.0 35.7 150.6 45ZM146.1 45Q147.0 28.6 146.4 15.2Q151.3 30.1 153.9 45ZM153.9 45Q157.4 23.7 162.5 6.3Q162.6 25.6 163.4 45ZM161.6 45Q162.4 33.9 161.2 24.7Q167.3 34.9 170.6 45ZM167.3 45Q169.2 38.4 171.6 33.0Q172.7 39.0 173.6 45ZM173.0 45Q175.8 30.3 179.4 18.3Q180.8 31.7 182.0 45ZM178.7 45Q180.7 34.5 182.2 25.9Q186.0 35.5 188.3 45ZM186.4 45Q186.5 30.3 184.7 18.3Q190.1 31.7 192.9 45ZM194.2 45Q194.9 23.2 193.6 5.3Q199.6 25.2 202.7 45ZM201.9 45Q203.7 22.4 205.9 3.9Q207.5 24.5 208.6 45ZM208.9 45Q209.8 34.7 209.5 26.3Q213.7 35.7 216.0 45ZM215.6 45Q217.7 25.7 220.7 9.9Q221.2 27.5 221.8 45ZM222.7 45Q223.6 37.9 222.8 32.0Q228.0 38.5 230.7 45ZM230.5 45Q233.3 27.1 237.7 12.4Q236.9 28.7 237.0 45ZM60 42q-14-6-20-20q14 2 20 20zM170 42q-14-6-20-20q14 2 20 20zM0 44H240V48H0Z"/></svg>';
const grassEdge = (color, over) => `<div class="edge-grass${over ? " over" : ""}" aria-hidden="true" style='background-image:${svgUrl(GRASS_SVG.replace("<svg ", `<svg fill="${color}" `))}'></div>`;
// цвет фона блока; прозрачный блок — цвет страницы
const bgOf = (el) => { const c = el && getComputedStyle(el).backgroundColor; return !c || c === "rgba(0, 0, 0, 0)" || c === "transparent" ? getComputedStyle(document.body).backgroundColor : c; };

// Края цветных секций (волна или трава) и веточки лаванды в заголовках.
function decorate() {
  const grass = document.body.dataset.edge === "grass";
  const footer = document.getElementById("site-footer");
  document.querySelectorAll(".band, .band-2, .band-fawn").forEach((s) => {
    const color = getComputedStyle(s).backgroundColor;
    if (grass) {
      // трава секции растёт вверх в блок над ней; снизу на секцию заходит трава следующего блока
      s.insertAdjacentHTML("beforebegin", grassEdge(color));
      s.insertAdjacentHTML("afterend", grassEdge(bgOf(s.nextElementSibling || footer), true));
      return;
    }
    s.insertAdjacentHTML("beforebegin", wave(color));
    s.insertAdjacentHTML("afterend", wave(color, " flip"));
  });
  if (grass) {
    // волну над подвалом тоже меняем на траву; если перед подвалом уже стоит травяная кромка — волна не нужна
    const fw = document.querySelector(".footer-wave");
    const lastEdge = document.querySelector("main")?.lastElementChild?.classList.contains("edge-grass");
    if (fw) fw.outerHTML = lastEdge ? "" : grassEdge(bgOf(footer));
  }
  document.querySelectorAll("[data-sprigs]").forEach((s) => {
    s.insertAdjacentHTML("afterbegin", `<span class="sprig l">${SPRIG}</span><span class="sprig r">${SPRIG}</span>`);
  });
}

// Мягкое появление блоков при прокрутке (выключено при «уменьшить движение» — см. CSS).
function reveal() {
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("shown"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".section > .wrap > *").forEach((el) => {
    if (el.getBoundingClientRect().top < innerHeight || el.hasAttribute("data-no-reveal")) return; // первый экран показываем сразу
    el.classList.add("reveal");
    io.observe(el);
  });
}

// ---------- Окна ----------
let modalEl;
function openModal(html) {
  if (!modalEl) {
    modalEl = document.createElement("div");
    modalEl.className = "modal";
    modalEl.setAttribute("role", "dialog");
    modalEl.setAttribute("aria-modal", "true");
    modalEl.innerHTML = '<div class="modal-box"><button class="modal-close" type="button" aria-label="Закрыть">×</button><div class="modal-content"></div></div>';
    document.body.append(modalEl);
    modalEl.querySelector(".modal-close").addEventListener("click", closeModal);
    modalEl.addEventListener("click", (e) => { if (e.target === modalEl) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modalEl.classList.contains("open")) closeModal(); });
  }
  const box = modalEl.querySelector(".modal-content");
  box.innerHTML = html;
  modalEl.classList.add("open");
  document.body.classList.add("no-scroll");
  modalEl.querySelector(".modal-box").scrollTop = 0;
  modalEl.querySelector(".modal-close").focus({ preventScroll: true });
  return box;
}
function closeModal() {
  modalEl?.classList.remove("open");
  document.body.classList.remove("no-scroll");
}

// ---------- Формы ----------
const DEMO_NOTE = '<p class="demo-note">Демо: деньги не списываются, заявка не отправлена.</p>';
const CONSENT = (id) => `
  <div>
    <label class="check" data-consent>
      <input type="checkbox" id="${id}" required>
      <span>Согласен(на) на <a href="soglasie.html" target="_blank">обработку персональных данных</a></span>
    </label>
    <p class="err">Нужно согласие на обработку данных</p>
  </div>`;

// Проверяет поля с required и телефон. Возвращает true, если всё заполнено.
function validate(form) {
  let ok = true;
  form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
  form.querySelectorAll("[required]").forEach((input) => {
    if (input.closest("[hidden]")) return;
    let bad = input.type === "checkbox" ? !input.checked : !input.value.trim();
    if (!bad && input.type === "tel") bad = input.value.replace(/\D/g, "").length < 10;
    if (!bad) return;
    ok = false;
    const consent = input.closest("[data-consent]");
    if (consent) { consent.classList.add("invalid"); consent.parentElement.classList.add("invalid"); }
    else input.closest(".field")?.classList.add("invalid");
  });
  form.querySelector(".invalid input, .invalid select, .invalid textarea")?.focus();
  return ok;
}

// Простая демо-форма: проверка → экран «принято».
function demoForm(form, doneHtml) {
  form.noValidate = true;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    form.outerHTML = `<div class="done-screen plate paper"><div class="big">💜</div>${doneHtml}${DEMO_NOTE}</div>`;
  });
}

// Поля формы: имя и телефон, одинаковые во всех заявках.
const NAME_PHONE = `
  <div class="field"><label for="f-name">Имя</label><input type="text" id="f-name" name="name" autocomplete="name" required><p class="err">Напишите имя</p></div>
  <div class="field"><label for="f-phone">Телефон</label><input type="tel" id="f-phone" name="phone" autocomplete="tel" placeholder="+7 900 000-00-00" required><p class="err">Нужен телефон, чтобы администратор связался с вами</p></div>`;

// ---------- Галерея на весь экран, листание свайпом ----------
function lightbox(container) {
  const links = [...container.querySelectorAll("button[data-full]")];
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.innerHTML = '<button class="modal-close" type="button" aria-label="Закрыть" style="top:12px;right:12px">×</button><button class="lb-nav lb-prev" type="button" aria-label="Предыдущее фото">‹</button><img alt=""><button class="lb-nav lb-next" type="button" aria-label="Следующее фото">›</button><div class="lb-count"></div>';
  document.body.append(lb);
  const img = lb.querySelector("img");
  let i = 0;
  const show = (n) => {
    i = (n + links.length) % links.length;
    img.src = links[i].dataset.full;
    img.alt = links[i].querySelector("img").alt;
    lb.querySelector(".lb-count").textContent = `${i + 1} / ${links.length}`;
  };
  const close = () => { lb.classList.remove("open"); document.body.classList.remove("no-scroll"); links[i].focus(); };
  links.forEach((b, n) => b.addEventListener("click", () => { show(n); lb.classList.add("open"); document.body.classList.add("no-scroll"); lb.querySelector(".modal-close").focus(); }));
  lb.querySelector(".modal-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(i - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(i + 1));
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(i - 1);
    if (e.key === "ArrowRight") show(i + 1);
  });
  let x0 = null;
  lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

renderHeader();
renderFooter();
decorate();
document.querySelectorAll("[data-gallery]").forEach(lightbox);
reveal();

// Ссылка вида zanyatiya.html#ps: браузер прыгает к якорю до того, как скрипты дорисовали страницу, — прокручиваем ещё раз.
if (location.hash.length > 1) {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) addEventListener("load", () => target.scrollIntoView({ behavior: "instant", block: "start" }));
}

// Рамка «Спецпредложение»: гирлянда тёплых лампочек с листочками по периметру + гуашевая лаванда в нижних углах.
// Перерисовывается при изменении размера рамки, чтобы шаг лампочек был ровным на любой ширине.
// Рисует в svg гирлянду (провод, лампочки, листочки) вдоль контура d размером w×h; closed — контур замкнут.
function drawGarland(svg, d, w, h, closed) {
  const NS = "http://www.w3.org/2000/svg", f = (n) => n.toFixed(1);
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  const guide = document.createElementNS(NS, "path");
  guide.setAttribute("d", d);
  guide.setAttribute("fill", "none");
  svg.replaceChildren(guide);
  // Длинный открытый путь режем на отрезки (каждая Q/C/L — свой path): getPointAtLength на одном длинном пути
  // очень медленный, на гирлянде каталога МК это было ~4,5 с при открытии страницы.
  const parts = [], starts = [];
  if (!closed && !/[AHVSTZ]/i.test(d)) {
    const re = /([MQCL])([^MQCL]*)/g;
    let m, last = null, acc = 0;
    while ((m = re.exec(d))) {
      const n = m[2].trim().split(/[\s,]+/).map(Number);
      if (m[1] !== "M" && last) {
        const p = document.createElementNS(NS, "path");
        p.setAttribute("d", `M${last[0]} ${last[1]}${m[1]}${n.join(" ")}`);
        svg.append(p);
        parts.push(p); starts.push(acc); acc += p.getTotalLength();
      }
      last = n.slice(-2);
    }
    starts.push(acc);
  }
  const L = parts.length ? starts[parts.length] : guide.getTotalLength();
  const pointAt = (s) => {
    if (!parts.length) return guide.getPointAtLength(s);
    let lo = 0, hi = parts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= s) lo = mid; else hi = mid - 1; }
    return parts[lo].getPointAtLength(s - starts[lo]);
  };
  const wrap = (s) => closed ? ((s % L) + L) % L : Math.max(0, Math.min(L, s));
  // точка на контуре и нормаль (ось y вниз)
  const at = (s) => {
    const p = pointAt(wrap(s)), q = pointAt(wrap(s + 1));
    const n = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    return { x: p.x, y: p.y, tx: (q.x - p.x) / n, ty: (q.y - p.y) / n, nx: -(q.y - p.y) / n, ny: (q.x - p.x) / n };
  };
  const wave = (s) => Math.sin((s / 40) * Math.PI) * 3; // провод слегка провисает волной
  let wire = "";
  for (let s = 0; s <= L; s += 4) { const p = at(s), o = wave(s); wire += `${s ? "L" : "M"}${f(p.x + p.nx * o)} ${f(p.y + p.ny * o)}`; }
  const count = Math.max(1, Math.round(L / 44)), step = L / count;
  let leaves = "", bulbs = "";
  for (let i = 0; i < count + (closed ? 0 : 1); i++) {
    const s = i * step, p = at(s), o = wave(s), x = p.x + p.nx * o, y = p.y + p.ny * o;
    bulbs += `<g class="gf-light" style="animation-delay:${f((i * 0.53) % 3.2)}s"><circle cx="${f(x)}" cy="${f(y)}" r="12" fill="url(#gf-glow)"/><circle class="gf-bulb" cx="${f(x)}" cy="${f(y)}" r="4.6"/></g>`;
    if (!closed && i === count) break;
    // два листочка между лампочками, по разные стороны провода
    for (const [k, side] of [[0.38, 1], [0.62, -1]]) {
      const sl = s + step * k, q = at(sl), qo = wave(sl), lx = q.x + q.nx * (qo + side * 4), ly = q.y + q.ny * (qo + side * 4);
      const ang = (Math.atan2(q.ty, q.tx) * 180) / Math.PI + side * 30;
      leaves += `<ellipse class="gf-leaf${(i + (side > 0 ? 0 : 1)) % 2 ? " light" : ""}" cx="${f(lx)}" cy="${f(ly)}" rx="6.5" ry="2.8" transform="rotate(${f(ang)} ${f(lx)} ${f(ly)})"/>`;
    }
  }
  svg.innerHTML = `<defs><radialGradient id="gf-glow"><stop offset="0" stop-color="#FFC24A" stop-opacity=".8"/><stop offset="1" stop-color="#F28A2E" stop-opacity="0"/></radialGradient></defs><path class="gf-wire" d="${wire}${closed ? "Z" : ""}"/>${leaves}${bulbs}`;
}

function garlandFrame(box) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "garland-frame");
  svg.setAttribute("aria-hidden", "true");
  box.prepend(svg);
  box.insertAdjacentHTML("beforeend", '<img class="lav-corner l" src="img/art/lav-corner-l.png" alt=""><img class="lav-corner r" src="img/art/lav-corner-r.png" alt="">');
  const draw = () => {
    const w = box.offsetWidth, h = box.offsetHeight, m = 6, r = 30;
    if (!w || !h) return;
    drawGarland(svg, `M${m + r} ${m}H${w - m - r}A${r} ${r} 0 0 1 ${w - m} ${m + r}V${h - m - r}A${r} ${r} 0 0 1 ${w - m - r} ${h - m}H${m + r}A${r} ${r} 0 0 1 ${m} ${h - m - r}V${m + r}A${r} ${r} 0 0 1 ${m + r} ${m}Z`, w, h, true);
  };
  draw();
  new ResizeObserver(draw).observe(box);
}
document.querySelectorAll(".special").forEach(garlandFrame);

// Чёрный кот и монетки в блоке тарифов (две карточки).
// Монетки лежат у одной карточки; из-под неё высовывается чёрная лапка, утаскивает монетку,
// кот выглядывает из-за края карточки, а монетка появляется у другой карточки.
// Когда у карточки монеток не осталось, кот переходит к другой — и так по кругу.
// На узких экранах рядом с карточками нет места — анимация выключена.
// Голова чёрного кота (viewBox 0 0 100 96, смотрит влево) — общая для кота в тарифах и котёнка в каталоге МК.
const CAT_HEAD = '<path d="M16 44L10 2l36 22z" fill="#17171C"/><path d="M84 44l6-42-36 22z" fill="#17171C"/><path d="M20 36L16 11l22 13z" fill="#E8C496"/><path d="M80 36l4-25-22 13z" fill="#E8C496"/><path d="M8 56C8 30 28 18 50 18S92 30 92 56 74 92 50 92 8 80 8 56z" fill="#17171C"/><path d="M40 24l3 7M50 22v8M60 24l-3 7" stroke="#2C2C34" stroke-width="1.4" stroke-linecap="round"/><g stroke="#9A9AA5" stroke-width=".9" stroke-linecap="round" fill="none"><path d="M36 72L-8 66M36 74L-8 75M37 76L-4 84M64 72l44-6M64 74l44 1M63 76l41 8"/></g><circle cx="32" cy="54" r="14" fill="#F4C842" stroke="#0B0B0E" stroke-width="2.5"/><circle cx="68" cy="54" r="14" fill="#F4C842" stroke="#0B0B0E" stroke-width="2.5"/><circle cx="29" cy="55" r="9" fill="#0B0B0E"/><circle cx="65" cy="55" r="9" fill="#0B0B0E"/><circle cx="33" cy="50" r="3.2" fill="#fff"/><circle cx="69" cy="50" r="3.2" fill="#fff"/><circle cx="26" cy="59" r="1.4" fill="#fff"/><circle cx="62" cy="59" r="1.4" fill="#fff"/><path d="M45 68Q50 65 55 68L50 73z" fill="#C77B6E"/><path d="M50 73Q47 78 43 76M50 73Q53 78 57 76" stroke="#0B0B0E" stroke-width="1.4" fill="none" stroke-linecap="round"/>';

function catPaw(grid) {
  const cards = [...grid.querySelectorAll(":scope > .tariff")];
  if (cards.length < 2) return;
  const layer = document.createElement("div");
  layer.className = "paw-layer";
  layer.setAttribute("aria-hidden", "true");
  grid.prepend(layer);
  const COIN = '<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="13.5" fill="#F2C14E" stroke="#9A6B1E" stroke-width="1.5"/><circle cx="15" cy="15" r="9.5" fill="none" stroke="#C9922F" stroke-width="1.2"/><text x="15" y="20" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="13" fill="#8A5A12">₽</text><path d="M8 10a9 9 0 0 1 6-4" stroke="#FFF1C4" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
  // чёрная лапа — вырезана из картинки-образца (img/art/cat-paw.png); рука продлевается полосой .fur
  const PAW = '<img src="img/art/cat-paw.png" alt="">';
  // голова чёрного кота смотрит влево (для правой карточки отражается)
  const CAT = `<svg viewBox="0 0 100 96">${CAT_HEAD}</svg>`;
  const arm = document.createElement("div");
  arm.className = "paw-arm";
  arm.innerHTML = '<div class="fur"></div>' + PAW;
  arm.style.visibility = "hidden";
  const cat = document.createElement("div");
  cat.className = "peek-cat";
  cat.innerHTML = CAT;
  cat.style.visibility = "hidden";
  layer.append(arm, cat);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // места для монеток у карточки: [x, y, откуда тянется лапка] — сбоку снаружи и под карточкой.
  // Для правой карточки места зеркальные, поэтому монеток у обеих поровну.
  const spots = () => {
    const c = cards[0], w = c.offsetWidth, h = c.offsetHeight, room = c.getBoundingClientRect().left;
    const s = [[w * 0.2, h + 44, "down"], [w * 0.58, h + 38, "down"]];
    if (room > 150) s.push([-62, h * 0.3, "side"], [-116, h * 0.72, "side"]);
    else if (room > 80) s.push([-46, h * 0.55, "side"]);
    return s;
  };
  const spotXY = (ci, i) => {
    const c = cards[ci], [x, y, dir] = spots()[i];
    return { x: c.offsetLeft + (ci ? c.offsetWidth - x : x), y: c.offsetTop + y, dir };
  };

  async function grab(ci, coin) {
    const c = cards[ci], { x: cx, y: cy, dir } = spotXY(ci, coin.spot);
    // точка, откуда растёт лапка, — под карточкой, в 40px от края
    const ox = dir === "side" ? c.offsetLeft + (ci ? c.offsetWidth - 40 : 40) : cx;
    const oy = dir === "side" ? cy : c.offsetTop + c.offsetHeight - 40;
    const dist = Math.hypot(cx - ox, cy - oy), ang = (Math.atan2(cy - oy, cx - ox) * 180) / Math.PI;
    const W = dist + 16; // пальцы ложатся на монетку
    Object.assign(arm.style, { left: ox + "px", top: oy + "px", width: W + "px", visibility: "visible" });
    const at = (t) => ({ transform: `rotate(${ang}deg) translateX(${t}px)` });
    await arm.animate([at(-W), at(0)], { duration: 900, easing: "cubic-bezier(.3,.7,.4,1)", fill: "forwards" }).finished;
    await arm.animate([at(0), at(-4), at(0)], { duration: 380, fill: "forwards" }).finished; // прихлопнула
    const back = { duration: 750, easing: "ease-in", fill: "forwards" };
    coin.el.animate([{ transform: "translate(0,0)" }, { transform: `translate(${ox - cx}px, ${oy - cy}px)` }], back);
    await arm.animate([at(0), at(-W)], back).finished;
    coin.el.style.visibility = "hidden";
    arm.style.visibility = "hidden";
  }

  // кот выглядывает из-за внешнего края карточки, наклоняет голову и прячется
  async function peek(ci) {
    const c = cards[ci], size = 74, out = ci ? 1 : -1;
    const left = ci ? c.offsetLeft + c.offsetWidth - size + 14 : c.offsetLeft - 14;
    Object.assign(cat.style, { left: left + "px", top: c.offsetTop + c.offsetHeight * 0.42 - size / 2 + "px", width: size + "px", visibility: "visible" });
    const flip = ci ? " scaleX(-1)" : "";
    const pos = (t, r) => ({ transform: `translateX(${t * out}px) rotate(${r * out}deg)${flip}` });
    await cat.animate([pos(0, 0), pos(size * 0.62, -8)], { duration: 600, easing: "cubic-bezier(.3,.7,.4,1)", fill: "forwards" }).finished;
    await cat.animate([pos(size * 0.62, -8), pos(size * 0.62, 6), pos(size * 0.62, -8)], { duration: 1300, easing: "ease-in-out", fill: "forwards" }).finished;
    await cat.animate([pos(size * 0.62, -8), pos(0, 0)], { duration: 450, easing: "ease-in", fill: "forwards" }).finished;
    cat.style.visibility = "hidden";
  }

  // монетка ставится на своё место у карточки coin.at и «выпрыгивает»
  const put = (coin) => {
    const { x, y } = spotXY(coin.at, coin.spot);
    Object.assign(coin.el.style, { left: x + "px", top: y + "px", visibility: "visible" });
    coin.el.getAnimations().forEach((a) => a.cancel());
    coin.el.classList.remove("pop");
    void coin.el.offsetWidth;
    coin.el.classList.add("pop");
  };

  let coins = [];
  const spawn = () => {
    layer.querySelectorAll(".paw-coin").forEach((e) => e.remove());
    coins = spots().map((_, spot) => {
      const el = document.createElement("div");
      el.className = "paw-coin";
      el.innerHTML = COIN;
      layer.append(el);
      return { el, spot, at: 0 };
    });
    coins.forEach(put);
  };
  addEventListener("resize", () => coins.forEach((c) => c.el.style.visibility !== "hidden" && put(c)));

  (async () => {
    let active = 0, layout = "";
    for (;;) {
      if (innerWidth < 900) { layer.hidden = true; layout = ""; await wait(2000); continue; }
      layer.hidden = false;
      // при первом запуске и после смены числа мест монетки раскладываются заново у левой карточки
      if (layout !== String(spots().length)) { layout = String(spots().length); spawn(); active = 0; await wait(1500); }
      for (const coin of coins.filter((c) => c.at === active).sort(() => Math.random() - 0.5)) {
        if (innerWidth < 900 || layout !== String(spots().length)) break;
        await grab(active, coin);
        await peek(active);
        coin.at = 1 - active;
        put(coin);
        await wait(1200 + Math.random() * 1400);
      }
      if (coins.every((c) => c.at !== active)) active = 1 - active; // здесь пусто — кот идёт к другой карточке
    }
  })();
}
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) document.querySelectorAll("[data-cat-paw]").forEach(catPaw);

// Сова на первом экране следит за курсором (или пальцем): наклоняет голову и водит зрачками
const owlEyes = [...document.querySelectorAll(".owl-eye")];
const owlHead = document.querySelector(".owl-head"), owlFace = document.querySelector(".owl-face");
if (owlEyes.length) {
  let frame = 0, px = 0, py = 0;
  const look = () => {
    frame = 0;
    if (owlHead) {
      const r = owlHead.getBoundingClientRect(), dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      const k = Math.max(-1, Math.min(1, dx / 500)), v = Math.max(-1, Math.min(1, dy / 600));
      // поворот головы вокруг шеи: мордочка уезжает вбок и чуть склоняется;
      // перспектива слабая (14°), чтобы клюв и глаза не сплющивались.
      // Мордочка на рисунке и так сидит левее центра головы, поэтому влево она уезжает меньше — иначе глаз упрётся в край
      const shift = k < 0 ? k * 6 : k * 13;
      owlFace.style.transform = `perspective(420px) translate(${shift}%, ${v * 3}%) rotateY(${k * 14}deg) rotate(${k * -3}deg)`;
    }
    owlEyes.forEach((eye) => {
      const r = eye.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 160) * 17; // сдвиг зрачка до 17% его размера
      eye.firstElementChild.style.setProperty("--px", (dx / d) * k + "%");
      eye.firstElementChild.style.setProperty("--py", (dy / d) * k + "%");
    });
  };
  addEventListener("pointermove", (e) => {
    px = e.clientX; py = e.clientY;
    if (!frame) frame = requestAnimationFrame(look);
  }, { passive: true });
}
