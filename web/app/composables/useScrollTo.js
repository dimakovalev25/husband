export function useScrollTo(id) {

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'})

  return {scrollTo}
}