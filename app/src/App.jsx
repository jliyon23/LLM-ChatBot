import { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaGithub, FaPaperPlane } from "react-icons/fa";

function Message({ message, role }) {
  return (
    <div className={`msg px-4 py-3 rounded-lg ${role === "user" ? "bg-gray-700" : "bg-gray-800 border-l-2 border-green-500"} w-full`}>
      <ReactMarkdown
        children={message}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-3"
                children={String(children).replace(/\n$/, "")}
                {...props}
              />
            ) : (
              <code className="bg-gray-900 px-1.5 py-0.5 rounded text-green-400" {...props}>
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const getResponse = async () => {
    if (!message.trim()) return;
    
    try {
      setLoading(true);
      const userMessage = message;
      setMessage("");
      
      // Update with user message immediately
      setChatHistory((oldChatHistory) => [
        ...oldChatHistory,
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ]);
      
      const response = await axios.post("https://llmchatbotapi.vercel.app/ask", {
        history: chatHistory,
        message: userMessage,
      });
      
      // Update with model response
      setChatHistory((oldChatHistory) => [
        ...oldChatHistory,
        {
          role: "model",
          parts: [{ text: response.data.data }],
        },
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error("Error getting response:", error);
      setChatHistory((oldChatHistory) => [
        ...oldChatHistory,
        {
          role: "model",
          parts: [{ text: "Sorry, I encountered an error. Please try again." }],
        },
      ]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      getResponse();
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <h2 className="text-white text-3xl flex gap-3 items-center font-extrabold mb-6">
        LLM <span className="text-green-400">ChatBot</span>
        <a 
          href="https://github.com/jliyon23" 
          className="cursor-pointer hover:text-green-400 transition-colors ml-2"
          target="_blank" 
          rel="noopener noreferrer"
        >
          <FaGithub />
        </a>
      </h2>
      
      <div className="w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-800">
        {chatHistory.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-gray-500">
            <div className="text-center">
              <div className="mb-4 text-6xl text-green-500 opacity-50">💬</div>
              <p className="text-xl font-medium">Start a conversation</p>
              <p className="mt-2">Ask me anything about coding, AI, or any topic!</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]">
            {chatHistory.map((msg, index) => (
              <div key={index} className="flex flex-col gap-2 text-white">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === "user" ? "bg-blue-600" : "bg-green-600"
                  }`}>
                    {msg.role === "user" ? "U" : "AI"}
                  </div>
                  <p className="font-medium capitalize">{msg.role}</p>
                </div>
                <Message message={msg.parts[0].text} role={msg.role} />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="relative">
            <textarea
              rows="2"
              placeholder="Ask me anything..."
              className="w-full px-4 py-3 pr-12 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className={`absolute right-3 bottom-3 rounded-full p-2 ${
                loading || !message.trim() 
                  ? "bg-gray-600 cursor-not-allowed" 
                  : "bg-green-500 hover:bg-green-600"
              } text-white transition-colors`}
              onClick={getResponse}
              disabled={loading || !message.trim()}
            >
              {loading ? (
                <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
              ) : (
                <FaPaperPlane size={14} />
              )}
            </button>
          </div>
          {loading && (
            <div className="text-xs text-green-400 mt-2 animate-pulse">
              Generating response...
            </div>
          )}
        </div>
      </div>
      
      <div className="text-gray-600 text-xs mt-4">
        Powered by Joseph Liyon • © {new Date().getFullYear()}
      </div>
    </div>
  );
}

export default App;
