const mongoose = require("mongoose");
const faqSchema = new mongoose.Schema(
  {
    organizationNumber: {
      type: Number,
      required: true,
      index: true,
    },

    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FAQ", faqSchema);
