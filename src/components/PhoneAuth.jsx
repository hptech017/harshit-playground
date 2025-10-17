// const firebaseConfig = {
//   apiKey: "AIzaSyChLLmOENNbDBshcRjqQKHS4zQ47VvXBPM",
//   authDomain: "phoneauth-37642.firebaseapp.com",
//   projectId: "phoneauth-37642",
//   storageBucket: "phoneauth-37642.appspot.com",
//   messagingSenderId: "591086670059",
//   appId: "1:591086670059:web:81e70aff81940235acaeae",
// };
// ✅ Minimal Firebase OTP (No Recaptcha - Localhost Only)// RealFirebasePhoneAuth.jsx
// Firebase v9 modular — real SMS OTPs (reCAPTCHA enabled, invisible by default)
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

/* -----------------------
   1) Put your Firebase config here
   (make sure it's the same project where Phone Auth is enabled)
   ----------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyCZF09w5cXtGLJi6BJDykaOtgwcFC-VsY4",
  authDomain: "auth-mark-1.firebaseapp.com",
  projectId: "auth-mark-1",
  storageBucket: "auth-mark-1.firebasestorage.app",
  messagingSenderId: "287982417283",
  appId: "1:287982417283:web:bac8002ffe3464964bb2b6",
  measurementId: "G-ZFVLN98W2Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// !! IMPORTANT: DO NOT set auth.settings.appVerificationDisabledForTesting = true
// for real OTPs. It must remain disabled in production/dev for actual SMS.

export default function RealFirebasePhoneAuth({ invisible = true }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
        delete window.recaptchaVerifier;
      }
    };
  }, []);

  // Create and render the RecaptchaVerifier
  const setupRecaptcha = async (size = invisible ? "invisible" : "normal") => {
    // clear any existing verifier (avoid duplicates / malformed tokens)
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch {}
      delete window.recaptchaVerifier;
    }

    // create new verifier
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size,
        callback: (token) => {
          // This callback is invoked when reCAPTCHA check passes.
          console.log("reCAPTCHA solved. token:", token);
        },
        "expired-callback": () => {
          console.warn("reCAPTCHA expired — recreating.");
          // recreate on expire so next send has fresh token
          try { setupRecaptcha(size); } catch {}
        },
      },
      auth
    );

    // Render and wait for completion so token is valid when we call signInWithPhoneNumber
    await window.recaptchaVerifier.render();
    return window.recaptchaVerifier;
  };

  // Send real OTP
  const sendOtp = async (e) => {
    e?.preventDefault();
    setMessage("");
    if (!phone || !phone.startsWith("+")) {
      return setMessage("Enter phone in +countrycode format, e.g. +919876543210");
    }

    setLoading(true);
    try {
      // ensure recaptcha is freshly rendered and valid
      const verifier = await setupRecaptcha(invisible ? "invisible" : "normal");
      const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
      window.confirmationResult = confirmation;
      setConfirmationResult(confirmation);
      setMessage("✅ OTP sent. Check your SMS.");
    } catch (err) {
      console.error("Send OTP Error:", err);
      // friendly mapping for common server messages
      const msg = (err && (err.code || err.message)) || String(err);
      if (msg.includes("CAPTCHA_CHECK_FAILED")) {
        setMessage("❌ reCAPTCHA failed (MALFORMED). Try disabling extensions, refresh page, or use visible captcha.");
      } else if (msg.includes("TOO_MANY_ATTEMPTS")) {
        setMessage("🚫 Too many attempts. Wait a while or try a different number/IP.");
      } else if (msg.includes("INVALID_APP_CREDENTIAL")) {
        setMessage("⚠️ Invalid app credential. Add your domain in Firebase Auth -> Authorized domains.");
      } else {
        setMessage("❌ Failed to send OTP: " + msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async (e) => {
    e?.preventDefault();
    setMessage("");
    if (!otp.trim()) return setMessage("Please enter OTP.");
    setLoading(true);
    try {
      const confirm = confirmationResult || window.confirmationResult;
      if (!confirm) return setMessage("No OTP request found. Please request OTP again.");
      const result = await confirm.confirm(otp.trim());
      console.log("Phone auth success:", result.user);
      setMessage("🎉 Verified! UID: " + result.user.uid);
    } catch (err) {
      console.error("Verify OTP Error:", err);
      setMessage("❌ Invalid OTP or verification failed: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-center">Phone OTP (real SMS + reCAPTCHA)</h3>

      {/* Phone form */}
      {!confirmationResult && (
        <form onSubmit={sendOtp}>
          <label className="block mb-1">Phone (+countrycode)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91xxxxxxxxxx" className="w-full p-2 mb-3 border rounded" />
          <button disabled={loading} type="submit" className="w-full p-2 rounded bg-blue-600 text-white">
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* OTP form */}
      {confirmationResult && (
        <form onSubmit={verifyOtp}>
          <label className="block mb-1 mt-3">Enter OTP</label>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" className="w-full p-2 mb-3 border rounded" />
          <button disabled={loading} type="submit" className="w-full p-2 rounded bg-green-600 text-white">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {/* reCAPTCHA container */}
      <div id="recaptcha-container" className="mt-4 flex justify-center" />

      {message && <p className={`mt-3 text-center ${message.startsWith("✅") || message.startsWith("🎉") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
    </div>
  );
}
