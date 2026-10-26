import { onBeforeUnmount, onMounted, watch } from "vue";

const DEFAULT_DEBOUNCE = 400;

/**
 * Автосохранение реактивного состояния формы в localStorage.
 *
 * @param {string} key — ключ в localStorage
 * @param {Record<string, import('vue').Ref>} fields — объект ref'ов, которые надо сохранять
 * @param {object} [options]
 * @param {number} [options.debounce=400] — задержка записи, мс
 * @param {(value: any) => any} [options.serialize] — как писать (по умолчанию JSON.stringify)
 * @param {(raw: string) => any} [options.deserialize] — как читать (по умолчанию JSON.parse)
 * @param {(restored: Record<string, any>) => void} [options.onRestore] — колбэк после восстановления
 */
export function useFormDraft(key, fields, options = {}) {
  const {
    debounce = DEFAULT_DEBOUNCE,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onRestore,
  } = options;

  let timer = null;

  // ── запись ────────────────────────────────────────────────
  function snapshot() {
    const data = {};
    for (const [name, ref] of Object.entries(fields)) {
      data[name] = ref.value;
    }
    return data;
  }

  function saveNow() {
    try {
      localStorage.setItem(key, serialize(snapshot()));
    } catch {
      // квота/приватный режим — молча игнорируем
    }
  }

  function scheduleSave() {
    clearTimeout(timer);
    timer = setTimeout(saveNow, debounce);
  }

  const stopWatch = watch(
    () => Object.values(fields).map((r) => r.value),
    scheduleSave,
    { deep: true },
  );

  // ── чтение ────────────────────────────────────────────────
  function restore() {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;

      const data = deserialize(raw);
      if (!data || typeof data !== "object") return false;

      for (const [name, ref] of Object.entries(fields)) {
        if (name in data) ref.value = data[name];
      }

      onRestore?.(data);
      return true;
    } catch {
      return false;
    }
  }

  function clear() {
    clearTimeout(timer);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  onMounted(() => {
    restore();
  });

  onBeforeUnmount(() => {
    clearTimeout(timer);
    stopWatch();
    // финальный «догоняющий» save, чтобы не потерять последние правки
    saveNow();
  });

  return { saveNow, restore, clear };
}