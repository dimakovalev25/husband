<script setup>
import {faq} from "~/data/handyman";
</script>

<template>
  <section id="faq" class="faq-section">
    <div class="section-wrap faq-layout">
      <div>
        <div class="eyebrow">Есть вопросы?</div>
        <h2>Лучше уточнить<br/><span>заранее.</span></h2>
        <p>Если не нашли ответ — опишите задачу в заявке, и обсудим детали.</p>
        <!--        <a class="text-link" href="#order">Задать
                вопрос <span>→</span></a>-->
        <button class="button button--primary button--large" @click.prevent.stop="scrollTo('order')">Задать
          вопрос
        </button>
      </div>
      <div class="faq-list">
        <details v-for="item in faq" :key="item.q">
          <summary>{{ item.q }}<span aria-hidden="true">+</span></summary>
          <p>{{ item.a }}</p></details>
      </div>
    </div>
  </section>
</template>
