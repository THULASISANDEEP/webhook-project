//TODO
/*import { datoClient } from "./datocmsClient.js";

export const getActorFromVersion = async (versionId) => {
  try {
    console.log("🧩 FETCHING VERSION:", versionId);

    const version = await datoClient.itemVersions.find(versionId);

    console.log("📦 VERSION RESPONSE:");
    console.log(JSON.stringify(version, null, 2));

    /* 🔥 HANDLE BOTH POSSIBLE STRUCTURES
    let editorId = null;

    if (version?.editor?.id) {
      editorId = version.editor.id;   // ✅ YOUR CASE
    } else if (version?.relationships?.editor?.data?.id) {
      editorId = version.relationships.editor.data.id; // fallback
    }

    console.log("👤 EDITOR ID:", editorId);

    if (!editorId) {
      console.log("❌ NO EDITOR FOUND");
      return null;
    }

    /* ================= USER ================= 
    const user = await datoClient.users.find(editorId);

    console.log("📦 USER RESPONSE:");
    console.log(JSON.stringify(user, null, 2));

     🔥 HANDLE ROLE STRUCTURE 
    let roleId = null;

    if (user?.relationships?.role?.data?.id) {
      roleId = user.relationships.role.data.id;
    } else if (user?.role?.id) {
      roleId = user.role.id;
    }

    console.log("🎭 ROLE ID:", roleId);

    let role = null;

    if (roleId) {
      role = await datoClient.roles.find(roleId);

      console.log("📦 ROLE RESPONSE:");
      console.log(JSON.stringify(role, null, 2));
    }

    return {
      userId: editorId,
      email: user?.attributes?.email || user?.email || null,
      role: role?.attributes?.name || role?.name || "unknown",
    };

  } catch (err) {
    console.error("❌ ACTOR ERROR:", err.message);
    return null;
  }
};*/