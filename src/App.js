import React, { useState } from "react";
import "./App.css";
import { sendMessage } from "./api";

function App() {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState([]);
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const models = ["gpt-3.5-turbo", "gpt-4", "gpt-4o", "gpt-4-turbo"];

  const handleSendMessage = async () => {
    if (message.trim() === "") return;
    setLoading(true);
    setError(null);
    const newResponses = [...responses, { question: message, answer: "" }];
    setResponses(newResponses);
    setMessage("");

    let accumulatedAnswer = "";

    const updateResponse = (newContent) => {
      accumulatedAnswer += newContent;
      setResponses((prevResponses) => {
        const updatedResponses = [...prevResponses];
        const lastResponseIndex = updatedResponses.length - 1;
        updatedResponses[lastResponseIndex] = {
          ...updatedResponses[lastResponseIndex],
          answer: accumulatedAnswer,
        };
        return updatedResponses;
      });
    };

    try {
      await sendMessage(message, selectedModel, updateResponse);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearResponses = () => {
    setResponses([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chat with GPT</h1>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {models.map((model, index) => (
            <option key={index} value={model}>
              {model}
            </option>
          ))}
        </select>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
        <button onClick={handleClearResponses} disabled={loading}>
          Clear
        </button>
        {error && <div className="error">{error}</div>}
        <div className="responses">
          {responses.map((res, index) => (
            <div key={index} className="response">
              <strong>Q:</strong> {res.question}
              <br />
              <strong>A:</strong> {res.answer}
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
