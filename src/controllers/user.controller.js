import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";
import fetchNewsByTopic from "../services/news.service.js";
import {generateContent} from './enhance.controller.js';
import pool from "../db/connect.js"; // your MySQL pool
const createIndustryPool = async () => {
  const [industries] = await pool.query(
    "SELECT uwe.industry, COUNT(u.id) as frequency FROM users u JOIN user_work_experience uwe ON uwe.user_id = u.id GROUP BY uwe.industry ORDER BY frequency DESC LIMIT 5"
  );
  return industries;
};

// Scheduling algorithm for dividing 35 posts among top 5 industries based on frequency
const dividePostsAmongIndustries = (industries, totalPosts = 35, topN = 5) => {
  const topIndustries = industries.slice(0, topN);
  const totalFrequency = topIndustries.reduce((sum, ind) => sum + ind.frequency, 0);
  let allocatedPosts = topIndustries.map(ind => ({
    industry: ind.industry,
    posts: Math.floor((ind.frequency / totalFrequency) * totalPosts)
  }));
  let postsAssigned = allocatedPosts.reduce((sum, ind) => sum + ind.posts, 0);
  let remaining = totalPosts - postsAssigned;

  const remainders = topIndustries.map(ind => ({
    industry: ind.industry,
    remainder: ((ind.frequency / totalFrequency) * totalPosts) % 1
  }));
  remainders.sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < remaining; i++) {
    const idx = allocatedPosts.findIndex(ind => ind.industry === remainders[i].industry);
    if (idx !== -1) allocatedPosts[idx].posts += 1;
  }

  return allocatedPosts;
};



const fetchHighestFrequencyIndustry = asyncHandler(async (req, res) => {
  const industries = await createIndustryPool();
  var frequencyMapping = dividePostsAmongIndustries(industries, 35, 5);
  console.log("Frequency Mapping: ", frequencyMapping);
  if (!industries || industries.length === 0) {
    return res.status(404).json({ message: "No industries found" });
  }
  let content = [];
  // for (const { industry, posts } of frequencyMapping) {
  //   for (let i = 0; i < posts; i++) {
  //     const news = await fetchNewsByTopic(industry);
  //     if (Array.isArray(news)) {
  //       content.push(...news);
  //     } else if (news) {
  //       content.push(news);
  //     }
  //   }
  // }
  content.push(await fetchNewsByTopic(industries[0].industry));
  console.log("starting generating content");
  var generatedData = await generateContent("integrated", content[0]);
  console.log("Generated Data: ", generatedData);
  // var generatedData = [];
  // for (const item of content) {
  //   var data = {};
  //   data["title"] = await generateContent("improve_title", item.title);
  //   data["content"] = await generateContent("improve_description", item.content);
  //   generatedData.push(data);
  // }


  res.status(200).json({
    message: "Fetched highest frequency industries",
    industry: industries,
    content: generatedData,
  });
});
const launchNewsletter = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  // This is your AngularJS URL
  const redirectUrl = `http://localhost/portal/dev/skitahd/feed/create?source=create&hiddenTag=0&title=${encodedTitle}&description=${encodedDesc}`;

  return res.status(200).json({
    redirectUrl,
  });
});
export { createIndustryPool, fetchHighestFrequencyIndustry, launchNewsletter };
