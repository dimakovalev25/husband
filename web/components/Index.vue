<script setup>
import HusbandGPT2 from "~~/components/HusbandGPT2.vue";

/*
 *   SEO! и его проверка!
 *   npx nuxt generate
 *   npx serve .output/public
 *   curl -s http://localhost:3000 | grep -i "<h1"
 *   Если в сыром HTML есть <h1>, текст и JSON-LD,
 *   то поисковик увидит то же самое. В SPA там был бы пустой <div id="app">.
 * */

useSeoMeta({
  title: "Муж на час в Гомеле — мелкий ремонт и сборка мебели",
  description:
      "Сборка мебели, полки и телевизор на стену, смесители, розетки, замки. Вечера и выходные. Цена до начала работ.",
  ogTitle: "Муж на час в Гомеле",
});
useHead({
  link: [{rel: "canonical", href: "https://example.by/"}],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        name: "Муж на час Гомель",
        areaServed: {"@type": "City", name: "Гомель"},
        telephone: "+375XXXXXXXXX",
      }),
    },
  ],
});

/*
const { public: { apiBase } } = useRuntimeConfig()
await $fetch('/leads', { baseURL: apiBase, method: 'POST', body: { name, phone, text } })
*/
</script>

<template>
  <div>
    here!!!!!!!
  <HusbandGPT2/>
  </div>
</template>

<style scoped></style>
