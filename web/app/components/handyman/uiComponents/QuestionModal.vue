<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
          v-if="open"
          class="modal-backdrop"
          @click.self="close"
          @keydown.esc="close"
      >
        <div
            ref="modalRef"
            aria-labelledby="q-title"
            aria-modal="true"
            class="modal"
            role="dialog"
        >
          <button
              aria-label="Закрыть"
              class="modal__close"
              type="button"
              @click="close"
          >
            ×
          </button>

          <h3 id="q-title">Задать вопрос</h3>
          <p class="modal__subtitle">
            Оставьте имя и телефон — перезвоню и отвечу. Обычно в течение дня.
          </p>

          <form class="modal__form" novalidate @submit.prevent="submitQuestion">
            <label class="field">
              <span class="modal__form__subtitle">Ваше имя *</span>
              <input
                  v-model="name"
                  :aria-invalid="!!fieldErrors.name.length"
                  autocomplete="name"
                  maxlength="100"
                  name="name"
                  placeholder="Как к вам обращаться?"
                  required
                  @blur="touched.name = true"
              />
              <small v-if="fieldErrors.name.length" class="field__error">
                {{ fieldErrors.name[0] }}
              </small>
            </label>

            <label class="field">
              <span>Телефон *</span>
              <input
                  v-model="phone"
                  :aria-invalid="!!fieldErrors.phone.length"
                  autocomplete="tel"
                  maxlength="30"
                  name="phone"
                  placeholder="+375 29 123-45-67"
                  required
                  type="tel"
                  @blur="touched.phone = true"
              />
              <small v-if="fieldErrors.phone.length" class="field__error">
                {{ fieldErrors.phone[0] }}
              </small>
            </label>

            <label class="field">
              <span>Вопрос *</span>
              <textarea
                  v-model="question"
                  :aria-invalid="!!fieldErrors.question.length"
                  maxlength="1000"
                  minlength="5"
                  name="question"
                  placeholder="Например: можете ли собрать шкаф в субботу? ИЛИ Чините ли разбитые сердца? ИЛИ Нужно выследить человека! "
                  required
                  rows="4"
                  @blur="touched.question = true"
              />
              <small v-if="fieldErrors.question.length" class="field__error">
                {{ fieldErrors.question[0] }}
              </small>
            </label>

            <!-- honeypot -->
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

            <YandexSmartCaptcha ref="captcha" v-model:token="captchaToken"/>

            <p v-if="submitError" class="form-message form-message--error" role="alert">
              {{ submitError }}
            </p>
            <p v-if="success" class="form-message form-message--success" role="status">
              {{ success }}
            </p>

            <div class="modal__actions">
              <button
                  :disabled="submitting"
                  class="button button--primary"
                  type="submit"
              >
                {{ submitButtonText }}
              </button>
              <button
                  :disabled="submitting"
                  class="button button--ghost"
                  type="button"
                  @click="close"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useQuestionForm } from "~/composables/useQuestionForm";
import YandexSmartCaptcha from "~/components/handyman/uiComponents/YandexSmartCaptcha.vue";

import {useYandexSmartCaptcha} from "~/composables/useYandexCaptcha";

const {captcha, token: captchaToken, reset: resetCaptcha} = useYandexSmartCaptcha();

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["update:open"]);

// const { widgetKey, token: turnstileToken, reset: resetTurnstile } = useTurnstile();

const {
  name,
  phone,
  question,
  website,
  submitting,
  success,
  submitError,
  fieldErrors,
  touched,
  submitButtonText,
  submitQuestion,
  clearForm,
} = useQuestionForm({
  getCaptchaToken: () => captchaToken.value,
  resetCaptcha,
});

const modalRef = ref(null);
let previouslyFocused = null;
let previousOverflow = "";
let autoCloseTimer = null;

function close() {
  if (submitting.value) return;
  emit("update:open", false);
}

/* --- блокировка скролла + запоминание фокуса + focus-trap --- */
function onKeydownTrap(e) {
  if (e.key !== "Tab" || !modalRef.value) return;
  const focusable = modalRef.value.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

watch(
    () => props.open,
    async (isOpen) => {
      if (isOpen) {
        previouslyFocused = document.activeElement;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeydownTrap);

        await nextTick();
        const firstField = modalRef.value?.querySelector("input, textarea");
        firstField?.focus();
      } else {
        document.body.style.overflow = previousOverflow;
        document.removeEventListener("keydown", onKeydownTrap);
        previouslyFocused?.focus?.();

        // resetTurnstile();
        if (success.value) clearForm();
      }
    }
);

watch(success, (val) => {
  if (!val) return;
  clearTimeout(autoCloseTimer);
  autoCloseTimer = setTimeout(() => {
    emit("update:open", false);
  }, 2500);
});

onBeforeUnmount(() => {
  clearTimeout(autoCloseTimer);
  document.removeEventListener("keydown", onKeydownTrap);
  document.body.style.overflow = previousOverflow;
});
</script>

<style scoped>
/* Используем только реальные токены из 01-tokens.css.
   Модалка живёт на .modal-backdrop — там же объявляем локальные алиасы,
   которые ссылаются на глобальные токены. В dark они сами меняются. */
.modal-backdrop {
  --modal-bg: var(--surface);
  --modal-text: var(--text);
  --modal-muted: var(--muted);
  --modal-border: var(--line);
  --modal-field-bg: var(--bg);
  --modal-accent: var(--accent-success, #7fa824);
  --modal-accent-ring: rgba(127, 168, 36, 0.2);
  --modal-danger: var(--red, #ff0000);
  --modal-danger-bg: color-mix(in srgb, var(--red, #ff0000) 12%, var(--surface));
  --modal-success: var(--accent-success, #7fa824);
  --modal-success-bg: color-mix(in srgb, var(--accent-success, #7fa824) 15%, var(--surface));

  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: rgba(15, 18, 24, 0.55);
  backdrop-filter: blur(4px);
  overflow-y: auto;
}

.modal {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: var(--space-5) var(--space-4) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--modal-bg);
  color: var(--modal-text);
  box-shadow: var(--shadow-md);
  transition: background 0.2s ease, color 0.2s ease;
}

.modal__close {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  color: var(--modal-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.modal__close:hover {
  background: var(--surface-soft);
  color: var(--modal-text);
}

.modal h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--text-xl);
  color: var(--modal-text);
}

.modal__subtitle {
  margin: 0 0 var(--space-4);
  font-size: var(--text-base);
  color: var(--modal-muted);
}

.modal__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--text-base);
}
.field > span,
.modal__form__subtitle {
  font-weight: 500;
  color: var(--modal-text);
}
.field input,
.field textarea {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--modal-border);
  border-radius: var(--radius-sm);
  font: inherit;
  background: var(--modal-field-bg);
  color: var(--modal-text);
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s, color 0.15s;
}
.field input::placeholder,
.field textarea::placeholder {
  color: var(--modal-muted);
  opacity: 0.8;
}
.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--modal-accent);
  box-shadow: 0 0 0 3px var(--modal-accent-ring);
}
.field input[aria-invalid="true"],
.field textarea[aria-invalid="true"] {
  border-color: var(--modal-danger);
}

.field__error {
  font-size: var(--text-sm);
  color: var(--modal-danger);
}

.honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.consent {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: var(--text-md);
  color: var(--modal-muted);
}
.consent input {
  margin-top: 2px;
}

.form-message {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-md);
}
.form-message--error {
  background: var(--modal-danger-bg);
  color: var(--modal-danger);
}
.form-message--success {
  background: var(--modal-success-bg);
  color: var(--modal-success);
}

.modal__actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-1);
}
.modal__actions .button {
  flex: 1;
}

/* transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .modal,
.modal-fade-leave-active .modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-fade-enter-from .modal,
.modal-fade-leave-to .modal {
  transform: translateY(12px) scale(0.98);
  opacity: 0;
}

@media (max-width: 480px) {
  .modal {
    padding: var(--space-4) var(--space-3) var(--space-3);
    border-radius: var(--radius-sm);
  }
}
</style>