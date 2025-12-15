import { db } from "./storage";
import { groups, links } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");
  
  // Check if data already exists
  const existingGroups = await db.select().from(groups);
  if (existingGroups.length > 0) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  // Insert default groups
  const defaultGroups = await db.insert(groups).values([
    { name: "Design Inspiration", order: 1 },
    { name: "Development", order: 2 },
    { name: "To Read", order: 3 },
    { name: "Tools", order: 4 },
  ]).returning();

  console.log(`Created ${defaultGroups.length} groups`);

  // Insert sample links
  const devGroup = defaultGroups.find(g => g.name === "Development");
  const designGroup = defaultGroups.find(g => g.name === "Design Inspiration");

  if (devGroup && designGroup) {
    await db.insert(links).values([
      {
        url: "https://replit.com",
        title: "Replit",
        note: "The platform for rapid software development.",
        groupId: devGroup.id,
      },
      {
        url: "https://dribbble.com",
        title: "Dribbble",
        note: "Design inspiration and community.",
        groupId: designGroup.id,
      },
    ]);
    console.log("Created 2 sample links");
  }

  console.log("Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
