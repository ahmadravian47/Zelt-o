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
    },

    branding: {
      primaryColor: {
        type: String,
        default: "#D9705A",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
