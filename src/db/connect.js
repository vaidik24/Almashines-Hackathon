// db/connect.js
import mysql from "mysql2/promise";

const pool = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "ls-60f0c30dcd3fe963a6df56fbcc29d2afc1303d71.cwbkdng4snz0.ap-south-1.rds.amazonaws.com",
      user: process.env.MYSQL_USER || "learning",
      password: process.env.MYSQL_PASSWORD || "2025.2025",
      database: process.env.MYSQL_DATABASE || "learning_hackathon",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
});
// const pool = await mysql.createConnection({
//       host: process.env.MYSQL_HOST || "ls-814eabaedc9633c9af9037e4b8ceba504f1115af.cwbkdng4snz0.ap-south-1.rds.amazonaws.com",
//       user: process.env.MYSQL_USER || "learning",
//       password: process.env.MYSQL_PASSWORD || "2025.2025",
//       database: process.env.MYSQL_DATABASE || "engage_pilot",
//       waitForConnections: true,
//       connectionLimit: 10,
//       queueLimit: 0,
// });

export default pool;
