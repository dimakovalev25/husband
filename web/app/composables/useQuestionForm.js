// ~/composables/useQuestionForm.js
import { computed, reactive, ref } from "vue";

const PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;

function emptyFieldErrors() {
  return {
    name: [],
    phone: [],
    question: [],
    consent: [],
  };
}

export function useQuestionForm({ getCaptchaToken, resetCaptcha } = {}) {
  const name = ref("");
  const phone = ref("");
  const question = ref("");
  const consent = ref(false);
  const website = ref(""); // honeypot

  const submitting = ref(false);
  const success = ref("");
  const submitError = ref("");

  const fieldErrors = reactive(emptyFieldErrors());
  const touched = reactive({ name: false, phone: false, question: false, consent: false });

  const hasFieldErrors = computed(() =>
    Object.values(fieldErrors).some((arr) => arr.length > 0)
  );

  const submitButtonText = computed(() =>
    submitting.value ? "Отправляю…" : "Отправить вопрос"
  );

  function clearErrors() {
    Object.assign(fieldErrors, emptyFieldErrors());
    submitError.value = "";
  }

  function validate() {
    clearErrors();

    const trimmedName = name.value.trim();
    const trimmedPhone = phone.value.trim();
    const trimmedQuestion = question.value.trim();

    if (trimmedName.length < 2) {
      fieldErrors.name.push("Укажите имя (минимум 2 символа).");
    } else if (trimmedName.length > 100) {
      fieldErrors.name.push("Имя слишком длинное.");
    }

    if (!trimmedPhone) {
      fieldErrors.phone.push("Укажите телефон.");
    } else if (!PHONE_RE.test(trimmedPhone)) {
      fieldErrors.phone.push("Похоже, телефон введён неверно.");
    }

    if (trimmedQuestion.length < 5) {
      fieldErrors.question.push("Опишите вопрос подробнее (минимум 5 символов).");
    } else if (trimmedQuestion.length > 1000) {
      fieldErrors.question.push("Вопрос слишком длинный (максимум 1000 символов).");
    }

    return !hasFieldErrors.value;
  }



  async function submitQuestion() {
    if (submitting.value) return;

    const captchaToken = getCaptchaToken();
    if (!captchaToken) {
      submitError.value = "Подтвердите, что вы не робот.";
      submitting.value = false;
      return;
    }

    success.value = "";
    submitError.value = "";

    // honeypot: бот заполнил — тихо "успех"
    if (website.value.trim() !== "") {
      success.value = "Спасибо! Я свяжусь с вами в ближайшее время.";
      return;
    }

    if (!validate()) {
      submitError.value = "Проверьте отмеченные поля.";
      return;
    }
    submitting.value = true;

    try {
      const xsrf = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

      const res = await $fetch("http://127.0.0.1:8000/api/questions", {
        method: "POST",
        headers: {
          Accept: "application/json",
          'X-XSRF-TOKEN': decodeURIComponent(xsrf) || 'd',
        },
        body: {
          name: name.value.trim(),
          phone: phone.value.trim(),
          question: question.value.trim(),
          smart_token: captchaToken,
          website: website.value,
        },
      });

      success.value =
        (res && res.message) ||
        "Спасибо! Я свяжусь с вами в ближайшее время.";

      // сброс полей после успешной отправки
      name.value = "";
      phone.value = "";
      question.value = "";
      consent.value = false;
      website.value = "";
      Object.keys(touched).forEach((k) => (touched[k] = false));

    } catch (err) {
      const data = err?.data || err?.response?._data;
      if (data?.errors && typeof data.errors === "object") {
        for (const key of Object.keys(fieldErrors)) {
          if (Array.isArray(data.errors[key])) {
            fieldErrors[key].push(...data.errors[key]);
          }
        }
        if (hasFieldErrors.value) {
          submitError.value = "Проверьте отмеченные поля.";
        } else {
          submitError.value = data.message || "Не удалось отправить вопрос.";
        }
      } else {
        submitError.value =
          data?.message || "Не удалось отправить вопрос. Попробуйте ещё раз.";
      }
    } finally {
      submitting.value = false;
      resetCaptcha();
    }
  }

  function clearForm() {
    name.value = "";
    phone.value = "";
    question.value = "";
    consent.value = false;
    website.value = "";
    success.value = "";
    Object.keys(touched).forEach((k) => (touched[k] = false));
    clearErrors();
  }

  return {
    // state
    name,
    phone,
    question,
    consent,
    website,
    submitting,
    success,
    submitError,
    fieldErrors,
    touched,
    hasFieldErrors,
    submitButtonText,
    // actions
    submitQuestion,
    clearForm,
  };
}