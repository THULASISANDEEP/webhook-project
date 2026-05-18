import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
//TODO
//import { getActorFromVersion } from "./services/datocmsService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ================== DB ================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(() => console.log("❌ DB Error"));

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

  /* 🔥 NEW FIELD */
  updatedBy: String,
  //TODO
  //updatedByEmail: String,
  //updatedByRole: String,

  localesChanged: {
    type: [String],
    default: []
  },

  localeChanges: {
    type: Object,
    default: {}
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payload = mongoose.model("Payload", payloadSchema);

/* ================== WEBHOOK ================== */
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    /* 🔥 ADD THIS */
    const entity = data.entity;
    //TODO
    //const versionId = data.entity?.meta?.current_version;

    const entityId = data.entity?.id;
    const itemTypeId =
      data.entity?.relationships?.item_type?.data?.id;

    const environment = data.environment;

    const projectId = "ppds";

    const cmsLink = `https://${projectId}.admin.datocms.com/environments/${environment}/editor/item_types/${itemTypeId}/items/${entityId}`;


    //TODO
    /* 🔥 ADD THIS (SAFE USER DETECTION) */
    
    /* 🔥 FETCH ACTOR INFO FROM VERSION */
    /*const actor = versionId
      ? await getActorFromVersion(versionId)
      : null;

    console.log("🎭 ACTOR:", actor);
    const updatedBy =
      actor?.userId ||
      entity?.relationships?.creator?.data?.id ||
      "unknown";*/
    //TODO

    /* ================== 🔥 STRICT EN TITLE ================== */
    const titleField = data.entity?.attributes?.title;

    let titleValue = "Untitled";

    if (
      titleField &&
      typeof titleField === "object" &&
      typeof titleField.en === "string" &&
      titleField.en.trim() !== ""
    ) {
      titleValue = titleField.en.trim();
    }

    /* ================== 🔥 CHANGE DETECTION ================== */
    const currentAttributes = data.entity?.attributes || {};
    const previousAttributes = data.previous_entity?.attributes || {};

    const isLocaleKey = (key) => /^[a-z]{2}(-[A-Z]{2})?$/.test(key);

    const changesPerLocale = {};

    if (data.previous_entity) {
      for (const field in currentAttributes) {
        const currentField = currentAttributes[field];
        const previousField = previousAttributes[field];

        if (
          typeof currentField === "object" &&
          currentField !== null &&
          !Array.isArray(currentField)
        ) {
          for (const locale in currentField) {
            if (!isLocaleKey(locale)) continue;

            const currValue = currentField[locale];
            const prevValue = previousField?.[locale];

            if (
              prevValue !== undefined &&
              JSON.stringify(currValue) !== JSON.stringify(prevValue)
            ) {
              changesPerLocale[locale] = {
                field,
                before: prevValue,
                after: currValue
              };
            }
          }
        }
      }
    }
    

    const currentStage = data.entity?.meta?.stage;
    const previousStage = data.previous_entity?.meta?.stage;

    /* ================== SAVE ================== */

  const existingRecord = await Payload.findOne({
    entityId,
    
  });

  const updateObject = {
    entityId,
    title: titleValue,
    itemTypeId,


    eventType: data.event_type,
    environment,
    cmsLink,
  
  };
  /* 🔥 DO NOT UPDATE STAGE INFO WHEN CURRENT STAGE = DRAFT */
  if (currentStage !== "draft") {
    updateObject.stage = currentStage;
    updateObject.previousStage = previousStage;
  }

  /* 🔥 UPDATE TIME ONLY WHEN MOVED TO REVIEW */
  if (currentStage === "review") {
    updateObject.createdAt = new Date();
  } else {
    updateObject.createdAt =
      existingRecord?.createdAt || new Date();
  }








//TODO
      /* 🔥 ADD THIS */
      //updatedBy

      //updatedByEmail: actor?.email || null,
      //updatedByRole: actor?.role || null,
      //TODO

    Object.entries(changesPerLocale).forEach(([locale, change]) => {
      updateObject[`localeChanges.${locale}`] = change;
    });

    /* 🔥 TODAY DATE KEY */
    

    await Payload.findOneAndUpdate(
      {
        entityId
      },
      {
        $set: updateObject,
        $addToSet: {
          localesChanged: { $each: Object.keys(changesPerLocale) }
        }
      },
      { upsert: true, returnDocument: "after" }
    );
    //TODO
    /*console.log(
    "✅ Stored:",
    entityId,
    "| User:",
    updatedBy,
    "| Email:",
    actor?.email,
    "| Role:",
    actor?.role
  );*/
    //TODO
    res.status(200).json({ message: "Stored" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed" });
  }
});

/* ================== GET ================== */
app.get("/payloads", async (req, res) => {
  const data = await Payload.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
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