import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { getActorFromVersion } from "./services/datocmsService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

/* ================== Connect DB ================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error", err));

/* ================== Access MODEL ================== */
const recordSchema = new mongoose.Schema({
  entityId: String,
  title: String,
  itemTypeId: String,
  stage: String,
  previousStage: String,
  changeStageToReview: {
    date: String,

    users: [
      {
        _id: false,
        name: String,
        mailID: String,
        time: String
      }
    ]
  },
  eventType: String,
  environment: String,
  cmsLink: String,
  
  lastUpdatedBy: String,
  lastUpdatedByEmail: String,

  updatedByNames: {
    type: [
      {
        _id: false,
        name: String,
        mailID: String
      }
    ],
    default: []
  },

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

const Record = mongoose.model("Record", recordSchema);

/* ================== WEBHOOK route ================== */
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    const entity = data.entity;
    const versionId = data.entity?.meta?.current_version;

    const entityId = data.entity?.id;
    const itemTypeId =
      data.entity?.relationships?.item_type?.data?.id;

    const environment = data.environment;
   

    const projectId = "ppds";

    const cmsLink = `https://${projectId}.admin.datocms.com/environments/${environment}/editor/item_types/${itemTypeId}/items/${entityId}`;


/* ================== Fetch actor ================== */
    const actor = versionId
      ? await getActorFromVersion(versionId)
      : null;

    console.log("🎭 ACTOR:", actor);
    const updatedBy =
      actor?.userId ||
      entity?.relationships?.creator?.data?.id ||
      "unknown";

    // ================== STRICT EN_GB TITLE ==================
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

    /* ================== DETECT CHANGES ================== */
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
              if (!changesPerLocale[locale]) {
                changesPerLocale[locale] = [];
              }
              // CHECK IF FIELD ALREADY EXISTS
              const existingField = changesPerLocale[locale].find(
                (item) => item.field === field
              );

              // UPDATE EXISTING FIELD
              if (existingField) {
                existingField.before = prevValue;
                existingField.after = currValue;
              } else {
                // ADD NEW FIELD
                changesPerLocale[locale].push({
                  field,
                  before: prevValue,
                  after: currValue
                });
              }


              // changesPerLocale[locale] = {
              //   field,
              //   before: prevValue,
              //   after: currValue
              // };
            }
          }
        }
      }
    }
    

    const currentStage = data.entity?.meta?.stage;
    const previousStage = data.previous_entity?.meta?.stage;

    /* ================== SAVE ================== */

  const existingRecord = await Record.findOne({
    entityId,
    
  });
  const today = new Date().toLocaleDateString();

  const currentTime =
    new Date().toLocaleTimeString();

  const updateObject = {
    entityId,
    title: titleValue,
    itemTypeId,

    eventType: data.event_type,
    environment,
    cmsLink,

    lastUpdatedBy:
      actor?.name || "Unknown",

    lastUpdatedByEmail:
      actor?.email || null,
  };
  // DO NOT UPDATE STAGE INFO WHEN CURRENT STAGE = DRAFT
  if (currentStage !== "draft") {
    updateObject.stage = currentStage;
    updateObject.previousStage = previousStage;
  }

  // UPDATE TIME ONLY WHEN MOVED TO REVIEW
  // UPDATE TIME ONLY WHEN MOVED TO REVIEW
  if (currentStage === "review") {

    updateObject.createdAt = new Date();

    updateObject.changeStageToReview =
      existingRecord?.changeStageToReview || {
        date: today,
        users: []
      };

    const existingUser =
      updateObject.changeStageToReview.users.find(
        (u) => u.mailID === actor?.email
      );

    if (existingUser) {

      existingUser.time = currentTime;

    } else {

      updateObject.changeStageToReview.users.push({
        name: actor?.name || "Unknown",
        mailID: actor?.email || null,
        time: currentTime
      });

    }

  } else {

    updateObject.createdAt =
      existingRecord?.createdAt || new Date();

  }

updateObject.localeChanges =
  existingRecord?.localeChanges || {};

/* LOOP NEW CHANGES */
Object.entries(changesPerLocale).forEach(
  ([locale, changes]) => {

    /* CREATE ARRAY */
    if (!updateObject.localeChanges[locale]) {
      updateObject.localeChanges[locale] = [];
    }
    if (!Array.isArray(updateObject.localeChanges[locale])) {
      updateObject.localeChanges[locale] = [
        updateObject.localeChanges[locale]
      ];
    }

    changes.forEach((newChange) => {

      // FIND SAME FIELD
      const existingField =
        updateObject.localeChanges[locale].find(
          (item) => item.field === newChange.field
        );

      // UPDATE EXISTING FIELD
      if (existingField) {
        existingField.before = newChange.before;
        existingField.after = newChange.after;
      } else {

        // ADD NEW FIELD
        updateObject.localeChanges[locale].push(newChange);

      }

    });
});
    

    await Record.findOneAndUpdate(
      {
        entityId
      },
      {
        $set: updateObject,
        $addToSet: {
          localesChanged: {
            $each: Object.keys(changesPerLocale)
          },

          updatedByNames: {
            name: actor?.name || "Unknown",
            mailID: actor?.email || null
          }
        }
        
      },
      { upsert: true, returnDocument: "after" }
    );
    //TODO
    console.log(
    "✅ Stored:",
    entityId,
    "| User:",
    updatedBy,
    "| Email:",
    actor?.email,
    "| Role:",
    actor?.role
  );
    //TODO
    res.status(200).json({ message: "Stored" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed" });
  }
});

/* ================== GET ================== */
app.get("/records", async (req, res) => {

  const data = await Record.find({
    stage: {
      $in: ["review", "approved", "reject"]
    }
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data
  });

});

/* ================== DELETE ================== */
/*i have removed the delete button*/

/* ================== SERVER ================== */
app.listen(4000, () => {
  console.log("🚀 Server running on port 4000");
});