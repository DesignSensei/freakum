require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const logger = require("../utils/logger");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info("Database connected");

  // Wipe out any existing categories (optional)
  //   await Category.deleteMany({});

  // Define each top-level group and its children
  const sections = [
    {
      name: "Vibrators & Massagers",
      slug: "vibrators-massagers",
      subs: [
        "Bullet vibrators",
        "Rabbit vibrators",
        "Wand massagers",
        "G-spot vibrators",
        "Curve-and-pulse vibrators",
        "Wearable vibrators",
        "App-controlled vibrators",
      ],
    },
    {
      name: "Dildos & Non-Vibrating Plugs",
      slug: "dildos-non-vibrating-plugs",
      subs: [
        "Classic straight dildos",
        "Textured dildos",
        "Realistic/flesh-like dildos",
        "Double-ended dildos",
        "Anal plugs",
        "Basic plugs",
        "Vibrating plugs",
        "Weighted plugs",
        "Jewel-base/plush-base plugs",
      ],
    },
    {
      name: "Couples & Shared Toys",
      slug: "couples-shared-toys",
      subs: [
        "Couples’ vibrators",
        "Remote-control couples’ rings",
        "Strap-ons & harnesses",
        "Finger vibes",
      ],
    },
    {
      name: "Prostate & P-Spot Toys",
      slug: "prostate-p-spot-toys",
      subs: [
        "Prostate massagers",
        "Wearable prostate stimulators",
        "Anal vibrators",
      ],
    },
    {
      name: "BDSM & Bondage",
      slug: "bdsm-bondage",
      subs: [
        "Restraints",
        "Blindfolds & gags",
        "Paddles & floggers",
        "Collars & leashes",
        "Clamps",
        "Electro-stimulation kits",
      ],
    },
    {
      name: "Strokers & Masturbators",
      slug: "strokers-masturbators",
      subs: [
        "Silicone strokers",
        "Fleshlights™ & similar",
        "Vibrating masturbators",
        "Automatic stroker machines",
      ],
    },
    {
      name: "Kegel & Pelvic-Floor Trainers",
      slug: "kegel-pelvic-floor-trainers",
      subs: ["Ben Wa balls / geishas balls", "Smart Kegel trainers"],
    },
    {
      name: "Specialty & Novelty",
      slug: "specialty-novelty",
      subs: [
        "Temperature-play toys",
        "Suction cup toys",
        "Discreet everyday wear",
        "Travel-size minis",
        "Toy cleaners & care kits",
      ],
    },
    {
      name: "Lubricants & Accessories",
      slug: "lubricants-accessories",
      subs: [
        "Water-based lubricants",
        "Silicone-based lubricants",
        "Hybrid lubricants",
        "Anal-specific lubes",
        "Sex toy cleaners",
        "Storage pouches & toy bags",
      ],
    },
  ];

  // Loop over each section and insert
  for (let section of sections) {
    const parent = await Category.create({
      name: section.name,
      slug: section.slug,
    });

    // Mapping each sub name to a slug
    const children = section.subs.map((name) => ({
      name,
      slug: name
        .toLowerCase()
        .replace(/[’™]/g, "") // strip special punctuation
        .replace(/&\s*/g, "and-") // convert & to “and-”
        .replace(/\s+/g, "-"), // spaces → hyphens
      parent: parent._id,
    }));

    await Category.insertMany(children);
  }

  logger.info("All categories seeded");

  mongoose.disconnect();
}

seed();
