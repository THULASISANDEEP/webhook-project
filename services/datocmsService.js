/* Import DatoCMS client and MongoDB User model */
import { datoClient } from "./datocmsClient.js";
import User from "../models/User.js";

/* Fetch editor details from a DatoCMS version */
export const getActorFromVersion = async (versionId) => {
  /* Start error-safe execution */
  try {
    /* Variables used to store editor and role information */
    let editorId = null;
    //let roleId = null;

    /* Fetch complete version payload using version ID */
    const version = await datoClient.itemVersions.find(versionId);
    

    /* Log version details for debugging */
    /*
    console.log("VERSION ID:", version.id);
    console.log("VERSION CREATED:", version.meta?.created_at);
    console.log("VERSION EDITOR:", version.editor);
    console.log("CURRENT VERSION ID FROM WEBHOOK:", versionId);
    console.log("=================================");
    console.log("VERSION PAYLOAD");
    console.log("=================================");

//Print full version payload from DatoCMS 
    console.dir(version, {
      depth: null,
      colors: true
    });

    console.log("=================================");*/


    /* Extract editor ID from version payload */
    if (version?.editor?.id) {
      editorId = version.editor.id;
    } else if (version?.relationships?.editor?.data?.id) {
      editorId = version.relationships.editor.data.id;
    }


/* Stop processing if no editor exists */
    if (!editorId) {
      console.log(" NO EDITOR FOUND");
      return null;
    }

/* Check whether user already exists in MongoDB cache */
    const cachedUser =
      await User.findOne({
        userId: editorId
      });


/* User found in cache - no DatoCMS user API call needed */
    if (cachedUser) {

      /* Log successful cache retrieval */
      console.log(
        ` USER CACHE HIT (${editorId})`
      );

/* Return user details directly from MongoDB */
      return {
        userId: cachedUser.userId,
        name: cachedUser.fullName,
        email: cachedUser.email
      };
    }

/* User not found in cache */
    console.log(
      `⚠️ USER CACHE MISS (${editorId})`
    );

/* Call DatoCMS user endpoint because cache is empty */
    console.log(
      `🚨 CALLING DATO USER API FOR ${editorId}`
    );

/* Fetch complete user information from DatoCMS */
    const user =
      await datoClient.users.find(editorId);


      console.log("USER PAYLOAD:");
      console.dir(user, {
        depth: null,
        colors: true
      });
      console.log("=================================");
      console.log("USER PAYLOAD");
      console.log("=================================");

      //Print full user payload for debugging
      console.dir(user, {
        depth: null,
        colors: true
      });

      console.log("=================================");


/* Store user in MongoDB cache for future requests */
    await User.findOneAndUpdate(

      /* Find user document using DatoCMS user ID */
      {
        userId: user.id
      },

      /* Save user information received from DatoCMS */
      {
        fullName: user.full_name,
        email: user.email,
        roleId: user.role?.id,
        isActive: user.is_active,
        lastAccess: user.meta?.last_access
      },

      /* Create user if missing or update existing user */
      {
        upsert: true,
        returnDocument: "after"
      }
    );

    /* Log cached user information */
    console.log(
      `📦 USER SAVED TO CACHE: ${user.email}`
    );

    /* Return user details fetched from DatoCMS */
    return {
      userId: user.id,
      name: user.full_name,
      email: user.email
    };

    /*
    // if (user?.relationships?.role?.data?.id) {
    //   roleId = user.relationships.role.data.id;
    // } else if (user?.role?.id) {
    //   roleId = user.role.id;
    // }

    // let role = null;

    // if (roleId) {
    //   role = await datoClient.roles.find(roleId);
    // }

    return {
      userId: editorId,
      name:
        user?.full_name ||
        user?.attributes?.full_name ||
        "Unknown",

      email:
        user?.attributes?.email ||
        user?.email ||
        null,
    };
      // role: role?.attributes?.name || role?.name || "unknown",*/
  
  /* Handle unexpected errors */
  } catch (err) {

    /* Log error details */
    console.error("❌ ACTOR ERROR:", err.message);

    /* Return null when actor information cannot be retrieved */
    return null;
  }
};


/*
Webhook
   ↓
Get Version ID
   ↓
Fetch Version From DatoCMS
   ↓
Extract Editor ID
   ↓
Check MongoDB Cache

Found?
├── YES → Return Cached User
│
└── NO
      ↓
   Call DatoCMS User API
      ↓
   Save User To MongoDB
      ↓
   Return User*/
