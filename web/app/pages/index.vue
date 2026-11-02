<script setup>
import HeroSection from "~/components/handyman/HeroSection.vue";
import ServicesSection from "~/components/handyman/ServicesSection.vue";
import OrderSection from "~/components/handyman/OrderSection.vue";
import FaqSection from "~/components/handyman/FaqSection.vue";

useSeoMeta({
  title: "Муж на час в Гомеле — мелкий ремонт и сборка мебели",
  description: "Муж на час в Гомеле: сборка мебели, полки и телевизор на стену, смесители, розетки, замки. Вечера и выходные. Цена до начала работ.",
  ogTitle: "Муж на час в Гомеле",
  ogDescription: "Мелкий ремонт и сборка мебели в Гомеле. Вечера и выходные, стоимость согласуем заранее.",
  ogType: "website"
});

useHead({
  meta: [{name: "theme-color", content: "#f7f5ef"}]
});

definePageMeta({
  layout: 'main-layout',
})

</script>

<template>
  <main>
    <div class="hero-shell">
      <div class="section-wrap">
        <HeroSection/>
      </div>
    </div>
    <ServicesSection/>
    <OrderSection/>
    <FaqSection/>
  </main>
</template>
