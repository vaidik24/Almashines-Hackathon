// require(dotenv).config({ path: "./env" });
import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    const PORT = 8080;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Open http://localhost:${PORT} in your browser`);
    });
  })
  .catch((error) => {
    console.log("Error in connecting DB : ", error);
  });

// import express from "express";
// // const app = express();
// (async () => {
//   try {
//     const conn = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("Error in connecting DB : ", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("Error in connecting DB : ", error);
//   }
// })();
