// client/src/contexts/AccessibilityContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  dyslexiaFont: boolean;
  textToSpeech: boolean;
  speechToText: boolean;
  captionsEnabled: boolean;
  screenReader: boolean;
  keyboardNav: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  saveSettings: () => Promise<boolean>;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 16,
  highContrast: false,
  dyslexiaFont: false,
  textToSpeech: false,
  speechToText: false,
  captionsEnabled: false,
  screenReader: false,
  keyboardNav: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.style.setProperty('--base-font-size', `${settings.fontSize}px`);
    document.body.style.fontSize = `${settings.fontSize}px`;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Dyslexia font
    if (settings.dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }

    // Save to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  // Load settings from server on mount
  useEffect(() => {
    const loadServerSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await api.get('/auth/me');
        if (response.data.user?.accessibilitySettings) {
          const serverSettings = response.data.user.accessibilitySettings;
          setSettings(prev => ({
            ...prev,
            fontSize: serverSettings.fontSize || prev.fontSize,
            highContrast: serverSettings.colorScheme === 'high-contrast' || prev.highContrast,
            dyslexiaFont: serverSettings.fontFamily === 'OpenDyslexic' || prev.dyslexiaFont,
            textToSpeech: serverSettings.textToSpeechEnabled || prev.textToSpeech,
            captionsEnabled: serverSettings.captionsEnabled || prev.captionsEnabled,
          }));
        }
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
      }
    };
    loadServerSettings();
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const saveSettings = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      await api.put('/auth/accessibility', {
        fontSize: settings.fontSize,
        fontFamily: settings.dyslexiaFont ? 'OpenDyslexic' : 'Inter',
        colorScheme: settings.highContrast ? 'high-contrast' : 'default',
        textToSpeechEnabled: settings.textToSpeech,
        captionsEnabled: settings.captionsEnabled,
      });
      return true;
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
      return false;
    }
  }, [settings]);

  // Text-to-Speech functionality
  const speak = useCallback((text: string) => {
    if (!settings.textToSpeech || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [settings.textToSpeech]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return (
    <AccessibilityContext.Provider value={{ 
      settings, 
      updateSettings, 
      saveSettings, 
      speak, 
      stopSpeaking, 
      isSpeaking 
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}
