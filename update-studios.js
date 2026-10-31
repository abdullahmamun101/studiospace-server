const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const { MongoClient } = require("mongodb");

const photo = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const IMG = {
  photoStudio: photo("photo-1598300042247-d088f8ab3a91"),
  filmStage: photo("photo-1492691527719-9d1e07e534b4"),
  podcast: photo("photo-1478737270239-2f02b77fc618"),
  music: photo("photo-1516280440614-37939bbacd81"),
  workshop: photo("photo-1487058792275-0ad4aaf24ca7"),
  loft: photo("photo-1519892300165-cb5542fb47c7"),
};


const updates = [
  {
    title: "Golden Hour Photo Studio",
    gallery: [IMG.photoStudio, IMG.loft, IMG.filmStage],
    reviews: [
      { name: "Rafi Ahmed", rating: 5, comment: "Perfect natural light and a spotless cyc wall. Our product shoot finished ahead of time.", date: "2026-09-12" },
      { name: "Tania Islam", rating: 5, comment: "Host was friendly and the lighting kit was easy to use.", date: "2026-08-30" },
    ],
  },
  {
    title: "Frame One Film Stage",
    gallery: [IMG.filmStage, IMG.photoStudio, IMG.loft],
    reviews: [
      { name: "Sabbir Hossain", rating: 5, comment: "Huge stage with a great light grid. The green room was a big plus for the cast.", date: "2026-09-05" },
      { name: "Nusrat Jahan", rating: 4, comment: "Sound proofing is excellent. Parking was a little tight on shoot day.", date: "2026-08-18" },
    ],
  },
  {
    title: "Echo Podcast Lounge",
    gallery: [IMG.podcast, IMG.music, IMG.workshop],
    reviews: [
      { name: "Imran Khan", rating: 5, comment: "Crisp audio straight out of the box. We recorded three episodes in one session.", date: "2026-09-20" },
      { name: "Mim Akter", rating: 4, comment: "Comfortable seating and a quiet room, perfect for long interviews.", date: "2026-09-01" },
    ],
  },
  {
    title: "Pulse Music Suite",
    gallery: [IMG.music, IMG.podcast, IMG.loft],
    reviews: [
      { name: "Arif Chowdhury", rating: 5, comment: "The vocal booth sounds great and the monitors are very accurate.", date: "2026-09-08" },
      { name: "Sadia Rahman", rating: 4, comment: "Drum kit was well kept. Easy booking and quick host replies.", date: "2026-08-25" },
    ],
  },
  {
    title: "Clay and Canvas Workshop",
    gallery: [IMG.workshop, IMG.photoStudio, IMG.podcast],
    reviews: [
      { name: "Farhan Kabir", rating: 5, comment: "Bright, roomy and well organised. We ran a full painting class here.", date: "2026-09-15" },
      { name: "Lamia Sultana", rating: 4, comment: "Pottery wheels were in good shape and cleanup was simple.", date: "2026-08-22" },
    ],
  },
  {
    title: "Neon Loft Content Studio",
    gallery: [IMG.loft, IMG.photoStudio, IMG.music],
    reviews: [
      { name: "Tanvir Alam", rating: 5, comment: "The RGB lighting made our reel look amazing with almost no editing.", date: "2026-09-18" },
      { name: "Priya Das", rating: 4, comment: "Great props and a handy changing room. Slightly warm when the lights run long.", date: "2026-09-02" },
    ],
  },
];

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const col = client.db("studiospace").collection("studios");

    for (const u of updates) {
      const result = await col.updateOne(
        { title: u.title },
        { $set: { gallery: u.gallery, reviews: u.reviews } }
      );
      console.log(`${u.title}: ${result.matchedCount ? "updated" : "NOT FOUND"}`);
    }
  } catch (error) {
    console.error("Update failed:", error.message);
  } finally {
    await client.close();
  }
}

run();