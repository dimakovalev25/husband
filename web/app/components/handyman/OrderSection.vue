<script setup>
import {PHONE, districts, services} from "~/data/handyman";
import TurnstileWidget from "~/components/handyman/TurnstileWidget.vue";
import {useTurnstile} from "~/composables/useTurnstile";
import {useOrderForm} from "~/composables/useOrderForm";

useHead({
  script: [
    {
      src: "https://challenges.cloudflare.com/turnstile/v0/api.js",
      async: true,
      defer: true,
    },
  ],
});

const {
  widgetKey,
  token: turnstileToken,
  reset: resetTurnstile,
} = useTurnstile();

const {
  customerName,
  phone,
  district,
  address,
  description,
  date,
  time,
  hours,
  consent,
  website,
  selected,
  photos,
  submitting,
  success,
  submitError,
  photoError,
  fieldErrors,
  minDate,
  timeSlots,
  hoursOptions,
  estimatedTotalFormatted,
  hasFieldErrors,
  submitButtonText,
  timePlaceholder,
  toggleService,
  isServiceSelected,
  addPhotos,
  removePhoto,
  submitRequest,
  clearForm
} = useOrderForm({
  getTurnstileToken: () => turnstileToken.value,
  resetTurnstile,
});

function onClearForm() {
  if (!confirm("Очистить все поля формы? Это действие нельзя отменить.")) {
    return;
  }
  clearForm();
  resetTurnstile();      // сбрасываем и Turnstile, чтобы токен не висел
}

</script>

<template>
  <section id="order" class="order-section">
    <div class="section-wrap order-layout">
      <div class="order-intro">
        <div class="eyebrow">Заявка без лишних звонков</div>



        <h2>
          Расскажите,<br/>
          <span>что нужно сделать.</span>
        </h2>

        <p>
          Заполните форму — я уточню детали и подтвержу, смогу ли приехать в
          выбранное время.
        </p>

        <div class="order-contact">
          <span class="order-contact__icon">✦</span>
          <div>
            <strong>Предпочитаете звонок?</strong>
            <a :href="`tel:${PHONE}`">Связаться с мастером</a>
          </div>
        </div>

        <div class="order-schedule">
          <span>ПН–ПТ</span>
          <strong>18:00–22:00</strong>
          <span>СБ–ВС</span>
          <strong>09:00–20:00</strong>
        </div>
      </div>

      <form class="order-form" @submit.prevent="submitRequest">
        <div class="order-form__heading">
          <div>
            <h3>Детали заказа</h3>
            <p>Поля со звёздочкой обязательны</p>


          </div>
          <span class="order-form__step">01 <i>/ 01</i></span>
        </div>

        <fieldset :disabled="submitting">
          <legend>Какие работы нужны?</legend>

          <div class="service-chips">
            <button
                v-for="service in services"
                :key="service.title"
                :aria-pressed="selected.includes(service.title)"
                :class="{ 'is-selected': selected.includes(service.title) }"
                type="button"
                @click="toggleService(service.title)"
            >
              {{ service.icon }} {{ service.title }}
            </button>
          </div>

          <div class="form-grid">
            <label class="field">
              <span>Ваше имя *</span>
              <input
                  v-model="customerName"
                  autocomplete="name"
                  maxlength="100"
                  name="name"
                  placeholder="Как к вам обращаться?"
                  required
              />
            </label>

            <label class="field">
              <span>Телефон *</span>
              <input
                  v-model="phone"
                  autocomplete="tel"
                  maxlength="30"
                  name="phone"
                  placeholder="+375 29 123-45-67"
                  required
                  type="tel"
              />
            </label>

            <label class="field">
              <span>Район *</span>
              <select v-model="district" name="district" required>
                <option value="">Выберите район</option>
                <option v-for="item in districts" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>Улица и дом</span>
              <input
                  v-model="address"
                  autocomplete="street-address"
                  maxlength="200"
                  name="address"
                  placeholder="Необязательно"
              />
            </label>

            <label class="field">
              <span>Желаемая дата *</span>
              <input
                  v-model="date"
                  :min="minDate"
                  name="preferred_date"
                  required
                  type="date"
                  @change="time = ''"
              />
            </label>

            <label class="field">
              <span>Время приезда *</span>
              <select
                  v-model="time"
                  :disabled="!date"
                  name="preferred_time"
                  required
              >
                <option value="">
                  {{ date ? "Выберите время" : "Сначала выберите дату" }}
                </option>
                <option v-for="slot in timeSlots" :key="slot" :value="slot">
                  {{ slot }}
                </option>
              </select>
            </label>
          </div>

          <p class="form-hint">
            Выбранное время — пожелание, а не бронь. Я подтвержу возможность
            приезда лично.
          </p>

          <label class="field">
            <span>Опишите задачу *</span>
            <textarea
                v-model="description"
                maxlength="2000"
                minlength="10"
                name="description"
                placeholder="Например: собрать комод и повесить две полки."
                required
                rows="4"
            />
          </label>

          <div class="estimate-row">
            <label class="field">
              <span>Примерная длительность</span>
              <select v-model.number="hours" name="estimated_hours">
                <option v-for="n in 8" :key="n" :value="n">{{ n }} ч.</option>
              </select>
            </label>

            <div>
              <span class="estimate-row__label">Ориентировочно от</span>
              <!--              <strong>{{ money.format(estimatedTotal) }} BYN</strong>-->
            </div>
          </div>

          <label class="field photo-field">
            <span>
              Фото задачи
              <small>JPG или PNG, до 5 файлов по 5 МБ</small>
            </span>
            <input
                accept="image/jpeg,image/png"
                multiple
                type="file"
                @change="addPhotos"
            />
          </label>

          <p v-if="photoError" class="form-message form-message--error" role="alert">
            {{ photoError }}
          </p>

          <div v-if="photos.length" class="photo-grid">
            <div v-for="photo in photos" :key="photo.id" class="photo-item">
              <img :src="photo.url" alt="Фото задачи"/>
              <button
                  :aria-label="`Удалить фото ${photo.id}`"
                  type="button"
                  @click="removePhoto(photo.id)"
              >
                ×
              </button>
            </div>
          </div>

          <div aria-hidden="true" class="honeypot" inert>
            <label>
              Ваш сайт
              <input
                  v-model="website"
                  autocomplete="off"
                  name="website"
                  tabindex="-1"
              />
            </label>
          </div>

          <label class="consent">
            <input v-model="consent" required type="checkbox"/>
            <span>
              Согласен на обработку данных для ответа на заявку, включая
              передачу описания и фото мастеру.
            </span>
          </label>

          <p class="form-hint">
            Не прикладывайте документы, банковские данные и фотографии
            посторонних людей.
          </p>

          <TurnstileWidget :key="turnstileWidgetKey" v-model:token="turnstileToken"/>

          <div class="order-form__actions">
            <button
                :disabled="submitting"
                class="button button--primary button--submit"
                type="submit"
            >
              {{ submitButtonText }}
              <span aria-hidden="true">→</span>
            </button>

            <button
                :disabled="submitting"
                class="button button--ghost button--clear"
                type="button"
                @click="onClearForm"
            >
              Очистить форму
            </button>
          </div>


<!--          <button :disabled="submitting" class="button button&#45;&#45;primary button&#45;&#45;submit">
            {{ submitButtonText }}
            <span aria-hidden="true">→</span>
          </button>-->

        </fieldset>

        <div
            v-if="Object.keys(fieldErrors).length"
            class="form-message form-message--error"
            role="alert"
        >
          <p v-for="(messages, key) in fieldErrors" :key="key">
            {{ messages[0] }}
          </p>
        </div>

        <p v-if="submitError" class="form-message form-message--error" role="alert">
          {{ submitError }}
        </p>

        <p v-if="success" class="form-message form-message--success" role="status">
          {{ success }}
        </p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.order-form__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.button--ghost {
  background: transparent;
  border: 1px solid currentColor;
  color: inherit;
}

.button--ghost:hover:not(:disabled) {
  opacity: 0.8;
}
</style>