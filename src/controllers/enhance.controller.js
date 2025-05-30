import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const enhanceText = asyncHandler(async (req, res) => {
  const { task, input } = req.body;

  if (!task || !input) {
    return res.status(400).json({ error: "Task and input are required." });
  }

  let prompt = "";

  switch (task) {
    case "paraphrase":
        prompt = `Paraphrase the following description to make it more engaging. Provide exactly 3 different versions in this JSON array format:

        ["paraphrased version 1", "paraphrased version 2", "paraphrased version 3"]

        Original text: "${input}"`;
    break;
    case "correct":
      prompt = `Correct any grammatical or spelling mistakes in the following description:\n\n"${input}"`;
      break;
    case "improve_title":
        prompt = `Suggest improved and catchy versions of this title. Provide exactly 3 options in this JSON array format:

        Option 1: [improved title]
        Option 2: [improved title]
        Option 3: [improved title]

        Original title: "${input}"`;
    break;
    case "improve_description":
        prompt = `Suggest improved versions of this description. Provide exactly 3 options in this format:

        Option 1: [improved description]
        Option 2: [improved description]
        Option 3: [improved description]

        Original title: "${input}"`;
    break;
    default:
      return res.status(400).json({ error: "Invalid task provided." });
  }

  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    
    // console.log("Full API Response:", JSON.stringify(result, null, 2));

    // Extract the text properly from the response
    const response = await result.response;
    const generatedText = response.text();
    
    if (!generatedText) {
      return res.status(500).json({ 
        error: "No text generated",
        debug: response 
      });
    }

    res.status(200).json({ 
      result: generatedText
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    console.error("Error details:", error.message);
    res.status(500).json({ 
      error: "Failed to generate text from Gemini.",
      details: error.message 
    });
  }
});

export { enhanceText };