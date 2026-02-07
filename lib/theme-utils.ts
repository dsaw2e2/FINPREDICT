// Theme utilities for generating consistent color themes from a primary color

export interface ThemeColors {
  primary: string
  primaryForeground: string
  background: string
  foreground: string
  card: string
  cardForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
  ring: string
}

export interface ThemePreset {
  name: string
  nameRu: string
  primaryHue: number
  primaryChroma: number
  primaryLightness: number
}

// Preset themes with carefully chosen colors
export const themePresets: ThemePreset[] = [
  { name: "Purple", nameRu: "Фиолетовый", primaryHue: 264, primaryChroma: 0.22, primaryLightness: 0.45 },
  { name: "Blue", nameRu: "Синий", primaryHue: 220, primaryChroma: 0.2, primaryLightness: 0.5 },
  { name: "Teal", nameRu: "Бирюзовый", primaryHue: 175, primaryChroma: 0.15, primaryLightness: 0.45 },
  { name: "Green", nameRu: "Зеленый", primaryHue: 145, primaryChroma: 0.18, primaryLightness: 0.4 },
  { name: "Orange", nameRu: "Оранжевый", primaryHue: 30, primaryChroma: 0.2, primaryLightness: 0.55 },
  { name: "Rose", nameRu: "Розовый", primaryHue: 350, primaryChroma: 0.18, primaryLightness: 0.5 },
  { name: "Amber", nameRu: "Янтарный", primaryHue: 45, primaryChroma: 0.18, primaryLightness: 0.5 },
  { name: "Cyan", nameRu: "Голубой", primaryHue: 190, primaryChroma: 0.15, primaryLightness: 0.5 },
]

// Generate a complete theme from a primary color hue
export function generateTheme(hue: number, chroma: number, lightness: number, isDark: boolean): ThemeColors {
  if (isDark) {
    return {
      primary: `oklch(${lightness + 0.2} ${chroma} ${hue})`,
      primaryForeground: `oklch(0.98 0.005 0)`,
      background: `oklch(0.08 0.015 ${hue})`,
      foreground: `oklch(0.98 0.005 0)`,
      card: `oklch(0.12 0.02 ${hue})`,
      cardForeground: `oklch(0.98 0.005 0)`,
      muted: `oklch(0.18 0.03 ${hue})`,
      mutedForeground: `oklch(0.7 0.01 0)`,
      accent: `oklch(${lightness + 0.2} ${chroma} ${hue})`,
      accentForeground: `oklch(0.98 0.005 0)`,
      border: `oklch(0.2 0.03 ${hue})`,
      ring: `oklch(${lightness + 0.2} ${chroma} ${hue})`,
    }
  } else {
    return {
      primary: `oklch(${lightness} ${chroma} ${hue})`,
      primaryForeground: `oklch(0.98 0.005 ${hue})`,
      background: `oklch(0.98 0.005 ${hue})`,
      foreground: `oklch(0.15 0.02 ${hue})`,
      card: `oklch(1 0 0)`,
      cardForeground: `oklch(0.15 0.02 ${hue})`,
      muted: `oklch(0.96 0.01 ${hue})`,
      mutedForeground: `oklch(0.55 0.02 ${hue})`,
      accent: `oklch(0.96 0.01 ${hue})`,
      accentForeground: `oklch(0.15 0.02 ${hue})`,
      border: `oklch(0.92 0.01 ${hue})`,
      ring: `oklch(${lightness} ${chroma} ${hue})`,
    }
  }
}

// Apply theme colors to CSS variables
export function applyTheme(colors: ThemeColors): void {
  const root = document.documentElement
  root.style.setProperty("--primary", colors.primary)
  root.style.setProperty("--primary-foreground", colors.primaryForeground)
  root.style.setProperty("--accent", colors.accent)
  root.style.setProperty("--accent-foreground", colors.accentForeground)
  root.style.setProperty("--ring", colors.ring)
  root.style.setProperty("--border", colors.border)
  root.style.setProperty("--muted", colors.muted)
  root.style.setProperty("--muted-foreground", colors.mutedForeground)
}

// Get stored theme from localStorage
export function getStoredTheme(): ThemePreset | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("finpredict-theme")
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  return null
}

// Store theme to localStorage
export function storeTheme(preset: ThemePreset): void {
  if (typeof window === "undefined") return
  localStorage.setItem("finpredict-theme", JSON.stringify(preset))
}

// Get color preview for a theme preset
export function getPresetColor(preset: ThemePreset): string {
  return `oklch(${preset.primaryLightness + 0.1} ${preset.primaryChroma} ${preset.primaryHue})`
}
