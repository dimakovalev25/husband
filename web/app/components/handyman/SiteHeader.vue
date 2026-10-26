<script setup>
import { PHONE } from "~/data/handyman";
</script>

<template>
  <header class="site-header">
    <a class="brand" href="#top" aria-label="Муж на час в Гомеле — на главную">
      <span class="brand__mark">МЧ</span>
      <span class="brand__copy"><strong>Муж на час</strong><small>Гомель и рядом</small></span>
    </a>
    <nav class="site-nav" aria-label="Основная навигация">
      <a href="#services">Услуги</a>
      <a href="#prices">Цены</a>
      <a href="#how-it-works">Как работаю</a>
      <a href="#faq">Вопросы</a>
    </nav>
    <div class="site-header__actions">
      <ThemeToggle />
      <a class="button button--primary header-call" :href="`tel:${PHONE}`">Позвонить <span aria-hidden="true">↗</span></a>
    </div>
  </header>
</template>
