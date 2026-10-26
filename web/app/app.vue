<script lang="ts" setup>
import index from "~/pages/index.vue";
import { onMounted } from 'vue'


//Flowbite
import { useFlowbite } from '~/composables/useFlowbite';
import {
  initAccordions,
  initCarousels,
  initCollapses,
  initDials,
  initDismisses,
  initDrawers,
  initDropdowns,
  initModals,
  initPopovers,
  initTabs,
  initTooltips } from 'flowbite'

// initialize components based on data attribute selectors
onMounted(() => {
  useFlowbite(() => {
    initAccordions();
    initCarousels();
    initCollapses();
    initDials();
    initDismisses();
    initDrawers();
    initDropdowns();
    initModals();
    initPopovers();
    initTabs();
    initTooltips();
  })
})
//Flowbite end!

</script>

<template>
  <index/>
</template>

<style>
html, body, #__nuxt {
  margin: 0;
  padding: 0;
  min-height: 100%;
}
</style>