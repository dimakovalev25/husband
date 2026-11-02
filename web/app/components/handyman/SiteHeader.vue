```vue
<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ThemeToggle from '~/components/handyman/ThemeToggle.vue'
import { useScrollTo } from '~/composables/useScrollTo'

const { scrollTo } = useScrollTo()

const isMenuOpen = ref(false)

const closeMenu = () => {
  isMenuOpen.value = false
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleEscape = (event) => {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

watch(isMenuOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="site-header">
    <NuxtLink
        to="/"
        class="brand"
        aria-label="Муж на час в Гомеле — на главную"
        @click="closeMenu"
    >
      <div>
        <img
            class="brand__logo"
            src="../../assets/images/logo-light.png"
            alt="Логотип"
        >
      </div>

      <span class="brand__copy">
        <strong>Муж на час</strong>
        <small>Гомель</small>
      </span>
    </NuxtLink>

    <nav class="site-nav" aria-label="Основная навигация">
      <NuxtLink
          to="/#order"
          @click.prevent.stop="scrollTo('order')"
          class="button button--secondary button--large"
      >
        Создать заказ
      </NuxtLink>

      <NuxtLink
          to="/#faq"
          @click.prevent.stop="scrollTo('faq')"
          class="button button--secondary button--large"
      >
        Вопросы
      </NuxtLink>

      <NuxtLink to="/review"  class="button button--secondary button--large">
        Отзывы
      </NuxtLink>
    </nav>

    <div class="site-header__actions">
      <ThemeToggle />

      <button
          class="mobile-menu-button"
          :class="{ 'is-open': isMenuOpen }"
          type="button"
          :aria-expanded="isMenuOpen"
          :aria-label="isMenuOpen ? 'Закрыть меню' : 'Открыть меню'"
          aria-controls="mobile-menu"
          @click="toggleMenu"
      >
        <span class="mobile-menu-button__line"></span>
        <span class="mobile-menu-button__line"></span>
        <span class="mobile-menu-button__line"></span>
      </button>
    </div>

    <Transition name="sheet">
      <div
          v-if="isMenuOpen"
          class="mobile-menu-overlay"
          @click.self="closeMenu"
      >
        <aside
            id="mobile-menu"
            class="mobile-menu-panel"
            aria-label="Мобильная навигация"
        >
          <div class="mobile-menu-panel__grabber" aria-hidden="true"></div>

          <nav class="mobile-menu-panel__nav">
            <NuxtLink
                to="/#order"
                class="mobile-menu-panel__link"
                @click.prevent.stop="closeMenu(); scrollTo('order')"
            >
              <span>Создать заказ</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </NuxtLink>

            <NuxtLink
                to="/#faq"
                class="mobile-menu-panel__link"
                @click.prevent.stop="closeMenu(); scrollTo('faq')"
            >
              <span>Вопросы</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </NuxtLink>

            <NuxtLink
                to="/review"
                class="mobile-menu-panel__link"
                @click="closeMenu"
            >
              <span>Отзывы</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </NuxtLink>
          </nav>

          <div class="mobile-menu-panel__footer">
            <span class="mobile-menu-panel__footer-label">Тема</span>
            <ThemeToggle />
          </div>
        </aside>
      </div>
    </Transition>
  </header>
</template>
<style>
/* ---------- Кнопка-гамбургер ---------- */
.mobile-menu-button {
  position: relative;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  display: none;                /* показываем на мобилке через media */
  place-items: center;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s;
}

.mobile-menu-button:active {
  background: #8882;
}

.mobile-menu-button__line {
  position: absolute;
  left: 50%;
  width: 20px;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
  transform: translateX(-50%);
  transition:
      transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      opacity   0.2s linear,
      width     0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-button__line:nth-child(1) { top: 12px; }
.mobile-menu-button__line:nth-child(2) { top: 19px; }
.mobile-menu-button__line:nth-child(3) { top: 26px; }

/* Открытое состояние — превращаем в крестик */
.mobile-menu-button.is-open .mobile-menu-button__line:nth-child(1) {
  top: 19px;
  transform: translateX(-50%) rotate(45deg);
}
.mobile-menu-button.is-open .mobile-menu-button__line:nth-child(2) {
  opacity: 0;
  transform: translateX(-50%) scaleX(0.2);
}
.mobile-menu-button.is-open .mobile-menu-button__line:nth-child(3) {
  top: 19px;
  transform: translateX(-50%) rotate(-45deg);
}

/* Показываем гамбургер только на мобилке */
@media (max-width: 768px) {
  .mobile-menu-button {
    display: grid;
  }
  .site-nav {
    display: none;
  }
}
/* ---------- Оверлей ---------- */
.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px) saturate(120%);
  -webkit-backdrop-filter: blur(8px) saturate(120%);
  display: flex;
  align-items: flex-end;          /* панель снизу, как iOS sheet */
  justify-content: center;
}

/* ---------- Панель (bottom sheet) ---------- */
.mobile-menu-panel {
  width: 100%;
  max-width: 480px;
  background: var(--surface, #fff);
  color: var(--text, #111);
  border-radius: 24px 24px 0 0;
  padding: 8px 16px calc(16px + env(safe-area-inset-bottom));
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.18);

  display: flex;
  flex-direction: column;
  gap: 8px;

  /* было: max-height: 85vh; — теперь только как страховка */
  max-height: 85vh;
  overflow-y: auto;

  /* ключевое: */
  height: auto;          /* панель = высоте контента */
  flex: 0 0 auto;        /* не растягиваться во flex-контейнере оверлея */
  align-self: flex-end;  /* прижат к низу */
}

/* grabber */
.mobile-menu-panel__grabber {
  width: 40px;
  height: 5px;
  border-radius: 3px;
  background: #8884;
  margin: 4px auto 12px;
}

/* ---------- Навигация ---------- */
.mobile-menu-panel__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mobile-menu-panel__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 500;
  color: inherit;
  text-decoration: none;
  transition: background 0.15s;
}
.mobile-menu-panel__link:active {
  background: #8882;
}
.mobile-menu-panel__link svg {
  width: 18px;
  height: 18px;
  opacity: 0.35;
}

/* ---------- Футер ---------- */
.mobile-menu-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px 8px;
  margin-top: 4px;
  border-top: 1px solid #8882;
}
.mobile-menu-panel__footer-label {
  font-size: 15px;
  opacity: 0.6;
}
</style>