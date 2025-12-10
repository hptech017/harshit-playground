import { useEffect, useRef, useState } from "react";
import "./TanmayChatBot.css";

function TanmayChatBotApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    // Initial welcome message
    const welcome =
      "Namaste! 👋\n\nMain ek Cyber Security Chatbot hoon.\n" +
      "- Mujhse cyber security tools ke baare mein puchho\n" +
      "- Install ka safe tareeka puchho\n" +
      "- Different types of cyber attacks samjho (sirf concept, illegal kaam strictly mana hai)\n\n" +
      "Please respectful language use karo. 🙂";

    setMessages([{ from: "bot", text: welcome }]);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { from: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    const replyText = getBotResponse(text);

    // Thoda delay for natural feel
    setTimeout(() => {
      const botMsg = { from: "bot", text: replyText };
      setMessages((prev) => [...prev, botMsg]);
    }, 300);

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app-root">
      <div className="chat-wrapper">
        <header className="chat-header">
          <div className="bot-avatar">C</div>
          <div className="chat-header-text">
            <h1>CyberSec Chatbot</h1>
            <span>Ask about tools, attacks &amp; safe usage</span>
          </div>
          <div className="badge">Safe · Friendly</div>
        </header>

        <div ref={chatRef} className="chat-messages">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                "message " + (m.from === "bot" ? "bot-message" : "user-message")
              }
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="hint">
          Try: "what is firewall", "types of cyber attack", "how to install
          security tools"
        </div>

        <footer className="chat-footer">
          <input
            type="text"
            placeholder="Type your question here... (Hinglish bhi chalega)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSend}>Send</button>
        </footer>
      </div>
    </div>
  );
}

// --- Chatbot Logic ---

function getBotResponse(rawMsg) {
  const msg = rawMsg.toLowerCase();

  // 1. Simple gaali filter
  const badWords = [
    "gandu",
    "madarchod",
    "mc ",
    "bc ",
    "bhosdi",
    "chutiya",
    "chutia",
    "harami",
    "kutte",
    "kutta"
  ];

  if (badWords.some((w) => msg.includes(w))) {
    return (
      "Dekho, main samajh sakta hoon kabhi gussa aa jata hai,\n" +
      "lekin gaali dena sahi baat nahi hai. 🙂\n\n" +
      "Hum yaha seekhne aur improve karne aaye hain.\n" +
      "Please respectful language use karo, tabhi main achhe se help kar paunga."
    );
  }

  // 2. Tools related queries
  if (
    msg.includes("tool") ||
    msg.includes("tools") ||
    msg.includes("cyber security tool")
  ) {
    return (
      "Cyber Security tools ka basic idea:\n\n" +
      "1) Antivirus / Endpoint Security:\n" +
      "- Malware, virus, trojan detect aur remove karta hai.\n" +
      "- Install: Hamesha official website se licensed ya free trusted version hi install karo.\n\n" +
      "2) Firewall:\n" +
      "- Network traffic ko filter karta hai (kaun sa traffic allow / block hoga).\n" +
      "- Windows / Mac me built-in firewall aata hai, jise settings se enable/adjust kiya ja sakta hai.\n\n" +
      "3) IDS / IPS (Intrusion Detection / Prevention System):\n" +
      "- Suspicious network activity detect karta hai.\n" +
      "- Generally servers / enterprise networks me use hota hai.\n\n" +
      "4) VPN (Virtual Private Network):\n" +
      "- Internet traffic ko encrypt karke secure tunnel banata hai.\n" +
      "- Install: Official VPN provider ki app / client download karo, account se login karke connect karo.\n\n" +
      "5) Password Manager:\n" +
      "- Strong passwords generate aur securely store karta hai.\n" +
      "- Install: Browser extension ya desktop/mobile app ke through.\n\n" +
      "Important:\n" +
      "- Hamesha official site / trusted store se hi download karo.\n" +
      "- Crack / illegal tools avoid karo.\n" +
      "- Tools ko sirf legal aur defensive purpose ke liye use karo."
    );
  }

  // 3. Installation style queries
  if (
    msg.includes("install") ||
    msg.includes("kaise install") ||
    msg.includes("how to install")
  ) {
    return (
      "General safe installation steps (kisi bhi cyber security tool ke liye):\n\n" +
      "1) Tool ka naam + 'official website' Google pe search karo.\n" +
      "2) Sirf official domain ya trusted source (Microsoft Store, Apple App Store, etc.) se hi download karo.\n" +
      "3) Download se pehle:\n" +
      "   - Reviews check karo\n" +
      "   - Fake / phishing website se bachho\n\n" +
      "4) Installer run karo:\n" +
      "   - Next-Next karke fast mat khatam karo\n" +
      "   - Extra unwanted software / toolbar ko uncheck karo\n\n" +
      "5) Install hone ke baad:\n" +
      "   - Updates enable karo\n" +
      "   - Basic settings configure karo (auto-update, scheduled scan, etc.)\n\n" +
      "Dhyan rahe: illegal hacking tools ya pirated software na use karo. " +
      "Ye tumhari machine ko bhi nuksan pahuncha sakta hai + legal problem bhi ho sakti hai."
    );
  }

  // 4. Attack types explanation
  if (
    msg.includes("attack") ||
    msg.includes("attacks") ||
    msg.includes("types of attack")
  ) {
    return (
      "Main tumhe sirf **high-level concept** bataunga, koi illegal kaam ka step-by-step nahi.\n\n" +
      "Kuch common cyber attack types:\n\n" +
      "1) Phishing:\n" +
      "- Fake email / message jo user se password, OTP, card details maangta hai.\n" +
      "- Protection: Sender check karo, URL verify karo, unknown links mat kholo.\n\n" +
      "2) Malware (Virus, Trojan, Ransomware):\n" +
      "- Aisi program jo system ko damage kare, data chura le ya lock kar de.\n" +
      "- Protection: Antivirus, updated OS, unknown attachments / cracks avoid.\n\n" +
      "3) DDoS (Distributed Denial of Service):\n" +
      "- Server pe itna fake traffic bhejna ki wo genuine users ke liye slow ya down ho jaye.\n" +
      "- Protection: Rate limiting, firewall, CDN, DDoS protection services.\n\n" +
      "4) Brute Force Attack:\n" +
      "- Password guess karne ke liye bahut saare combinations try karna.\n" +
      "- Protection: Strong passwords, rate limiting, account lockout, MFA.\n\n" +
      "5) SQL Injection (Web apps pe):\n" +
      "- Malicious input ke through database queries ko manipulate karna.\n" +
      "- Protection: Prepared statements, input validation, least-privilege DB access.\n\n" +
      "Ye sab sirf understanding ke liye hai, practical attacks karna illegal hai.\n" +
      "Focus always on **defense & protection**."
    );
  }

  // 5. Generic cyber security roadmap
  if (
    msg.includes("cyber security") ||
    msg.includes("cybersecurity") ||
    msg.includes("security")
  ) {
    return (
      "Cyber Security seekhne ka basic roadmap (legal + ethical way):\n\n" +
      "1) Fundamentals:\n" +
      "- Networking basics (IP, TCP/UDP, HTTP, DNS)\n" +
      "- OS basics (Windows, Linux file system, processes)\n\n" +
      "2) Security Fundamentals:\n" +
      "- CIA triad (Confidentiality, Integrity, Availability)\n" +
      "- Authentication, Authorization, Encryption\n\n" +
      "3) Tools & Concepts:\n" +
      "- Antivirus, Firewall, VPN, IDS/IPS, Password Managers\n" +
      "- Secure coding practices (input validation, auth, etc.)\n\n" +
      "4) Legal + Ethical side:\n" +
      "- Sirf apni machine / authorized systems pe testing\n" +
      "- Country ke cyber laws ke according kaam karna\n\n" +
      "Agar tum chaho to main specific topics pe bhi explain kar sakta hoon. Bas yaad rakho:\n" +
      "Illegal hacking ≠ Cyber Security. Focus hamesha defense par rakho. 🙂"
    );
  }

  // Default fallback
  return (
    "Mujhe tumhara sawaal thoda generic laga. 😅\n\n" +
    "Tum mujhse aise sawaal puch sakte ho:\n" +
    "- \"Cyber security tools ke types?\"\n" +
    "- \"Firewall kya hota hai?\"\n" +
    "- \"Types of cyber attack explain karo\"\n" +
    "- \"Tools ko safely install kaise karein?\"\n\n" +
    "Bas dhyaan rahe: main sirf legal, ethical aur defensive information hi dunga."
  );
}

export default TanmayChatBotApp;
