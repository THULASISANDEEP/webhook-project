import express from "express";
import nodemailer from "nodemailer";
import fs from "fs";
import cors from "cors";

const app = express();
const updatedBy = entity?.relationships?.updated_by?.data;

console.log("👤 Updated By:");
console.log("ID:", updatedBy?.id);
console.log("Type:", updatedBy?.type);
console.log("-------------------------");
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ⚠️ Credentials
const EMAIL_USER = "thulasisandeep04@gmail.com";
const EMAIL_PASS = "locrtbqpoyvwuxrd";

// ✅ Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});


// =======================================
// 🔥 SAFE JSON READ
// =======================================
function safeReadJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];

    const data = fs.readFileSync(filePath, "utf-8");

    if (!data || data.trim() === "") return [];

    return JSON.parse(data);
  } catch (err) {
    console.error("❌ JSON Read Error:", err);
    return [];
  }
}


// =======================================
// 🔥 SAVE PAYLOAD
// =======================================
function savePayload(payload) {
  const filePath = "./payloads.json";

  let existing = safeReadJSON(filePath);

  const newEntry = {
    id: Date.now() + Math.random(),
    timestamp: new Date(),
    payload
  };

  existing.push(newEntry);

  // ✅ Limit file size (keep last 100)
  if (existing.length > 100) {
    existing = existing.slice(-100);
  }

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
}


// =======================================
// 🔥 SAVE REVIEW
// =======================================
function saveReview(data) {
  const filePath = "./reviews.json";

  let existing = safeReadJSON(filePath);

  existing.push(data);

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
}


// =======================================
// 🔥 WEBHOOK
// =======================================
app.post("/webhook", async (req, res) => {
  const payload = req.body;

  // ✅ PRINT PAYLOAD
  console.log("📦 FULL PAYLOAD:");
  console.log(JSON.stringify(payload, null, 2));

  // ✅ SAVE PAYLOAD
  savePayload(payload);

  const entity = payload.entity;
  const previous_entity = payload.previous_entity;

  const event_type = payload.event_type;
  const environment = payload.environment;

  const entity_id = entity?.id;
  const item_type_id = entity?.relationships?.item_type?.data?.id;

  const creator = entity?.relationships?.creator?.data;

  const current_stage = entity?.meta?.stage;
  const previous_stage = previous_entity?.meta?.stage;

  // ✅ CREATOR LOG
  console.log("🔍 Creator Info:");
  console.log("ID:", creator?.id);
  console.log("Type:", creator?.type);
  console.log("-------------------------");

  console.log("Event:", event_type);
  console.log("Stage:", previous_stage, "→", current_stage);

  // 🚫 FILTER (ignore unwanted triggers)
  if (
    event_type !== "update" ||
    !entity ||
    !previous_entity ||
    !current_stage ||
    !previous_stage ||
    current_stage === previous_stage ||
    environment !== "development"
  ) {
    return res.send("Ignored");
  }

  // =======================================
  // ✅ Draft → Review
  // =======================================
  if (previous_stage === "draft" && current_stage === "review") {

    const cmsLink = `https://ppds.admin.datocms.com/environments/development/editor/item_types/${item_type_id}/items/${entity_id}`;

    const allLocales = Object.keys(entity?.attributes?.title || {});

    console.log("🌍 ALL LOCALES:", allLocales);

    for (let locale of allLocales) {

      const title = entity?.attributes?.title?.[locale] || "No Title";

      const newReview = {
        id: Date.now() + Math.random(),
        entityId: entity_id,
        creatorId: creator?.id,
        creatorType: creator?.type,
        title,
        locale,
        stage: current_stage,
        status: "pending",
        createdAt: new Date(),
        cmsLink
      };

      saveReview(newReview);

      // 📧 EMAIL
      try {
        await transporter.sendMail({
          from: EMAIL_USER,
          to: "thulasisandeepch26@gmail.com",
          subject: `🚀 Content moved to Review (${locale})`,
          html: `
            <h2>Content Ready for Review</h2>
            <p><b>Title:</b> ${title}</p>
            <p><b>Locale:</b> ${locale}</p>
            <p><b>Stage:</b> ${current_stage}</p>

            <a href="${cmsLink}"
               style="padding:10px;background:#007bff;color:white;text-decoration:none;">
               Open in DatoCMS
            </a>
          `
        });

        console.log(`✅ Email sent for ${locale}`);

      } catch (err) {
        console.error("❌ Email error:", err);
      }
    }
  }

  res.send("OK");
});


// =======================================
// 🔥 GET REVIEWS
// =======================================
app.get("/reviews", (req, res) => {
  const data = safeReadJSON("./reviews.json");
  res.json(data);
});


// =======================================
// 🔥 TOGGLE MARK DONE
// =======================================
app.post("/mark-done", (req, res) => {
  const { id } = req.body;

  const data = safeReadJSON("./reviews.json");

  const item = data.find(d => d.id === id);

  if (item) {
    item.status =
      item.status === "completed" ? "pending" : "completed";

    fs.writeFileSync("./reviews.json", JSON.stringify(data, null, 2));
    return res.send("Updated");
  }

  res.status(400).send("Not found");
});


// =======================================
// 🔥 TOGGLE DELETE
// =======================================
app.post("/delete", (req, res) => {
  const { id } = req.body;

  const data = safeReadJSON("./reviews.json");

  const item = data.find(d => d.id === id);

  if (item) {
    item.status =
      item.status === "deleted" ? "pending" : "deleted";

    fs.writeFileSync("./reviews.json", JSON.stringify(data, null, 2));
    return res.send("Updated");
  }

  res.status(400).send("Not found");
});


// =======================================
app.listen(4000, () => {
  console.log("🚀 Server running on port 4000");
});