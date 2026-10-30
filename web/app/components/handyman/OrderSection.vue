<script setup>
import {PHONE, districts, services} from "~/data/handyman";
import {useOrderForm} from "~/composables/useOrderForm";
import YandexSmartCaptcha from "~/components/handyman/uiComponents/YandexSmartCaptcha.vue";
import {useYandexSmartCaptcha} from "~/composables/useYandexCaptcha";

const {captcha, token: captchaToken, reset: resetCaptcha} = useYandexSmartCaptcha();

const {goal} = useYandexMetrika()

const {
  customerName,
  phone,
  district,
  address,
  description,
  date,
  time,
  selected,
  submitting,
  success,
  submitError,
  fieldErrors,
  minDate,
  timeSlots,
  submitButtonText,
  toggleService,
  submitRequest,
  clearForm
} = useOrderForm({
  getCaptchaToken: () => captchaToken.value,
  resetCaptcha,
});

function onClearForm() {
  if (!confirm("Очистить все поля формы? Это действие нельзя отменить.")) {
    return;
  }
  clearForm();
  captcha.value?.reset();
}

</script>

<template>
  <section id="order" class="order-section">
    <div class="section-wrap order-layout">
      <div class="order-intro">
        <div class="eyebrow">Заявка без лишних звонков</div>


        <h2>
          Создайте заказ<br/>
        </h2>
        <span>заполните все поля в форме, это поможет мне быстрее дать обратную связь! </span>

        <p>
          я Вам перезвоню, обговорим работу, цену работы и сроки выполнения
        </p>
      </div>

      <form class="order-form" @submit.prevent="submitRequest" @focusin.once="goal('order_form_start')">
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
                  class="ym-disable-keys"
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
                  class="ym-disable-keys"
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

          <YandexSmartCaptcha ref="captcha" v-model:token="captchaToken"/>

          <div class="order-form__actions">
            <div>
              <button
                  :disabled="submitting"
                  class="button button--primary button--submit"
                  type="submit"
              >
                {{ submitButtonText }} →
              </button>
            </div>

            <div>
              <button
                  :disabled="submitting"
                  class="button button--ghost button--clear"
                  type="button"
                  @click="onClearForm"
              >
                Очистить форму
              </button>
            </div>

          </div>

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
