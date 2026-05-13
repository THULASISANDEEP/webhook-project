import Payload from "../models/payloadModel.js";

// 🔥 WEBHOOK
export const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;

    const entity = payload.entity;
    const previous_entity = payload.previous_entity;

    const entityId = entity?.id || "";
    const itemTypeId =
      entity?.relationships?.item_type?.data?.id || "";

    const stage = entity?.meta?.stage || "";
    const previousStage = previous_entity?.meta?.stage || "";

    const eventType = payload.event_type || "";
    const environment = payload.environment || "main";

    const cmsLink = `https://ppds.admin.datocms.com/environments/${environment}/editor/item_types/${itemTypeId}/items/${entityId}`;

    let locale = "";

    // =====================================
    // ✅ CASE 1: draft → draft (detect)
    // =====================================
    if (stage === "draft" && previousStage === "draft") {
      const currentAttr = payload.entity?.attributes || {};
      const previousAttr = payload.previous_entity?.attributes || {};

      let changedLocales = new Set();

      function detectLocales(curr, prev) {
        if (!curr || typeof curr !== "object") return;

        for (let key in curr) {
          const currVal = curr[key];
          const prevVal = prev?.[key];

          if (
            currVal &&
            typeof currVal === "object" &&
            !Array.isArray(currVal)
          ) {
            const keys = Object.keys(currVal);

            const isLocaleObject = keys.some(
              (k) => k.includes("-") || k.length === 2
            );

            if (isLocaleObject) {
              for (let localeKey of keys) {
                if (
                  JSON.stringify(currVal[localeKey]) !==
                  JSON.stringify(prevVal?.[localeKey])
                ) {
                  changedLocales.add(localeKey);
                }
              }
            } else {
              detectLocales(currVal, prevVal);
            }
          }
        }
      }

      detectLocales(currentAttr, previousAttr);

      locale = [...changedLocales].join(", ") || "unknown";
    }

    // =====================================
    // ✅ CASE 2: draft → review (USE LATEST)
    // =====================================
    else if (previousStage === "draft" && stage === "review") {

  // STEP 1: last review
  const lastReview = await Payload.findOne({
    entityId,
    stage: "review"
  }).sort({ createdAt: -1 });

  // STEP 2: all drafts after last review
  const drafts = await Payload.find({
    entityId,
    stage: "draft",
    previousStage: "draft",
    createdAt: {
      $gt: lastReview ? lastReview.createdAt : new Date(0)
    }
  }).sort({ createdAt: 1 });

  let localeCount = {};
  let firstValidLocale = "";

  for (let item of drafts) {
    if (!item.locale || item.locale === "unknown") continue;

    const locales = item.locale.split(",").map(l => l.trim());

    for (let loc of locales) {
      localeCount[loc] = (localeCount[loc] || 0) + 1;

      // store first valid
      if (!firstValidLocale) {
        firstValidLocale = loc;
      }
    }
  }

  // STEP 3: find dominant locale
  let dominantLocale = "";
  let maxCount = 0;

  for (let loc in localeCount) {
    if (localeCount[loc] > maxCount) {
      maxCount = localeCount[loc];
      dominantLocale = loc;
    }
  }

  // STEP 4: fallback chain
  locale = dominantLocale || firstValidLocale || "unknown";
}

    // =====================================
    // SAVE TO DB
    // =====================================
    await Payload.create({
      entityId,
      itemTypeId,
      stage,
      previousStage,
      eventType,
      environment,
      locale,
      cmsLink,
      payload,
    });

    console.log("✅ Saved:", entityId, "| Locale:", locale);

    res.send("Saved");
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Error");
  }
};

// 🔥 GET ALL
export const getAllPayloads = async (req, res) => {
  const data = await Payload.find().sort({ createdAt: -1 });
  res.json(data);
};

// 🔥 DELETE
export const deletePayload = async (req, res) => {
  await Payload.findByIdAndDelete(req.params.id);
  res.send("Deleted");
};