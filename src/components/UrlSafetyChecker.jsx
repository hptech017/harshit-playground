import React, { useState } from "react";

const UrlSafetyChecker = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // basic URL validation
  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  };

  // auto-add https:// if missing
  const prepareUrl = (raw) => {
    let value = raw.trim();
    if (!value) return value;
    if (!/^https?:\/\//i.test(value)) {
      value = "https://" + value;
    }
    return value;
  };

  const analyzeUrl = (value, original) => {
    const analysis = {
      url: value,
      originalInput: original || value,
      score: 0,
      reasons: [],
      signals: [], // detailed metrics
    };

    if (!isValidUrl(value)) {
      analysis.score = 100;
      analysis.reasons.push("URL format valid nahi hai.");
      analysis.signals.push({
        name: "URL Format",
        status: "Critical",
        impact: "High",
        detail: "Given string valid URL nahi hai.",
      });
      return analysis;
    }

    const u = new URL(value);
    const hostname = u.hostname;
    const fullLower = value.toLowerCase();
    const path = u.pathname || "/";
    const query = u.search || "";
    const searchParams = u.searchParams;
    const pathDepth = path.split("/").filter(Boolean).length;
    const queryParamCount = searchParams
      ? Array.from(searchParams.keys()).length
      : (query.match(/=/g) || []).length;
    const subdomainCount = hostname.split(".").length - 2 > 0
      ? hostname.split(".").length - 2
      : 0;

    // small helpers
    const addReason = (text, risk = 0) => {
      analysis.reasons.push(text);
      analysis.score += risk;
    };

    const addSignal = (name, status, impact, detail) => {
      analysis.signals.push({ name, status, impact, detail });
    };

    // 1) Protocol
    if (u.protocol === "https:") {
      addSignal("Protocol", "OK", "Medium", "HTTPS use ho raha hai.");
    } else {
      addReason("URL HTTPS use nahi kar raha.", 20);
      addSignal(
        "Protocol",
        "Warning",
        "Medium",
        "Non-HTTPS protocol use ho raha hai (HTTP ya kuch aur)."
      );
    }

    // 2) IP as domain
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(hostname)) {
      addReason("Domain ki jagah IP address use ho raha hai.", 30);
      addSignal(
        "Domain Type",
        "Warning",
        "High",
        "Hostname IP address hai, jo phishing me common pattern hai."
      );
    } else {
      addSignal("Domain Type", "OK", "Medium", "Hostname proper domain name hai.");
    }

    // 3) URL length
    if (value.length > 150) {
      addReason("URL bohot lamba hai, phishing ka risk badh jata hai.", 20);
      addSignal(
        "URL Length",
        "Warning",
        "Medium",
        `Length ${value.length} characters (bohot lamba).`
      );
    } else if (value.length > 80) {
      addReason("URL thoda lamba hai, suspicious ho sakta hai.", 10);
      addSignal(
        "URL Length",
        "Caution",
        "Low",
        `Length ${value.length} characters (moderately long).`
      );
    } else {
      addSignal(
        "URL Length",
        "OK",
        "Low",
        `Length ${value.length} characters (normal range).`
      );
    }

    // 4) @ symbol
    if (value.includes("@")) {
      addReason("@ symbol use hua hai, jo phishing me common hai.", 25);
      addSignal(
        "URL Contains '@'",
        "Warning",
        "High",
        "@ symbol se URL ka real destination hide kiya ja sakta hai."
      );
    } else {
      addSignal("URL Contains '@'", "OK", "Low", "@ symbol use nahi hua.");
    }

    // 5) Suspicious TLDs
    const suspiciousTlds = [".tk", ".ml", ".ga", ".cf", ".gq"];
    let tldFlag = "OK";
    for (const tld of suspiciousTlds) {
      if (hostname.endsWith(tld)) {
        addReason(`Suspicious TLD (${tld}) use ho raha hai.`, 20);
        tldFlag = "Warning";
        addSignal(
          "Top-level Domain",
          "Warning",
          "Medium",
          `TLD ${tld} suspicious/free domain category me aata hai.`
        );
        break;
      }
    }
    if (tldFlag === "OK") {
      addSignal(
        "Top-level Domain",
        "OK",
        "Low",
        `TLD normal lag raha hai (${hostname.split(".").slice(-1)[0]}).`
      );
    }

    // 6) Hyphen / numbers heavy
    const hyphenCount = (hostname.match(/-/g) || []).length;
    const digitCount = (hostname.match(/[0-9]/g) || []).length;

    if (hyphenCount >= 3) {
      addReason("Domain me bohot hyphens (-) hai.", 10);
      addSignal(
        "Hyphen Count",
        "Caution",
        "Low",
        `Hostname me ${hyphenCount} hyphens (-) hai.`
      );
    } else {
      addSignal(
        "Hyphen Count",
        "OK",
        "Low",
        `Hostname me ${hyphenCount} hyphens hai (normal).`
      );
    }

    if (digitCount >= 3) {
      addReason("Domain me bohot numbers hai.", 10);
      addSignal(
        "Digit Count",
        "Caution",
        "Low",
        `Hostname me ${digitCount} digits hai.`
      );
    } else {
      addSignal(
        "Digit Count",
        "OK",
        "Low",
        `Hostname me ${digitCount} digits hai (normal).`
      );
    }

    // 7) Brand impersonation (simple check)
    const popularBrands = [
      "google",
      "facebook",
      "amazon",
      "paypal",
      "apple",
      "microsoft",
      "netflix",
      "bank",
    ];
    const cleanHost = hostname.replace(/[-_0-9]/g, "").toLowerCase();
    let brandFlag = "OK";
    for (const brand of popularBrands) {
      if (cleanHost.includes(brand) && !hostname.endsWith(`${brand}.com`)) {
        addReason(
          `Domain ${brand} jaisa lag raha hai, impersonation ho sakta hai.`,
          25
        );
        brandFlag = "Warning";
        addSignal(
          "Brand Impersonation",
          "Warning",
          "High",
          `Hostname ${brand} ka pattern mimic kar raha hai, but official domain nahi lagta.`
        );
        break;
      }
    }
    if (brandFlag === "OK") {
      addSignal(
        "Brand Impersonation",
        "OK",
        "High",
        "Popular brands ka suspicious mimic detect nahi hua."
      );
    }

    // 8) Path depth
    if (pathDepth >= 4) {
      addReason(
        "URL path bohot deep hai, jo obfuscation ka sign ho sakta hai.",
        8
      );
      addSignal(
        "Path Depth",
        "Caution",
        "Low",
        `Path depth ${pathDepth} segments hai (kaafi deep).`
      );
    } else {
      addSignal(
        "Path Depth",
        "OK",
        "Low",
        `Path depth ${pathDepth} segments hai.`
      );
    }

    // 9) Query params
    if (queryParamCount >= 5) {
      addReason(
        "Bohot saare query parameters use ho rahe hain, jo tracking/obfuscation ka indication ho sakta hai.",
        6
      );
      addSignal(
        "Query Parameters",
        "Caution",
        "Low",
        `${queryParamCount} query parameters detect hue.`
      );
    } else if (queryParamCount > 0) {
      addSignal(
        "Query Parameters",
        "OK",
        "Low",
        `${queryParamCount} query parameters detect hue (normal).`
      );
    } else {
      addSignal("Query Parameters", "OK", "Low", "Koi query parameters nahi.");
    }

    // 10) Sensitive keywords in path/query
    const sensitiveKeywords = [
      "password",
      "pass",
      "otp",
      "token",
      "pin",
      "credit",
      "debit",
      "card",
    ];
    const phishingKeywords = [
      "login",
      "signin",
      "verify",
      "secure",
      "update",
      "confirm",
      "restore",
      "billing",
      "wallet",
      "gift",
      "bonus",
      "prize",
      "win",
      "free",
    ];
    const combined = (path + query).toLowerCase();

    const sensitiveFound = sensitiveKeywords.filter((k) =>
      combined.includes(k)
    );
    const phishingFound = phishingKeywords.filter((k) =>
      combined.includes(k)
    );

    if (sensitiveFound.length > 0) {
      addReason(
        `URL me sensitive keywords use ho rahe hain: ${sensitiveFound.join(
          ", "
        )}.`,
        18
      );
      addSignal(
        "Sensitive Keywords (Path/Query)",
        "Warning",
        "High",
        `Sensitive keywords detect hue: ${sensitiveFound.join(", ")}.`
      );
    } else {
      addSignal(
        "Sensitive Keywords (Path/Query)",
        "OK",
        "High",
        "Sensitive data related keywords detect nahi hue."
      );
    }

    if (phishingFound.length > 0) {
      addReason(
        `URL me high-risk phishing keywords hai: ${phishingFound.join(", ")}.`,
        18
      );
      addSignal(
        "Phishing Keywords (Path/Query)",
        "Caution",
        "High",
        `High-risk keywords detect hue: ${phishingFound.join(", ")}.`
      );
    } else {
      addSignal(
        "Phishing Keywords (Path/Query)",
        "OK",
        "High",
        "Typical phishing keywords detect nahi hue."
      );
    }

    // 11) Shortened URL check
    const shortenerDomains = [
      "bit.ly",
      "tinyurl.com",
      "t.co",
      "goo.gl",
      "ow.ly",
      "buff.ly",
      "cutt.ly",
      "is.gd",
    ];
    if (shortenerDomains.includes(hostname.toLowerCase())) {
      addReason("URL ek URL shortener se aa raha hai.", 15);
      addSignal(
        "URL Shortener",
        "Caution",
        "Medium",
        "Shortened URL actual destination hide kar sakta hai."
      );
    } else {
      addSignal(
        "URL Shortener",
        "OK",
        "Medium",
        "Hostname known URL shortener nahi hai."
      );
    }

    // 12) Custom port
    if (u.port) {
      addReason(
        `Custom port (${u.port}) use ho raha hai, jo kabhi-kabhi suspicious hota hai.`,
        6
      );
      addSignal(
        "Custom Port",
        "Caution",
        "Low",
        `URL port ${u.port} use kar raha hai.`
      );
    } else {
      addSignal("Custom Port", "OK", "Low", "Custom port use nahi ho raha.");
    }

    // 13) Encoded characters
    const encodedMatch = value.match(/%[0-9A-Fa-f]{2}/g) || [];
    if (encodedMatch.length >= 5) {
      addReason(
        "URL me bohot saare encoded characters hai, jo obfuscation ke liye ho sakte hain.",
        8
      );
      addSignal(
        "Encoded Characters",
        "Caution",
        "Low",
        `${encodedMatch.length} encoded characters detect hue.`
      );
    } else if (encodedMatch.length > 0) {
      addSignal(
        "Encoded Characters",
        "OK",
        "Low",
        `${encodedMatch.length} encoded characters detect hue (normal).`
      );
    } else {
      addSignal(
        "Encoded Characters",
        "OK",
        "Low",
        "Encoded characters detect nahi hue."
      );
    }

    // 14) Subdomain count
    if (subdomainCount >= 3) {
      addReason(
        "Hostname me bohot saare nested subdomains hai, jo kabhi-kabhi obfuscation me use hote hain.",
        8
      );
      addSignal(
        "Subdomain Count",
        "Caution",
        "Low",
        `${subdomainCount} subdomains detect hue.`
      );
    } else {
      addSignal(
        "Subdomain Count",
        "OK",
        "Low",
        `${subdomainCount} subdomains detect hue.`
      );
    }

    // cap score
    if (analysis.score < 0) analysis.score = 0;
    if (analysis.score > 100) analysis.score = 100;

    return analysis;
  };

  const getRiskLabel = (score) => {
    if (score <= 25) return "Low Risk • Mostly Safe";
    if (score <= 50) return "Medium Risk • Review Carefully";
    if (score <= 75) return "High Risk • Suspicious";
    return "Critical Risk • Likely Phishing";
  };

  const getRiskColor = (score) => {
    if (score <= 25) return "#22c55e";
    if (score <= 50) return "#facc15";
    if (score <= 75) return "#f97316";
    return "#dc2626";
  };

  const getStatusColor = (status) => {
    if (status === "OK") return "#22c55e";
    if (status === "Caution") return "#facc15";
    return "#f97316";
  };

  const handleCheck = (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!url.trim()) {
      setError("Please URL ya domain enter kare.");
      return;
    }

    const normalized = prepareUrl(url);
    const analysis = analyzeUrl(normalized, url.trim());
    setResult(analysis);
  };

  const totalChecks = result?.signals?.length || 0;
  const triggeredWarnings =
    result?.signals?.filter((s) => s.status !== "OK").length || 0;
  const highImpactTriggers =
    result?.signals?.filter(
      (s) => s.status !== "OK" && s.impact === "High"
    ).length || 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #020617 0, #020617 45%, #020617 65%, #020617 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#e5e7eb",
      }}
    >
      {/* gradient backdrop */}
      <div
        style={{
          position: "absolute",
          inset: "-220px",
          background:
            "radial-gradient(circle at 0% 0%, rgba(59,130,246,0.22), transparent 60%), radial-gradient(circle at 100% 0%, rgba(16,185,129,0.20), transparent 55%), radial-gradient(circle at 50% 100%, rgba(234,88,12,0.16), transparent 60%)",
          opacity: 0.95,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "1080px",
          position: "relative",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.3fr)",
          gap: "22px",
        }}
      >
        {/* LEFT: overview / branding */}
        <div
          style={{
            padding: "26px 22px 20px",
            borderRadius: "22px",
            border: "1px solid rgba(148,163,184,0.35)",
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(15,23,42,0.82))",
            backdropFilter: "blur(18px)",
            boxShadow:
              "0 18px 40px rgba(15,23,42,0.95), 0 0 0 1px rgba(15,23,42,0.8)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                alignItems: "flex-start",
                marginBottom: "10px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#9ca3af",
                    marginBottom: "6px",
                  }}
                >
                  Security Intelligence Panel
                </div>
                <h1
                  style={{
                    fontSize: "26px",
                    lineHeight: 1.25,
                    fontWeight: 600,
                    margin: 0,
                    color: "#f9fafb",
                  }}
                >
                  Advanced{" "}
                  <span
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #38bdf8, #22c55e, #facc15)",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    URL Risk Analyzer
                  </span>
                </h1>
              </div>
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.5)",
                  fontSize: "11px",
                  color: "#e5e7eb",
                  background:
                    "radial-gradient(circle at top left, rgba(59,130,246,0.26), transparent)",
                  whiteSpace: "nowrap",
                  textAlign: "right",
                }}
              >
                Made & Built by{" "}
                <span style={{ fontWeight: 600 }}>TS^2</span>
              </div>
            </div>Koi bhi

            <p
              style={{
                marginTop: "4px",
                fontSize: "13px",
                color: "#9ca3af",
              }}
            >
               The system analyzes multiple security signals — protocol, domain structure, path, query parameters, phishing keywords, and brand impersonation — and generates a clear risk profile.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "10px",
                marginTop: "16px",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  padding: "10px 11px",
                  borderRadius: "14px",
                  border: "1px solid rgba(55,65,81,0.75)",
                  background:
                    "radial-gradient(circle at top left, rgba(59,130,246,0.16), rgba(15,23,42,0.96))",
                }}
              >
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>Signals</div>
                <div style={{ marginTop: "4px", lineHeight: 1.4 }}>
                  Protocol, IP vs domain, suspicious TLDs, URL length, path
                  depth, query density, shortener usage, encoded characters.
                </div>
              </div>
              <div
                style={{
                  padding: "10px 11px",
                  borderRadius: "14px",
                  border: "1px solid rgba(55,65,81,0.75)",
                  background:
                    "radial-gradient(circle at top right, rgba(45,212,191,0.16), rgba(15,23,42,0.96))",
                }}
              >
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                  Phishing Intelligence
                </div>
                <div style={{ marginTop: "4px", lineHeight: 1.4 }}>
                  Brand impersonation detection, phishing & sensitive keyword
                  scan, subdomain analysis, risk scoring 0–100.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              borderTop: "1px dashed rgba(55,65,81,0.9)",
              paddingTop: "8px",
              marginTop: "4px",
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span>
              Frontend-only heuristic engine • Koi external API call nahi
              (privacy-safe demo).
            </span>
            <span style={{ whiteSpace: "nowrap" }}>
              Version 1.0 • Security Lab Prototype
            </span>
          </div>
        </div>

        {/* RIGHT: form + dynamic metrics */}
        <div
          style={{
            padding: "22px 20px 18px",
            borderRadius: "22px",
            border: "1px solid rgba(148,163,184,0.45)",
            background:
              "linear-gradient(150deg, rgba(15,23,42,0.98), rgba(15,23,42,0.84))",
            backdropFilter: "blur(18px)",
            boxShadow:
              "0 18px 40px rgba(15,23,42,0.95), 0 0 0 1px rgba(15,23,42,0.8)",
          }}
        >
          <div
            style={{
              marginBottom: "14px",
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "#9ca3af",
                  marginBottom: "4px",
                }}
              >
                Instant Scan
              </div>
              <div style={{ fontSize: "13px", color: "#e5e7eb" }}>
                Domain ya full URL daalein. Agar{" "}
                <span style={{ color: "#a5b4fc" }}>https://</span> missing hoga
                to system khud add karega aur phir analyse karega.
              </div>
            </div>
            <div
              style={{
                padding: "5px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.5)",
                fontSize: "11px",
                color: "#e5e7eb",
                background:
                  "radial-gradient(circle at top left, rgba(59,130,246,0.22), transparent)",
                whiteSpace: "nowrap",
              }}
            >
              Heuristic Engine • Local Only
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCheck}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginBottom: error ? "4px" : "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1, position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "12px",
                      fontSize: "11px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#6b7280",
                    }}
                  >
                    Domain / URL
                  </div>
                  <input
                    type="text"
                    placeholder="example.com, paypal-secure-login.xyz, ya koi bhi link"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "24px 12px 10px 12px",
                      borderRadius: "14px",
                      border: "1px solid rgba(148,163,184,0.5)",
                      backgroundColor: "rgba(15,23,42,0.94)",
                      color: "#e5e7eb",
                      fontSize: "13px",
                      outline: "none",
                      boxShadow: "0 0 0 1px transparent",
                      transition:
                        "border-color 0.14s ease, box-shadow 0.14s ease, background-color 0.12s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3b82f6";
                      e.target.style.boxShadow =
                        "0 0 0 1px rgba(59,130,246,0.9), 0 0 0 7px rgba(37,99,235,0.2)";
                      e.target.style.backgroundColor = "#020617";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(148,163,184,0.5)";
                      e.target.style.boxShadow = "0 0 0 1px transparent";
                      e.target.style.backgroundColor = "rgba(15,23,42,0.94)";
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: "13px 16px",
                    borderRadius: "14px",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    background:
                      "linear-gradient(135deg, #22c55e, #16a34a, #22c55e)",
                    color: "#0b1120",
                    boxShadow:
                      "0 14px 30px rgba(22,163,74,0.45), 0 0 0 1px rgba(21,128,61,0.7)",
                    whiteSpace: "nowrap",
                    transition:
                      "transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease",
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(1px) scale(0.99)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(22,163,74,0.4)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 14px 30px rgba(22,163,74,0.45), 0 0 0 1px rgba(21,128,61,0.7)";
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = "brightness(1.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = "brightness(1)";
                    e.currentTarget.style.transform =
                      "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 14px 30px rgba(22,163,74,0.45), 0 0 0 1px rgba(21,128,61,0.7)";
                  }}
                >
                  Scan
                </button>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#9ca3af",
                }}
              >
                Tip: <span style={{ color: "#a5b4fc" }}>https://</span> likhne
                ki zaroorat nahi, engine khud add karega agar missing hua.
              </div>
            </div>

            {error && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#f97316",
                  marginBottom: "8px",
                }}
              >
                {error}
              </div>
            )}
          </form>

          {/* Result dashboard */}
          {result && (
            <div
              style={{
                marginTop: "12px",
                padding: "14px 14px 10px",
                borderRadius: "18px",
                border: "1px solid rgba(55,65,81,0.9)",
                background:
                  "radial-gradient(circle at top left, rgba(30,64,175,0.32), rgba(15,23,42,0.98))",
              }}
            >
              {/* top row: URL + score */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: "#9ca3af",
                      marginBottom: "4px",
                    }}
                  >
                    Analysed URL
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginBottom: "2px",
                      wordBreak: "break-all",
                    }}
                  >
                    Input:&nbsp;
                    <span style={{ color: "#e5e7eb" }}>
                      {result.originalInput}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      wordBreak: "break-all",
                    }}
                  >
                    Normalized:&nbsp;
                    <span style={{ color: "#e5e7eb" }}>{result.url}</span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      marginBottom: "2px",
                      color: "#9ca3af",
                    }}
                  >
                    Risk Score
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 600,
                      color: getRiskColor(result.score),
                      lineHeight: 1,
                    }}
                  >
                    {result.score}
                    <span
                      style={{
                        fontSize: "12px",
                        marginLeft: "2px",
                        color: "#9ca3af",
                      }}
                    >
                      /100
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "11px",
                      padding: "3px 8px",
                      borderRadius: "999px",
                      border: `1px solid ${getRiskColor(result.score)}55`,
                      color: getRiskColor(result.score),
                      backgroundColor: "#020617",
                      display: "inline-block",
                    }}
                  >
                    {getRiskLabel(result.score)}
                  </div>
                </div>
              </div>

              {/* stats row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "8px",
                  marginBottom: "10px",
                  fontSize: "11px",
                }}
              >
                <div
                  style={{
                    padding: "8px 9px",
                    borderRadius: "10px",
                    border: "1px solid rgba(55,65,81,0.9)",
                    background:
                      "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.9))",
                  }}
                >
                  <div style={{ color: "#9ca3af", marginBottom: "2px" }}>
                    Checks Run
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 600 }}>
                    {totalChecks}
                  </div>
                  <div style={{ color: "#6b7280" }}>
                    Distinct security metrics
                  </div>
                </div>
                <div
                  style={{
                    padding: "8px 9px",
                    borderRadius: "10px",
                    border: "1px solid rgba(55,65,81,0.9)",
                    background:
                      "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.9))",
                  }}
                >
                  <div style={{ color: "#9ca3af", marginBottom: "2px" }}>
                    Warnings
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: triggeredWarnings > 0 ? "#f97316" : "#22c55e",
                    }}
                  >
                    {triggeredWarnings}
                  </div>
                  <div style={{ color: "#6b7280" }}>
                    Metrics flagged as risky
                  </div>
                </div>
                <div
                  style={{
                    padding: "8px 9px",
                    borderRadius: "10px",
                    border: "1px solid rgba(55,65,81,0.9)",
                    background:
                      "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.9))",
                  }}
                >
                  <div style={{ color: "#9ca3af", marginBottom: "2px" }}>
                    High-Impact
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: highImpactTriggers > 0 ? "#f97316" : "#22c55e",
                    }}
                  >
                    {highImpactTriggers}
                  </div>
                  <div style={{ color: "#6b7280" }}>
                    Critical phishing indicators
                  </div>
                </div>
              </div>

              {/* risk bar */}
              <div style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    height: "7px",
                    borderRadius: "999px",
                    background:
                      "linear-gradient(90deg, #22c55e, #facc15, #f97316, #dc2626)",
                    opacity: 0.32,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: `${result.score}%`,
                      borderRadius: "999px",
                      background:
                        "linear-gradient(90deg, #22c55e, #facc15, #f97316, #dc2626)",
                      boxShadow: "0 0 16px rgba(248,250,252,0.44)",
                      transition: "width 0.35s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "10px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                  }}
                >
                  <span>Low</span>
                  <span>Medium</span>
                  <span>Critical</span>
                </div>
              </div>

              {/* Metrics list */}
              {result.signals && result.signals.length > 0 && (
                <div
                  style={{
                    marginTop: "6px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: "#9ca3af",
                      marginBottom: "6px",
                    }}
                  >
                    Detailed Security Metrics
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "8px",
                      fontSize: "12px",
                    }}
                  >
                    {result.signals.map((s, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "8px 9px",
                          borderRadius: "10px",
                          border: "1px solid rgba(55,65,81,0.9)",
                          background:
                            "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.9))",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "6px",
                            marginBottom: "2px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              textTransform: "uppercase",
                              letterSpacing: "0.12em",
                              color: "#9ca3af",
                            }}
                          >
                            {s.name}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "999px",
                              border: `1px solid ${getStatusColor(
                                s.status
                              )}55`,
                              color: getStatusColor(s.status),
                              backgroundColor: "#020617",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {s.status}
                          </span>
                        </div>
                        <div
                          style={{
                            color: "#e5e7eb",
                            marginBottom: "2px",
                            lineHeight: 1.35,
                          }}
                        >
                          {s.detail}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#9ca3af",
                          }}
                        >
                          Impact: {s.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* reasons / summary text */}
              {result.reasons && result.reasons.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: "#9ca3af",
                      marginBottom: "4px",
                    }}
                  >
                    Summary Insights
                  </div>
                  <ul
                    style={{
                      paddingLeft: "18px",
                      margin: 0,
                      fontSize: "13px",
                      color: "#e5e7eb",
                      display: "grid",
                      rowGap: "4px",
                    }}
                  >
                    {result.reasons.map((r, index) => (
                      <li key={index}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p
                style={{
                  marginTop: "10px",
                  fontSize: "11px",
                  color: "#9ca3af",
                }}
              >
                Note: Ye engine heuristics use karta hai, live blacklist /
                reputation data nahi. Real money / login actions se pehle
                hamesha manual verification + official sources use karein.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UrlSafetyChecker;
