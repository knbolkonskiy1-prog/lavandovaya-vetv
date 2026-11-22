// Афиша «Дневник-расписание», окно записи и оплата-заглушка.
// Нужны data/afisha.js, data/mk.js и js/main.js.
// Демо: занятые места хранятся только в этом браузере (localStorage), никуда не отправляются.

const STORE_KEY = "lv-demo-booked";
const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const MONTHS_NOM = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const MONTHS_IN = ["январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре"];
// цена события: число или null («цена уточняется» — тогда запись через ВК)
const priceText = (p) => (p == null ? "цена уточняется" : rub(p));
const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const DAYS_FULL = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

const mkById = (id) => MK.find((m) => m.id === id);
const evId = (ev) => `${ev.date}-${ev.time}-${ev.mk || ev.title}`;
const parseDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const dayLabel = (s) => { const d = parseDate(s); return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayStr = () => isoDate(new Date());
const isPast = (ev) => ev.date < todayStr();
const byTime = (a, b) => (a.date + a.time).localeCompare(b.date + b.time);

function loadBooked() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
}
function saveBooked(map) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(map)); } catch { /* приватный режим: места не сохранятся */ }
}
const seatsLeft = (ev) => Math.max(0, ev.seats - (loadBooked()[evId(ev)] || 0));

// Сумма: участники по полной цене + каждый ребёнок до 10 лет (100%) со взрослым (50%).
const calcTotal = (price, people, kids) => price * people + price * kids + Math.round(price * kids * 0.5);
console.assert(calcTotal(550, 0, 1) === 825, "мыловарение: ребёнок + взрослый = 825 ₽");
console.assert(calcTotal(750, 2, 0) === 1500, "двое взрослых на роспись = 1500 ₽");

const placesWord = (n) => (n % 10 === 1 && n % 100 !== 11 ? "место" : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "места" : "мест");
function seatsText(left) {
  return left === 0 ? "Мест нет" : `осталось ${left} ${placesWord(left)}`;
}

// «сегодня», «завтра», «через 3 дня»
function whenText(dateStr) {
  const t = parseDate(todayStr());
  const n = Math.round((parseDate(dateStr) - t) / 864e5);
  if (n === 0) return "сегодня";
  if (n === 1) return "завтра";
  if (n === 2) return "послезавтра";
  return `через ${n} ${n % 10 === 1 && n % 100 !== 11 ? "день" : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "дня" : "дней"}`;
}

function bookButton(ev, left) {
  if (ev.price == null) return `<a class="btn btn-small" href="${SITE.vk}" target="_blank" rel="noopener">Записаться в ВК</a>`;
  return left === 0
    ? '<button class="btn btn-small is-disabled" disabled>Мест нет</button>'
    : `<button class="btn btn-small" data-book="${esc(evId(ev))}">Записаться</button>`;
}

// Мастер-класс — строка с обложкой на «скотче»; мероприятие — билет с корешком.
function eventRow(ev) {
  const mk = mkById(ev.mk);
  const left = seatsLeft(ev);
  const low = left > 0 && left <= 2;
  const seats = left === 0 ? "мест нет" : `свободно ${left} из ${ev.seats}`;
  if (!mk) {
    const d = parseDate(ev.date);
    return `
      <article class="ticket${low ? " has-sticker" : ""}">
        <div class="main">
          <span class="label">мероприятие</span>
          <h3 style="margin:4px 0">${esc(ev.title)}</h3>
          <div class="ev-meta">${ev.time} · ${priceText(ev.price)} · ${seats}</div>
          <div style="margin-top:10px">${bookButton(ev, left)}</div>
        </div>
        <div class="stub" aria-hidden="true"><span><b>${d.getDate()}</b>${MONTHS[d.getMonth()]}</span></div>
        ${low ? `<span class="sticker" style="top:8px;right:102px" aria-label="${seatsText(left)}"><span><b>${left}</b>${placesWord(left)}</span></span>` : ""}
      </article>`;
  }
  return `
    <article class="ev-row${low ? " has-sticker" : ""}">
      <a class="cover" href="mk.html#${mk.id}" aria-label="${esc(mk.title)}: описание">${mk.cover ? `<img src="${mk.cover}" alt="" loading="lazy">` : `<div class="no-img">${esc(mk.title)}</div>`}</a>
      <div>
        <div class="ev-time">${ev.time}${mk.duration && !mk.duration.includes("[") ? ` · ${mk.duration}` : ""}</div>
        <h3>${esc(ev.title)}</h3>
        <div class="ev-meta">${priceText(ev.price)} · ${seats}</div>
      </div>
      <div class="act">${bookButton(ev, left)}</div>
      ${low ? `<span class="sticker" aria-label="${seatsText(left)}"><span><b>${left}</b>${placesWord(left)}</span></span>` : ""}
    </article>`;
}

// ---------- Блок «Афиша» на главной ----------
function initAfisha(root) {
  let type = "all";
  let selected = null; // выбранный день; по умолчанию — ближайший с событиями
  root.innerHTML = `
    <div class="diary">
      <aside class="cal plate paper" aria-hidden="true"></aside>
      <div>
        <div class="chips" role="group" aria-label="Тип событий">
          <button class="chip" data-type="all" aria-pressed="true">Все</button>
          <button class="chip" data-type="mk" aria-pressed="false">Мастер-классы</button>
          <button class="chip" data-type="event" aria-pressed="false">Мероприятия</button>
        </div>
        <div class="days"><div class="chips" role="group" aria-label="Дни"></div></div>
        <div class="diary-list" aria-live="polite"></div>
        <details class="was">
          <summary></summary>
          <div class="polaroids"></div>
        </details>
      </div>
    </div>`;

  const T = todayStr();
  const match = (ev) => type === "all" || (type === "mk" ? ev.mk : !ev.mk);

  const draw = () => {
    const future = AFISHA.filter((ev) => ev.date >= T && match(ev)).sort(byTime);
    const past = AFISHA.filter((ev) => ev.date < T && match(ev)).sort(byTime);
    const dates = [...new Set(future.map((ev) => ev.date))];
    if (!dates.includes(selected)) selected = dates[0] || null;

    // Лента дней: от сегодня (или от 1-го числа месяца афиши, если она ещё не началась) до последнего события, не меньше 14 дней
    const monthStart = dates.length ? dates[0].slice(0, 8) + "01" : T;
    const from = monthStart > T ? monthStart : T;
    const last = dates.length ? parseDate(dates[dates.length - 1]) : new Date();
    const span = Math.max(14, Math.round((last - parseDate(from)) / 864e5) + 1);
    const strip = [...Array(span)].map((_, i) => { const d = parseDate(from); d.setDate(d.getDate() + i); return isoDate(d); });
    root.querySelector(".days .chips").innerHTML = strip.map((ds, i) => {
      const d = parseDate(ds);
      const has = dates.includes(ds);
      const today = ds === T;
      return `<button class="day-chip${today ? " today" : ""}${has ? "" : " empty"}" data-day="${ds}"${has ? ` aria-pressed="${ds === selected}"` : " disabled"}${today ? ' aria-current="date"' : ""} aria-label="${d.getDate()} ${MONTHS[d.getMonth()]}${has ? ", есть события" : ", событий нет"}">
        <small>${today ? "сегодня" : DAYS[d.getDay()].toLowerCase()}</small>${d.getDate()}${has ? '<span class="dot"></span>' : ""}</button>`;
    }).join("");

    // События только выбранного дня
    root.querySelector(".diary-list").innerHTML = selected
      ? (() => {
          const d = parseDate(selected);
          return `<h3 class="day-head">${DAYS_FULL[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} <small>${whenText(selected)}</small></h3>` +
            future.filter((ev) => ev.date === selected).map(eventRow).join("") +
            `<p class="small muted">Дни с событиями отмечены точкой — нажмите на дату, чтобы посмотреть.</p>`;
        })()
      : `<p class="empty">До конца месяца событий больше нет. Следите за афишей на следующий месяц в группе ВК.</p>`;

    // Заголовок «Афиша на …» — месяцы ближайших событий («октябрь и ноябрь», с 1 ноября — «ноябрь»)
    const title = root.closest("section")?.querySelector(".section-title h2");
    const months = [...new Set(AFISHA.filter((ev) => ev.date >= T).map((ev) => ev.date.slice(0, 7)))].sort().slice(0, 2);
    if (title) title.textContent = months.length ? `Афиша на ${months.map((m) => MONTHS_NOM[+m.slice(5) - 1]).join(" и ")}` : "Афиша";

    // «Было в этом месяце» — цветные полароиды прошедших событий текущего месяца
    const pastHere = past.filter((ev) => ev.date.slice(0, 7) === T.slice(0, 7));
    const was = root.querySelector(".was");
    was.hidden = pastHere.length === 0;
    was.querySelector("summary").textContent = `📷 Было в ${MONTHS_IN[parseDate(T).getMonth()]} · ${pastHere.length}`;
    was.querySelector(".polaroids").innerHTML = pastHere.map((ev) => {
      const mk = mkById(ev.mk), d = parseDate(ev.date);
      return `<div class="pol">${mk?.cover ? `<img src="${mk.cover}" alt="" loading="lazy">` : `<div class="no-img">${esc(ev.title)}</div>`}<small>${esc(ev.title.replace(/\s*\(.*\)/, ""))}<br>случилось ${d.getDate()} ${MONTHS[d.getMonth()]}</small></div>`;
    }).join("");

    // Мини-календарь (компьютер) — месяц выбранного дня
    const base = parseDate(selected || T);
    const first = new Date(base.getFullYear(), base.getMonth(), 1);
    const daysIn = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    let cells = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map((x) => `<b>${x}</b>`).join("") + "<span></span>".repeat((first.getDay() + 6) % 7);
    for (let i = 1; i <= daysIn; i++) {
      const ds = isoDate(new Date(base.getFullYear(), base.getMonth(), i));
      const cls = [AFISHA.some((ev) => ev.date === ds && match(ev)) && "ev", ds < T && "past", ds === T && "today", ds === selected && "sel"].filter(Boolean).join(" ");
      cells += dates.includes(ds) ? `<button class="${cls}" data-day="${ds}" tabindex="-1">${i}</button>` : `<span class="${cls}">${i}</span>`;
    }
    const monthName = MONTHS_NOM[base.getMonth()];
    root.querySelector(".cal").innerHTML = `<h3>${monthName[0].toUpperCase() + monthName.slice(1)}</h3><div class="cal-grid">${cells}</div><p class="small muted" style="margin:12px 0 0">● — есть события</p>`;

    root.querySelectorAll("[data-type]").forEach((c) => c.setAttribute("aria-pressed", c.dataset.type === type));
  };

  root.addEventListener("click", (e) => {
    const t = e.target.closest("[data-type]");
    if (t) { type = t.dataset.type; draw(); }
    const day = e.target.closest("[data-day]");
    if (day && !day.disabled) {
      selected = day.dataset.day;
      draw();
      root.querySelector(`.days [data-day="${selected}"]`)?.scrollIntoView({ inline: "nearest", block: "nearest" });
    }
  });
  draw();
  document.addEventListener("booked", draw);
}

// ---------- Окно записи ----------
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-book]");
  if (!b) return;
  const ev = AFISHA.find((x) => evId(x) === b.dataset.book);
  if (ev) bookEvent(ev);
});

function bookEvent(ev) {
  const mk = mkById(ev.mk);
  const left = seatsLeft(ev);
  // Изделие выбирают при записи, если у МК несколько вариантов (и у события оно не задано); цена — по варианту
  const choose = mk?.variants?.length > 1 && !ev.variant;
  const varied = choose && mk.variants.some((v) => v.price !== ev.price);
  const box = openModal(`
    <h2>Запись: ${esc(ev.title)}</h2>
    <p><b>${dayLabel(ev.date)}, ${ev.time}</b> · ${varied ? "от " : ""}${rub(ev.price)} с человека · <span class="muted">${seatsText(left)}</span></p>
    <form class="form" novalidate>
      ${NAME_PHONE}
      ${choose ? `<div class="field"><label for="f-var">Изделие</label><select id="f-var" required><option value="">Выберите</option>${mk.variants.map((v) => `<option value="${esc(v.name)}">${esc(v.name)} — ${rub(v.price)}</option>`).join("")}</select><p class="err">Выберите изделие</p></div>` : ""}
      ${ev.variant ? `<p class="small">Изделие: <b>${esc(ev.variant)}</b></p>` : ""}
      <div class="field">
        <span class="label">Участники (взрослые и дети от 10 лет)</span>
        <div class="stepper" data-step="people"><button type="button" aria-label="Меньше">−</button><output>1</output><button type="button" aria-label="Больше">+</button></div>
      </div>
      ${mk?.kids50 ? `
      <div class="field">
        <span class="label">Ребёнок до 10 лет + взрослый</span>
        <div class="stepper" data-step="kids"><button type="button" aria-label="Меньше">−</button><output>0</output><button type="button" aria-label="Больше">+</button></div>
        <p class="hint">Каждый ребёнок приходит со взрослым: ребёнок платит полную цену, взрослый — 50%. Пара занимает 2 места.</p>
      </div>` : ""}
      <p class="err" id="f-seats">Столько мест нет. Свободно: ${left}</p>
      <div class="total"><span>Итого</span><b id="f-total"></b></div>
      ${CONSENT("f-consent")}
      <p class="form-errors" id="f-errors" role="alert"></p>
      <button class="btn btn-block" type="submit" id="f-pay">Оплатить</button>
      ${DEMO_NOTE}
    </form>`);

  const form = box.querySelector("form");
  const count = { people: 1, kids: 0 };
  const payBtn = box.querySelector("#f-pay");
  const unitPrice = () => (choose && mk.variants.find((v) => v.name === form.querySelector("#f-var").value)?.price) || ev.price;
  const total = () => calcTotal(unitPrice(), count.people, count.kids);
  const seatsUsed = () => count.people + count.kids * 2;
  const formOk = () => form.querySelector("#f-name").value.trim() && form.querySelector("#f-phone").value.replace(/\D/g, "").length >= 10 &&
    form.querySelector("#f-consent").checked && (!choose || form.querySelector("#f-var").value) && seatsUsed() > 0 && seatsUsed() <= left;
  // Кнопка выглядит неактивной, пока форма не готова; нажатие подсказывает, что не так.
  const update = () => {
    box.querySelector("#f-total").textContent = rub(total());
    form.querySelectorAll(".stepper").forEach((s) => { s.querySelector("output").textContent = count[s.dataset.step]; });
    box.querySelector("#f-seats").style.display = seatsUsed() > left ? "block" : "none";
    payBtn.textContent = `Оплатить ${rub(total())}`;
    payBtn.classList.toggle("is-disabled", !formOk());
  };
  form.addEventListener("click", (e) => {
    const btn = e.target.closest(".stepper button");
    if (!btn) return;
    const key = btn.parentElement.dataset.step;
    count[key] = Math.max(0, count[key] + (btn.textContent === "+" ? 1 : -1));
    update();
  });
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const okFields = validate(form);
    box.querySelector("#f-errors").textContent = !okFields ? "Заполните отмеченные поля."
      : seatsUsed() === 0 ? "Добавьте хотя бы одного участника."
      : seatsUsed() > left ? `Свободно только ${left} ${placesWord(left)}.` : "";
    if (!okFields || seatsUsed() === 0 || seatsUsed() > left) return;
    const variant = ev.variant || (choose ? form.querySelector("#f-var").value : "");
    showPayment(ev, { name: form.querySelector("#f-name").value.trim(), sum: total(), seats: seatsUsed(), variant });
  });
  update();
}

function showPayment(ev, order) {
  const box = openModal(`
    <h2>Оплата (демо)</h2>
    <p>${esc(ev.title)} · ${dayLabel(ev.date)}, ${ev.time}</p>
    <div class="total"><span>К оплате</span><b>${rub(order.sum)}</b></div>
    <fieldset style="margin:16px 0">
      <legend>Способ оплаты</legend>
      <div class="checks">
        <label class="check"><input type="radio" name="pay" checked> Банковская карта</label>
        <label class="check"><input type="radio" name="pay"> СБП</label>
      </div>
    </fieldset>
    <button class="btn btn-block" type="button" id="f-confirm">Оплатить ${rub(order.sum)} (демо)</button>
    <p class="hint center">Платёжный сервис подключим во второй версии.</p>
    ${DEMO_NOTE}`);
  box.querySelector("#f-confirm").addEventListener("click", () => {
    const map = loadBooked();
    map[evId(ev)] = (map[evId(ev)] || 0) + order.seats;
    saveBooked(map);
    document.dispatchEvent(new Event("booked"));
    openModal(`
      <div class="done-screen">
        <div class="big">💜</div>
        <h2 style="padding:0">Вы записаны (демо)</h2>
        <p><b>${esc(ev.title)}</b><br>${dayLabel(ev.date)}, ${ev.time}${order.variant ? `<br>Изделие: ${esc(order.variant)}` : ""}</p>
        <p>${esc(order.name)}, мест: ${order.seats}, сумма: ${rub(order.sum)}</p>
        <p class="muted">Ждём вас по адресу ${SITE.address}.</p>
        ${DEMO_NOTE}
        <button class="btn btn-outline" type="button" onclick="closeModal()">Готово</button>
      </div>`);
  });
}

// ---------- «Хочу на этот МК» — заявка без даты ----------
function wantMk(mk) {
  const box = openModal(`
    <h2>Хочу на «${esc(mk.title)}»</h2>
    <p>Ближайших дат пока нет. Оставьте контакты — администратор напишет, когда появится запись.</p>
    <form class="form" novalidate>
      ${NAME_PHONE}
      <div class="field"><label for="f-com">Комментарий</label><textarea id="f-com" placeholder="Удобные дни, сколько вас человек"></textarea></div>
      ${CONSENT("f-consent")}
      <button class="btn btn-block" type="submit">Отправить заявку</button>
    </form>`);
  demoForm(box.querySelector("form"), "<h3>Заявка принята (демо)</h3><p>Администратор свяжется с вами, когда появится дата.</p>");
}

const upcomingFor = (mkId) => AFISHA.filter((ev) => ev.mk === mkId && !isPast(ev)).sort(byTime);

document.querySelectorAll("[data-afisha]").forEach(initAfisha);
