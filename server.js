import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { getActorFromVersion } from "./services/datocmsService.js";
import { datoClient } from "./services/datocmsClient.js";

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
    /*
    console.log("=================================");
    console.log("WEBHOOK PAYLOAD");
    console.log("=================================");

    console.dir(data, {
      depth: null,
      colors: true
    });

    console.log("=================================");
    console.log(
      "EVENT TYPE:",
      data.event_type
    );

    console.log(
      "CURRENT STAGE:",
      data.entity?.meta?.stage
    );

    console.log(
      "PREVIOUS STAGE:",
      data.previous_entity?.meta?.stage
    );
    console.log(
      "PUBLISHED AT:",
      data.entity?.meta?.published_at
    );

    console.log(
      "STATUS:",
      data.entity?.meta?.status
    );
    console.log(Object.keys(datoClient));
    console.log(
      Object.keys(datoClient.items)
    );
    console.log(
      Object.getOwnPropertyNames(
        Object.getPrototypeOf(datoClient.items)
      )
    );*/

    const entity = data.entity;
    const versionId = data.entity?.meta?.current_version;

    const entityId = data.entity?.id;
    const itemTypeId =
      data.entity?.relationships?.item_type?.data?.id;

    const environment = data.environment;
   

    const projectId = "ppds";

    const cmsLink = `https://${projectId}.admin.datocms.com/environments/${environment}/editor/item_types/${itemTypeId}/items/${entityId}`;



    

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
    const hasContentChanges =
      Object.keys(changesPerLocale).length > 0;

    let actor = null;

    if (hasContentChanges) {

      actor = versionId
        ? await getActorFromVersion(versionId)
        : null;

      console.log("🎭 ACTOR:", actor);

    }
    
    
    console.log(
      "✅ Stored:",
      entityId,
      "| User:",
      actor?.userId || "No Content Change",
      "| Email:",
      actor?.email || "-"
    );
    

    const currentStage = data.entity?.meta?.stage;
    const previousStage = data.previous_entity?.meta?.stage;
    /*publish on approving*/
    if (
      currentStage === "approved" &&
      previousStage === "review"
    ) {

      try {

        console.log(
          `🚀 Publishing Item ${entityId}`
        );

        await datoClient.items.publish(entityId);

        console.log(
          `✅ Item Published ${entityId}`
        );

      } catch (err) {

        console.error(
          "❌ Publish Failed:",
          err.message
        );

      }

    }


    /* ================== SAVE ================== */

  const existingRecord = await Record.findOne({
    entityId,
    
  });
  

  const updateObject = {
    entityId,
    title: titleValue,
    itemTypeId,

    eventType: data.event_type,
    environment,
    cmsLink,

    lastUpdatedBy:
      hasContentChanges
        ? actor?.name || "Unknown"
        : existingRecord?.lastUpdatedBy,

    lastUpdatedByEmail:
      hasContentChanges
        ? actor?.email || null
        : existingRecord?.lastUpdatedByEmail,
      };

  // SAVE CURRENT STAGE EXCEPT DRAFT
  if (currentStage !== "draft") {
    updateObject.stage = currentStage;
  }

  /*
    Ignore reject -> draft (or approved -> draft)
    Keep the last meaningful workflow state.
  */
  if (currentStage === "draft") {
    updateObject.previousStage =
      existingRecord?.previousStage;
  }

  /*
    draft -> review
    If this item was previously rejected and sent back for rework,
    show reject -> review instead of draft -> review.
  */
  else if (
    currentStage === "review" &&
    previousStage === "draft"
  ) {

    // First time entering workflow
    if (!existingRecord?.stage) {

      updateObject.previousStage = "draft";

    }

    // Coming back from reject/approved
    else if (
      existingRecord.stage &&
      existingRecord.stage !== "review"
    ) {

      updateObject.previousStage =
        existingRecord.stage;

    }

    // review -> draft -> review
    else {

      updateObject.previousStage =
        existingRecord.previousStage;

    }

  }

  /* NORMAL TRANSITIONS */
  else {

    updateObject.previousStage = previousStage;

  }
  // UPDATE TIME ONLY WHEN MOVED TO REVIEW
  // UPDATE TIME ONLY WHEN MOVED TO REVIEW
  if (currentStage === "review") {

    updateObject.createdAt = new Date();

  
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

    const addToSetObject = {
      localesChanged: {
        $each: Object.keys(changesPerLocale)
      }
    };

    if (hasContentChanges) {

      addToSetObject.updatedByNames = {
        name: actor?.name || "Unknown",
        mailID: actor?.email || null
      };

    }
    console.log("CURRENT STAGE:", currentStage);
    console.log("PREVIOUS STAGE:", previousStage);
    console.log("STAGE TO SAVE:", updateObject.stage);

    await Record.findOneAndUpdate(
      {
        entityId
      },
      {
        $set: updateObject,
        $addToSet: addToSetObject
        
      },
      { upsert: true, returnDocument: "after" }
    );
    //TODO
    
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