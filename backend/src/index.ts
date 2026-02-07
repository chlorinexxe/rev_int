import express from "express";
import cors from "cors";
import { initDb } from "./db";
import { loadData } from "./loaders/loadData";
import summaryRouter from './routes/routes';


const app = express();
initDb();
loadData();

app.use(cors());
app.use(express.json());
app.use('/api', summaryRouter);
app.get("/", (_req, res) => {
  res.send("Revenue Intelligence Backend is running");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
