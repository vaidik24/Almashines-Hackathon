import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const enhanceText = asyncHandler(async (req, res) => {
    const { task, input, category } = req.body;

    if (!task || !input) {
    return res.status(400).json({ error: "Task and input are required." });
    }

  const result = await generateContent(task, input, category);
  if (result.error) {
    return res.status(result.status).json({ error: result.error, details: result.details });
  } else{
    res.status(result.status).json(result);
  }
});

const generateContent = async(task,input,category) =>{
  console.log("Generating content with task:", task, "and input:", input, "category:", category);
  
  let prompt = "";
  
  switch (task) {
    case "paraphrase":
        prompt = `Paraphrase the following ${category || 'content'} description to make it more engaging. Provide exactly 1  corrected version:

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
    prompt = `You are helping a college administrator create engaging ${category || 'content'} for their institute's alumni platform.

    Institute News/Update: ${input.title} and ${input.content}

    As a college admin, you want to keep alumni connected and engaged with their alma mater. Create a ${category || 'content'} that will resonate with alumni by highlighting how this news reflects the institute's growth, achievements, or opportunities for alumni involvement.

    Please generate it in the following format and return ONLY the JSON object without any markdown formatting or code blocks:

    {
      "title": "Create an alumni-focused ${category || 'content'} title that connects this news to alumni pride, opportunities, or institute legacy",
      "description": "Write a ${category || 'content'} description from the college admin's perspective that: 1) Highlights the significance of this news for the institute, 2) Connects it to alumni achievements or opportunities, 3) Encourages alumni engagement or participation, 4) Maintains a tone of institutional pride and community. Include how alumni can get involved, benefit, or contribute. (600-800 words)"
    }

    Important: Return only the JSON object, no additional text or formatting.`;
    break;
    default:
      return { error: "Invalid task provided.", status: 400 };
  }
  console.log("Generated prompt:", prompt);
  

  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    
    // console.log("Full API Response:", JSON.stringify(result, null, 2));

    // Extract the text properly from the response
    const response = await result.response;
    const generatedText = response.text();
    const ans = JSON.parse(generatedText);
    console.log(ans);
    
    if (!generatedText) {
      return { 
        error: "No text generated",
        debug: response ,
        status: 500
      };
    }

    return { 
      result: ans,
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