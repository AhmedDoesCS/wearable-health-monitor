import express from "express";
import activityRouter from "./routes/activity.js";

const app = express();

app.use(express.json());
app.use("/activity", activityRouter)

app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001")
});

app.get("/", (req, res) => res.send("IT'S RUNNING!!!!!!!!!!!!!!"));
