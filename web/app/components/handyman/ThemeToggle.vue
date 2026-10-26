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
