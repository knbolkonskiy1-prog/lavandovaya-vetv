// Каталог мастер-классов: фильтр по группам и подробная карточка.
// Нужны data/mk.js, data/afisha.js, js/main.js, js/booking.js.

const priceLabel = (m) => m.price == null ? "Цена [уточнить]" : (m.variants?.some((v) => v.price !== m.price) ? "от " : "") + rub(m.price);
const cover = (m, cls) => m.cover
  ? `<img class="${cls}" src="${m.cover}" alt="" loading="lazy">`
  : `<div class="no-img">${esc(m.title)}</div>`;

function mkCard(m) {
  return `
    <article class="card">
      <button class="card-link" type="button" data-mk="${m.id}" aria-label="${esc(m.title)}: подробнее">
        ${cover(m, "card-img")}
        <div class="card-body">
          <span class="tag">${MK_GROUPS[m.group]}</span>
          <h3>${esc(m.title)}</h3>
          <div class="price">${fill(priceLabel(m))}</div>
          <div class="small muted">${fill(m.duration)}</div>
        </div>
      </button>
    </article>`;
}

function mkDetail(m) {
  const dates = upcomingFor(m.id);
  const list = (title, items) => items?.length ? `<h3>${title}</h3><ul class="list-check">${items.map((x) => `<li>${fill(x)}</li>`).join("")}</ul>` : "";
  const box = openModal(`
    <div class="mk-detail">
      ${cover(m, "mk-cover")}
      <h2>${esc(m.title)}</h2>
      <p class="price">${fill(priceLabel(m))} <span class="muted small">с человека · ${fill(m.duration)}</span></p>
      ${m.variants ? `<div class="tbl-wrap"><table class="tbl"><tr><th>Вариант</th><th>Цена</th></tr>${m.variants.map((v) => `<tr><td>${esc(v.name)}</td><td>${rub(v.price)}</td></tr>`).join("")}</table></div>` : ""}
      <p style="margin-top:14px">${fill(m.about)}</p>
      ${list("Что делаем", m.does)}
      ${list("Что входит", m.includes)}
      ${m.result ? `<h3>Результат</h3><p>${fill(m.result)}</p>` : ""}
      ${m.forWho ? `<h3>Для кого</h3><p>${fill(m.forWho)}</p>` : ""}
      <h3>Дети до 10 лет</h3><p>${fill(m.kids)}</p>
      <h3>Ближайшие даты</h3>
      ${dates.length
        ? `<div class="dates">${dates.map((ev) => `<div class="date-row"><span><b>${dayLabel(ev.date)}, ${ev.time}</b><br><span class="small muted">${priceText(ev.price)} ·${seatsText(seatsLeft(ev))}</span></span>${seatsLeft(ev) ? `<button class="btn btn-small" data-book="${esc(evId(ev))}">Записаться</button>` : '<button class="btn btn-small is-disabled" disabled>Мест нет</button>'}</div>`).join("")}</div>`
        : `<p class="muted">Пока нет дат в афише.</p><button class="btn btn-block" type="button" data-want="${m.id}">Хочу на этот МК</button>`}
      <div class="plate peach" style="margin-top:18px"><b>Можно заказать на праздник.</b> Мастер-класс входит в «Уютные наборы» №1 и №3. <a href="prazdniki.html">Праздники →</a></div>
      ${m.link ? `<p class="small" style="margin-top:12px"><a href="${m.link}" target="_blank" rel="noopener">Описание в группе ВК ↗</a></p>` : ""}
    </div>`);
  box.querySelector("[data-want]")?.addEventListener("click", () => wantMk(m));
}

// Карточки сетки по рядам: [{ top, cards }]
function cardRows(grid) {
  const rows = [];
  for (const c of grid.children) {
    const row = rows.find((r) => Math.abs(r.top - c.offsetTop) < 4);
    row ? row.cards.push(c) : rows.push({ top: c.offsetTop, cards: [c] });
  }
  return rows;
}

// Что несёт светлячок: чаще кисточку (за ручку, ворсом вверх), иногда баночку краски, банку варенья или катушку ниток.
// Предметы вырезаны из картинки шапки (img/art/mk-scene.jpg) в img/art/fly-*.png; точка подвеса — под светлячком (0, 6).
const flyImg = (name, x, y, w, h) => `<image href="img/art/fly-${name}.png" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
const flyHang = (name, w, h) => `<path d="M0 6V13" stroke="#330C4B" stroke-width="1.2"/>${flyImg(name, -w / 2, 12, w, h)}`;
const FLY_PROPS = {
  brush: flyImg("brush", -24, -68, 33, 72), // ручка внизу справа картинки — у лапок светлячка
  paint: flyHang("paint", 30, 44),
  jam: flyHang("jam", 40, 48),
  spool: flyHang("spool", 28, 44),
};
const firefly = (prop) => `<svg viewBox="-40 -24 80 110"><defs><radialGradient id="ff-glow"><stop offset="0" stop-color="#FFE9A0" stop-opacity=".95"/><stop offset=".45" stop-color="#FFC24A" stop-opacity=".45"/><stop offset="1" stop-color="#F28A2E" stop-opacity="0"/></radialGradient></defs><circle cx="4" cy="1" r="20" fill="url(#ff-glow)" class="ff-glow"/><g class="ff-prop">${FLY_PROPS[prop]}</g><ellipse class="ff-wing" cx="0" cy="-6" rx="7" ry="3.6" fill="#EEF4FF" opacity=".75"/><ellipse cx="6" cy="1" rx="7" ry="4.8" fill="#FFE37A"/><ellipse cx="-3" cy="0" rx="5.5" ry="4.2" fill="#3A2A3A"/><circle cx="-9" cy="-1" r="3" fill="#3A2A3A"/><path d="M-10 -3Q-14 -9 -17 -8M-9 -3Q-11 -10 -14 -11" stroke="#3A2A3A" stroke-width=".9" fill="none"/><ellipse class="ff-wing" cx="3" cy="-7" rx="7" ry="3.6" fill="#FFFFFF" opacity=".6"/></svg>`;

// Раз в 10 секунд, пока каталог на экране: светлячок с предметом пролетает над рядом карточек.
function fireflyPlay(wrap, grid) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  wrap.insertAdjacentHTML("beforeend", `<div class="mk-play" aria-hidden="true"><div class="mk-fly"></div></div>`);
  const fly = wrap.querySelector(".mk-fly");
  const OX = 16, OY = 90; // сдвиг слоя .mk-play относительно сетки (см. CSS)
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let count = 0;

  async function scene() {
    // ряд, верхний край которого сейчас в середине экрана (над первым рядом места нет)
    const gt = grid.getBoundingClientRect().top;
    const rows = cardRows(grid).slice(1).filter((r) => gt + r.top > innerHeight * 0.2 && gt + r.top < innerHeight * 0.85);
    if (!rows.length) return false;
    const row = rows[Math.floor(Math.random() * rows.length)];
    const W = grid.offsetWidth, dir = Math.random() < 0.5 ? 1 : -1;
    const flyY = row.top - (W < 560 ? 70 : 90), vf = W < 560 ? 0.12 : 0.19; // px/мс
    const x0 = dir > 0 ? -40 : W + 40, T = (W + 80) / vf;
    const fw = fly.offsetWidth / 2, fh = (fly.offsetWidth * 24) / 80; // точка светлячка (0, 0) внутри картинки
    const fpose = (t) => ({
      opacity: Math.max(0, Math.min(1, t / 300, (T - t) / 300)),
      transform: `translate(${(x0 + dir * vf * t - fw + OX).toFixed(1)}px, ${(flyY + Math.sin(t / 320) * 12 - fh + OY).toFixed(1)}px) scaleX(${dir > 0 ? -1 : 1})`,
    });
    const frames = Array.from({ length: Math.ceil(T / 40) + 1 }, (_, i) => fpose(Math.min(T, i * 40)));
    const prop = count++ === 0 || Math.random() < 0.5 ? "brush" : ["paint", "jam", "spool"][Math.floor(Math.random() * 3)];
    fly.innerHTML = firefly(prop);
    fly.getAnimations().forEach((a) => a.cancel()); // прошлая сцена держит последний кадр (fill)
    fly.style.visibility = "visible";
    fly.animate(frames, { duration: T, fill: "forwards" });
    await wait(T);
    fly.style.visibility = "hidden";
    return true;
  }

  (async () => {
    for (;;) {
      const t0 = Date.now();
      // scene() сама проверяет, что подходящий ряд карточек сейчас на экране
      const played = !document.hidden && grid.children.length && (await scene());
      await wait(played ? Math.max(1000, 10000 - (Date.now() - t0)) : 1000);
    }
  })();
}

function initCatalog(root) {
  let group = "all";
  root.innerHTML = `
    <div class="chips" role="group" aria-label="Группы мастер-классов">
      <button class="chip" data-group="all" aria-pressed="true">Все</button>
      ${Object.entries(MK_GROUPS).map(([id, name]) => `<button class="chip" data-group="${id}" aria-pressed="false">${name}</button>`).join("")}
    </div>
    <div class="mk-garland-wrap"><svg class="mk-garland" aria-hidden="true"></svg><div class="grid-cards" id="mk-cards" aria-live="polite"></div></div>`;
  const grid = root.querySelector("#mk-cards"), svg = root.querySelector(".mk-garland");
  // Гирлянда змейкой: провисает над каждым рядом карточек и спускается к следующему ряду по краю сетки.
  const garland = () => {
    const W = grid.offsetWidth, H = grid.offsetHeight, rows = cardRows(grid);
    if (!W || !H) return;
    const sag = 20, bow = 8;
    let d = "", tacks = "";
    rows.forEach((r, i) => {
      const y = r.top - 6;
      // точки крепления: края сетки и кнопки в середине верха каждой карточки (карточки приколоты к пробковой доске)
      const mids = r.cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
      const pins = [0, ...mids, W];
      if (i % 2) pins.reverse();
      if (!i) d = `M${pins[0]} ${y}`;
      else { const x = pins[0], py = rows[i - 1].top - 6, out = x ? bow : -bow; d += `C${x + out} ${py + 60} ${x + out} ${y - 60} ${x} ${y}`; }
      for (let k = 1; k < pins.length; k++) d += `Q${(pins[k - 1] + pins[k]) / 2} ${y + sag * 2} ${pins[k]} ${y}`;
      tacks += mids.map((x) => `<g transform="translate(${x} ${y + 4})"><ellipse cx="2" cy="5" rx="9" ry="4" fill="rgba(42,10,31,.35)"/><circle r="9" fill="url(#tack)" stroke="#2A0A1F" stroke-width="1.5"/><circle cx="-3" cy="-3" r="2.6" fill="#fff" opacity=".7"/></g>`).join("");
    });
    drawGarland(svg, d, W, H, false);
    // кнопки поверх провода — гирлянда висит на них
    svg.insertAdjacentHTML("beforeend", `<defs><radialGradient id="tack" cx=".35" cy=".35"><stop offset="0" stop-color="#C79BE0"/><stop offset=".6" stop-color="#8E4FB8"/><stop offset="1" stop-color="#5A2A7E"/></radialGradient></defs>${tacks}`);
  };
  new ResizeObserver(garland).observe(grid);
  const draw = () => {
    // shortcut: МК без обложки временно в конце списка; убрать сортировку, когда будут все обложки
    grid.innerHTML = MK.filter((m) => group === "all" || m.group === group).sort((a, b) => !a.cover - !b.cover).map(mkCard).join("");
    root.querySelectorAll("[data-group]").forEach((c) => c.setAttribute("aria-pressed", c.dataset.group === group));
    garland();
  };
  root.addEventListener("click", (e) => {
    const g = e.target.closest("[data-group]");
    if (g) { group = g.dataset.group; draw(); }
    const c = e.target.closest("[data-mk]");
    if (c) mkDetail(MK.find((m) => m.id === c.dataset.mk));
  });
  draw();
  const wrap = root.querySelector(".mk-garland-wrap");
  fireflyPlay(wrap, grid);

  // Кнопка «Каталог» в окне: плавно листает к каталогу, а карточки «волшебно» слетаются в ряды
  // из точки над каталогом, с искорками там, где карточка встала; потом проявляется гирлянда.
  const spark = (c) => {
    const s = document.createElement("div");
    s.className = "mk-spark";
    s.style.cssText = `left:${c.offsetLeft + c.offsetWidth / 2}px;top:${c.offsetTop}px`;
    wrap.append(s);
    for (let k = 0; k < 7; k++) {
      const i = document.createElement("i"), a = (k / 7) * Math.PI * 2 + Math.random(), d = 26 + Math.random() * 30;
      s.append(i);
      i.animate([{ transform: "translate(-50%,-50%) scale(0)", opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(1) rotate(90deg)`, opacity: 0 }], { duration: 700, easing: "ease-out" });
    }
    setTimeout(() => s.remove(), 750);
  };
  const assemble = () => {
    const cards = [...grid.children], g = grid.getBoundingClientRect();
    const ox = g.left + g.width / 2, oy = Math.max(g.top, 0) - 60; // точка «из окна» над каталогом
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect(), dx = ox - (r.left + r.width / 2), dy = oy - (r.top + r.height / 2);
      const rot = (Math.random() - 0.5) * 60, delay = i * 70;
      c.style.opacity = "";
      c.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(.12) rotate(${rot}deg)`, opacity: 0, filter: "blur(6px)" },
        { transform: `translate(${dx * 0.2}px, ${dy * 0.2 - 30}px) scale(.85) rotate(${-rot / 4}deg)`, opacity: 1, filter: "blur(1px)", offset: 0.65 },
        { transform: "none", opacity: 1, filter: "none" },
      ], { duration: 950, delay, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
      setTimeout(() => spark(c), delay + 900);
    });
    svg.style.opacity = "";
    svg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: cards.length * 70 + 700, fill: "backwards" });
  };
  document.querySelector(".mk-window-btn")?.addEventListener("click", (e) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // обычный переход по якорю
    e.preventDefault();
    [...grid.children].forEach((c) => { c.style.opacity = "0"; });
    svg.style.opacity = "0";
    root.closest("section").scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#katalog");
    // ждём окончания прокрутки (scrollend есть не во всех браузерах — запасной таймер)
    let done = false;
    const go = () => { if (done) return; done = true; removeEventListener("scrollend", go); assemble(); };
    addEventListener("scrollend", go);
    setTimeout(go, 1100);
  });
  // Ссылка вида mk.html#mylo сразу открывает нужный МК.
  const fromHash = MK.find((m) => m.id === location.hash.slice(1));
  if (fromHash) mkDetail(fromHash);
}

document.querySelectorAll("[data-catalog]").forEach(initCatalog);
