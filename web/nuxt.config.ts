// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    nitro: {
        devProxy: Object.fromEntries(
            ['/login', '/register', '/logout', '/forgot-password', '/reset-password', '/api', '/sanctum', '/build']
                .map(p => [p, {
                    target: `http://hasbend.test${p}`,
                    changeOrigin: true,
                    headers: {'X-Forwarded-Host': 'localhost:3000'},
                }])
        ),
    },
    routeRules: {'/mainpage': {ssr: false}},
    modules: ['@nuxtjs/sitemap', '@nuxtjs/robots'],
    site: {url: 'https://example.by', name: 'Муж на час Гомель'},
    runtimeConfig: {public: {apiBase: 'http://localhost:8000/api'}},
    // routeRules: { '/': { prerender: true } },
    app: {head: {htmlAttrs: {lang: 'ru'}}},
    // css: ['~/assets/css/main.css'],
})

