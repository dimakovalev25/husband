<script setup>
import {PHONE} from "~/data/handyman";
import ThemeToggle from "~/components/handyman/ThemeToggle.vue";

const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'})
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

    <!--    <nav class="site-nav" aria-label="Основная навигация">
          <a  href="#order"  @click.prevent.stop="scrollTo('order')">Создать заказ</a >
          <a href="#review"  @click.prevent.stop="scrollTo('review')">Отзывы</a>
          <a href="#faq"  @click.prevent.stop="scrollTo('faq')">Вопросы</a>
        </nav>-->


    <nav class="site-nav" aria-label="Основная навигация">
      <button type="button" @click.prevent.stop="scrollTo('order')">Создать заказ</button>
      <!--      <a href="#services"  @click.prevent="scrollTo('services')">Что делаю</a>-->
      <button type="button" @click.prevent.stop="scrollTo('review')">Отзывы</button>
      <button type="button" @click.prevent.stop="scrollTo('faq')">Вопросы</button>
    </nav>

    <div class="site-header__actions">
      <!--      <a class="button button&#45;&#45;primary header-call" :href="`tel:${PHONE}`">Позвонить <span
                aria-hidden="true">↗</span></a>-->
      <ThemeToggle/>
    </div>
  </header>
</template>
