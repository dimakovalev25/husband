// https://nuxt.com/docs/api/configuration/nuxt-config

// import tailwindcss from '@tailwindcss/vite'

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
    app: {
        head: {
            htmlAttrs: {lang: 'ru'},
            script: [
                {
                    // Выполняется ДО первой отрисовки — тема не мигает
                    innerHTML: `
                        (function() {
                            try {
                                var stored = localStorage.getItem('theme');
                                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                var isDark = stored === 'dark' || (stored !== 'light' && prefersDark);
                                var root = document.documentElement;
                                if (isDark) {
                                    root.classList.add('dark');
                                    root.setAttribute('data-theme', 'dark');
                                } else {
                                    root.classList.remove('dark');
                                    root.setAttribute('data-theme', 'light');
                                }
                            } catch (e) {}
                        })();
                    `,
                    type: 'text/javascript',
                    link: [
                        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
                        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
                        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
                        { rel: 'manifest', href: '/site.webmanifest' },
                    ],
                },
            ],
        },
    },
    css: ['~/assets/styles/main.css'],
    vite: {
        plugins: [
            // tailwindcss(),
        ],
    },
    runtimeConfig: {
        laravelApiBase: "http://127.0.0.1:8000",
        public: {
            turnstileSiteKey: '',
            smartcaptchaSitekey: process.env.NUXT_PUBLIC_SMARTCAPTCHA_SITEKEY,
            ymId: process.env.NUXT_PUBLIC_YM_ID
        },
    },

})