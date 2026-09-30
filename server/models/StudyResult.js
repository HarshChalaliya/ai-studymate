const mongoose = require("mongoose");

const studyResultSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },

  score: {
    type: Number,
    required: true,
  },

  totalQuestions: {
    type: Number,
    required: true,
  },

  percentage: {
    type: Number,
    required: true,
  },

  weakQuestions: {
    type: [String],
    default: [],
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("StudyResult", studyResultSchema);
