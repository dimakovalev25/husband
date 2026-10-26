
interface TurnstileOptions {
    sitekey: string
    theme?: 'light' | 'dark' | 'auto'
    language?: string
    callback?: (token: string) => void
    'expired-callback'?: () => void
    'error-callback'?: () => void
}

interface TurnstileApi {
    render(
        container: HTMLElement,
        options: TurnstileOptions
    ): string

    remove(widgetId: string): void
    reset(widgetId: string): void
}

declare global {
    interface Window {
        turnstile?: TurnstileApi
    }
}

export {}
