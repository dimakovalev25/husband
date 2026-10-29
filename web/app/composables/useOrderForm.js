import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useFormDraft } from "~/composables/useFormDraft";

import {
  MAX_ESTIMATED_HOURS,
  PRICE_FROM,
  WORK_HOURS,
} from "~/data/handyman";
import {
  makePhotoEntry,
  revokePhoto,
  validatePhotoFiles,
} from "~/utils/photos";
import { formatBYN } from "~/utils/money";

const MINSK_TZ = "Europe/Minsk";

function minskToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MINSK_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * @param {() => string} getTurnstileToken — геттер токена из useTurnstile
 * @param {() => void} resetTurnstile — сброс токена/виджета после успеха
 */
export function useOrderForm({ getTurnstileToken, resetTurnstile }) {
  // ── поля формы ─────────────────────────────────────────────
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

  // ── статусы ────────────────────────────────────────────────
  const submitting = ref(false);
  const success = ref("");
  const submitError = ref("");
  const photoError = ref("");
  const fieldErrors = ref({});

  // ── автосохранение черновика ───────────────────────────────
  // ВАЖНО: вызывается ПОСЛЕ объявления всех ref'ов.
  // Фото (File) в localStorage не сохраняются — только текстовые поля.
  const draft = useFormDraft(
    "handyman:order:draft",
    {
      customerName,
      phone,
      district,
      address,
      description,
      date,
      time,
      hours,
      consent,
      selected,
      website,
    },
    {
      onRestore: (data) => {
        // если восстановленная дата уже в прошлом — сбрасываем её и время
        if (data.date && data.date < minskToday()) {
          date.value = "";
          time.value = "";
        }
      },
    },
  );

  // ── computed ───────────────────────────────────────────────
  const minDate = computed(() => minskToday());

  const isWeekend = computed(() => {
    if (!date.value) return false;
    const weekday = new Date(`${date.value}T12:00:00Z`).getUTCDay();
    return weekday === 0 || weekday === 6;
  });

  const timeSlots = computed(() => {
    if (!date.value) return [];
    const { start, end } = isWeekend.value
      ? WORK_HOURS.weekend
      : WORK_HOURS.weekday;

    return Array.from(
      { length: end - start },
      (_, i) => `${String(start + i).padStart(2, "0")}:00`,
    );
  });

  const hoursOptions = computed(() =>
    Array.from({ length: MAX_ESTIMATED_HOURS }, (_, i) => i + 1),
  );

  const estimatedTotal = computed(
    () => Math.max(1, Number(hours.value) || 1) * PRICE_FROM,
  );

  const estimatedTotalFormatted = computed(() =>
    formatBYN(estimatedTotal.value),
  );

  const selectedSet = computed(() => new Set(selected.value));

  const hasFieldErrors = computed(
    () => Object.keys(fieldErrors.value).length > 0,
  );

  const submitButtonText = computed(() =>
    submitting.value ? "Отправляем заявку…" : "Отправить заявку",
  );

  const timePlaceholder = computed(() =>
    date.value ? "Выберите время" : "Сначала выберите дату",
  );

  // ── действия с услугами ────────────────────────────────────
  function toggleService(title) {
    selected.value = selected.value.includes(title)
      ? selected.value.filter((item) => item !== title)
      : [...selected.value, title];
  }

  function isServiceSelected(title) {
    return selectedSet.value.has(title);
  }

  // ── действия с фото ────────────────────────────────────────
  function addPhotos(event) {
    photoError.value = "";
    const files = Array.from(event.target.files ?? []);
    const { accepted, error } = validatePhotoFiles(files, photos.value.length);

    if (error) photoError.value = error;
    photos.value.push(...accepted.map(makePhotoEntry));

    event.target.value = "";
  }

  function removePhoto(id) {
    const photo = photos.value.find((item) => item.id === id);
    if (photo) revokePhoto(photo);

    photos.value = photos.value.filter((item) => item.id !== id);
  }

  function clearPhotos() {
    photos.value.forEach(revokePhoto);
    photos.value = [];
  }

  onBeforeUnmount(clearPhotos);

  // ── сброс формы ────────────────────────────────────────────
  function resetForm() {
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
    website.value = "";
  }

  function clearForm() {
    resetForm();       // сбрасывает все поля и фото
    submitError.value = "";
    success.value = "";
    photoError.value = "";
    fieldErrors.value = {};
    draft.clear();     // чистим localStorage, чтобы не восстановилось
  }

  // ── отправка ───────────────────────────────────────────────
  function buildFormData(token) {
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
    body.append("cf-turnstile-response", token);
    // services.value.forEach(s => fd.append('services[]', s));

    selected.value.forEach((value) => body.append("services[]", value));
    photos.value.forEach((photo) => body.append("photos[]", photo.file));

    return body;
  }

  async function submitRequest() {
    if (submitting.value) return;

    submitting.value = true;
    success.value = "";
    submitError.value = "";
    fieldErrors.value = {};

    const turnstileToken = getTurnstileToken();
    if (!turnstileToken) {
      submitError.value = "Пройдите проверку Cloudflare перед отправкой.";
      submitting.value = false;
      return;
    }

    try {
      const csrf = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

/*      const response = await fetch("http://127.0.0.1:8000/store", {
        method: "POST",
        credentials: "same-origin",
        headers: {d
          Accept: "application/json",
          "X-CSRF-TOKEN": csrf,
        },
        body: buildFormData(turnstileToken),
      });*/

      // await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', {
      //   credentials: 'include',
      // });

// 2. Читаем токен из document.cookie
      const xsrf = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];



      const response = await fetch("http://127.0.0.1:8000/api/order", {
        method: "POST",
        headers: {
          Accept: "application/json",
          'X-XSRF-TOKEN': decodeURIComponent(xsrf) || 'd',
        },
        body: buildFormData(turnstileToken),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 422) {
        fieldErrors.value = data.errors ?? {};
        throw new Error("Проверьте заполнение формы.");
      }
      if (response.status === 429) {
        throw new Error("Слишком много заявок. Попробуйте немного позже.");
      }
/*      if (response.status === 419) {
        throw new Error("Страница устарела. Обновите её и отправьте снова.");
      }*/

      if (!response.ok) {
        throw new Error(data.message || "Не удалось отправить заявку.");
      }

      success.value = `Заявка №${data.id} принята. Свяжусь с вами для подтверждения времени и стоимости.`;

      resetForm();
      draft.clear();
      resetTurnstile();
    } catch (error) {
      submitError.value =
        error instanceof Error
          ? error.message
          : "Ошибка отправки. Попробуйте ещё раз.";
    } finally {
      submitting.value = false;
    }
  }

  // ── синхронизация времени с датой ──────────────────────────
  // Если дату очистили — время тоже не должно остаться «висеть».
  watch(date, (value) => {
    if (!value) time.value = "";
  });

  return {
    // поля
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
    // статусы
    submitting,
    success,
    submitError,
    photoError,
    fieldErrors,
    // computed
    minDate,
    isWeekend,
    timeSlots,
    hoursOptions,
    estimatedTotalFormatted,
    hasFieldErrors,
    submitButtonText,
    timePlaceholder,
    // действия
    toggleService,
    isServiceSelected,
    addPhotos,
    removePhoto,
    submitRequest,
    clearForm,
    draft,
  };
}