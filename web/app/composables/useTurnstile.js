import { ref } from "vue";

export function useTurnstile() {
  const widgetKey = ref(0);
  const token = ref("");

  function reset() {
    token.value = "";
    widgetKey.value++;
  }

  return { widgetKey, token, reset };
}