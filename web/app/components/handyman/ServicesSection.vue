<script setup>
import { services } from "~/data/handyman";
</script>

<template>
  <section id="services" class="section section-wrap">
    <div class="section-heading"><div><div class="eyebrow">Чем могу помочь</div><h2>Мелочи, которые<br /><span>делают дом лучше.</span></h2></div><p>От одной полки до нескольких задач за один визит. Сначала обсуждаем объём, потом приступаю к работе.</p></div>
    <div class="services-grid">
      <article v-for="(service, index) in services" :key="service.title" class="service-card">
        <div class="service-card__top"><span class="service-card__icon">{{ service.icon }}</span><span class="service-card__number">0{{ index + 1 }}</span></div>
        <h3>{{ service.title }}</h3><p>{{ service.text }}</p><a href="#order" :aria-label="`Заказать услугу: ${service.title}`" class="service-card__link">Обсудить задачу <span>↗</span></a>
      </article>
    </div>
  </section>
</template>
