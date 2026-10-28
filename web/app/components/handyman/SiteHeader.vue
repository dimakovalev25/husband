<script setup>
import {PHONE} from "~/data/handyman";
import ThemeToggle from "~/components/handyman/ThemeToggle.vue";
</script>

<template>
  <header class="site-header">
    <a class="brand" aria-label="Муж на час в Гомеле — на главную">
      <div>
        <img class="brand__logo" src="../../assets/images/logo.jpg" alt="logo">
      </div>
      <span class="brand__copy"><strong>Муж на час</strong><small>Гомель</small></span>
<!--      <span class="brand__mark">МЧС</span>-->
    </a>
    <nav class="site-nav" aria-label="Основная навигация">
      <a href="#order">Создать заказ</a>
<!--      <a href="#services">Что делаю</a>-->
      <a href="#faq">Вопросы</a>
    </nav>
    <div class="site-header__actions">
      <a class="button button--primary header-call" :href="`tel:${PHONE}`">Позвонить <span
          aria-hidden="true">↗</span></a>
      <ThemeToggle/>
    </div>
  </header>
</template>
