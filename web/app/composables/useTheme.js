export function useTheme() {
  const theme = useState("handyman-theme", () => "light");

  function applyTheme(value) {
    theme.value = value;
    if (import.meta.client) {
      document.documentElement.dataset.theme = value;
      localStorage.setItem("handyman-theme", value);
    }
  }

  function toggleTheme() {
    applyTheme(theme.value === "dark" ? "light" : "dark");
  }

  onMounted(() => {
    const saved = localStorage.getItem("handyman-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    applyTheme(saved || preferred);
  });

  return { theme, toggleTheme };
}
