import { datoClient } from "./datocmsClient.js";

export const getActorFromVersion = async (versionId) => {
  try {
    let editorId = null;
    let roleId = null;

    const version = await datoClient.itemVersions.find(versionId);

    if (version?.editor?.id) {
      editorId = version.editor.id;
    } else if (version?.relationships?.editor?.data?.id) {
      editorId = version.relationships.editor.data.id;
    }

    if (!editorId) {
      console.log("❌ NO EDITOR FOUND");
      return null;
    }

    const user = await datoClient.users.find(editorId);

    if (user?.relationships?.role?.data?.id) {
      roleId = user.relationships.role.data.id;
    } else if (user?.role?.id) {
      roleId = user.role.id;
    }

    let role = null;

    if (roleId) {
      role = await datoClient.roles.find(roleId);
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
};
