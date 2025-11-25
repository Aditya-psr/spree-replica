import React, { createContext, useState, useContext } from "react";

const API_KEY = "YOUR_GOOGLE_API_KEY";

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const cache = {};

  const translateText = async (text) => {
    if (language === "en") return text; 
    if (cache[text + language]) return cache[text + language]; 
    try {
      const res = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: text,
            target: language,
            format: "text",
          }),
        }
      );
      const data = await res.json();
      const translated = data.data.translations[0].translatedText;
      cache[text + language] = translated;
      return translated;
    } catch (err) {
      console.error("Translation API error:", err);
      return text;
    }
  };

  const t = (text) => {
    if (language === "en") return text;
    return translateText(text); 
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, translateText }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => useContext(TranslationContext);
