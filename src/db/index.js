import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// const connectDB = async () => {
//   try {
//     // mongodb connection
//     // const conn = await mongoose.connect(
//     //   `${process.env.MONGODB_URL}/${DB_NAME}`
//     // );
//     // console.log("Connected to MongoDB , Host : ", conn.connection.host);
//   } catch (error) {
//     console.log("Error in Connecting with DB : ", error);
//     process.exit(1);
//   }
// };

// export default connectDB;


// db/connect.js
import mysql from "mysql2/promise";

const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "ls-60f0c30dcd3fe963a6df56fbcc29d2afc1303d71.cwbkdng4snz0.ap-south-1.rds.amazonaws.com",
      user: process.env.MYSQL_USER || "almadev",
      password: process.env.MYSQL_PASSWORD || "2025.xopv.product",
      database: process.env.MYSQL_DATABASE || "engage_pilot",
    });

    await connection.connect(); // Ensure connection is established

    console.log("✅ Connected to MySQL DB");
    return connection;
  } catch (error) {
    console.error("❌ MySQL connection failed:", error);
    console.error("Check your host, user, password, and database credentials.");
    process.exit(1);
  }
};

export default connectDB;
