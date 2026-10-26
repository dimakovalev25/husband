<script setup>
import { PRICE_FROM, services } from "~/data/handyman";
</script>

<template>
  <section id="prices" class="pricing-section">
    <div class="section-wrap pricing-layout">
      <div><div class="eyebrow">Понятные условия</div><h2>Сначала цена.<br /><span>Потом работа.</span></h2><p class="pricing-copy">Никаких неожиданных доплат в конце. Обсуждаем задачу и ориентировочную длительность заранее.</p><a class="button button--primary button--large" href="#order">Рассчитать стоимость <span>→</span></a></div>
      <div class="pricing-panel"><div class="pricing-panel__label">Почасовая оплата</div><div class="pricing-panel__price"><strong>от {{ PRICE_FROM }}</strong><span>BYN / час</span></div><div class="pricing-panel__line"></div><div class="pricing-panel__row"><span>Минимальный заказ</span><strong>1 час</strong></div><div class="pricing-panel__row"><span>Материалы и расходники</span><strong>По согласованию</strong></div><div class="pricing-panel__row"><span>Стоимость до начала</span><strong class="pricing-panel__yes">✓ Обязательно</strong></div><div class="pricing-panel__note">Итог зависит от задачи, сложности и необходимых материалов.</div></div>
    </div>
  </section>
</template>
