import DOMPurify from "dompurify";
import { marked } from "marked";
import { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [responses, setResponses] = useState([]);
  const models = ["gpt-3.5-turbo", "gpt-4", "gpt-4o", "gpt-4-turbo"];

  const handleSubmit = async () => {
    const newResponse = {
      prompt: prompt,
      response: "",
      timestamp: new Date().toLocaleString(),
      model: selectedModel,
      tokenCount: 0,
    };
    setResponses([...responses, newResponse]);
    const url = "http://127.0.0.1:5000/api/prompt";
    let tmpPromptResponse = "";
    let tokenCount = 0;
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
      const decoder = new TextDecoderStream();
      if (!response.body) return;
      const reader = response.body.pipeThrough(decoder).getReader();

      const processChunk = (value) => {
        if (value.includes("token_count")) {
          tokenCount = parseInt(value.split(":")[1].trim());
        } else {
          tmpPromptResponse += value;
          setResponses((prevResponses) =>
            prevResponses.map((resp, index) =>
              index === prevResponses.length - 1
                ? {
                    ...resp,
                    response: tmpPromptResponse,
                  }
                : resp
            )
          );
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        } else {
          processChunk(value);
        }
      }

      // After the loop, update the state with the final token count
      setResponses((prevResponses) =>
        prevResponses.map((resp, index) =>
          index === prevResponses.length - 1
            ? {
                ...resp,
                tokenCount: tokenCount,
              }
            : resp
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleClear = () => {
    setPrompt("");
    setResponses([]);
  };

  const sanitizeAndConvertMarkdown = (markdown) => {
    const rawHtml = marked(markdown);
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    const formattedHtml = `<strong style="color: white;">Answer: </strong>${sanitizedHtml}`;
    return formattedHtml;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "75vw" }}>
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
                    <p>
                      <strong>Response Tokens: </strong>
                      {response.tokenCount}
                    </p>
                    <p className="medium-text">
                      <strong>Prompt: </strong>
                      {response.prompt.length > 300
                        ? response.prompt.substring(0, 300) + "..."
                        : response.prompt}
                    </p>
                    <div
                      className="medium-text"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeAndConvertMarkdown(response.response),
                      }}
                    ></div>
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
