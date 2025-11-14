// const { GoogleGenAI } = require("@google/genai");
// const { getFullPortfolioContext } = require('./portfolioContextController');

// const model = 'gemini-2.5-flash';

// exports.handleChat = async (req, res) => {
//   // 1. Validate that the API key is available in the environment.
//   if (!process.env.API_KEY) {
//     console.error("API_KEY is not set in the environment variables.");
//     return res.status(500).json({ error: "Server configuration error: Missing API Key." });
//   }
  
//   // Initialize the AI client within the handler to ensure the latest key is used.
//   const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

//   const { messages } = req.body;

//   if (!messages || !Array.isArray(messages) || messages.length === 0) {
//     return res.status(400).json({ error: 'Messages array is required' });
//   }

//   try {
//     // 2. Get the latest portfolio context from the database.
//     const portfolioContext = await getFullPortfolioContext();
//     const systemInstruction = `You are a friendly and professional AI assistant for Yohan Permana portfolio website. Your goal is to answer questions from visitors about Yohan. You must base your answers STRICTLY on the following JSON data. Do not invent any information that is not present in this data. If a question cannot be answered from the data, politely say that you don't have that information. Keep your answers concise and to the point. Here is the data: ${JSON.stringify(portfolioContext)}`;
    
//     // 3. Format the chat history for the Gemini API.
//     const history = messages.slice(0, -1).map(msg => ({
//       role: msg.sender === 'user' ? 'user' : 'model',
//       parts: [{ text: msg.text }],
//     }));

//     // 4. Get the latest message from the user.
//     const latestUserMessage = messages[messages.length - 1].text;

//     // 5. Create a new chat session with the system instruction and history.
//     const chat = ai.chats.create({
//       model: model,
//       config: { systemInstruction },
//       history: history,
//     });

//     // 6. Send the new message and get the result.
//     const result = await chat.sendMessage({ message: latestUserMessage });

//     // 7. Send the correct response text back to the frontend.
//     res.json({ text: result.text });

//   } catch (error) {
//     console.error("Error in chatController:", error);
//     res.status(500).json({ error: "Failed to get a response from the AI assistant." });
//   }
// };

const { GoogleGenAI } = require("@google/genai");
const { getFullPortfolioContext } = require('./portfolioContextController');

const model = 'gemini-2.5-flash';

exports.handleChat = async (req, res) => {
  // 1. Validate that the API key is available in the environment.
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set in the environment variables.");
    return res.status(500).json({ error: "Server configuration error: Missing API Key." });
  }
  
  // Initialize the AI client within the handler to ensure the latest key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    // 2. Get the latest portfolio context from the database.
    const portfolioContext = await getFullPortfolioContext();
    const systemInstruction = `You are a friendly and professional AI assistant for Yohan Permana portfolio website. Your goal is to answer questions from visitors about Yohan. You must base your answers STRICTLY on the following JSON data. Do not invent any information that is not present in this data. If a question cannot be answered from the data, politely say that you don't have that information. Keep your answers concise and to the point. Here is the data: ${JSON.stringify(portfolioContext)}`;
    
    // 3. Format the entire message history for the stateless generateContent API.
    const contents = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // 4. Send the full context to the model in a single, stateless request.
    const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
        }
    });
    
    // 5. Send the response text back to the frontend.
    res.json({ text: response.text });

  } catch (error) {
    console.error("Error in chatController:", error);
    res.status(500).json({ error: "Failed to get a response from the AI assistant." });
  }
};