import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const enhanceText = asyncHandler(async (req, res) => {
    const { task, input, category } = req.body;

    if (!task || !input) {
    return res.status(400).json({ error: "Task and input are required." });
    }

  const result = await generateContent(task, input);
  if (result.error) {
    return res.status(result.status).json({ error: result.error, details: result.details });
  } else{
    res.status(result.status).json(result);
  }
});

const generateContent = async(task,input) =>{
  let prompt = "";
  // prompt examples
  /*
  Create an event plan based on the following:
- Industry: Healthcare AI
- Audience: Young alumni in biotech
- Event type: Webinar
- Goal: Awareness and networking

Please generate:
- Event title
- 2-line catchy tagline
- Event description (~100 words)
- 3-part agenda with times
- Social media post content
  */
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
    case "integrated":
        prompt = `Create an event plan based on the following:
- ${input}
- Event type: event

Please generate:
- Event title
- 2-line catchy tagline
- Event description (~200 words)
- 3-part agenda with times
- Social media post content
        
        Original description: "${input}"`;
    break;
    default:
      return { error: "Invalid task provided.", status: 400 };
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
      return { 
        error: "No text generated",
        debug: response ,
        status: 500
      };
    }

    return { 
      result: generatedText,
      status: 200
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    console.error("Error details:", error.message);
    return { 
      error: "Failed to generate text from Gemini.",
      details: error.message ,
      status: 500
    };
  }
};

export { enhanceText, generateContent };