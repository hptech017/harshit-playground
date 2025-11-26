import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZF09w5cXtGLJi6BJDykaOtgwcFC-VsY4",
  authDomain: "auth-mark-1.firebaseapp.com",
  projectId: "auth-mark-1",
  storageBucket: "auth-mark-1.firebasestorage.app",
  messagingSenderId: "287982417283",
  appId: "1:287982417283:web:bac8002ffe3464964bb2b6",
  measurementId: "G-ZFVLN98W2Z",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function RealFirebasePhoneAuth({ invisible = true }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {}
        delete window.recaptchaVerifier;
      }
    };
  }, []);

  const setupRecaptcha = async (size = invisible ? "invisible" : "normal") => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {}
      delete window.recaptchaVerifier;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size,
        callback: (token) => {
          console.log("reCAPTCHA solved:", token);
        },
        "expired-callback": () => {
          console.warn("reCAPTCHA expired, recreating...");
          try {
            setupRecaptcha(size);
          } catch {}
        },
      },
      auth
    );

    await window.recaptchaVerifier.render();
    return window.recaptchaVerifier;
  };

  const sendOtp = async (e) => {
    e?.preventDefault();
    setMessage("");

    if (!phone || !phone.startsWith("+")) {
      return setMessage("Enter phone in +countrycode format, e.g. +919876543210");
    }

    setLoading(true);
    try {
      const verifier = await setupRecaptcha(invisible ? "invisible" : "normal");
      const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
      window.confirmationResult = confirmation;
      setConfirmationResult(confirmation);
      setMessage("OTP sent successfully. Check your SMS.");
    } catch (err) {
      console.error("Send OTP Error:", err);
      const msg = (err && (err.code || err.message)) || String(err);

      if (msg.includes("CAPTCHA_CHECK_FAILED")) {
        setMessage("reCAPTCHA failed. Try disabling extensions or refresh the page.");
      } else if (msg.includes("TOO_MANY_ATTEMPTS")) {
        setMessage("Too many attempts. Please wait and try again later.");
      } else if (msg.includes("INVALID_APP_CREDENTIAL")) {
        setMessage("Invalid app credential. Add your domain in Firebase Auth -> Authorized domains.");
      } else {
        setMessage("Failed to send OTP: " + msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e?.preventDefault();
    setMessage("");

    if (!otp.trim()) return setMessage("Please enter OTP.");

    setLoading(true);
    try {
      const confirm = confirmationResult || window.confirmationResult;
      if (!confirm) return setMessage("No OTP request found. Please request OTP again.");
      const result = await confirm.confirm(otp.trim());
      console.log("Phone verified:", result.user);
      setMessage("Verified successfully! UID: " + result.user.uid);
    } catch (err) {
      console.error("Verify OTP Error:", err);
      setMessage("Invalid OTP or verification failed: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-center">Phone OTP Verification</h3>

      {!confirmationResult && (
        <form onSubmit={sendOtp}>
          <label className="block mb-1">Phone (+countrycode)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91xxxxxxxxxx"
            className="w-full p-2 mb-3 border rounded"
          />
          <button
            disabled={loading}
            type="submit"
            className="w-full p-2 rounded bg-blue-600 text-white"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {confirmationResult && (
        <form onSubmit={verifyOtp}>
          <label className="block mb-1 mt-3">Enter OTP</label>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="w-full p-2 mb-3 border rounded"
          />
          <button
            disabled={loading}
            type="submit"
            className="w-full p-2 rounded bg-green-600 text-white"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      <div id="recaptcha-container" className="mt-4 flex justify-center" />

      {message && (
        <p
          className={`mt-3 text-center ${
            message.includes("success") || message.includes("Verified")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
