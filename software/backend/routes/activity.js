import express from "express";
import { db } from "../db.js"

const router = express.Router();

router.get("/activity", async (req, res) => {
    try {

        const [rows] = await db.execute(
            "SELECT activity_time, heart_rate, temperature, calories_burned", ["ACTIVITY"]
        );

        if (rows.length === 0) {
            return res.status(404).json({error: "No acitivities found"})
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Failed to fetch activity data"});
    }
});

export default router;