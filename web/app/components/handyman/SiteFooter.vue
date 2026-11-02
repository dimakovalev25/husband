<script setup>
import {PHONE, PHONE_VIEW, TG} from "~/data/handyman";
const {goal} = useYandexMetrika()
</script>

<template>
  <footer class="site-footer">
    <div class="section-wrap site-footer__main"><a class="brand" href="#top"><span class="brand__mark">МЧС</span><span
        class="brand__copy"><strong>Мастер на час</strong></span></a>
<!--      <a @click="goal('call_click')" class="site-footer__phone" :href="`tel:${PHONE}`">{{ PHONE_VIEW }}</a>-->
    </div>
    <div class="section-wrap site-footer__bottom">
      <span>© {{
        new Date().getFullYear()
      }} · Муж на час в Гомеле
      </span>
      <span> 
        Самозанятый  <span class="blurred">
         Ковалев А.А. Номер:888888888888
      </span>
      </span>

      <a @click="goal('tg_click')" :href="`https://t.me/${TG}`"
         target="_blank"
         rel="noopener noreferrer">
        Telegram ↗</a>
    </div>
  </footer>
</template>

<style>
.blurred {
  filter: blur(4px);
  user-select: none;        /* нельзя выделить и скопировать */
  cursor: default;
  transition: filter 0.2s;
}
</style>
