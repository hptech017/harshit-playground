// GeminiChat.jsx
import React, { useState } from 'react';
import Gemini from './Gemini'; // Assuming Gemini.js exports the function
import axios from 'axios';

const GeminiChat = () => {
  const [prompt, setPrompt] = useState('');
  const [chat, setChat] = useState([]); // [{ sender: 'user', message }, { sender: 'ai', message }]

  const handleSend = async () => {
    if (!prompt.trim()) return;

    // Add user prompt to chat
    const updatedChat = [...chat, { sender: 'user', message: prompt }];
    setChat(updatedChat);
    setPrompt('');

    try {
      const res = await Gemini(prompt);
      const reply = res.data.reply;

      // Add AI reply to chat
      setChat([...updatedChat, { sender: 'ai', message: reply }]);
    } catch (err) {
      setChat([...updatedChat, { sender: 'ai', message: 'Error fetching response 😢' }]);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">🤖 Gemini Chat</h1>
      <div className="h-96 overflow-y-auto border p-4 mb-4 rounded bg-gray-100">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 p-2 rounded ${
              msg.sender === 'user' ? 'text-right bg-blue-200 ml-20' : 'text-left bg-green-200 mr-20'
            }`}
          >
            <strong>{msg.sender === 'user' ? 'You' : 'Gemini'}: </strong>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border p-2 rounded"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask something..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default GeminiChat;
