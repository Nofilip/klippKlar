import express = require("express");
import "dotenv/config";
import { pool } from "./db";
import cors from "cors"

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(express.json(), cors());

app.get("/ping", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/bookings", async (_req, res) => {
  const r = await pool.query("select * from bookings order by created_at desc limit 50");
  res.json(r.rows);
});


















app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
