import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AppContextType {
  language: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  
  // Create a state to hold the current language, initialized from i18next
  const [language, setLanguage] = useState(i18n.language);

  // Use an effect to listen for language changes from i18next
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log(`Language changed to: ${lng}`); // For debugging
      setLanguage(lng);
    };

    // Subscribe to the 'languageChanged' event
    i18n.on('languageChanged', handleLanguageChange);

    // Cleanup function to remove the event listener on component unmount
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]); // Dependency array ensures this runs only when i18n instance changes

  // The value that will be supplied to all consuming components
  const value = { language };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Create a custom hook for easy consumption of the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};