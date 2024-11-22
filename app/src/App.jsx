import { useState } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaGithub } from "react-icons/fa";


function Message({ message }) {
  return (
    <div className="bg-gray-800 msg px-3 py-2 rounded-sm w-[80%]">
      <ReactMarkdown
        children={message}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                children={String(children).replace(/\n$/, "")}
                {...props}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      />
    </div>
  );
}

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getResponse = async () => {
    try {
      setLoading(true);
      const response = await axios.post("https://llmchatbotapi.vercel.app/ask", {
        history: chatHistory,
        message: message,
      });

      // Update chat history
      setChatHistory((oldChatHistory) => [
        ...oldChatHistory,
        {
          role: "user",
          parts: [
            {
              text: message,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: response.data.data,
            },
          ],
        },
      ]);
      setLoading(false);
      setMessage("");
      window.scrollTo(0, document.body.scrollHeight);
    } catch (error) {
      console.error("Error getting response:", error);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <h2 className="text-white text-2xl flex gap-3 items-center font-extrabold mb-4">
          LLM <span className="text-green-400">ChatBot</span>
          <a href="https://github.com/jliyon23" className="cursor-pointer"><FaGithub /></a>
        </h2>

        <div className="w-full max-w-2xl max-h-[82vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-scroll p-5 no-scrollbar">
            {chatHistory.map((msg, index) => (
              <div key={index} className="flex gap-3 mt-5 text-white">
                <p className="w-[20%] font-bold">{msg.role} :</p>
                <Message message={msg.parts[0].text} />
              </div>
            ))}
          </div>

          <div className="flex gap-2 p-4 bg-gray-800 border-t border-[#1c8e56]">
            <input
              type="text"
              placeholder="Ask me anything..."
              className="w-full h-10 px-2 bg-gray-700 ring-0 text-white"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className="h-10 bg-green-500 text-white rounded-sm px-3"
              onClick={getResponse}
            >
              {loading ? (
                <span className="loading loading-dots loading-xs"></span>
              ) : (
                "Ask"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
