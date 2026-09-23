import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Default Gemini model for Google AI Studio Free Tier.
 * gemini-2.0-flash offers generous free tier limits
 * (15 RPM, 1,000,000 TPM, 1,500 RPD) with zero billing requirements.
 */
export const DEFAULT_GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";

// Fallback models if primary model hits rate-limits or temporary service issues
const FALLBACK_MODELS = [
  DEFAULT_GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite"
].filter((m, i, self) => self.indexOf(m) === i);

// In-memory cache fallback
const memoryCache = new Map();

// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Generate a short deterministic hash for cache key
 */
function hashPrompt(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Retrieve cached response from localStorage or memory
 */
function getFromCache(cacheKey) {
  // Check memory cache first
  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return entry.text;
    }
    memoryCache.delete(cacheKey);
  }

  // Check localStorage
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = localStorage.getItem(`mora_ai_${cacheKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          // Warm up memory cache
          memoryCache.set(cacheKey, parsed);
          return parsed.text;
        }
        localStorage.removeItem(`mora_ai_${cacheKey}`);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }

  return null;
}

/**
 * Save response to localStorage and memory cache
 */
function saveToCache(cacheKey, text) {
  const entry = { text, timestamp: Date.now() };
  memoryCache.set(cacheKey, entry);

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(`mora_ai_${cacheKey}`, JSON.stringify(entry));
    } catch {
      // If storage is full, continue gracefully
    }
  }
}

/**
 * Clear all stored AI caches
 */
export function clearAiCache() {
  memoryCache.clear();
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("mora_ai_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore
    }
  }
}

/**
 * Helper to get active Gemini API Key
 * Checks user runtime override in localStorage, then .env
 */
export function getActiveApiKey() {
  if (typeof window !== "undefined" && window.localStorage) {
    const customKey = localStorage.getItem("mora_custom_gemini_api_key");
    if (customKey && customKey.trim()) {
      return customKey.trim();
    }
  }
  return (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
}

/**
 * Helper function with exponential backoff delay
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core text generation using official Google AI Studio SDK (@google/generative-ai)
 * Includes persistent caching, retry logic, and fallback models.
 * 
 * @param {string} prompt - Prompt sent to Gemini
 * @param {string} preferredModel - Preferred model name
 * @param {boolean} bypassCache - If true, bypasses cache and forces API call
 * @returns {Promise<string>} - Generated text response
 */
export const generateText = async (prompt, preferredModel = DEFAULT_GEMINI_MODEL, bypassCache = false) => {
  const apiKey = getActiveApiKey();
  if (!apiKey) {
    throw new Error(
      "API Key Gemini belum dikonfigurasi. Silakan tambahkan VITE_GEMINI_API_KEY di file .env.local atau buat API Key gratis di Google AI Studio (aistudio.google.com)."
    );
  }

  const promptHash = hashPrompt(prompt);
  const cacheKey = `${preferredModel}_${promptHash}`;

  if (!bypassCache) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Models to attempt in order
  const candidateModels = [
    preferredModel,
    ...FALLBACK_MODELS.filter((m) => m !== preferredModel)
  ];

  let lastError = null;

  for (const modelName of candidateModels) {
    // Up to 2 attempts per model (for 429 rate limit backoff)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        if (responseText && responseText.trim()) {
          saveToCache(cacheKey, responseText);
          return responseText;
        }
      } catch (error) {
        lastError = error;
        const errMsg = error?.message || "";
        const isRateLimit =
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("Quota exceeded");

        // If rate limited on attempt 1, wait 2 seconds before retry
        if (isRateLimit && attempt === 1) {
          console.warn(`[Gemini Free Tier] Rate limit on ${modelName}, waiting 2s before retry...`);
          await sleep(2000);
          continue;
        }

        // If it's not a rate limit or second attempt failed, break to next candidate model
        break;
      }
    }
  }

  // If all models failed, provide clear and actionable Indonesian error messages
  console.error("All Gemini models failed. Last error:", lastError);
  const rawMsg = lastError?.message || "";

  if (rawMsg.includes("API_KEY_SERVICE_BLOCKED") || rawMsg.includes("blocked")) {
    throw new Error(
      "API Key Terblokir (API_KEY_SERVICE_BLOCKED): Kunci API saat ini terikat pada project lama yang ditangguhkan. Silakan buat API Key baru gratis di Google AI Studio (https://aistudio.google.com/app/apikey) dengan memilih 'Create API key in new project', lalu pasang di .env.local."
    );
  }

  if (rawMsg.includes("API key not valid") || rawMsg.includes("PERMISSION_DENIED")) {
    throw new Error(
      "Kunci API Tidak Valid / Ditolak (403): Silakan periksa kunci API Anda di Google AI Studio (https://aistudio.google.com/app/apikey)."
    );
  }

  if (rawMsg.includes("429") || rawMsg.includes("RESOURCE_EXHAUSTED") || rawMsg.includes("Quota exceeded")) {
    throw new Error(
      "Batas Kuota Gratis Tercapai (429): Google AI Studio membatasi 15 request/menit untuk tier gratis. Silakan tunggu sekitar 1 menit, lalu klik tombol muat ulang."
    );
  }

  if (rawMsg.includes("BILLING_DISABLED") || rawMsg.includes("billing")) {
    throw new Error(
      "Billing Project Tersuspensi: Jangan gunakan endpoint Vertex AI. Gunakan API Key resmi dari Google AI Studio (Free Tier)."
    );
  }

  throw new Error(`Gagal menghubungi Gemini AI: ${rawMsg || "Terjadi kesalahan koneksi"}`);
};
