import React, { createContext, useContext, useEffect, useState } from 'react'

interface AppearanceSettings {
  primaryColor: string
  theme: 'light' | 'dark' | 'system'
}

interface ThemeContextType {
  appearance: AppearanceSettings
  setAppearance: (settings: AppearanceSettings) => void
  updatePrimaryColor: (color: string) => void
  updateTheme: (theme: 'light' | 'dark' | 'system') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    primaryColor: 'indigo',
    theme: 'light',
  })

  // Appliquer le thème au chargement
  useEffect(() => {
    const savedAppearance = localStorage.getItem('appearance_settings')
    if (savedAppearance) {
      const parsed = JSON.parse(savedAppearance)
      setAppearance(parsed)
      applyTheme(parsed.theme)
      applyPrimaryColor(parsed.primaryColor)
    }
  }, [])

  // Appliquer le thème
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  // Appliquer la couleur primaire
  const applyPrimaryColor = (color: string) => {
    const root = document.documentElement
    const colorMap: Record<string, string> = {
      indigo: '#4f46e5',
      violet: '#7c3aed',
      blue: '#2563eb',
      emerald: '#059669',
      orange: '#ea580c',
      pink: '#db2777',
    }
    
    const primaryColorValue = colorMap[color] || colorMap.indigo
    root.style.setProperty('--primary-color', primaryColorValue)
    root.style.setProperty('--primary-hover', `${primaryColorValue}cc`)
    root.style.setProperty('--primary-light', `${primaryColorValue}20`)
  }

  const updatePrimaryColor = (color: string) => {
    const newAppearance = { ...appearance, primaryColor: color }
    setAppearance(newAppearance)
    localStorage.setItem('appearance_settings', JSON.stringify(newAppearance))
    applyPrimaryColor(color)
  }

  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    const newAppearance = { ...appearance, theme }
    setAppearance(newAppearance)
    localStorage.setItem('appearance_settings', JSON.stringify(newAppearance))
    applyTheme(theme)
  }

  // Écouter les changements de thème système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (appearance.theme === 'system') {
        applyTheme('system')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [appearance.theme])

  return (
    <ThemeContext.Provider value={{ appearance, setAppearance, updatePrimaryColor, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}