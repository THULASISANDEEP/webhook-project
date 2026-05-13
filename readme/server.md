import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// ===============================
// 🔥 MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ===============================
// 🔥 MONGODB CONNECTION (FIXED)
// ===============================
const MONGO_URI = "mongodb+srv://admin:admin123@cluster0.5x1juhn.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // prevents long hang
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => {
  console.error("❌ MongoDB Error:", err.message);
  process.exit(1); // stop server if DB fails
});

// ===============================
// 🔥 SCHEMA
// ===============================
const payloadSchema = new mongoose.Schema({
  entityId: String,
  itemTypeId: String,
  stage: String,
  previousStage: String,
  eventType: String,
  environment: String,
  cmsLink: String,
  payload: Object,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payload = mongoose.model("Payload", payloadSchema);

// ===============================
// 🔥 WEBHOOK
// ===============================
app.post("/webhook", async (req, res) => {
  try {
    const payload = req.body;

    const entity = payload.entity;
    const previous_entity = payload.previous_entity;

    const entityId = entity?.id || "";
    const itemTypeId = entity?.relationships?.item_type?.data?.id || "";

    const stage = entity?.meta?.stage || "";
    const previousStage = previous_entity?.meta?.stage || "";

    const eventType = payload.event_type || "";

    const environment = payload.environment || "main";

    const cmsLink = `https://ppds.admin.datocms.com/environments/${environment}/editor/item_types/${itemTypeId}/items/${entityId}`;

    await Payload.create({
      entityId,
      itemTypeId,
      stage,
      previousStage,
      eventType,
      environment,
      cmsLink,
      payload
    });

    console.log("✅ Saved:", entityId, stage);

    res.send("Saved");
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    res.status(500).send("Error");
  }
});

// ===============================
// 🔥 GET ALL
// ===============================
app.get("/payloads", async (req, res) => {
  try {
    const data = await Payload.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).send("Error fetching data");
  }
});

// ===============================
// 🔥 GET ONE
// ===============================
app.get("/payloads/:id", async (req, res) => {
  try {
    const data = await Payload.findById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).send("Error fetching payload");
  }
});

// ===============================
// 🔥 DELETE
// ===============================
app.delete("/payloads/:id", async (req, res) => {
  try {
    await Payload.findByIdAndDelete(req.params.id);
    res.send("Deleted");
  } catch (err) {
    res.status(500).send("Error deleting");
  }
});

// ===============================
app.listen(4000, () => {
  console.log("🚀 Server running on port 4000");
});