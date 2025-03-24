const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const cors = require("cors");


const app = express();
const PORT = 3000;
app.use(cors({
  origin: "https://llmchatbotv1.vercel.app", 
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
}));

const genAI = new GoogleGenerativeAI(process.env.GEMINIKEY);

app.use(express.json());

app.post("/ask", async (req, res) => {
  const { history, message } = req.body;

  // Validate required fields
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!Array.isArray(history)) {
    return res.status(400).json({ error: "History should be an array" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = await model.startChat({ history });
    const result = await chat.sendMessage(message);

    res.json({ data: result.response.text() });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Failed to get a response from Google Generative AI" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
