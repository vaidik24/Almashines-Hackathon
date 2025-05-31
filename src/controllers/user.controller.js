import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";
import fetchNewsByTopic from "../services/news.service.js";
import {generateContent} from './enhance.controller.js';
import pool from "../db/connect.js"; // your MySQL pool
import SuggestionRatioAdjuster from "../Logic/SuggestionRatioAdjuster.js"
const createIndustryPool = async () => {
  const [industries] = await pool.query(
    "SELECT uwe.industry, COUNT(u.id) as frequency FROM users u JOIN user_work_experience uwe ON uwe.user_id = u.id where uwe.industry!='Other' and uwe.industry!='' and u.cid = ? GROUP BY uwe.industry ORDER BY frequency DESC LIMIT 5",
    [cid]
  );
  return industries;
};
const fetchNewsById = async (id) => {
  const [news] = await pool.query(
    "SELECT * FROM suggestions WHERE id = ?",
    [id]
  );
  return news[0];
}
const generateContentFromNews = async(req,res) =>{
  // if(req.lang)
  //   delete req.lang
  console.log("Request ID: ", req.body.id);
  if(!req.body.id)
    res.status(400).json({ error: "ID is required" });
  fetchNewsById(req.body.id).then(async (news) => {
    var generatedData = await generateContent("integrated", {title: news.source_title, content: news.suggestion_content},req.category,true);
    if (generatedData.error) {
      return { error: generatedData.error, status: generatedData.status };
    } else{
      const { status, ...result } = generatedData;
      res.status(status).json(result);
    }
  });
}
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
  try {
    const industries = await createIndustryPool(); // [{ industry: "tech", frequency: 6 }, ...]
    const [results] = await pool.query('SELECT COUNT(*) as count FROM industry_ratio');

    let frequencyMapping;

    if (results[0].count === 0) {
      frequencyMapping = dividePostsAmongIndustries(industries, 35, 5);
      const insertQuery = `INSERT INTO industry_ratio (industry_id, ratio) VALUES (?, ?)`;

      for (const entry of frequencyMapping) {
        const { industry, posts } = entry;
        await pool.execute(insertQuery, [industry, posts]);
      }
    } else {
      const topIndustries = industries.slice(0, 5);
      const industryNames = topIndustries.map(i => i.industry);
      const placeholders = industryNames.map(() => '?').join(',');

      const query = `
        SELECT uw.industry,
          COUNT(nl.user_id) AS likes,
          COUNT(nc.user_id) AS comments,
          COUNT(nv.user_id) AS clicks
        FROM user_work_experience uw
        LEFT JOIN newsLikes nl ON uw.user_id = nl.user_id
        LEFT JOIN newsComments nc ON uw.user_id = nc.user_id
        LEFT JOIN newsViews nv ON uw.user_id = nv.user_id
        WHERE uw.industry IN (${placeholders})
        GROUP BY uw.industry
      `;

      const [rows] = await pool.execute(query, industryNames);

      const interactions = industryNames.map(ind => {
        const row = rows.find(r => r.industry === ind) || {};
        return {
          industry: ind,
          likes: row.likes || 0,
          comments: row.comments || 0,
          clicks: row.clicks || 0
        };
      });

      const adjuster = new SuggestionRatioAdjuster();
      // frequencyMapping = adjuster.adjustRatios(interactions);
      frequencyMapping = dividePostsAmongIndustries(industries, 35, 5);
      const insertQuery = `INSERT INTO industry_ratio (industry_id, ratio) VALUES (?, ?)`;

      for (const entry of frequencyMapping) {
        const { industry, posts } = entry;
        await pool.execute(insertQuery, [industry, posts]);
      }

    }

    console.log("Frequency Mapping: ", frequencyMapping);

    if (!industries || industries.length === 0) {
      return res.status(404).json({ message: "No industries found" });
    }

    let content = [];

    for (const { industry, posts } of frequencyMapping) {
    if (content.length === 0) {
      const news = await fetchNewsByTopic(industry, posts);
      if (Array.isArray(news)) {
        news.forEach(item => {
          content.push({ ...item, industry });
        });
      } else if (news) {
        content.push({ ...news, industry });
      }
    }
  }
  storeNewsArticles(content).then(() => {
    console.log("News articles stored successfully!");
    res.status(200).json({
      industry: industries,
      content: content,
    });
  });
  } catch (err) {
    console.error("Error in fetchHighestFrequencyIndustry:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
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
const fetchSuggestions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 35 } = req.query;
  const offset = (page - 1) * limit;

  const [suggestions] = await pool.query(
    "SELECT * FROM suggestions where status!=2 ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [parseInt(limit), parseInt(offset)]
  );

  if (!suggestions || suggestions.length === 0) {
    return res.status(404).json({ message: "No suggestions found" });
  }

  res.status(200).json({
    page: parseInt(page),
    limit: parseInt(limit),
    total: suggestions.length,
    suggestions,
  });
});
export { createIndustryPool, fetchHighestFrequencyIndustry, launchNewsletter, generateContentFromNews, fetchSuggestions };
