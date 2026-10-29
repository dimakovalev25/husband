<script setup>
import SiteHeader from "~/components/handyman/SiteHeader.vue";
import HeroSection from "~/components/handyman/HeroSection.vue";
import ServicesSection from "~/components/handyman/ServicesSection.vue";
import PricingSection from "~/components/handyman/PricingSection.vue";
import OrderSection from "~/components/handyman/OrderSection.vue";
import StepsSection from "~/components/handyman/StepsSection.vue";
import FaqSection from "~/components/handyman/FaqSection.vue";
import SiteFooter from "~/components/handyman/SiteFooter.vue";

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


</script>

<template>
  <div class="handyman-site">
    <div class="section-wrap">
      <SiteHeader/>
    </div>
    <main>
      <div class="hero-shell">
        <div class="section-wrap">
          <HeroSection/>
        </div>
      </div>
      <ServicesSection/>
      <OrderSection/>
      <FaqSection/>
      <!--      <PricingSection/>-->
      <!--      <StepsSection/>-->
    </main>
    <SiteFooter/>
    <!--    <a class="mobile-order-button" href="#order">Оставить заявку <span aria-hidden="true">→</span></a>-->
  </div>
</template>
