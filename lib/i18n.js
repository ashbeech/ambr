import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { pick } from "accept-language-parser";
//import Debug from "debug";
//import { captureException } from '../lib/sentry.js'
import { i18nFormat } from "./i18n-format.js";
import { fetcher } from "./fetcher.js";

import { isProd } from "../config.js";
import { setEventContext } from "./event-context.js";

//const debug = Debug("ambr:i18n");

const DEFAULT_LANG = "en-US";

const COOKIE_MAX_AGE_SECS = 3600 * 24 * 365; // 1 year
const COOKIE_SUFFIX = `; Max-Age=${COOKIE_MAX_AGE_SECS}; Path=/; Secure; SameSite=Lax`;

// These should be set in priority order for matching
export const supportedLanguages = {
  /*
   * Latin scripts
   */

  // Keep English listed first
  "en-US": {
    name: "English",
    title: "English",
  },

  "da-DK": {
    name: "Dansk",
    title: "Danish",
  },

  "de-DE": {
    name: "Deutsch",
    title: "German",
  },

  "es-ES": {
    name: "Español",
    title: "Spanish",
  },

  "eu-ES": {
    name: "Euskara",
    title: "Basque",
  },

  "fr-FR": {
    name: "Français",
    title: "French",
  },

  "hu-HU": {
    name: "Magyar",
    title: "Hungarian",
  },

  "id-ID": {
    name: "Bahasa Indonesia",
    title: "Indonesian",
  },

  "it-IT": {
    name: "Italiano",
    title: "Italian",
  },

  "nl-NL": {
    name: "Nederlands",
    title: "Dutch",
  },

  "no-NO": {
    name: "Norsk",
    title: "Norwegian",
  },

  "pl-PL": {
    name: "Polski",
    title: "Italian",
  },

  "pt-PT": {
    name: "Português",
    title: "Portuguese",
  },
  "pt-BR": {
    name: "Português brasileiro",
    title: "Brazilian Portuguese",
  },

  "ro-RO": {
    name: "Română",
    title: "Romanian",
  },

  "sv-SE": {
    name: "Svenska",
    title: "Swedish",
  },

  "tr-TR": {
    name: "Türkçe",
    title: "Turkish",
  },

  "vi-VN": {
    name: "Tiếng Việt",
    title: "Vietnamese",
  },

  /*
   * Non-latin scripts
   */

  "ar-SA": {
    name: "العربية",
    title: "Arabic",
  },

  "el-GR": {
    name: "Ελληνικά",
    title: "Greek",
  },

  "fa-IR": {
    name: "فارسی",
    title: "Persian",
  },

  "he-IL": {
    name: "עברית",
    title: "Hebrew",
  },

  "hi-IN": {
    name: "हिन्दी, हिंदी",
    title: "Hindi",
  },

  "ja-JP": {
    name: "日本語",
    title: "Japanese",
  },

  "ko-KR": {
    name: "한국어",
    title: "Korean",
  },

  "zh-CN": {
    name: "简体中文",
    title: "Simplified Chinese",
  },
  "zh-TW": {
    name: "繁體中文",
    title: "Traditional Chinese",
  },
};

if (!isProd) {
  supportedLanguages.cimode = {
    name: "CI Mode",
    title: "CI Mode",
  };
}

const supportedLanguageCodes = Object.keys(supportedLanguages);

// Backend for i18next to dynamically load additional languages
const backend = {
  type: "backend",
  read: (language, namespace, callback) => {
    if (namespace !== "translation") {
      callback(new Error(`Unsupported namespace: ${namespace}`));
      return;
    }

    loadTranslation(language).then(
      (translation) => callback(null, translation),
      (err) => callback(err)
    );
  },
};

const instancesByLanguage = {};
export const getI18nForLanguage = (language, preloadedResources = {}) => {
  let instance = instancesByLanguage[language];
  if (!instance) {
    instance = i18next.createInstance().use(backend).use(initReactI18next);
    instance.init(
      {
        // Use JSON Format v3 for now until we're ready to upgrade
        // See: https://www.i18next.com/misc/migration-guide#v-20-x-x-to-v-21-0-0
        compatibilityJSON: "v3",
        // Language
        lng: language,
        // Used if translations are missing
        fallbackLng: DEFAULT_LANG,
        resources: preloadedResources,
        // Use fallback when translation is an empty string
        returnEmptyString: false,
        // Synchronously init (instead of on the next tick)
        initImmediate: false,
        // Allow preloading translations in `resources` and also
        // fetching more through `backend`
        partialBundledLanguages: true,
        // Don't try to also load more general translations, e.g. 'es' when 'es-ES' is specified
        load: "currentOnly",
        // Disable suspense while dynamically loading translations
        react: {
          useSuspense: false,
          // Wrap text nodes in <span> tags to workaround Google Translate
          // issue with React apps.
          // See: https://github.com/facebook/react/issues/11538
          transWrapTextNodes: "span",
        },
        interpolation: {
          // Custom formatting for numbers, bytes, percentages, etc.
          format: (value, format, language = instance.language) =>
            i18nFormat(value, format, language),
          // Call format fn for all interpolated values, even if
          // an explicit format is not provided
          alwaysFormat: true,
        },
      },
      (err) => {
        if (err) {
          //captureException(err)
        }
      }
    );

    instancesByLanguage[language] = instance;

    // Send language with events
    setEventContext("language", language);
  }

  if (process.browser) {
    instance.on("languageChanged", (language) => {
      const direction = instance.dir();

      // Save user preference in cookie, accessible from client and server
      document.cookie = `lang=${language}${COOKIE_SUFFIX}`;

      // Set <html> lang and dir attributes
      const html = document.querySelector("html");
      html.setAttribute("lang", language);
      html.setAttribute("dir", direction);

      // Send language with events
      setEventContext("language", language);
    });
  }

  return instance;
};

const loadTranslation = async (language) => {
  if (language === "cimode" || !supportedLanguages[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }

  if (process.browser) {
    /*     return await fetcher.get(`/locales/${language}/translation.json`, {
      retry: true,
    }); */
  } else {
    /*     return (await import(`../public/locales/${language}/translation.json`))
      .default; */
  }
};

// Called from App.getInitialProps to include the selected language in the page itself
export const preloadI18nResources = async (language) => {
  const languagesToLoad = [];

  // Don't preload cimode
  if (language !== "cimode") {
    languagesToLoad.push(language);
  }

  // Preload en-US unless already included
  if (language !== DEFAULT_LANG) {
    languagesToLoad.push(DEFAULT_LANG);
  }

  const resources = {};
  try {
    await Promise.all(
      languagesToLoad.map(async (language) => {
        /*         const translation = await loadTranslation(language);

        resources[language] = {
          translation,
        }; */
      })
    );
  } catch (err) {
    //captureException(err)
    // It isn't a big deal if this fails; i18next will try again once it is initialized
    return {};
  }

  return resources;
};

export const getLanguage = (req) => {
  let langCookie;
  let acceptLanguage;
  if (process.browser) {
    // Client side detection
    for (const cookie of document.cookie.split(";")) {
      const langCookieMatch = cookie.trim().match(/lang=(?<lang>[^\s;]+)/);
      if (langCookieMatch) {
        langCookie = langCookieMatch.groups.lang;
        break;
      }
    }

    acceptLanguage = navigator.languages.join(",");
  } else if (req != null) {
    // Server side detection
    langCookie = req.cookies?.lang;

    acceptLanguage = req.headers["accept-language"];
  } else {
    return DEFAULT_LANG;
  }

  //debug(`langCookie: ${langCookie}`);
  //debug(`acceptLanguage: ${acceptLanguage}`);

  // Use 'lang' cookie if set
  if (langCookie && supportedLanguageCodes.includes(langCookie)) {
    //debug(`using langCookie; selected ${langCookie}`);
    return langCookie;
  }

  // Use browser setting if set
  if (acceptLanguage != null) {
    const language = pick(supportedLanguageCodes, acceptLanguage);

    if (language != null) {
      //debug(`using acceptLanuage; selected ${language}`);
      return language;
    }
  }

  //debug("using default");
  return DEFAULT_LANG;
};
