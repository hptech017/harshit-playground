


// src/api/binance.js
import axios from "axios";
import CryptoJS from "crypto-js";

const BASE = "https://192.168.1.4:2000";

// ----- IMPORTANT -----
// You said you already placed keys. Put them here (only for local testing).
// Note: Keeping SECRET in frontend is insecure. Use only for learning/dev.
export const API_KEY = "3Y7TUkZrC2OzYDuI4Y0QhoGhHmRJ0Eph1GagwkoscOZp9G9gXZLFtwRLFCSJ2hGQ";
 export const API_SECRET = "JfrOSFX672ysRPBnjejUTW0EeHAuayKS8hvUHZqjGmGeWQpbNmez29WXUecS51JJ";

// config
const REQUEST_TIMEOUT = 10000; // ms
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;

// helper sleep
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Track server time offset (serverTime - localTime)
let serverTimeOffset = 0;

// get server time and update offset (call once in start)
async function syncServerTime() {
  try {
    const { data } = await axios.get(`${BASE}/api/v3/time`, { timeout: REQUEST_TIMEOUT });
    const local = Date.now();
    serverTimeOffset = data.serverTime - local;
    return { ok: true, serverTime: data.serverTime };
  } catch (err) {
    // ignore but return failure for caller
    return { ok: false, error: err.message || err.toString() };
  }
}

// get timestamp adjusted
function nowTs() {
  return Date.now() + serverTimeOffset;
}

// sign helper
function sign(queryString) {
  // CryptoJS HmacSHA256 -> hex
  return CryptoJS.HmacSHA256(queryString, API_SECRET).toString(CryptoJS.enc.Hex);
}

// generic request with basic retry for rate limits
async function requestWithRetry(fn, attempt = 0) {
  try {
    return await fn();
  } catch (err) {
    const status = err?.response?.status;
    // Retry on 418 or 429 (rate limit) with backoff
    if ((status === 429 || status === 418) && attempt < MAX_RETRIES) {
      const wait = RETRY_BASE_MS * Math.pow(2, attempt);
      await sleep(wait);
      return requestWithRetry(fn, attempt + 1);
    }
    throw err;
  }
}

// ----------------- Public API -----------------

export async function getPrice(symbol = "BTCUSDT") {
  try {
    const { data } = await axios.get(`${BASE}/api/v3/ticker/price?symbol=${symbol}`, {
      timeout: REQUEST_TIMEOUT,
    });
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.response?.data || err.message || err.toString() };
  }
}

// ----------------- Private (signed) APIs -----------------
// Ensure you've called syncServerTime() once at app start to reduce timestamp issues.

export async function placeOrder({ symbol = "BTCUSDT", side = "BUY", type = "MARKET", quantity, price }) {
  // Validate inputs
  if (!API_KEY || !API_SECRET) {
    return { success: false, error: "API_KEY or API_SECRET not set in front-end (unsafe!)." };
  }
  if (!symbol || !side || !type || !quantity) {
    return { success: false, error: "Missing required params: symbol/side/type/quantity." };
  }

  try {
    // ensure server time sync (best-effort)
    if (!serverTimeOffset) await syncServerTime();

    const timestamp = nowTs();
    let qs = `symbol=${symbol}&side=${side}&type=${type}&quantity=${quantity}&timestamp=${timestamp}`;
    if (type === "LIMIT") {
      if (!price) return { success: false, error: "LIMIT order requires price param." };
      qs += `&price=${price}&timeInForce=GTC`;
    }

    const signature = sign(qs);
    const url = `${BASE}/api/v3/order?${qs}&signature=${signature}`;

    const doReq = async () =>
      axios.post(url, {}, { headers: { "X-MBX-APIKEY": API_KEY }, timeout: REQUEST_TIMEOUT });

    const resp = await requestWithRetry(doReq);
    return { success: true, data: resp.data };
  } catch (err) {
    const payload = err.response?.data || err.message || err.toString();
    return { success: false, error: payload };
  }
}

export async function getOrders(symbol = "BTCUSDT", limit = 50) {
  if (!API_KEY || !API_SECRET) {
    return { success: false, error: "API_KEY or API_SECRET not set in front-end (unsafe!)." };
  }

  try {
    if (!serverTimeOffset) await syncServerTime();

    const timestamp = nowTs();
    const qs = `symbol=${symbol}&limit=${limit}&timestamp=${timestamp}`;
    const signature = sign(qs);
    const url = `${BASE}/api/v3/allOrders?${qs}&signature=${signature}`;

    const doReq = async () =>
      axios.get(url, { headers: { "X-MBX-APIKEY": API_KEY }, timeout: REQUEST_TIMEOUT });

    const resp = await requestWithRetry(doReq);
    // resp.data is an array (may be empty)
    const arr = Array.isArray(resp.data) ? resp.data : [];
    return { success: true, data: arr };
  } catch (err) {
    const payload = err.response?.data || err.message || err.toString();
    return { success: false, error: payload };
  }
}

// Utility: attempt to check permissions (read-only info)
// This calls /sapi/v1/accountSnapshot as a probe (requires certain permissions).
export async function testKeyPermissions() {
  if (!API_KEY) return { success: false, error: "API_KEY not set" };
  try {
    const { data } = await axios.get(`${BASE}/api/v3/account`, { headers: { "X-MBX-APIKEY": API_KEY }, timeout: REQUEST_TIMEOUT });
    // If API_SECRET missing or signature invalid you'll get 401/400.
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.response?.data || err.message || err.toString() };
  }
}




