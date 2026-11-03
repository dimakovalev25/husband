<script setup>
import { ref } from 'vue'
import {faq} from "~/data/handyman";
import {useScrollTo} from "~/composables/useScrollTo";
import QuestionModal from "~/components/handyman/uiComponents/QuestionModal.vue";

const { scrollTo } = useScrollTo();
const isQuestionOpen = ref(false)
</script>

<template>
  <section id="faq" class="faq-section">
    <div class="section-wrap faq-layout">
      <div>
        <div class="eyebrow">Есть вопросы?</div>
        <h2>Лучше уточнить<br/><span>заранее.</span></h2>
        <p>Если не нашли ответ — у Вас есть возможность задать Вопрос.</p>
        <!--        <a class="text-link" href="#order">Задать
                вопрос <span>→</span></a>-->
        <button class="button button--primary button--large"  @click="isQuestionOpen = true" @click.prevent.stop="scrollTo('order')">Задать
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

  <QuestionModal v-model:open="isQuestionOpen" />
</template>
