import React, { createContext, useState, useContext } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    // Default language is 'en' (English)
    const [language, setLanguage] = useState('en');

    const changeLanguage = (lang) => {
        setLanguage(lang);
    };

    // Helper function to get translation string by key (e.g., 'nav.home')
    const t = (key) => {
        const keys = key.split('.');
        let result = translations[language];
        for (const k of keys) {
            if (result && result[k] !== undefined) {
                result = result[k];
            } else {
                // Fallback to Indonesian if key not found
                let fallback = translations['id'];
                for (const fb of keys) {
                    if (fallback && fallback[fb] !== undefined) {
                        fallback = fallback[fb];
                    } else {
                        return key; // return the key itself if not found anywhere
                    }
                }
                return fallback;
            }
        }
        return result;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);
