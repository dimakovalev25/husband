<script setup lang="ts">
import SiteHeader from "~/components/handyman/SiteHeader.vue";
import SiteFooter from "~/components/handyman/SiteFooter.vue";
import QuoutesLine from "~/components/handyman/uiComponents/QuoutesLine.vue";
</script>
<template>
  <div class="handyman-site">
    <div class="section-wrap">
      <SiteHeader/>
      <QuoutesLine/>
    </div>
    <div class="section-wrap">
      <slot/>
    </div>
    <SiteFooter/>
  </div>
</template>