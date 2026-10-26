<script setup>
import { PHONE, PHONE_VIEW, TG } from "~/data/handyman";
</script>

<template>
  <footer class="site-footer"><div class="section-wrap site-footer__main"><a class="brand" href="#top"><span class="brand__mark">МЧ</span><span class="brand__copy"><strong>Муж на час</strong><small>Гомель и рядом</small></span></a><p>Помогаю дому работать как надо.</p><a class="site-footer__phone" :href="`tel:${PHONE}`">{{ PHONE_VIEW }}</a></div><div class="section-wrap site-footer__bottom"><span>© {{ new Date().getFullYear() }} · Муж на час в Гомеле</span><span>Вечера и выходные</span><a :href="`https://t.me/${TG}`" target="_blank" rel="noopener noreferrer">Telegram ↗</a></div></footer>
</template>
