const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const { MongoClient } = require("mongodb");

const IDS = [
  "photo-1598300042247-d088f8ab3a91",
  "photo-1492691527719-9d1e07e534b4",
  "photo-1478737270239-2f02b77fc618",
  "photo-1516280440614-37939bbacd81",
  "photo-1487058792275-0ad4aaf24ca7",
  "photo-1519892300165-cb5542fb47c7",
];
const img = (i) =>
  `https://images.unsplash.com/${IDS[i % IDS.length]}?auto=format&fit=crop&w=1200&q=80`;

const reviewPool = [
  { name: "Daniel Carter", rating: 5, comment: "Spotless space and exactly as described. Setup took no time at all.", date: "2026-09-14" },
  { name: "Emily Brooks", rating: 5, comment: "Great light and a very helpful host. We finished our shoot early.", date: "2026-09-02" },
  { name: "Marcus Reed", rating: 4, comment: "Solid equipment and easy booking. Parking was a bit tight.", date: "2026-08-27" },
  { name: "Sophia Nguyen", rating: 5, comment: "Comfortable, quiet and well organised. Would book again.", date: "2026-09-19" },
  { name: "Jordan Ellis", rating: 4, comment: "Good value for the hourly rate. The gear was in great shape.", date: "2026-08-20" },
  { name: "Olivia Hayes", rating: 5, comment: "Perfect for our session. The host answered every question quickly.", date: "2026-09-08" },
  { name: "Ryan Mitchell", rating: 4, comment: "Nice room with plenty of space. Slightly warm when lights ran long.", date: "2026-08-31" },
  { name: "Chloe Anderson", rating: 5, comment: "Professional setup from start to finish. Highly recommended.", date: "2026-09-21" },
];

// Ager 6 ta studio er location USA te bodlano
const locationUpdates = [
  { title: "Golden Hour Photo Studio", location: "Brooklyn, New York, USA" },
  { title: "Frame One Film Stage", location: "Burbank, Los Angeles, USA" },
  { title: "Echo Podcast Lounge", location: "Austin, Texas, USA" },
  { title: "Pulse Music Suite", location: "Nashville, Tennessee, USA" },
  { title: "Clay and Canvas Workshop", location: "Portland, Oregon, USA" },
  { title: "Neon Loft Content Studio", location: "Miami, Florida, USA" },
];

// 12 ta notun studio
const newStudios = [
  { title: "Soho Light Box Studio", category: "Photo Studio", hourlyRate: 70, securityDeposit: 150, maxCapacity: 12, location: "Manhattan, New York, USA", amenities: ["Cyc Wall", "Strobe Lights", "Backdrops", "WiFi"], overview: "A bright downtown studio with a white cyc wall and strobe kit, built for fashion and e-commerce shoots.", rating: 4.9 },
  { title: "Sunset Strip Photo Loft", category: "Photo Studio", hourlyRate: 65, securityDeposit: 140, maxCapacity: 10, location: "West Hollywood, California, USA", amenities: ["Natural Light", "Lighting Kit", "Props", "Changing Room"], overview: "A sunlit loft with tall windows and warm wood floors, ideal for portraits and lifestyle content.", rating: 4.7 },
  { title: "Lakeview Product Studio", category: "Photo Studio", hourlyRate: 50, securityDeposit: 100, maxCapacity: 8, location: "Chicago, Illinois, USA", amenities: ["Product Tables", "Softbox Lights", "Backdrops", "Air Conditioning"], overview: "A compact studio set up for clean product photography with tabletop lighting and seamless backdrops.", rating: 4.5 },
  { title: "Big Sky Sound Stage", category: "Film Stage", hourlyRate: 150, securityDeposit: 400, maxCapacity: 40, location: "Atlanta, Georgia, USA", amenities: ["Green Screen", "Light Grid", "Green Room", "Parking"], overview: "A large sound stage with a ceiling light grid and green screen, suited to films, ads and music videos.", rating: 4.8 },
  { title: "Harbor Film Warehouse", category: "Film Stage", hourlyRate: 130, securityDeposit: 350, maxCapacity: 35, location: "Seattle, Washington, USA", amenities: ["Dolly Track", "Light Grid", "Sound Proofing", "Restroom"], overview: "A converted waterfront warehouse with high ceilings and sound proofing for larger productions.", rating: 4.6 },
  { title: "Midtown Podcast Room", category: "Podcast Lounge", hourlyRate: 40, securityDeposit: 60, maxCapacity: 5, location: "Denver, Colorado, USA", amenities: ["4 Mics", "Acoustic Panels", "Mixer", "Tea and Coffee"], overview: "A quiet treated room with four broadcast mics and a simple mixer, ready for interviews and shows.", rating: 4.7 },
  { title: "Bayou Audio Lounge", category: "Podcast Lounge", hourlyRate: 38, securityDeposit: 55, maxCapacity: 6, location: "New Orleans, Louisiana, USA", amenities: ["Microphones", "Sound Proofing", "Sofa Seating", "WiFi"], overview: "A relaxed lounge with soft seating and clean audio, perfect for long conversational episodes.", rating: 4.4 },
  { title: "Rhythm House Recording", category: "Music Suite", hourlyRate: 75, securityDeposit: 180, maxCapacity: 10, location: "Los Angeles, California, USA", amenities: ["Vocal Booth", "Studio Monitors", "Drum Kit", "Audio Interface"], overview: "A full recording suite with a vocal booth and monitors for tracking, mixing and rehearsals.", rating: 4.9 },
  { title: "Delta Beat Lab", category: "Music Suite", hourlyRate: 55, securityDeposit: 120, maxCapacity: 6, location: "Memphis, Tennessee, USA", amenities: ["Producer Desk", "Studio Monitors", "Microphones", "Air Conditioning"], overview: "A producer focused beat lab with a desk, monitors and a small booth for vocals and samples.", rating: 4.6 },
  { title: "Golden Gate Practice Rooms", category: "Music Suite", hourlyRate: 45, securityDeposit: 90, maxCapacity: 8, location: "San Francisco, California, USA", amenities: ["Drum Kit", "Amps", "Sound Proofing", "Parking"], overview: "Sound proofed practice rooms with a drum kit and amps, great for band rehearsals and demo sessions.", rating: 4.3 },
  { title: "Red Brick Art Workshop", category: "Workshop", hourlyRate: 30, securityDeposit: 50, maxCapacity: 18, location: "Boston, Massachusetts, USA", amenities: ["Easels", "Sink Area", "Storage Racks", "Tea and Coffee"], overview: "A bright brick walled workshop with easels and a wash area, perfect for classes and painting nights.", rating: 4.5 },
  { title: "Desert Bloom Craft Studio", category: "Workshop", hourlyRate: 28, securityDeposit: 45, maxCapacity: 14, location: "Phoenix, Arizona, USA", amenities: ["Pottery Wheels", "Work Tables", "Kiln Access", "Restroom"], overview: "An open craft studio with pottery wheels and kiln access, suited to ceramics and small group workshops.", rating: 4.2 },
];

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const col = client.db("studiospace").collection("studios");

    // 1. Ager studio gulor location bodlano
    for (const u of locationUpdates) {
      const r = await col.updateOne(
        { title: u.title },
        { $set: { location: u.location } }
      );
      console.log(`${u.title}: ${r.matchedCount ? "location updated" : "NOT FOUND"}`);
    }

    // 2. Notun studio add (title match hole update, na hole insert)
    for (let i = 0; i < newStudios.length; i++) {
      const s = newStudios[i];
      const doc = {
        ...s,
        image: img(i),
        gallery: [img(i), img(i + 1), img(i + 2)],
        reviews: [reviewPool[i % 8], reviewPool[(i + 3) % 8]],
        ownerEmail: "host@studiospace.com",
        ownerName: "StudioSpace Host",
      };

      await col.updateOne(
        { title: s.title },
        { $set: doc, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
      console.log(`${s.title}: saved`);
    }

    console.log("Done");
  } catch (error) {
    console.error("Failed:", error.message);
  } finally {
    await client.close();
  }
}

run();