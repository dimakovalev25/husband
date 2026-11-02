<script setup>
const { theme, toggleTheme } = useTheme();
</script>

<template>
  <button
      class="theme-switch"
      type="button"
      role="switch"
      :aria-checked="theme === 'dark'"
      @click="toggleTheme"
  >
    <span class="theme-switch__thumb" :class="{ 'is-dark': theme === 'dark' }">
      <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="currentColor" class="thumb-icon">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor" class="thumb-icon">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </span>
  </button>
</template>

<style scoped>
.theme-switch {
  position: relative;
  width: 60px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #87ceeb, #4a90d9);
  cursor: pointer;
  padding: 3px;
  transition: background 0.4s;
}
:global(.dark) .theme-switch,
.theme-switch:has(.is-dark) {
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
}

.theme-switch__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fff;
  display: grid;
  place-items: center;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px #0003;
}
.theme-switch__thumb.is-dark {
  left: 31px;
}
.thumb-icon {
  width: 16px;
  height: 16px;
  color: #f59e0b;
}
.is-dark .thumb-icon { color: #6366f1; }
</style>

<!--
<script setup>
const { theme, toggleTheme } = useTheme();
</script>

<template>
    <button
        class="theme-toggle"
        type="button"
        :aria-label="theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'"
        :title="theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'"
        @click="toggleTheme"
    >
      <span aria-hidden="true">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
      <span class="theme-toggle__label">{{ theme === 'dark' ? 'Светлая' : 'Тёмная' }}</span>
    </button>

</template>

-->
