(function () {
  const COOKIE_NAME = "googtrans";

  const isIpAddress = (host) => /^\d{1,3}(\.\d{1,3}){3}$/.test(host);

  const getDomainCandidates = () => {
    if (typeof window === "undefined") return [undefined];
    const host = window.location.hostname;
    if (!host || host === "localhost" || isIpAddress(host)) {
      return [undefined];
    }
    const parts = host.split(".");
    const domains = new Set([undefined, host]);
    for (let i = 1; i < parts.length; i += 1) {
      domains.add("." + parts.slice(i).join("."));
    }
    return Array.from(domains);
  };

  const setLanguageCookie = (value) => {
    if (typeof document === "undefined") return;
    const expires = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    ).toUTCString();
    getDomainCandidates().forEach((domain) => {
      const domainSegment = domain ? `;domain=${domain}` : "";
      document.cookie = `${COOKIE_NAME}=${value};path=/;expires=${expires}${domainSegment}`;
    });
  };

  const readLanguageCookie = () => {
    const cookieString = document.cookie || "";
    const parts = cookieString.split(";").map((entry) => entry.trim());
    for (let i = parts.length - 1; i >= 0; i -= 1) {
      if (parts[i].startsWith(`${COOKIE_NAME}=`)) {
        return parts[i].substring(COOKIE_NAME.length + 1);
      }
    }
    return undefined;
  };

  function ensureLanguageCookie() {
    if (!window.__GOOGLE_TRANSLATION_CONFIG__) return;
    const existing = readLanguageCookie();
    if (existing) {
      setLanguageCookie(existing);
      return;
    }

    const lang = window.__GOOGLE_TRANSLATION_CONFIG__.defaultLanguage || "en";
    setLanguageCookie(`/auto/${lang}`);
  }

  function TranslateInit() {
    if (!window.__GOOGLE_TRANSLATION_CONFIG__) return;
    ensureLanguageCookie();

    const config = window.__GOOGLE_TRANSLATION_CONFIG__;
    const includedLanguages = config.languages.map((l) => l.name).join(",");

    new google.translate.TranslateElement(
      {
        pageLanguage: config.defaultLanguage,
        includedLanguages,
        autoDisplay: false,
      },
      "google_translate_element"
    );
  }

  window.TranslateInit = TranslateInit;
})();
