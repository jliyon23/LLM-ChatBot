const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const cors = require("cors");


const app = express();
const PORT = 3000;
app.use(cors());
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());

app.post("/ask", async (req, res) => {
  const { history, message } = req.body;
  console.log(message);
  try {

    const model = genAI.getGenerativeModel({
        model: "gemini-pro",
    });

    const chat = await model.startChat({
      history: history,
    })

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
