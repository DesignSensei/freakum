// scripts/seedAdmin.js
require("dotenv").config();
const logger = require("../utils/logger");
const mongoose = require("mongoose");
const User = require("../models/User");

async function seed() {
  // Optional guard:
  if (process.env.RUN_SEED !== "true") {
    logger.info("Skipping admin seeding (set RUN_SEED=true to enable)");
    return process.exit(0);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const name = process.env.INITIAL_ADMIN_NAME;
  const email = process.env.INITIAL_ADMIN_EMAIL;
  const pw = process.env.INITIAL_ADMIN_PW;

  if (!email || !pw || !name) {
    logger.error("Missing INITIAL_ADMIN_NAME, EMAIL or PW in .env");
    await mongoose.disconnect();
    return process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    logger.info(`Admin user (${email}) already exists; no action taken.`);
    await mongoose.disconnect();
    return process.exit(0);
  }

  await User.create({ name, email, password: pw, role: "admin" });
  logger.info(`✅ Admin "${name}" <${email}> created successfully.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  logger.error("Seeding failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
