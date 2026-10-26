<script setup>
import { steps } from "~/data/handyman";
</script>

<template>
  <section id="how-it-works" class="section section-wrap"><div class="section-heading"><div><div class="eyebrow">Всё просто</div><h2>Три шага — и<br /><span>дело сделано.</span></h2></div><p>Понятный процесс без неопределённости: договариваемся о задаче, цене и времени до визита.</p></div><div class="steps-grid"><article v-for="(step, index) in steps" :key="step.title" class="step-card"><span class="step-card__number">0{{ index + 1 }}</span><div><h3>{{ step.title }}</h3><p>{{ step.text }}</p></div><span class="step-card__arrow" aria-hidden="true">↗</span></article></div></section>
</template>
