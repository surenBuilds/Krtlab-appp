import express from "express";
const router = express.Router();
router.post("/create-checkout", express.json(), async (_req, res) => { res.json({ url: null }); });
export default router;
