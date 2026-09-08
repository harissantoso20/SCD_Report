import { initializeApp } from "firebase/app";
import { getVertexAI, getGenerativeModel } from "@firebase/vertexai";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  authDomain: "mora-scd.firebaseapp.com",
  projectId: "mora-scd",
  storageBucket: "mora-scd.firebasestorage.app",
  messagingSenderId: "114887605897",
  appId: "1:114887605897:web:85d114ba7e62fcd435d058",
  measurementId: "G-5VYL8XCEKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check (reCAPTCHA Enterprise)
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeUbq8tAAAAANu5Ou53tpxyO6iFxCCLZhj4yzkJ";
if (typeof window !== "undefined" && recaptchaSiteKey) {
  if (import.meta.env.DEV) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true
    });
  } catch (err) {
    console.warn("App Check initialization warning:", err);
  }
}

const vertexLocation = import.meta.env.VITE_VERTEX_LOCATION || "global";

// Initialize Firebase Vertex AI
const vertexAI = getVertexAI(app, { location: vertexLocation });

/**
 * Simple memory cache to save API quota.
 * Stores prompt hash/string -> generated response.
 */
const responseCache = new Map();

export const DEFAULT_GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-3.7-flash";

/**
 * Helper function to generate text using the Firebase Vertex AI model
 * @param {string} prompt - The prompt to send to Gemini
 * @param {string} modelName - The model to use (default: gemini-3.7-flash)
 * @param {boolean} bypassCache - If true, bypasses the memory cache
 * @returns {Promise<string>} - The generated text response
 */
export const generateText = async (prompt, modelName = DEFAULT_GEMINI_MODEL, bypassCache = false) => {
  try {
    const cacheKey = `${modelName}:${prompt}`;
    if (!bypassCache && responseCache.has(cacheKey)) {
      return responseCache.get(cacheKey);
    }

    const model = getGenerativeModel(vertexAI, { model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    if (!bypassCache) {
      responseCache.set(cacheKey, responseText);
    }
    
    return responseText;
  } catch (error) {
    console.error("Error generating text with Firebase Vertex AI:", error);
    
    // Intercept the Firebase SDK bug that hides the real 403 Permission Denied error
    if (error.message && error.message.includes("reading 'some'")) {
      throw new Error("Akses Model Ditolak (403): Silakan buka Firebase Console -> Vertex AI, lalu selesaikan proses Onboarding/Enable AI Logic untuk project 'mora-scd' Anda agar bisa menggunakan model generasi terbaru.");
    }
    
    if (error.message && error.message.includes("API_KEY_SERVICE_BLOCKED")) {
      throw new Error("API Key Terblokir: Buka Google Cloud Console -> APIs & Services -> Credentials, dan pastikan API Key Anda diizinkan untuk mengakses 'Generative Language API' atau 'Vertex AI API'.");
    }
    
    throw error;
  }
};
