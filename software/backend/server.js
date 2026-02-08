import express from "express";

const app = express();

app.use(express.json());

app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001")
});

app.get("/", (req, res) => res.send("IT'S RUNNING!!!!!!!!!!!!!!"));