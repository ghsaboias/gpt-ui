export const sendMessage = async (message, model, onUpdate) => {
  const controller = new AbortController();
  const { signal } = controller;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: message }],
        stream: true,
      }),
      signal: signal,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let partial = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      partial += chunk;

      const lines = partial.split("\n");
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6);
          if (jsonStr !== "[DONE]") {
            try {
              const data = JSON.parse(jsonStr);
              const newContent = data.choices[0].delta.content || "";
              onUpdate(newContent);
            } catch (error) {
              console.error("JSON parse error:", error);
            }
          }
        }
      }
      partial = lines[lines.length - 1];
    }
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};
