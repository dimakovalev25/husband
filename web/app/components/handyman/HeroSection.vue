<script setup>
import {PHONE, PRICE_FROM} from "~/data/handyman";
import {useScrollTo} from "~/composables/useScrollTo";

const { scrollTo } = useScrollTo();
</script>

<template>
  <section id="top" class="hero section-wrap">
    <div class="hero__content">
      <div class="eyebrow"><span class="status-dot"></span> Работаю по Гомелю · Вечера и выходные</div>
      <h1>Домашние дела?<br/><span>Решим без хлопот.</span></h1>
      <p class="hero__lead">Соберу мебель, заменю сантехнику и помогу с мелким ремонтом. Стоимость согласуем до начала
        работ.</p>
      <div class="hero__actions">
        <button class="button button--primary button--large" @click.prevent.stop="scrollTo('order')">Создать заказ
        </button>
        <a class="button button--secondary button--large"
           :href="`tel:${PHONE}`">{{ PHONE === "+375298677824" ? "Позвонить мастеру" : PHONE }}</a>
      </div>
      <div class="hero__facts">
        <div><strong>от {{ PRICE_FROM }} BYN</strong><span>за час работы</span></div>
        <div><strong>17:00–20:00</strong><span>будни</span></div>
        <div><strong>09:00–20:00</strong><span>выходные</span></div>
      </div>
    </div>
    <!--    <div class="hero-visual" aria-label="Инструменты для домашнего ремонта" role="img">
          <div class="hero-visual__glow"></div>
          <div class="tool-card tool-card&#45;&#45;main"><div class="tool-card__top"><span>ДОМАШНИЙ МАСТЕР</span><span class="tool-card__icon">✳</span></div><div class="tool-illustration"><div class="tool-illustration__handle"></div><div class="tool-illustration__body"></div><div class="tool-illustration__tip"></div></div><div class="tool-card__bottom"><span>Аккуратно</span><span>По договорённости</span></div></div>
          <div class="floating-note floating-note&#45;&#45;top"><span>✓</span><div><strong>Цена заранее</strong><small>Без сюрпризов</small></div></div>
          <div class="floating-note floating-note&#45;&#45;bottom"><span class="floating-note__emoji">🧰</span><div><strong>С инструментом</strong><small>Всё необходимое с собой</small></div></div>
          <div class="hero-visual__number">01 / 06</div>
        </div>-->
  </section>
</template>
