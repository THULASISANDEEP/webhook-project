import mongoose from "mongoose";

const userSchema =
  new mongoose.Schema({
    userId: {
      type: String,
      unique: true
    },

    fullName: String,

    email: String,

    roleId: String,

    isActive: Boolean,

    lastAccess: String,

    cachedAt: {
      type: Date,
      default: Date.now
    }
  });

export default mongoose.model(
  "User",
  userSchema
);