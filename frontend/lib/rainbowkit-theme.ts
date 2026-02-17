'use client'

import merge from 'lodash.merge'
import type { Theme } from '@rainbow-me/rainbowkit'
import { lightTheme } from '@rainbow-me/rainbowkit'

/**
 * DuDucks custom RainbowKit theme
 * Completely redesigned - keeps our palette: #edd9c6, #ec9137 accent, black text
 */
const base = lightTheme({
  accentColor: '#ec9137',
  accentColorForeground: 'white',
  borderRadius: 'large',
  overlayBlur: 'large',
})

export const duducksRainbowTheme: Theme = merge({}, base, {
  colors: {
    accentColor: '#ec9137',
    accentColorForeground: 'white',
    modalBackground: '#fefdfb',
    modalBackdrop: 'rgba(237, 217, 198, 0.85)',
    modalBorder: '1px solid rgba(236, 145, 55, 0.2)',
    modalText: '#000000',
    modalTextDim: '#404040',
    modalTextSecondary: '#5c5048',
    closeButton: '#000000',
    closeButtonBackground: '#edd9c6',
    generalBorder: 'rgba(236, 145, 55, 0.25)',
    generalBorderDim: 'rgba(0, 0, 0, 0.08)',
    menuItemBackground: 'rgba(237, 217, 198, 0.5)',
    connectButtonBackground: '#ec9137',
    connectButtonText: 'white',
    actionButtonSecondaryBackground: 'rgba(236, 145, 55, 0.1)',
  },
  radii: {
    modal: '24px',
    modalMobile: '20px',
    actionButton: '12px',
    connectButton: '9999px',
    menuButton: '12px',
  },
  shadows: {
    dialog: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(236, 145, 55, 0.05)',
    selectedWallet: '0 0 0 2px #ec9137',
    selectedOption: '0 0 0 2px #ec9137',
  },
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
} as Theme)
