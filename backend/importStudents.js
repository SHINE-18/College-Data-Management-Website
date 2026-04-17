const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const dotenv = require("dotenv");
dotenv.config({ path: require("path").resolve(__dirname, ".env") });

// ── Config ────────────────────────────────────────────────────────────────────
// Update this to match your MongoDB connection string / .env setup
const MONGO_URI = process.env.MONGODB_URI;

// ── Student Model ─────────────────────────────────────────────────────────────
const Student = require('./models/Student');

// ── Main ──────────────────────────────────────────────────────────────────────
const csvFile = process.argv[2];

if (!csvFile) {
  console.error("Usage: node importStudents.js <path-to-csv>");
  process.exit(1);
}

const filePath = path.resolve(csvFile);
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

async function importStudents() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const students = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        students.push({
          enrollmentNumber: row.enrollmentNumber?.trim(),
          name:             row.name?.trim(),
          email:            row.email?.trim(),
          password:         row.password?.trim(),
          semester:         parseInt(row.semester),
          department:       row.department?.trim(),
          batch:            row.batch?.trim(),
        });
      })
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Parsed ${students.length} students from CSV`);

  let inserted = 0, skipped = 0;

  for (const student of students) {
    try {
      await Student.create(student);
      inserted++;
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate key — student already exists
        skipped++;
        console.warn(`Skipped (already exists): ${student.enrollmentNumber}`);
      } else {
        console.error(`Error inserting ${student.enrollmentNumber}:`, err.message);
      }
    }
  }

  console.log(`\nDone! Inserted: ${inserted} | Skipped (duplicates): ${skipped}`);
  await mongoose.disconnect();
}

importStudents().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});