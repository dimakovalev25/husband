<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'

const emit = defineEmits(['update:token'])
const sitekey = useRuntimeConfig().public.smartcaptchaSitekey

const box = ref(null)
let widgetId = null

function render() {
  if (!box.value || widgetId !== null) return
  widgetId = window.smartCaptcha.render(box.value, {
    sitekey,
    hl: 'ru',
    callback: (t) => emit('update:token', t),
  })
  window.smartCaptcha.subscribe(widgetId, 'token-expired', () => emit('update:token', ''))
}

onMounted(() => {
  if (window.smartCaptcha) return render()

  let s = document.getElementById('smartcaptcha-js')
  if (!s) {
    s = document.createElement('script')
    s.id = 'smartcaptcha-js'
    s.src = 'https://smartcaptcha.yandexcloud.net/captcha.js'
    s.async = true
    document.head.appendChild(s)
  }
  s.addEventListener('load', render)
})

onBeforeUnmount(() => {
  if (widgetId !== null) window.smartCaptcha?.destroy(widgetId)
})

defineExpose({
  reset() {
    emit('update:token', '')
    if (widgetId !== null) window.smartCaptcha?.reset(widgetId)
  },
})
</script>

<template>
  <div class="ya-captcha" ref="box"></div>
</template>

<style scoped>
.ya-captcha{
  margin-bottom: 12px;
}
</style>