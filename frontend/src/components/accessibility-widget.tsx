// src/components/accessibility-widget.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, Check, Eye, Type, Moon, Minimize2, Volume2, ZoomIn, ZoomOut, AlignLeft, AlignCenter, Underline, Palette, Monitor, Mic, Keyboard, BookOpen, Heart, Facebook, Twitter, Linkedin, Github, Globe } from 'lucide-react'

// New accessibility icon (from the widget service)
const AccessibilityIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    style={{ fill: 'white' }}
    className={className}
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M20.5 6c-2.61.7-5.67 1-8.5 1s-5.89-.3-8.5-1L3 8c1.86.5 4 .83 6 1v13h2v-6h2v6h2V9c2-.17 4.14-.5 6-1l-.5-2zM12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
  </svg>
)

interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  extraLargeText: boolean
  readableFont: boolean
  removeAnimations: boolean
  increaseLineHeight: boolean
  highlightLinks: boolean
  grayscale: boolean
  invertColors: boolean
  underlineLinks: boolean
  focusOutline: boolean
  cursorSize: 'normal' | 'large' | 'extra-large'
  textSpacing: 'normal' | 'wide' | 'extra-wide'
}

const AccessibilityWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    extraLargeText: false,
    readableFont: false,
    removeAnimations: false,
    increaseLineHeight: false,
    highlightLinks: false,
    grayscale: false,
    invertColors: false,
    underlineLinks: false,
    focusOutline: true,
    cursorSize: 'normal',
    textSpacing: 'normal',
  })

  // Apply settings to document only when they change
  useEffect(() => {
    const root = document.documentElement

    // High Contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Large Text - Remove extra large if large is toggled off
    if (settings.largeText) {
      root.classList.add('large-text')
      root.classList.remove('extra-large-text')
    } else if (settings.extraLargeText) {
      root.classList.add('extra-large-text')
      root.classList.remove('large-text')
    } else {
      root.classList.remove('large-text')
      root.classList.remove('extra-large-text')
    }

    // Readable Font
    if (settings.readableFont) {
      root.classList.add('readable-font')
    } else {
      root.classList.remove('readable-font')
    }

    // Remove Animations
    if (settings.removeAnimations) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // Increase Line Height
    if (settings.increaseLineHeight) {
      root.classList.add('increase-line-height')
    } else {
      root.classList.remove('increase-line-height')
    }

    // Highlight Links
    if (settings.highlightLinks) {
      root.classList.add('highlight-links')
    } else {
      root.classList.remove('highlight-links')
    }

    // Grayscale
    if (settings.grayscale) {
      root.classList.add('grayscale')
    } else {
      root.classList.remove('grayscale')
    }

    // Invert Colors
    if (settings.invertColors) {
      root.classList.add('invert-colors')
    } else {
      root.classList.remove('invert-colors')
    }

    // Underline Links
    if (settings.underlineLinks) {
      root.classList.add('underline-links')
    } else {
      root.classList.remove('underline-links')
    }

    // Focus Outline
    if (settings.focusOutline) {
      root.classList.add('focus-outline')
    } else {
      root.classList.remove('focus-outline')
    }

    // Cursor Size
    root.classList.remove('cursor-normal', 'cursor-large', 'cursor-extra-large')
    root.classList.add(`cursor-${settings.cursorSize}`)

    // Text Spacing
    root.classList.remove('text-spacing-normal', 'text-spacing-wide', 'text-spacing-extra-wide')
    root.classList.add(`text-spacing-${settings.textSpacing}`)

    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
  }, [settings])

  // Load saved settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings(parsed)
      } catch (e) {
        console.error('Failed to load accessibility settings', e)
      }
    }
  }, [])

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    // Handle mutually exclusive text size options
    if (key === 'largeText') {
      setSettings(prev => ({ ...prev, largeText: !prev.largeText, extraLargeText: false }))
    } else if (key === 'extraLargeText') {
      setSettings(prev => ({ ...prev, extraLargeText: !prev.extraLargeText, largeText: false }))
    } else {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }
  }

  const updateCursorSize = (size: 'normal' | 'large' | 'extra-large') => {
    setSettings(prev => ({ ...prev, cursorSize: size }))
  }

  const updateTextSpacing = (spacing: 'normal' | 'wide' | 'extra-wide') => {
    setSettings(prev => ({ ...prev, textSpacing: spacing }))
  }

  const resetAll = () => {
    setSettings({
      highContrast: false,
      largeText: false,
      extraLargeText: false,
      readableFont: false,
      removeAnimations: false,
      increaseLineHeight: false,
      highlightLinks: false,
      grayscale: false,
      invertColors: false,
      underlineLinks: false,
      focusOutline: true,
      cursorSize: 'normal',
      textSpacing: 'normal',
    })
  }

  const activeCount = Object.entries(settings).filter(([key, value]) => {
    if (key === 'cursorSize') return value !== 'normal'
    if (key === 'textSpacing') return value !== 'normal'
    if (key === 'focusOutline') return false // Always on by default, not counted
    return value === true
  }).length

  return (
    <>
      {/* Accessibility Button - Bottom Left */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 ${activeCount > 0
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-brand-blue hover:bg-brand-purple'
          } text-white`}
        aria-label="Open accessibility menu"
      >
        <AccessibilityIcon className="w-7 h-7" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full text-xs flex items-center justify-center text-white font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* Accessibility Menu - Bottom Left aligned */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-5 duration-200 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-brand-blue to-brand-purple text-white">
            <div className="flex items-center gap-2">
              <AccessibilityIcon className="w-5 h-5" />
              <h3 className="font-semibold">Accessibility Menu</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close accessibility menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {/* Visual Adjustments Section */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visual Adjustments</p>

              {/* High Contrast */}
              <button
                onClick={() => toggleSetting('highContrast')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${settings.highContrast
                  ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <ContrastIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">High Contrast</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${settings.highContrast ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {settings.highContrast && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>

              {/* Grayscale */}
              <button
                onClick={() => toggleSetting('grayscale')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${settings.grayscale
                  ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grayscale Mode</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${settings.grayscale ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {settings.grayscale && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>

              {/* Invert Colors */}
              <button
                onClick={() => toggleSetting('invertColors')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${settings.invertColors
                  ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Invert Colors</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${settings.invertColors ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {settings.invertColors && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            </div>

            {/* Text Adjustments Section */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Text Adjustments</p>

              {/* Large Text */}
              <button
                onClick={() => toggleSetting('largeText')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${settings.largeText
                  ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Large Text (125%)</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${settings.largeText ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {settings.largeText && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>

              {/* Extra Large Text */}
              <button
                onClick={() => toggleSetting('extraLargeText')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${settings.extraLargeText
                  ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Extra Large Text (150%)</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${settings.extraLargeText ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {settings.extraLargeText && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>

              {/* Readable Font */}
              <button
                onClick={() => toggleSetting('readableFont')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${settings.readableFont
                  ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Readable Font (Dyslexia Friendly)</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${settings.readableFont ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {settings.readableFont && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>

              {/* Increase Line Height */}
              <button
                onClick={() => toggleSetting('increaseLineHeight')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${settings.increaseLineHeight
                  ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <AlignLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Increase Line Height</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${settings.increaseLineHeight ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {settings.increaseLineHeight && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>

              {/* Text Spacing */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">Letter Spacing</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateTextSpacing('normal')}
                    className={`flex-1 py-2 text-xs rounded-lg transition-colors ${settings.textSpacing === 'normal'
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => updateTextSpacing('wide')}
                    className={`flex-1 py-2 text-xs rounded-lg transition-colors ${settings.textSpacing === 'wide'
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                  >
                    Wide
                  </button>
                  <button
                    onClick={() => updateTextSpacing('extra-wide')}
                    className={`flex-1 py-2 text-xs rounded-lg transition-colors ${settings.textSpacing === 'extra-wide'
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                  >
                    Extra Wide
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Adjustments Section */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Navigation Adjustments</p>

              {/* Highlight Links */}
              <button
                onClick={() => toggleSetting('highlightLinks')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${settings.highlightLinks
                  ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Underline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Highlight Links</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${settings.highlightLinks ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {settings.highlightLinks && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>

              {/* Underline Links */}
              <button
                onClick={() => toggleSetting('underlineLinks')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${settings.underlineLinks
                  ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Underline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Underline Links</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${settings.underlineLinks ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {settings.underlineLinks && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>

              {/* Cursor Size */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">Cursor Size</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateCursorSize('normal')}
                    className={`flex-1 py-2 text-xs rounded-lg transition-colors ${settings.cursorSize === 'normal'
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => updateCursorSize('large')}
                    className={`flex-1 py-2 text-xs rounded-lg transition-colors ${settings.cursorSize === 'large'
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                  >
                    Large
                  </button>
                  <button
                    onClick={() => updateCursorSize('extra-large')}
                    className={`flex-1 py-2 text-xs rounded-lg transition-colors ${settings.cursorSize === 'extra-large'
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                  >
                    Extra Large
                  </button>
                </div>
              </div>

              {/* Reduce Motion */}
              <button
                onClick={() => toggleSetting('removeAnimations')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${settings.removeAnimations
                  ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Minimize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reduce Motion</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${settings.removeAnimations ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  {settings.removeAnimations && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetAll}
              className="w-full mt-3 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              Reset All Settings
            </button>
          </div>

          {/* Footer with Developer Info */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              WCAG 2.1 AA Compliant • Settings saved locally
            </p>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Developed by <strong className="text-brand-blue dark:text-brand-blue">Stephen Muli</strong> •{' '}
              <a
                href="https://ascorpi.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue dark:text-brand-blue hover:underline"
              >
                Pasbest Ventures
              </a>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1">
              <a
                href="https://ascorpi.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                aria-label="Visit Pasbest Ventures"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
              <Heart className="w-3 h-3 text-red-400 animate-pulse" />
              <span className="text-[10px] text-gray-400">Accessibility First</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Custom icons
const ContrastIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20" />
  </svg>
)

export default AccessibilityWidget
