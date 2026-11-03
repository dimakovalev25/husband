export default defineNuxtConfig({
    modules: ['@nuxtjs/sitemap', '@nuxtjs/robots'],
    site: {name: 'Муж на час Гомель'}, // url берётся из NUXT_PUBLIC_SITE_URL
    css: ['~/assets/styles/main.css'],

    app: {
        head: {
            htmlAttrs: {lang: 'ru'},
            script: [{
                innerHTML: `(function(){try{var s=localStorage.getItem('theme'),d=matchMedia('(prefers-color-scheme: dark)').matches,
                    dark=s==='dark'||(s!=='light'&&d),r=document.documentElement;
                    r.classList.toggle('dark',dark);r.setAttribute('data-theme',dark?'dark':'light')}catch(e){}})()`,
            }],
            link: [
                {rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'},
                {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png'},
                {rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png'},
                {rel: 'manifest', href: '/site.webmanifest'},
            ],
        },
    },

    // только dev; цель берём из .env
    nitro: {
        devProxy: Object.fromEntries(
            ['/api', '/sanctum'].map(p => [p, {
                target: `${process.env.DEV_API_TARGET || 'http://hasbend.test'}${p}`,
                changeOrigin: true,
                headers: {'X-Forwarded-Host': 'localhost:3000'},
            }])
        ),
    },

    // пустые значения = "ключ существует", реальные приходят из NUXT_* в рантайме
    runtimeConfig: {
        laravelApiBase: 'http://127.0.0.1:8000', // NUXT_LARAVEL_API_BASE
        public: {
            smartcaptchaSitekey: '',             // NUXT_PUBLIC_SMARTCAPTCHA_SITEKEY
            ymId: '',                            // NUXT_PUBLIC_YM_ID
        },
    },
})