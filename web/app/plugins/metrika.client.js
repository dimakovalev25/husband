// plugins/metrika.client.js
export default defineNuxtPlugin(() => {
  const id = Number(useRuntimeConfig().public.ymId)
  if (!id || import.meta.dev) return   // в деве статистику не мусорим

  window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments) }
  window.ym.l = Date.now()

  const s = document.createElement('script')
  s.async = true
  s.src = 'https://mc.yandex.ru/metrika/tag.js'
  document.head.appendChild(s)

  window.ym(id, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  })
})