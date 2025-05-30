import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";
import pool from "../db/connect.js"; // your MySQL pool
const createIndustryPool = async () => {
  const [industries] = await pool.query(
    "SELECT uwe.industry, COUNT(u.id) as frequency FROM users u JOIN user_work_experience uwe ON uwe.user_id = u.id GROUP BY uwe.industry ORDER BY frequency DESC LIMIT 10"
  );
  return industries;
};

const fetchHighestFrequencyIndustry = asyncHandler(async (req, res) => {
  const industries = await createIndustryPool();

  if (!industries || industries.length === 0) {
    return res.status(404).json({ message: "No industries found" });
  }

  res.status(200).json({
    message: "Fetched highest frequency industries",
    industry: industries,
  });
});
export { createIndustryPool, fetchHighestFrequencyIndustry };

// 