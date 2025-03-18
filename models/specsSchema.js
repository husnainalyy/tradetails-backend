const mongoose = require("mongoose");

const specsSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
    },
    details: {
      Body: {
        Dimensions: String,
        Weight: String,
        Build: String,
        SIM: String,
        additional: String, // Use this field for any extra spec (like IP68 rating, Apple Pay, etc.)
      },
      Display: {
        Type: String,
        Size: String,
        Resolution: String,
        Protection: String,
        additional: String, // For specs like Always-On display
      },
      Platform: {
        OS: String,
        Chipset: String,
        CPU: String,
        GPU: String,
      },
      MainCamera: {
        Triple: String,
        Features: String,
        Video: String,
      },
      Battery: {
        Type: String,
        Charging: String,
      },
    },
  },
  { _id: false }
);

module.exports = specsSchema;
