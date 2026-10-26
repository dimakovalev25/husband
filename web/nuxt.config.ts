// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from '@tailwindcss/vite'

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
     // routeRules: { '/': { prerender: true } },
    app: {head: {htmlAttrs: {lang: 'ru'}}},
    css: ['~/assets/css/main.css'],
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
    runtimeConfig: {
        laravelApiBase: "http://127.0.0.1:8000",
        public: {
            turnstileSiteKey: ''
        },
    },

})




/*
export default defineNuxtConfig({
    css: ['~/assets/css/main.css'],
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
})*/
