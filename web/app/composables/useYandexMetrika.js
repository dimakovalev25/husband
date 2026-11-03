export function useYandexMetrika() {
  const id = Number(useRuntimeConfig().public.ymId)

  const goal = (name, params) => {
    if (id && window.ym) window.ym(id, 'reachGoal', name, params)
  }

  return {goal}
}