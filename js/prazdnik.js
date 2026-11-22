// Заявка на праздник с предварительным расчётом по прайсу.
// Формула сходится с ценами «от» из прайса (будни, 6 человек):
//   аренда зала 1 час (1 000 ₽ будни / 1 500 ₽ выходные)
// + квест «12 записок»: 3 500 ₽ до 3 игроков, +500 ₽ за каждого следующего
// + мастер-класс: цена выбранного МК × гости.
// Если МК не выбран, берём цену на человека, заложенную в «от» набора.
// Нужны data/mk.js и js/main.js.

// 0 — просто аренда зала по часам (от 1 часа); наборы — только наше предложение, в них зал на 1 час
const SETS = {
  0: { label: "Только зал, без набора", mk: false, quest: false, hourly: true },
  1: { name: "№1 Mini", mk: true, quest: false, mkDefault: 150 },  // (1 900 − 1 000) / 6
  2: { name: "№2 Midi", mk: false, quest: true },
  3: { name: "№3 Maxi", mk: true, quest: true, mkDefault: 500 },   // (9 000 − 1 000 − 5 000) / 6
};
const EXTRAS = [
  { id: "animator", name: "Аниматор (1 час)", price: () => 3500 },
  { id: "dnd", name: "D&D-мастер", price: (g) => 950 * g },
  { id: "host", name: "Ведущий настольных игр", price: (g) => 450 * g },
  { id: "quest", name: "Квест «12 записок»", price: (g) => questPrice(g), onlySets: [0, 1] }, // в Midi и Maxi квест уже есть
  { id: "lila", name: "Психологическая игра «Лила»", price: null },
  { id: "home", name: "Психологическая игра «Жизнь как дома»", price: null },
];

const questPrice = (g) => 3500 + Math.max(0, g - 3) * 500;
const rentPrice = (weekend) => (weekend ? 1500 : 1000);

function estimate({ set, guests, weekend, mkPrice, extras, hours = 1 }) {
  const s = SETS[set];
  const h = s.hourly ? hours : 1;
  const lines = [[`Аренда зала, ${h} ч`, rentPrice(weekend) * h]];
  if (s.quest) lines.push(["Квест «12 записок»", questPrice(guests)]);
  if (s.mk) lines.push(["Мастер-класс", (mkPrice ?? s.mkDefault) * guests]);
  EXTRAS.forEach((x) => {
    if (extras.includes(x.id) && x.price && (!x.onlySets || x.onlySets.includes(set))) lines.push([x.name, x.price(guests)]);
  });
  return { lines, sum: lines.reduce((a, [, p]) => a + p, 0) };
}
console.assert(estimate({ set: 1, guests: 6, weekend: false, mkPrice: null, extras: [] }).sum === 1900, "Mini от 1 900");
console.assert(estimate({ set: 2, guests: 6, weekend: false, mkPrice: null, extras: [] }).sum === 6000, "Midi от 6 000");
console.assert(estimate({ set: 3, guests: 6, weekend: false, mkPrice: null, extras: [] }).sum === 9000, "Maxi от 9 000");
console.assert(estimate({ set: 0, guests: 12, weekend: true, mkPrice: null, extras: [], hours: 3 }).sum === 4500, "только зал: 3 ч в выходной = 4 500");
console.assert(estimate({ set: 0, guests: 4, weekend: false, mkPrice: null, extras: ["quest"], hours: 1 }).sum === 5000, "зал + квест на 4 = 5 000");

function initPartyForm(form) {
  const mkOptions = MK.map((m) => `<option value="${m.id}">${esc(m.title)}${m.price ? ` — ${m.variants ? "от " : ""}${rub(m.price)}` : ""}</option>`).join("");
  form.innerHTML = `
    <div class="field">
      <label for="p-set">Формат</label>
      <select id="p-set">${Object.entries(SETS).map(([k, s]) => `<option value="${k}">${s.label || "Уютный набор " + s.name}</option>`).join("")}</select>
    </div>
    <div class="field" id="p-hours-field"><label for="p-hours">Часов аренды</label><input type="number" id="p-hours" min="1" max="12" value="2"></div>
    <div class="row-2">
      <div class="field"><label for="p-date">Дата</label><input type="date" id="p-date" required><p class="err">Выберите дату</p></div>
      <div class="field"><label for="p-guests">Гостей</label><input type="number" id="p-guests" min="1" max="30" value="6" required><p class="err">От 1 до 30 гостей</p></div>
    </div>
    <div class="field" id="p-mk-field">
      <label for="p-mk">Мастер-класс</label>
      <select id="p-mk"><option value="">Выберу позже</option>${mkOptions}</select>
      <p class="hint">Цена МК — за каждого гостя. Список и описания — на странице <a href="mk.html" target="_blank">Мастер-классы</a>.</p>
    </div>
    <fieldset>
      <legend>Дополнительно</legend>
      <div class="checks">${EXTRAS.map((x) => `<label class="check" data-extra="${x.id}"><input type="checkbox" value="${x.id}"> ${x.name}</label>`).join("")}</div>
    </fieldset>
    ${NAME_PHONE}
    <div class="field"><label for="p-com">Комментарий</label><textarea id="p-com" placeholder="Повод, время, пожелания"></textarea></div>
    <div class="plate lav" aria-live="polite">
      <div class="total" style="padding:0;background:none"><span>Предварительно</span><b id="p-sum"></b></div>
      <div id="p-lines" class="small"></div>
      <p class="small" id="p-note" style="margin:8px 0 0"></p>
      <p class="small muted" style="margin:6px 0 0">Точную сумму подтвердит администратор. Компании именинника — скидка 10% на аренду, мастер-классы и мероприятия.</p>
    </div>
    ${CONSENT("p-consent")}
    <button class="btn btn-block" type="submit">Отправить заявку</button>`;

  const $ = (s) => form.querySelector(s);
  const update = () => {
    const set = Number($("#p-set").value);
    const guests = Math.min(30, Math.max(1, Number($("#p-guests").value) || 1));
    const d = $("#p-date").value ? new Date($("#p-date").value + "T12:00") : null;
    const weekend = d ? [0, 6].includes(d.getDay()) : false;
    const hours = Math.min(12, Math.max(1, Math.round(Number($("#p-hours").value)) || 1));
    $("#p-hours-field").hidden = !SETS[set].hourly;
    $("#p-mk-field").hidden = !SETS[set].mk;
    form.querySelector('[data-extra="quest"]').hidden = SETS[set].quest;
    const extras = [...form.querySelectorAll("[data-extra] input:checked")].filter((i) => !i.closest("[hidden]")).map((i) => i.value);
    const mk = SETS[set].mk ? MK.find((m) => m.id === $("#p-mk").value) : null;
    const r = estimate({ set, guests, weekend, mkPrice: mk?.price ?? null, extras, hours });
    $("#p-sum").textContent = "от " + rub(r.sum);
    $("#p-lines").innerHTML = r.lines.map(([n, p]) => `<div style="display:flex;justify-content:space-between;gap:8px"><span>${esc(n)}</span><span>${rub(p)}</span></div>`).join("");
    const notes = [weekend ? "Выходной день: аренда 1 500 ₽/час." : "Будний день: аренда 1 000 ₽/час."];
    if (SETS[set].mk && (!mk || mk.price == null)) notes.push("МК не выбран или цена не указана — взята минимальная цена набора.");
    if ((SETS[set].quest || extras.includes("quest")) && guests > 15) notes.push("В квесте — максимум 15 участников.");
    if (extras.some((x) => x === "lila" || x === "home")) notes.push("Стоимость психологической игры уточнит администратор.");
    $("#p-note").textContent = notes.join(" ");
  };
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  update();
  // «Забронировать зал»: в форме сразу «Только зал»; без смены адреса — в мини-аппе хэш переключает вкладки
  document.querySelectorAll("[data-rent]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    $("#p-set").value = "0";
    update();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  demoForm(form, "<h3>Заявка принята (демо)</h3><p>Администратор свяжется с вами, подтвердит дату и точную сумму.</p>");
}

document.querySelectorAll("[data-party-form]").forEach(initPartyForm);
