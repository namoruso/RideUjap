/**
 * Clerk: solo si hay VITE_CLERK_PUBLISHABLE_KEY.
 * Dominio @ujap.edu.ve se valida en el backend (sin Allowlist Pro).
 */
import type { App } from 'vue'
import { clerkPlugin } from '@clerk/vue'
import { esES } from '@clerk/localizations'

export const clerkPublishableKey = (
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
)?.trim()

export function clerkActivo(): boolean {
  return Boolean(clerkPublishableKey)
}

/** Apariencia alineada a --ride-green (#0b6e4f) */
export const clerkAppearance = {
  variables: {
    colorPrimary: '#0b6e4f',
    colorDanger: '#b91c1c',
    colorSuccess: '#0b6e4f',
    colorText: '#1a2e28',
    colorTextSecondary: '#5a6b63',
    colorBackground: '#ffffff',
    colorInputBackground: '#f7faf8',
    colorInputText: '#1a2e28',
    borderRadius: '0.75rem',
    fontFamily: 'inherit',
  },
  elements: {
    rootBox: {
      width: '100%',
      maxWidth: '26rem',
      margin: '0 auto',
    },
    cardBox: {
      boxShadow: 'none',
      width: '100%',
    },
    card: {
      boxShadow: 'none',
      border: 'none',
      padding: '0',
      background: 'transparent',
    },
    header: {
      display: 'none',
    },
    headerTitle: {
      fontSize: '1.35rem',
      fontWeight: '700',
    },
    headerSubtitle: {
      fontSize: '0.9rem',
    },
    socialButtonsBlockButton: {
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
    },
    formFieldInput: {
      borderRadius: '0.75rem',
    },
    formButtonPrimary: {
      backgroundColor: '#047857',
      fontWeight: '700',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 14px rgba(4, 120, 87, 0.22)',
      '&:hover': {
        backgroundColor: '#065f46',
      },
    },
    footerActionLink: {
      color: '#0b6e4f',
      fontWeight: '600',
    },
    identityPreviewEditButton: {
      color: '#0b6e4f',
    },
  },
} as const

export function instalarClerk(app: App) {
  if (!clerkPublishableKey) {
    console.info('[RideUJAP] Clerk desactivado (sin VITE_CLERK_PUBLISHABLE_KEY)')
    return
  }

  app.use(clerkPlugin, {
    publishableKey: clerkPublishableKey,
    localization: esES,
    appearance: clerkAppearance as never,
    signInUrl: '/login',
    signUpUrl: '/registro',
    // No force-redirect: Pinia debe sincronizar antes de salir de /login|/registro.
    // ClerkSessionSync + router bootstrap navegan a /onboarding o /inicio.
    afterSignOutUrl: '/login',
  })

  console.info(
    '[RideUJAP] Clerk activo — dominio @ujap.edu.ve se valida en el backend (sin Allowlist Pro)',
  )
}
