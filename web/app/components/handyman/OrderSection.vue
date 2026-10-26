<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { districts, PHONE, PRICE_FROM, services } from "~/data/handyman";

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"];
const customerName = ref("");
const phone = ref("");
const district = ref("");
const address = ref("");
const description = ref("");
const date = ref("");
const time = ref("");
const hours = ref(1);
const consent = ref(false);
const website = ref("");
const selected = ref([]);
const photos = ref([]);
const submitting = ref(false);
const success = ref("");
const submitError = ref("");
const photoError = ref("");
const fieldErrors = ref({});
const today = new Date();
const minDate = computed(() => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Minsk", year: "numeric", month: "2-digit", day: "2-digit" }).format(today));
const timeSlots = computed(() => {
  if (!date.value) return [];
  const weekday = new Date(`${date.value}T12:00:00Z`).getUTCDay();
  const weekend = weekday === 0 || weekday === 6;
  const start = weekend ? 9 : 18;
  const end = weekend ? 20 : 22;
  return Array.from({ length: end - start }, (_, index) => `${String(start + index).padStart(2, "0")}:00`);
});
const estimatedTotal = computed(() => Math.max(1, Number(hours.value) || 1) * PRICE_FROM);
const money = new Intl.NumberFormat("ru-BY", { maximumFractionDigits: 2 });

function toggleService(title) {
  selected.value = selected.value.includes(title) ? selected.value.filter((item) => item !== title) : [...selected.value, title];
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
    photos.value.push({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) });
  }
  event.target.value = "";
}

function removePhoto(id) {
  const photo = photos.value.find((item) => item.id === id);
  if (photo) URL.revokeObjectURL(photo.url);
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
  selected.value.forEach((value) => body.append("services[]", value));
  photos.value.forEach((photo) => body.append("photos[]", photo.file));
  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
    if (!token) throw new Error("Не удалось проверить страницу. Обновите её.");
    const response = await fetch("/requests", { method: "POST", credentials: "same-origin", headers: { Accept: "application/json", "X-CSRF-TOKEN": token }, body });
    const data = await response.json().catch(() => ({}));
    if (response.status === 422) {
      fieldErrors.value = data.errors ?? {};
      throw new Error("Проверьте заполнение формы.");
    }
    if (response.status === 429) throw new Error("Слишком много заявок. Попробуйте немного позже.");
    if (response.status === 419) throw new Error("Страница устарела. Обновите её и отправьте снова.");
    if (!response.ok) throw new Error(data.message || "Не удалось отправить заявку.");
    success.value = `Заявка №${data.id} принята. Свяжусь с вами для подтверждения времени и стоимости.`;
    clearPhotos();
    customerName.value = "";
    phone.value = "";
    district.value = "";
    address.value = "";
    description.value = "";
    date.value = "";
    time.value = "";
    hours.value = 1;
    selected.value = [];
    consent.value = false;
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : "Ошибка отправки. Попробуйте ещё раз.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section id="order" class="order-section">
    <div class="section-wrap order-layout">
      <div class="order-intro"><div class="eyebrow">Заявка без лишних звонков</div><h2>Расскажите,<br /><span>что нужно сделать.</span></h2><p>Заполните форму — я уточню детали и подтвержу, смогу ли приехать в выбранное время.</p><div class="order-contact"><span class="order-contact__icon">✦</span><div><strong>Предпочитаете звонок?</strong><a :href="`tel:${PHONE}`">Связаться с мастером</a></div></div><div class="order-schedule"><span>ПН–ПТ</span><strong>18:00–22:00</strong><span>СБ–ВС</span><strong>09:00–20:00</strong></div></div>
      <form class="order-form" @submit.prevent="submitRequest">
        <div class="order-form__heading"><div><h3>Детали заказа</h3><p>Поля со звёздочкой обязательны</p></div><span class="order-form__step">01 <i>/ 01</i></span></div>
        <fieldset :disabled="submitting">
          <legend>Какие работы нужны?</legend>
          <div class="service-chips"><button v-for="service in services" :key="service.title" type="button" :class="{ 'is-selected': selected.includes(service.title) }" :aria-pressed="selected.includes(service.title)" @click="toggleService(service.title)">{{ service.icon }} {{ service.title }}</button></div>
          <div class="form-grid">
            <label class="field"><span>Ваше имя *</span><input v-model="customerName" name="name" autocomplete="name" maxlength="100" required placeholder="Как к вам обращаться?" /></label>
            <label class="field"><span>Телефон *</span><input v-model="phone" name="phone" type="tel" autocomplete="tel" maxlength="30" required placeholder="+375 29 123-45-67" /></label>
            <label class="field"><span>Район *</span><select v-model="district" name="district" required><option value="">Выберите район</option><option v-for="item in districts" :key="item" :value="item">{{ item }}</option></select></label>
            <label class="field"><span>Улица и дом</span><input v-model="address" name="address" autocomplete="street-address" maxlength="200" placeholder="Необязательно" /></label>
            <label class="field"><span>Желаемая дата *</span><input v-model="date" name="preferred_date" type="date" :min="minDate" required @change="time = ''" /></label>
            <label class="field"><span>Время приезда *</span><select v-model="time" name="preferred_time" :disabled="!date" required><option value="">{{ date ? 'Выберите время' : 'Сначала выберите дату' }}</option><option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option></select></label>
          </div>
          <p class="form-hint">Выбранное время — пожелание, а не бронь. Я подтвержу возможность приезда лично.</p>
          <label class="field"><span>Опишите задачу *</span><textarea v-model="description" name="description" rows="4" minlength="10" maxlength="2000" required placeholder="Например: собрать комод и повесить две полки." /></label>
          <div class="estimate-row"><label class="field"><span>Примерная длительность</span><select v-model.number="hours" name="estimated_hours"><option v-for="n in 8" :key="n" :value="n">{{ n }} ч.</option></select></label><div><span class="estimate-row__label">Ориентировочно от</span><strong>{{ money.format(estimatedTotal) }} BYN</strong></div></div>
          <label class="field photo-field"><span>Фото задачи <small>JPG или PNG, до 5 файлов по 5 МБ</small></span><input type="file" accept="image/jpeg,image/png" multiple @change="addPhotos" /></label>
          <p v-if="photoError" class="form-message form-message--error" role="alert">{{ photoError }}</p>
          <div v-if="photos.length" class="photo-grid"><div v-for="photo in photos" :key="photo.id" class="photo-item"><img :src="photo.url" alt="Фото задачи" /><button type="button" :aria-label="`Удалить фото ${photo.id}`" @click="removePhoto(photo.id)">×</button></div></div>
          <div class="honeypot" aria-hidden="true" inert><label>Ваш сайт<input v-model="website" name="website" tabindex="-1" autocomplete="off" /></label></div>
          <label class="consent"><input v-model="consent" type="checkbox" required /><span>Согласен на обработку данных для ответа на заявку, включая передачу описания и фото мастеру.</span></label>
          <p class="form-hint">Не прикладывайте документы, банковские данные и фотографии посторонних людей.</p>
          <button class="button button--primary button--submit" type="submit">{{ submitting ? "Отправляем заявку…" : "Отправить заявку" }} <span aria-hidden="true">→</span></button>
        </fieldset>
        <div v-if="Object.keys(fieldErrors).length" class="form-message form-message--error" role="alert"><p v-for="(messages, key) in fieldErrors" :key="key">{{ messages[0] }}</p></div>
        <p v-if="submitError" class="form-message form-message--error" role="alert">{{ submitError }}</p>
        <p v-if="success" class="form-message form-message--success" role="status">{{ success }}</p>
      </form>
    </div>
  </section>
</template>
