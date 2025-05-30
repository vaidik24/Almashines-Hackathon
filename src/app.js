import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  express.json({
    limit: "32kb",
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(cookieParser());
app.use(
  express.urlencoded({
    limit: "32kb",
  })
);
app.use(express.static("public"));

//import route
import userRouter from "./routes/user.routes.js";
import enhanceRouter from "./routes/enhance.routes.js";

app.use("/api/", userRouter);

export { app };
