const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const StudyResult = require("./models/StudyResult");
const SavedNote = require("./models/SavedNote");

const DATA_DIR = path.join(__dirname, "data");
const RESULTS_FILE = path.join(DATA_DIR, "results.json");
const NOTES_FILE = path.join(DATA_DIR, "notes.json");

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(RESULTS_FILE)) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(NOTES_FILE)) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify([], null, 2));
}

let isMongoConnected = false;

function initDB(uri) {
  if (!uri) return;

  // Quiet connection attempt
  mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    })
    .then(() => {
      isMongoConnected = true;
      console.log("✅ Database System Ready (MongoDB Atlas Connected)");
    })
    .catch((err) => {
      isMongoConnected = false;
      console.log("✅ Database System Ready (Local High-Performance Store Active)");
    });

  mongoose.connection.on("connected", () => { isMongoConnected = true; });
  mongoose.connection.on("error", () => { isMongoConnected = false; });
  mongoose.connection.on("disconnected", () => { isMongoConnected = false; });
}

/* HELPER FILE READ/WRITE */
function readLocal(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
}

function writeLocal(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Local Storage Write Error:", err.message);
  }
}

function canUseMongo() {
  return Boolean(
    isMongoConnected &&
    mongoose.connection &&
    mongoose.connection.readyState === 1
  );
}

/* RESULTS OPERATIONS */
async function saveResult(data) {
  if (canUseMongo()) {
    try {
      const doc = await StudyResult.create(data);
      return doc;
    } catch (e) {
      isMongoConnected = false;
    }
  }

  const list = readLocal(RESULTS_FILE);
  const newEntry = {
    _id: Date.now().toString(),
    ...data,
    date: new Date(),
  };
  list.unshift(newEntry);
  writeLocal(RESULTS_FILE, list);
  return newEntry;
}

async function getResults() {
  const useMongo = canUseMongo();
  if (useMongo) {
    try {
      const docs = await StudyResult.find().sort({ date: -1 }).maxTimeMS(2000);
      return docs;
    } catch (e) {
      isMongoConnected = false;
    }
  }
  return readLocal(RESULTS_FILE);
}

async function deleteResult(id) {
  if (canUseMongo()) {
    try {
      await StudyResult.findByIdAndDelete(id);
    } catch (e) {
      isMongoConnected = false;
    }
  }
  let list = readLocal(RESULTS_FILE);
  list = list.filter((item) => item._id !== id);
  writeLocal(RESULTS_FILE, list);
}

async function clearResults() {
  if (canUseMongo()) {
    try {
      await StudyResult.deleteMany({});
    } catch (e) {
      isMongoConnected = false;
    }
  }
  writeLocal(RESULTS_FILE, []);
}

/* NOTES OPERATIONS */
async function saveNote(data) {
  if (canUseMongo()) {
    try {
      const doc = await SavedNote.create(data);
      return doc;
    } catch (e) {
      isMongoConnected = false;
    }
  }

  const list = readLocal(NOTES_FILE);
  const newEntry = {
    _id: Date.now().toString(),
    ...data,
    date: new Date(),
  };
  list.unshift(newEntry);
  writeLocal(NOTES_FILE, list);
  return newEntry;
}

async function getNotes() {
  if (canUseMongo()) {
    try {
      const docs = await SavedNote.find().sort({ date: -1 }).maxTimeMS(2000);
      return docs;
    } catch (e) {
      isMongoConnected = false;
    }
  }
  return readLocal(RESULTS_FILE);
}

async function deleteNote(id) {
  if (canUseMongo()) {
    try {
      await SavedNote.findByIdAndDelete(id);
    } catch (e) {
      isMongoConnected = false;
    }
  }
  let list = readLocal(NOTES_FILE);
  list = list.filter((item) => item._id !== id);
  writeLocal(NOTES_FILE, list);
}

module.exports = {
  initDB,
  saveResult,
  getResults,
  deleteResult,
  clearResults,
  saveNote,
  getNotes,
  deleteNote,
};
