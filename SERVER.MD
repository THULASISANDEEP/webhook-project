import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ================== DB ================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

/* ================== MODEL ================== */
const payloadSchema = new mongoose.Schema({
  entityId: String,
  title: String,
  itemTypeId: String,
  stage: String,
  previousStage: String,
  eventType: String,
  environment: String,
  cmsLink: String,

  isRejected: Boolean,

  localesChanged: {
    type: [String],
    default: []
  },

  localeChanges: {
    type: Object,
    default: {}
  },

  dateKey: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

/* 🔥 PREVENT DUPLICATES */
payloadSchema.index({ entityId: 1, dateKey: 1 }, { unique: true });

const Payload = mongoose.model("Payload", payloadSchema);

/* ================== WEBHOOK ================== */
app.post("/webhook", async (req, res) => {
  try {
    console.log("🔥 WEBHOOK HIT");

    const data = req.body;

    const entityId = data.entity?.id || null;
    const itemTypeId =
      data.entity?.relationships?.item_type?.data?.id || null;

    const environment = data.environment || "development";

    const cmsLink = entityId && itemTypeId
      ? `https://ppds.admin.datocms.com/environments/${environment}/editor/item_types/${itemTypeId}/items/${entityId}`
      : null;

    /* TITLE */
    const titleField = data.entity?.attributes?.title;
    let title = "Untitled";
    if (titleField?.en) title = titleField.en;

    /* STAGE */
    const currentStage = data.entity?.meta?.stage;
    const previousStage = data.previous_entity?.meta?.stage;

    const isRejected = currentStage === "reject";

    /* DATE KEY */
    const today = new Date().toISOString().split("T")[0];

    /* CHANGE DETECTION */
    const currentAttributes = data.entity?.attributes || {};
    const previousAttributes = data.previous_entity?.attributes || {};

    const isLocaleKey = (key) => /^[a-z]{2}(-[A-Z]{2})?$/.test(key);

    const changesPerLocale = {};
    const newLocales = [];

    if (data.previous_entity) {
      for (const field in currentAttributes) {
        const curr = currentAttributes[field];
        const prev = previousAttributes[field];

        if (typeof curr === "object" && curr !== null) {
          for (const locale in curr) {
            if (!isLocaleKey(locale)) continue;

            const currVal = curr[locale];
            const prevVal = prev?.[locale];

            if (
              prevVal !== undefined &&
              JSON.stringify(currVal) !== JSON.stringify(prevVal)
            ) {
              if (!changesPerLocale[locale]) {
                changesPerLocale[locale] = [];
              }

              changesPerLocale[locale].push({
                field,
                before: prevVal,
                after: currVal
              });

              newLocales.push(locale);
            }
          }
        }
      }
    }

    /* ================= UPSERT LOGIC ================= */

    let existing = await Payload.findOne({ entityId, dateKey: today });

    if (existing) {
      /* 🔁 UPDATE */

      // merge locales
      existing.localesChanged = [
        ...new Set([...existing.localesChanged, ...newLocales])
      ];

      // update stage
      existing.stage = currentStage;
      existing.previousStage = previousStage;

      // merge changes
      for (const locale in changesPerLocale) {
        if (!existing.localeChanges[locale]) {
          existing.localeChanges[locale] = [];
        }

        existing.localeChanges[locale].push(
          ...changesPerLocale[locale]
        );
      }

      existing.isRejected = isRejected;

      await existing.save();

      console.log("♻️ UPDATED EXISTING");

    } else {
      /* 🆕 CREATE */

      await Payload.create({
        entityId,
        title,
        itemTypeId,
        stage: currentStage,
        previousStage,
        eventType: data.event_type,
        environment,
        cmsLink,
        isRejected,
        localesChanged: newLocales,
        localeChanges: changesPerLocale,
        dateKey: today,
        createdAt: new Date()
      });

      console.log("✅ CREATED NEW");
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "fail" });
  }
});

/* ================== GET ALL ================== */
app.get("/payloads", async (req, res) => {
  const data = await Payload.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});

/* ================== GET REJECTED ================== */
app.get("/rejected", async (req, res) => {
  try {
    const rejected = await Payload.find({
      isRejected: true
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: rejected });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ================== DELETE ================== */
app.delete("/payloads/:id", async (req, res) => {
  await Payload.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ================== SERVER ================== */
app.listen(4000, () => {
  console.log("🚀 Server running on port 4000");
});