import React, { useState, useRef } from 'react';

const SpeechTextComponent = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  // Start listening
  const startListening = () => {
    initSpeechRecognition();
    recognitionRef.current.start();
    setIsListening(true);
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Speak the text
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-Speech is not supported in this browser');
    }
  };

  return (
    <div style={styles.container}>
      <h2>🎤 Speech to Text & Text to Speech 🔊</h2>

      <textarea
        rows="4"
        cols="50"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Speak or type something..."
        style={styles.textArea}
      />

      <div style={styles.buttonContainer}>
        <button onClick={isListening ? stopListening : startListening} style={styles.button}>
          {isListening ? '🛑 Stop Listening' : '🎙️ Start Listening'}
        </button>

        <button onClick={handleSpeak} style={styles.button}>
          🔊 Speak Text
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '30px auto',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    textAlign: 'center',
    fontFamily: 'sans-serif',
  },
  textArea: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '16px',
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default SpeechTextComponent;
