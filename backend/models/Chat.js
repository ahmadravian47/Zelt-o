const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema(
  {
    organizationNumber: {
      type: Number,
      required: true,
      index: true,
    },

    visitorName: {
      type: String,
    },

    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
