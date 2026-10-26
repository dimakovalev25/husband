<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'

const emit = defineEmits(['update:token'])

const config = useRuntimeConfig()
const container = ref(null)
const error = ref('')

let widgetId
let scriptElement

function loadScript() {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve()
      return
    }

    const existing = document.querySelector(
        'script[data-turnstile-script]'
    )

    if (existing) {
      existing.addEventListener('load', resolve, {once: true})
      existing.addEventListener(
          'error',
          () => reject(new Error('Не удалось загрузить Cloudflare')),
          {once: true}
      )
      return
    }

    scriptElement = document.createElement('script')
    scriptElement.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    scriptElement.async = true
    scriptElement.defer = true
    scriptElement.dataset.turnstileScript = 'true'
    scriptElement.onload = resolve
    scriptElement.onerror = () =>
        reject(new Error('Не удалось загрузить скрипт Cloudflare'))

    document.head.appendChild(scriptElement)
  })
}

onMounted(async () => {
  // const siteKey = config.public.turnstileSiteKey
  const siteKey = '0x4AAAAAAFmi4hX9owb_KcPc'

  if (!siteKey) {
    error.value = 'Не задан NUXT_PUBLIC_TURNSTILE_SITE_KEY'
    console.error(error.value)
    return
  }

  try {
    await loadScript()

    if (!container.value || !window.turnstile) {
      throw new Error('Turnstile API недоступен')
    }

    widgetId = window.turnstile.render(container.value, {
      sitekey: siteKey,
      theme: 'auto',
      language: 'ru',
      callback: (token) => {
        error.value = ''
        emit('update:token', token)
      },
      'expired-callback': () => {
        emit('update:token', '')
      },
      'error-callback': () => {
        emit('update:token', '')
        error.value = 'Cloudflare не смог выполнить проверку. Обновите страницу.'
      }
    })
  } catch (e) {
    console.error('Turnstile error:', e)
    error.value = e instanceof Error
        ? e.message
        : 'Не удалось загрузить Cloudflare'
  }
})

onBeforeUnmount(() => {
  if (widgetId && window.turnstile) {
    window.turnstile.remove(widgetId)
  }
})
</script>

<template>
  <div class="turnstile-widget">
    <div ref="container"/>

    <p v-if="error" class="turnstile-widget__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.turnstile-widget {
  margin: 16px 0;
  min-height: 65px;
}

.turnstile-widget__error {
  color: #dc2626;
  font-size: 14px;
  margin-top: 8px;
}
</style>
