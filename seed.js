const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const { MongoClient } = require("mongodb");

const studios = [
  {
    title: "Golden Hour Photo Studio",
    category: "Photo Studio",
    hourlyRate: 45,
    securityDeposit: 100,
    maxCapacity: 10,
    location: "Gulshan 2, Dhaka",
    image:
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80",
    amenities: ["Cyc Wall", "Softbox Lights", "Backdrops", "WiFi"],
    overview:
      "A bright white cyc wall studio with natural light and a full lighting kit, perfect for portrait, fashion and product shoots.",
    rating: 4.9,
  },
  {
    title: "Frame One Film Stage",
    category: "Film Stage",
    hourlyRate: 120,
    securityDeposit: 300,
    maxCapacity: 30,
    location: "Banani, Dhaka",
    image:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    amenities: ["Green Screen", "Light Grid", "Dolly Track", "Green Room"],
    overview:
      "A spacious sound-proofed film stage with a ceiling light grid, green screen and a private green room for cast and crew.",
    rating: 4.8,
  },
  {
    title: "Echo Podcast Lounge",
    category: "Podcast Lounge",
    hourlyRate: 35,
    securityDeposit: 50,
    maxCapacity: 6,
    location: "Dhanmondi, Dhaka",
    image:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80",
    amenities: ["4 Mics", "Acoustic Panels", "Mixer", "Sofa Seating"],
    overview:
      "A cozy acoustically treated lounge with four broadcast mics, a mixer and comfortable seating for relaxed interviews.",
    rating: 4.7,
  },
  {
    title: "Pulse Music Suite",
    category: "Music Suite",
    hourlyRate: 60,
    securityDeposit: 150,
    maxCapacity: 8,
    location: "Uttara, Dhaka",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
    amenities: ["Vocal Booth", "Studio Monitors", "Drum Kit", "Audio Interface"],
    overview:
      "A recording suite with a vocal booth, studio monitors and a drum kit, ready for tracking, mixing and rehearsals.",
    rating: 4.6,
  },
  {
    title: "Clay and Canvas Workshop",
    category: "Workshop",
    hourlyRate: 25,
    securityDeposit: 40,
    maxCapacity: 15,
    location: "Mirpur, Dhaka",
    image:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=800&q=80",
    amenities: ["Easels", "Pottery Wheels", "Sink Area", "Storage Racks"],
    overview:
      "An airy art workshop with easels, pottery wheels and a wash area, ideal for classes, painting sessions and small exhibitions.",
    rating: 4.5,
  },
  {
    title: "Neon Loft Content Studio",
    category: "Photo Studio",
    hourlyRate: 55,
    securityDeposit: 120,
    maxCapacity: 12,
    location: "Bashundhara, Dhaka",
    image:
      "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=800&q=80",
    amenities: ["RGB Lights", "Fog Machine", "Props", "Changing Room"],
    overview:
      "A moody loft studio with programmable RGB lighting and props, built for music videos, reels and creator content.",
    rating: 4.4,
  },
];

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const col = client.db("studiospace").collection("studios");

    const docs = studios.map((s) => ({
      ...s,
      reviews: [],
      ownerEmail: "host@studiospace.com",
      ownerName: "StudioSpace Host",
      createdAt: new Date(),
    }));

    const result = await col.insertMany(docs);
    console.log(`Inserted ${result.insertedCount} studios`);
  } catch (error) {
    console.error("Seed failed:", error.message);
  } finally {
    await client.close();
  }
}

seed();
