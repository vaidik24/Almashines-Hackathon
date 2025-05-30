import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const enhanceText = asyncHandler(async (req, res) => {
    const { task, input, category } = req.body;

    if (!task || !input) {
    return res.status(400).json({ error: "Task and input are required." });
    }

    let prompt = "";

    switch (task) {
    case "paraphrase":
        prompt = `Paraphrase the following ${category || 'content'} description to make it more engaging. Provide exactly 1 version:

        ["paraphrased version 1"]

        Original text: "${input}"`;
    break;
    case "correct":
        prompt = `Correct any grammatical or spelling mistakes in the following ${category || 'content'}. Provide exactly 1 corrected version:

        ["corrected version 1"]

        Original text: "${input}"`;
        break;
    case "improve_title":
        prompt = `Suggest an improved and catchy version of this ${category || 'content'} title. Provide exactly 1 option:
        
        ["improved title 1"]
        
        Original title: "${input}"`;
    break;
    case "improve_description":
        prompt = `Suggest an improved version of this ${category || 'content'} description. Provide exactly 1 option:
        
        ["improved description 1"]
        
        Original description: "${input}"`;
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
        console.log("Generated Text:", JSON.parse(generatedText));
        
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