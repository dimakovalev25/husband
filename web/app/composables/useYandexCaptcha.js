import {ref} from "vue";

export function useYandexSmartCaptcha() {
  const captcha = ref(null);
  const token = ref("");

  const reset = () => captcha.value?.reset();

  return {captcha, token, reset};
}
