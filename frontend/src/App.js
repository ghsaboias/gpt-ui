import { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [responses, setResponses] = useState([]);
  const models = ["gpt-3.5-turbo", "gpt-4", "gpt-4o", "gpt-4-turbo"];

  const handleSubmit = async () => {
    setResponses([
      ...responses,
      {
        prompt: prompt,
        response: "",
        timestamp: new Date().toLocaleString(),
      },
    ]);
    const url = "http://127.0.0.1:5000/api/prompt";
    var tmpPromptResponse = "";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          model: selectedModel,
        }),
      });

      // eslint-disable-next-line no-undef
      let decoder = new TextDecoderStream();
      if (!response.body) return;
      const reader = response.body.pipeThrough(decoder).getReader();

      while (true) {
        var { value, done } = await reader.read();

        if (done) {
          break;
        } else {
          tmpPromptResponse += value;
          setResponses([
            ...responses,
            {
              prompt: prompt,
              response: tmpPromptResponse,
              timestamp: new Date().toLocaleString(),
              model: selectedModel,
            },
          ]);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClear = () => {
    setPrompt("");
    setResponses([]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        margin: "1rem",
      }}
    >
      <div style={{ width: "80vh" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2>Chat with GPT</h2>
          <textarea
            rows={10}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ marginBottom: "1rem" }}
            value={prompt}
          ></textarea>

          <div style={{ display: "flex", gap: "5px" }}>
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
            <button onClick={handleSubmit}>Submit</button>{" "}
            <button onClick={handleClear}>Clear</button>
          </div>

          <div className="card-container">
            {responses
              .slice()
              .reverse()
              .map((response, index) => (
                <div key={index} className="card">
                  <div className="card-header">
                    <p className="question-id">
                      Prompt {responses.length - index}
                    </p>
                    <p className="timestamp">{response.timestamp}</p>
                  </div>
                  <div className="prompt-info">
                    <p>
                      <strong>Model: </strong>
                      {response.model}
                    </p>
                    <p className="medium-text">
                      <strong>Q: </strong>
                      {response.prompt.length > 300
                        ? response.prompt.substring(0, 300) + "..."
                        : response.prompt}
                    </p>
                    <p className="medium-text">
                      <strong>A: </strong>
                      {response.response}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
