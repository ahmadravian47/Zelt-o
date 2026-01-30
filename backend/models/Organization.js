const mongoose = require("mongoose");
const organizationSchema = new mongoose.Schema(
  {
    organizationNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    businessName: {
      type: String,
      required: true,
    },

    businessDescription: {
      type: String,
      required: true,
      maxlength: 2000, // prevents prompt abuse
    },


    bot: {
      isLive: {
        type: Boolean,
        default: false,
      },
      embedCode: {
        type: String,
      },
      botId: {
        type: String,
        unique: true,
      },
      lastSeen: Date,
    },

    branding: {
      primaryColor: {
        type: String,
        default: "#D9705A",
      },
    },

    ai: {
      openAiKey: {
        type: String,
        select: false, // important for security
      },
      provider: {
        type: String,
        enum: ["internal", "openai"],
        default: "internal",
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
