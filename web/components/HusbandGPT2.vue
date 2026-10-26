<!--
  Вставь в <head> хост-страницы (index.html / Blade-layout), в компоненте это не живёт:

  <title>Муж на час в Гомеле — мелкий ремонт и сборка мебели, вечера и выходные</title>
  <meta name="description" content="Муж на час в Гомеле: сборка мебели, полки и телевизор на стену, смесители, розетки, замки. Вечера и выходные. Цена до начала работ.">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="canonical" href="https://example.by/">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"HomeAndConstructionBusiness","name":"Муж на час Гомель",
   "areaServed":{"@type":"City","name":"Гомель"},"telephone":"+375XXXXXXXXX","priceRange":"от 25 BYN/час",
   "openingHoursSpecification":[
     {"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"18:00","closes":"22:00"},
     {"@type":"OpeningHoursSpecification","dayOfWeek":["Saturday","Sunday"],"opens":"09:00","closes":"20:00"}]}
  </script>
-->

<script setup>
const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"];

// Здесь используем подписи услуг как значения формы.
// // const selected = ref([]);
// const district = ref("");

const customerName = ref("");
const phone = ref("");
const address = ref("");
const description = ref("");

const date = ref("");
const time = ref("");
const hours = ref(1);
const consent = ref(false);

// Заполняется только ботами — скрытое поле.
const website = ref("");

const photos = ref([]);
const fileInput = ref(null);

const submitting = ref(false);
const success = ref("");
const submitError = ref("");
const photoError = ref("");
const fieldErrors = ref({});

const money = new Intl.NumberFormat("ru-BY", {
  maximumFractionDigits: 2,
});

const estimatedTotal = computed(() => {
  const value = Number(hours.value);

  if (!Number.isFinite(value)) {
    return PRICE_FROM;
  }

  return Math.max(1, value) * PRICE_FROM;
});

const priceRows = computed(() =>
    services.map((service) => ({
      title: service.title,
      price: `от ${PRICE_FROM} BYN/час`,
    })),
);

function gomelDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Minsk",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const get = (type) => parts.find((part) => part.type === type)?.value;

  return `${get("year")}-${get("month")}-${get("day")}`;
}

const minDate = computed(() => gomelDate());

const timeSlots = computed(() => {
  if (!date.value) return [];

  // Полдень UTC позволяет определить день недели выбранной даты.
  const weekday = new Date(`${date.value}T12:00:00Z`).getUTCDay();
  const weekend = weekday === 0 || weekday === 6;

  const start = weekend ? 9 : 18;
  const end = weekend ? 20 : 22;

  return Array.from(
      {length: end - start},
      (_, index) => `${String(start + index).padStart(2, "0")}:00`,
  );
});

const tgLink = computed(() => {
  const what = selected.value.length
      ? ` Что сделать: ${selected.value.join(", ")}.`
      : "";

  const where = district.value ? ` Район: ${district.value}.` : "";

  const msg = `Здравствуйте! Нужен мастер в Гомеле.${what}${where}`;

  return `https://t.me/${TG}?text=${encodeURIComponent(msg)}`;
});

function toggle(value) {
  selected.value = selected.value.includes(value)
      ? selected.value.filter((item) => item !== value)
      : [...selected.value, value];
}

function changeDate() {
  time.value = "";
}

function addPhotos(event) {
  photoError.value = "";

  for (const file of Array.from(event.target.files ?? [])) {
    if (photos.value.length >= MAX_PHOTOS) {
      photoError.value = `Можно добавить не больше ${MAX_PHOTOS} фото.`;
      break;
    }

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      photoError.value = "Поддерживаются только JPG и PNG.";
      continue;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      photoError.value = "Каждое фото должно быть не больше 5 МБ.";
      continue;
    }

    photos.value.push({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    });
  }

  // Позволяет снова выбрать тот же файл после удаления.
  event.target.value = "";
}

function removePhoto(id) {
  const photo = photos.value.find((item) => item.id === id);

  if (photo) {
    URL.revokeObjectURL(photo.url);
  }

  photos.value = photos.value.filter((item) => item.id !== id);
}

function clearPhotos() {
  photos.value.forEach((photo) => URL.revokeObjectURL(photo.url));
  photos.value = [];
}

onBeforeUnmount(clearPhotos);

async function submitRequest() {
  if (submitting.value) return;

  submitting.value = true;
  success.value = "";
  submitError.value = "";
  fieldErrors.value = {};

  const body = new FormData();

  body.append("name", customerName.value.trim());
  body.append("phone", phone.value.trim());
  body.append("district", district.value);
  body.append("address", address.value.trim());
  body.append("description", description.value.trim());
  body.append("preferred_date", date.value);
  body.append("preferred_time", time.value);
  body.append("estimated_hours", String(hours.value));
  body.append("consent", consent.value ? "1" : "0");
  body.append("website", website.value);

  selected.value.forEach((value) => {
    body.append("services[]", value);
  });

  photos.value.forEach((photo) => {
    body.append("photos[]", photo.file);
  });

  try {
    const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

    if (!token) {
      throw new Error("Не удалось проверить страницу. Обновите её.");
    }

    const response = await fetch("/requests", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "X-CSRF-TOKEN": token,
      },
      body,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 422) {
      fieldErrors.value = data.errors ?? {};
      throw new Error("Проверьте заполнение формы.");
    }

    if (response.status === 429) {
      throw new Error("Слишком много заявок. Попробуйте немного позже.");
    }

    if (response.status === 419) {
      throw new Error(
          "Страница устарела. Обновите её и отправьте снова.",
      );
    }

    if (!response.ok) {
      throw new Error(data.message || "Не удалось отправить заявку.");
    }

    success.value = `Заявка №${data.id} принята. Свяжусь с вами для подтверждения времени и стоимости.`;

    clearPhotos();
    description.value = "";
    consent.value = false;
  } catch (error) {
    submitError.value =
        error instanceof Error
            ? error.message
            : "Ошибка отправки. Попробуйте ещё раз.";
  } finally {
    submitting.value = false;
  }
}

import {ref, computed} from "vue";

// Всё, что нужно поменять, — здесь
const PHONE = "+375XXXXXXXXX";
const PHONE_VIEW = "+375 XX XXX-XX-XX";
const TG = "your_telegram";
const PRICE_FROM = 25;

const services = [
  {
    icon: "🪑",
    title: "Сборка мебели",
    text: "Шкафы, кровати, кухни, офисная мебель",
  },
  {
    icon: "📺",
    title: "Повесить на стену",
    text: "Телевизор, полки, карнизы, зеркала, картины",
  },
  {
    icon: "🚿",
    title: "Мелкая сантехника",
    text: "Смесители, сифоны, унитаз, подключение стиралки",
  },
  {
    icon: "💡",
    title: "Мелкая электрика",
    text: "Розетки, выключатели, светильники, люстры",
  },
  {
    icon: "🚪",
    title: "Двери и замки",
    text: "Замена замков, ручки, регулировка дверей",
  },
  {
    icon: "🎨",
    title: "Косметика по дому",
    text: "Шпаклёвка, покраска, герметизация, мелкий ремонт",
  },
];

const chips = [
  {label: "Сборка мебели", text: "сборка мебели"},
  {label: "Повесить на стену", text: "повесить телевизор/полки"},
  {label: "Сантехника", text: "смеситель/сантехника"},
  {label: "Электрика", text: "розетки/свет"},
  {label: "Двери и замки", text: "замки/двери"},
  {label: "Другое", text: "другое мелкое дело"},
];

const districts = [
  "Центральный",
  "Железнодорожный",
  "Новобелицкий",
  "Советский",
];

const steps = [
  {
    title: "Пишете, что нужно",
    text: "Лучше с фото. Отвечаю в течение 15 минут в рабочие часы.",
  },
  {
    title: "Называю цену",
    text: "Почасовая ставка и примерное время до начала работ.",
  },
  {
    title: "Приезжаю в удобный вечер",
    text: "С инструментом и расходниками. Убираю за собой.",
  },
];

const faq = [
  {
    q: "Сколько это стоит?",
    a: `Оплата почасовая, от ${PRICE_FROM} BYN/час, минимальный заказ — 1 час. Точную цену называю после описания задачи.`,
  },
  {
    q: "В какие районы Гомеля выезжаете?",
    a: `${districts.join(", ")}. Выезд в пределах города.`,
  },
  {
    q: "Что вы не делаете?",
    a: "Газ, электрощитки и всё, что затрагивает несущие конструкции, — для этого нужны специалисты с допусками.",
  },
  {
    q: "Расходники ваши или наши?",
    a: "Могу купить по чеку или использовать ваши — как удобнее.",
  },
];

const selected = ref([]);
const district = ref("");

/* const tgLink = computed(() => {
    const what = selected.value.length
        ? ` Что сделать: ${selected.value.join(", ")}.`
        : "";
    const where = district.value ? ` Район: ${district.value}.` : "";
    const msg = `Здравствуйте! Нужен мастер в Гомеле.${what}${where} Когда можно приехать?`;
    return `https://t.me/${TG}?text=${encodeURIComponent(msg)}`;
}); */

/* function toggle(text) {
    const i = selected.value.indexOf(text);
    i === -1 ? selected.value.push(text) : selected.value.splice(i, 1);
} */
</script>

<template>
  <div class="mnch">
    <div class="w">
      <header>
        <div class="logo"><span>МУЖ НА ЧАС</span>Гомель</div>
        <a class="btn p" :href="`tel:${PHONE}`">Позвонить</a>
      </header>

      <div class="hero">
        <div>
          <h1>
            Починю, повешу, соберу —
            <mark>пока вы отдыхаете</mark>
          </h1>
          <p>
            Мелкий ремонт и сборка мебели по Гомелю. Приезжаю
            вечером после работы и в выходные. Цену называю до
            начала, без сюрпризов.
          </p>
          <div class="cta">
            <a class="btn p" href="#order">Оставить заявку</a>
            <a class="btn" href="#services">Что умею</a>
          </div>
          <div class="tags">
            <b>Пн–Пт 18:00–22:00</b><b>Сб–Вс 09:00–20:00</b
          ><b>от {{ PRICE_FROM }} BYN/час</b>
          </div>
        </div>
        <svg
            class="clock"
            viewBox="0 0 200 200"
            role="img"
            aria-label="Часы: один час работы"
        >
          <circle
              cx="100"
              cy="100"
              r="92"
              fill="var(--card)"
              stroke="var(--fg)"
              stroke-width="6"
          />
          <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="var(--accent)"
              stroke-width="10"
              stroke-dasharray="3 37.7"
          />
          <g class="hand">
            <line
                x1="100"
                y1="100"
                x2="100"
                y2="34"
                stroke="var(--fg)"
                stroke-width="6"
                stroke-linecap="round"
            />
          </g>
          <circle
              cx="100"
              cy="100"
              r="9"
              fill="var(--accent)"
              stroke="var(--fg)"
              stroke-width="3"
          />
          <text
              x="100"
              y="150"
              text-anchor="middle"
              font-size="22"
              font-weight="900"
              fill="var(--fg)"
          >
            1 ЧАС
          </text>
        </svg>
      </div>
    </div>
    <div class="stripe"/>

    <section id="services">
      <div class="w">
        <h2>Что делаю</h2>
        <p class="sub">
          Мелкие и средние задачи, которые «всё никак руки не
          доходят».
        </p>
        <div class="grid">
          <div v-for="s in services" :key="s.title" class="card">
            <i>{{ s.icon }}</i
            ><b>{{ s.title }}</b
          ><span>{{ s.text }}</span>
          </div>
        </div>
      </div>
    </section>

    <section id="prices">
      <div class="w">
        <h2>Стоимость работ</h2>

        <p class="sub">
          Почасовая оплата. Минимальный заказ — 1 час. Итоговую
          стоимость согласуем до начала работ.
        </p>

        <div class="price-list">
          <div
              v-for="row in priceRows"
              :key="row.title"
              class="price-row"
          >
            <span>{{ row.title }}</span>
            <strong>{{ row.price }}</strong>
          </div>
        </div>

        <p class="sub">
          Материалы и расходники оплачиваются отдельно по
          согласованию.
        </p>
      </div>
    </section>

<!--    <section id="order">
      <div class="w">
        <form class="box order-form" @submit.prevent="submitRequest">
          <h2>Оставить заявку</h2>

          <p class="sub">
            Опишите задачу, выберите удобное время и приложите фото.
            Я свяжусь с вами и подтвержу детали.
          </p>

          <fieldset :disabled="submitting">
            <legend>Что нужно сделать?</legend>

            <div class="chips">
              <button
                  v-for="service in services"
                  :key="service.title"
                  type="button"
                  class="chip"
                  :class="{
                                    on: selected.includes(service.title),
                                }"
                  :aria-pressed="selected.includes(service.title)"
                  @click="toggle(service.title)"
              >
                {{ service.title }}
              </button>
            </div>

            <div class="form-grid">
              <label class="field">
                <span>Ваше имя</span>
                <input
                    v-model="customerName"
                    name="name"
                    autocomplete="name"
                    maxlength="100"
                    required
                />
              </label>

              <label class="field">
                <span>Телефон</span>
                <input
                    v-model="phone"
                    name="phone"
                    type="tel"
                    autocomplete="tel"
                    placeholder="+375 29 123-45-67"
                    maxlength="30"
                    required
                />
              </label>

              <label class="field">
                <span>Район</span>
                <select
                    v-model="district"
                    name="district"
                    required
                >
                  <option value="">Выберите район</option>
                  <option
                      v-for="d in districts"
                      :key="d"
                      :value="d"
                  >
                    {{ d }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Улица и дом — необязательно</span>
                <input
                    v-model="address"
                    name="address"
                    autocomplete="street-address"
                    maxlength="200"
                />
              </label>

              <label class="field">
                <span>Желаемая дата</span>
                <input
                    v-model="date"
                    name="preferred_date"
                    type="date"
                    :min="minDate"
                    required
                    @change="changeDate"
                />
              </label>

              <label class="field">
                <span>Желаемое время приезда</span>
                <select
                    v-model="time"
                    name="preferred_time"
                    :disabled="!date"
                    required
                >
                  <option value="">Выберите время</option>
                  <option
                      v-for="slot in timeSlots"
                      :key="slot"
                      :value="slot"
                  >
                    {{ slot }}
                  </option>
                </select>
              </label>
            </div>

            <p class="hint">
              Это пожелание по времени, не бронь. Возможность и
              длительность работ подтвержу лично.
            </p>

            <label class="field">
              <span>Опишите задачу</span>
              <textarea
                  v-model="description"
                  name="description"
                  rows="4"
                  minlength="10"
                  maxlength="2000"
                  placeholder="Например: собрать комод и повесить две полки."
                  required
              />
            </label>

            <div class="estimate">
              <label class="field">
                <span>Примерно сколько часов потребуется?</span>
                <select
                    v-model.number="hours"
                    name="estimated_hours"
                >
                  <option v-for="n in 8" :key="n" :value="n">
                    {{ n }} ч.
                  </option>
                </select>
              </label>

              <div>
                <span>Предварительно за работу</span>
                <strong class="estimate-value">
                  от {{ money.format(estimatedTotal) }} BYN
                </strong>
              </div>
            </div>

            <p class="hint">
              Расчёт ориентировочный, без материалов. Если не
              знаете длительность, оставьте 1 час — уточним по
              описанию и фото.
            </p>

            <div class="field">
                            <span
                            >Фото задачи — до 5 файлов JPG/PNG, каждый до 5
                                МБ</span
                            >

              <input
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  @change="addPhotos"
              />

              <p
                  v-if="photoError"
                  class="form-error"
                  role="alert"
              >
                {{ photoError }}
              </p>

              <div v-if="photos.length" class="photo-grid">
                <div
                    v-for="photo in photos"
                    :key="photo.id"
                    class="photo-item"
                >
                  <img :src="photo.url" alt="Фото задачи"/>

                  <button
                      type="button"
                      class="photo-remove"
                      aria-label="Удалить фото"
                      @click="removePhoto(photo.id)"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div class="honeypot" aria-hidden="true" inert>
              <label>
                Ваш сайт
                <input
                    v-model="website"
                    name="website"
                    tabindex="-1"
                    autocomplete="off"
                />
              </label>
            </div>

            <label class="consent">
              <input v-model="consent" type="checkbox" required/>
              <span>
                                Согласен на обработку данных для ответа на
                                заявку, включая передачу описания и фото в
                                Telegram мастеру.
                            </span>
            </label>

            <p class="hint">
              Не прикладывайте документы, банковские данные и
              фотографии посторонних людей.
            </p>

            <div class="cta">
              <button class="btn p" type="submit">
                {{
                  submitting
                      ? "Отправляем…"
                      : "Отправить заявку"
                }}
              </button>

              <a class="btn" :href="`tel:${PHONE}`">
                Позвонить
              </a>
            </div>
          </fieldset>

          <div
              v-if="Object.keys(fieldErrors).length"
              class="form-error"
              role="alert"
          >
            <p v-for="(messages, key) in fieldErrors" :key="key">
              {{ messages[0] }}
            </p>
          </div>

          <p v-if="submitError" class="form-error" role="alert">
            {{ submitError }}
          </p>

          <p v-if="success" class="form-success" role="status">
            {{ success }}
          </p>
        </form>
      </div>
    </section>-->

    <section>
      <div class="w">
        <h2>Как это работает</h2>
        <p class="sub">
          Без звонков по пять раз и «приедем с 10 до 18».
        </p>
        <div class="steps">
          <div v-for="s in steps" :key="s.title">
            <b>{{ s.title }}</b
            ><br/><span>{{ s.text }}</span>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="w">
        <h2>Частые вопросы</h2>
        <details v-for="f in faq" :key="f.q">
          <summary>{{ f.q }}</summary>
          <p>{{ f.a }}</p>
        </details>
      </div>
    </section>

    <footer>
      <div class="w">
        Муж на час · Гомель ·
        <a :href="`tel:${PHONE}`">{{ PHONE_VIEW }}</a> · Telegram @{{
          TG
        }}
      </div>
    </footer>
  </div>
</template>

<style scoped>
.price-list {
  background: var(--card);
  border: 2px solid var(--fg);
  border-radius: 16px;
  padding: 8px 20px;
  box-shadow: 4px 4px 0 var(--shadow);
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 16px 0;
}

.price-row + .price-row {
  border-top: 1px solid var(--line);
}

.price-row strong {
  white-space: nowrap;
}

.order-form fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.order-form legend {
  padding: 0;
  font-weight: 700;
}

.order-form fieldset:disabled {
  opacity: 0.65;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
  min-width: 0;
  margin-bottom: 16px;
}

.field > span {
  font-weight: 650;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  max-width: none;
  min-width: 0;
  min-height: 48px;
  padding: 12px;
  border: 2px solid var(--line);
  border-radius: 12px;
  background: var(--bg);
  color: var(--fg);
  font: inherit;
}

.field input[type="file"] {
  border-style: dashed;
}

.field textarea {
  resize: vertical;
}

.hint {
  color: var(--muted);
  font-size: 14px;
  margin: 0 0 20px;
}

.estimate {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 20px;
  padding: 18px;
  margin: 20px 0 12px;
  border: 2px solid var(--line);
  border-radius: 14px;
  background: var(--bg);
}

.estimate .field {
  margin: 0;
}

.estimate-value {
  display: block;
  margin-top: 4px;
  font-size: 28px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 140px));
  gap: 12px;
}

.photo-item {
  position: relative;
}

.photo-item img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border: 2px solid var(--line);
  border-radius: 12px;
}

.photo-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 36px;
  height: 36px;
  border: 2px solid var(--fg);
  border-radius: 50%;
  background: var(--card);
  color: var(--fg);
  font-size: 24px;
  cursor: pointer;
}

.consent {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 20px 0 12px;
  font-size: 14px;
}

.consent input {
  flex: none;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: var(--accent);
}

.honeypot {
  display: none;
}

.form-error {
  color: #b42318;
}

.form-success {
  padding: 16px;
  border: 2px solid var(--fg);
  border-radius: 12px;
  background: var(--accent);
  color: var(--on-accent);
}

@media (max-width: 600px) {
  .form-grid,
  .estimate {
    grid-template-columns: 1fr;
  }

  .price-row {
    flex-direction: column;
    gap: 4px;
  }
}

.mnch {
  --bg: #faf8f1;
  --fg: #202019;
  --card: #ffffff;
  --muted: #777466;
  --line: #e9e4d6;
  --accent: #ffd02f;
  --accent-hover: #f4bf00;
  --on-accent: #202019;
  --shadow: 0 12px 35px rgba(32, 32, 25, 0.06);
  --shadow-hover: 0 18px 40px rgba(32, 32, 25, 0.11);

  min-height: 100vh;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  overflow: hidden;
  background: radial-gradient(
      ellipse at 90% 5%,
      rgba(255, 208, 47, 0.12),
      transparent 30%
  ),
  var(--bg);
  color: var(--fg);
  font-family: system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  Arial,
  sans-serif;
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.mnch *,
.mnch *::before,
.mnch *::after {
  box-sizing: border-box;
}

.mnch a {
  color: inherit;
  -webkit-tap-highlight-color: transparent;
}

.mnch button,
.mnch select {
  font: inherit;
}

.mnch button:focus-visible,
.mnch a:focus-visible,
.mnch select:focus-visible,
.mnch summary:focus-visible {
  outline: 3px solid #a77a00;
  outline-offset: 4px;
}

.w {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 0;
}

.logo {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.logo span {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 8px;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 13px;
  font-weight: 950;
  letter-spacing: 0.02em;
}

.btn {
  display: inline-flex;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 22px;
  border: 1.5px solid var(--fg);
  border-radius: 14px;
  background: var(--card);
  color: var(--fg);
  font-size: 15px;
  font-weight: 800;
  line-height: 1.3;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: transform 180ms ease,
  background-color 180ms ease,
  border-color 180ms ease,
  box-shadow 180ms ease;
  -webkit-tap-highlight-color: transparent;
}

.btn.p {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
  box-shadow: 0 5px 0 rgba(32, 32, 25, 0.08);
}

.btn.p:hover {
  border-color: var(--accent-hover);
  background: var(--accent-hover);
  box-shadow: 0 8px 18px rgba(244, 191, 0, 0.2);
}

.btn:not(.p):hover {
  background: var(--bg);
  box-shadow: var(--shadow);
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(220px, 0.65fr);
  gap: 40px;
  align-items: center;
  padding: 65px 0 72px;
}

.hero > div:first-child {
  position: relative;
  z-index: 1;
}

.hero h1 {
  max-width: 780px;
  margin: 0 0 24px;
  font-size: clamp(38px, 5.5vw, 66px);
  font-weight: 950;
  line-height: 1.04;
  letter-spacing: -0.055em;
  text-wrap: balance;
}

.hero h1 mark {
  display: inline;
  padding: 0 7px 3px;
  border-radius: 9px;
  background: linear-gradient(transparent 12%, var(--accent) 12%);
  color: var(--on-accent);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.hero p {
  max-width: 580px;
  margin: 0;
  color: var(--muted);
  font-size: 18px;
  line-height: 1.8;
}

.cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 28px 0 22px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.tags b {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}

.tags b:last-child {
  border-color: rgba(255, 208, 47, 0.65);
  background: rgba(255, 208, 47, 0.22);
  color: var(--fg);
}

.clock {
  display: block;
  width: 100%;
  max-width: 310px;
  margin: auto;
  overflow: visible;
  filter: drop-shadow(0 22px 28px rgba(32, 32, 25, 0.1));
}

.hand {
  transform-origin: 100px 100px;
  animation: tick 18s linear infinite;
}

@keyframes tick {
  to {
    transform: rotate(360deg);
  }
}

.stripe {
  height: 10px;
  background: repeating-linear-gradient(
      -45deg,
      var(--accent) 0 16px,
      var(--fg) 16px 32px
  );
}

.mnch section {
  padding: 72px 0;
}

.mnch h2 {
  margin: 0 0 10px;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 950;
  line-height: 1.15;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.sub {
  max-width: 680px;
  margin: 0 0 30px;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.75;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.card {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 190px;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--card);
  box-shadow: var(--shadow);
  transition: transform 200ms ease,
  border-color 200ms ease,
  box-shadow 200ms ease;
}

.card i {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 16px;
  background: rgba(255, 208, 47, 0.23);
  font-size: 27px;
  font-style: normal;
}

.card b {
  margin-bottom: 8px;
  font-size: 17px;
  font-weight: 850;
  line-height: 1.35;
}

.card span {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
}

#order {
  position: relative;
  isolation: isolate;
}

#order::before {
  position: absolute;
  z-index: -1;
  top: 0;
  right: -15%;
  left: -15%;
  height: 100%;
  background: rgba(255, 208, 47, 0.09);
  content: "";
}

.box {
  padding: 38px;
  border: 1px solid var(--line);
  border-radius: 26px;
  background: var(--card);
  box-shadow: 0 24px 65px rgba(32, 32, 25, 0.08);
}

.box h2 {
  max-width: 650px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 22px 0;
}

.chip {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  padding: 10px 17px;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  background: var(--bg);
  color: var(--fg);
  font-size: 14px;
  font-weight: 750;
  line-height: 1.4;
  cursor: pointer;
  transition: background-color 160ms ease,
  border-color 160ms ease,
  transform 160ms ease;
  -webkit-tap-highlight-color: transparent;
}

.chip.on {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}

.box select {
  display: block;
  width: 100%;
  max-width: 360px;
  min-height: 50px;
  padding: 12px 42px 12px 15px;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  background-color: var(--bg);
  color: var(--fg);
  font-size: 15px;
  cursor: pointer;
}

.box .cta {
  margin-bottom: 0;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 28px;
}

.steps > div {
  min-width: 0;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card);
  box-shadow: var(--shadow);
}

.steps > div::before {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 14px;
  background: var(--accent);
  color: var(--fg);
  content: counter(s, decimal-leading-zero);
  font-size: 20px;
  font-weight: 950;
  line-height: 1;
}

.steps > div b {
  display: block;
  margin-bottom: 9px;
  font-size: 16px;
  line-height: 1.45;
}

.steps > div span {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.75;
}

.mnch details {
  padding: 19px 0;
  border-bottom: 1px solid var(--line);
}

.mnch details:first-of-type {
  border-top: 1px solid var(--line);
}

.mnch summary {
  position: relative;
  padding-right: 28px;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.5;
  cursor: pointer;
  list-style: none;
}

.mnch summary::-webkit-details-marker {
  display: none;
}

.mnch summary::after {
  position: absolute;
  top: 50%;
  right: 3px;
  color: var(--muted);
  content: "+";
  font-size: 24px;
  font-weight: 500;
  transform: translateY(-50%);
}

.mnch details[open] summary::after {
  content: "−";
}

.mnch details p {
  max-width: 760px;
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.8;
}

.mnch footer {
  padding: 30px 0;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 13px;
  line-height: 1.9;
}

.mnch footer a {
  color: var(--fg);
  font-weight: 800;
  text-decoration-color: var(--accent);
  text-underline-offset: 4px;
}

@media (hover: hover) and (pointer: fine) {
  .btn:hover {
    transform: translateY(-2px);
  }

  .card:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 208, 47, 0.8);
    box-shadow: var(--shadow-hover);
  }

  .chip:hover {
    border-color: var(--accent);
  }
}

@media (max-width: 900px) {
  .w {
    padding-right: 22px;
    padding-left: 22px;
  }

  .hero {
    grid-template-columns: minmax(0, 1.3fr) minmax(180px, 0.7fr);
    gap: 20px;
    padding: 52px 0 58px;
  }

  .hero h1 {
    font-size: clamp(36px, 6vw, 54px);
  }

  .clock {
    max-width: 250px;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .steps {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .steps > div {
    padding: 20px;
  }

  .steps > div::before {
    width: 42px;
    height: 42px;
    margin-bottom: 14px;
  }

  .mnch section {
    padding: 56px 0;
  }
}

@media (max-width: 600px) {
  .mnch {
    font-size: 15px;
  }

  .w {
    padding-right: 18px;
    padding-left: 18px;
  }

  header {
    gap: 10px;
    padding: 14px 0;
  }

  .logo {
    gap: 6px;
    font-size: 13px;
  }

  .logo span {
    padding: 5px 7px;
    font-size: 11px;
  }

  header .btn {
    min-height: 42px;
    padding: 10px 13px;
    border-radius: 11px;
    font-size: 13px;
    white-space: nowrap;
  }

  .hero {
    grid-template-columns: minmax(0, 1fr);
    gap: 22px;
    padding: 30px 0 36px;
  }

  .hero > div:first-child {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .hero h1 {
    margin-bottom: 16px;
    font-size: clamp(36px, 9vw, 49px);
    line-height: 1.06;
    letter-spacing: -0.045em;
  }

  .hero p {
    font-size: 15px;
    line-height: 1.8;
  }

  .clock {
    grid-row: 1;
    width: 145px;
    max-width: 145px;
    margin: 0 auto;
  }

  .hero .cta {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin: 22px 0 18px;
  }

  .hero .cta .btn {
    width: 100%;
  }

  .btn {
    min-height: 50px;
    padding: 14px 16px;
    border-radius: 13px;
    font-size: 14px;
  }

  .tags {
    gap: 7px;
  }

  .tags b {
    min-height: 32px;
    padding: 5px 10px;
    font-size: 11px;
  }

  .stripe {
    height: 7px;
  }

  .mnch section {
    padding: 42px 0;
  }

  .mnch h2 {
    font-size: 29px;
    line-height: 1.2;
  }

  .sub {
    margin-bottom: 22px;
    font-size: 14px;
    line-height: 1.75;
  }

  .grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 11px;
  }

  .card {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    column-gap: 14px;
    align-items: center;
    min-height: 0;
    padding: 17px;
    border-radius: 16px;
  }

  .card i {
    grid-column: 1;
    grid-row: 1 / span 2;
    width: 46px;
    height: 46px;
    margin: 0;
    border-radius: 13px;
    font-size: 23px;
  }

  .card b {
    align-self: end;
    margin-bottom: 3px;
    font-size: 15px;
  }

  .card span {
    align-self: start;
    font-size: 12px;
    line-height: 1.6;
  }

  .box {
    padding: 22px 17px;
    border-width: 1px;
    border-radius: 20px;
  }

  .box h2 {
    font-size: 27px;
  }

  .box .sub {
    margin-bottom: 18px;
  }

  .chips {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin: 18px 0;
  }

  .chip {
    min-width: 0;
    min-height: 48px;
    padding: 10px 8px;
    border-radius: 12px;
    font-size: 12px;
    text-align: center;
    overflow-wrap: anywhere;
  }

  .box select {
    max-width: none;
    min-height: 50px;
    font-size: 14px;
  }

  .box .cta {
    display: grid;
    grid-template-columns: 1fr;
    gap: 9px;
    margin-top: 17px;
  }

  .box .cta .btn {
    width: 100%;
  }

  .steps {
    margin-top: 22px;
  }

  .steps > div {
    padding: 18px;
    border-radius: 15px;
  }

  .steps > div b {
    font-size: 15px;
  }

  .steps > div span {
    font-size: 13px;
  }

  .mnch summary {
    font-size: 14px;
  }

  .mnch details p {
    font-size: 13px;
  }

  .mnch footer {
    padding: 24px 0;
    font-size: 12px;
  }
}

@media (max-width: 360px) {
  .w {
    padding-right: 14px;
    padding-left: 14px;
  }

  .logo {
    font-size: 11px;
  }

  .logo span {
    font-size: 10px;
  }

  header .btn {
    padding: 9px 10px;
    font-size: 12px;
  }

  .hero h1 {
    font-size: 34px;
  }

  .box {
    padding: 18px 13px;
  }

  .box h2 {
    font-size: 25px;
  }

  .chip {
    font-size: 11px;
  }
}

@media (prefers-color-scheme: dark) {
  .mnch {
    --bg: #151512;
    --fg: #f4f0e4;
    --card: #20201c;
    --muted: #b1ad9d;
    --line: #37362f;
    --accent: #ffd02f;
    --accent-hover: #ffda58;
    --on-accent: #202019;
    --shadow: 0 12px 35px rgba(0, 0, 0, 0.14);
    --shadow-hover: 0 18px 40px rgba(0, 0, 0, 0.24);

    color-scheme: dark;
    background: radial-gradient(
        ellipse at 90% 5%,
        rgba(255, 208, 47, 0.07),
        transparent 30%
    ),
    var(--bg);
  }

  .tags b {
    background: var(--card);
  }

  .tags b:last-child {
    background: rgba(255, 208, 47, 0.14);
  }

  #order::before {
    background: rgba(255, 208, 47, 0.045);
  }

  .box {
    box-shadow: 0 24px 65px rgba(0, 0, 0, 0.16);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mnch *,
  .mnch *::before,
  .mnch *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .hand {
    animation: none;
  }
}
</style>
