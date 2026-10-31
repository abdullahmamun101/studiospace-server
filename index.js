const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
} = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// JWT verify middleware (reads HTTPOnly cookie)
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect MongoDB
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    console.log("MongoDB connected successfully");

    const db = client.db("studiospace");
    const studiosCollection = db.collection("studios");
    const bookingsCollection = db.collection("bookings");

    // 1. Add a new studio (protected)
    app.post("/studios", verifyToken, async (req, res) => {
      try {
        const studio = req.body;

        studio.hourlyRate = Number(studio.hourlyRate);
        studio.securityDeposit = Number(studio.securityDeposit);
        studio.maxCapacity = Number(studio.maxCapacity);
        studio.rating = 0;
        studio.reviews = [];
        studio.createdAt = new Date();

        const result = await studiosCollection.insertOne(studio);

        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // 2. Get all studios (category, search, sort, limit support)
    app.get("/studios", async (req, res) => {
      try {
        const { category, search, sort, limit } = req.query;

        const query = {};

        if (category) {
          query.category = category;
        }

        if (search) {
          query.title = { $regex: search, $options: "i" };
        }

        let sortOption = { createdAt: -1 };

        if (sort === "rating") {
          sortOption = { rating: -1 };
        }

        let cursor = studiosCollection.find(query).sort(sortOption);

        if (limit) {
          cursor = cursor.limit(Number(limit));
        }

        const studios = await cursor.toArray();

        res.send(studios);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // 3. Get a single studio by ID
    app.get("/studios/:id", async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid studio id",
          });
        }

        const studio = await studiosCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!studio) {
          return res.status(404).send({
            message: "Studio not found",
          });
        }

        res.send(studio);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // 4. Get studios of one owner (My Listings)
    app.get("/my-studios", async (req, res) => {
      try {
        const email = req.query.email;

        if (!email) {
          return res.status(400).send({
            message: "Email is required",
          });
        }

        const studios = await studiosCollection
          .find({ ownerEmail: email })
          .sort({ createdAt: -1 })
          .toArray();

        res.send(studios);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // 5. Update a studio
    app.put("/studios/:id", async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid studio id",
          });
        }

        const data = req.body;

        const updatedDoc = {
          title: data.title,
          category: data.category,
          hourlyRate: Number(data.hourlyRate),
          securityDeposit: Number(data.securityDeposit),
          maxCapacity: Number(data.maxCapacity),
          location: data.location,
          image: data.image,
          amenities: data.amenities,
          overview: data.overview,
        };

        const result = await studiosCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedDoc }
        );

        res.send(result);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // 6. Delete a studio (protected)
    app.delete("/studios/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid studio id",
          });
        }

        const result = await studiosCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send(result);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // 7. Create a booking (protected, status starts as Pending, blocks double booking)
    app.post("/bookings", verifyToken, async (req, res) => {
      try {
        const booking = req.body;
        const { studioId, date, startTime, endTime } = booking;

        if (!studioId || !date || !startTime || !endTime) {
          return res.status(400).send({
            message: "studioId, date, startTime and endTime are required",
          });
        }

        if (startTime >= endTime) {
          return res.status(400).send({
            message: "End time must be after start time",
          });
        }

        // Overlap check against Confirmed bookings of the same studio and date
        const conflict = await bookingsCollection.findOne({
          studioId: studioId,
          date: date,
          status: "Confirmed",
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        });

        if (conflict) {
          return res.status(409).send({
            message:
              "This time slot is already booked. Please choose another time.",
          });
        }

        booking.status = "Pending";
        booking.createdAt = new Date();

        const result = await bookingsCollection.insertOne(booking);

        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // 8. Get bookings of one user (My Bookings)
    app.get("/my-bookings", async (req, res) => {
      try {
        const email = req.query.email;

        if (!email) {
          return res.status(400).send({
            message: "Email is required",
          });
        }

        const bookings = await bookingsCollection
          .find({ userEmail: email })
          .sort({ createdAt: -1 })
          .toArray();

        res.send(bookings);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // 9. Cancel a booking (only if Pending)
    app.patch("/bookings/:id/cancel", async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid booking id",
          });
        }

        const result = await bookingsCollection.updateOne(
          { _id: new ObjectId(id), status: "Pending" },
          { $set: { status: "Cancelled" } }
        );

        if (result.modifiedCount === 0) {
          return res.status(400).send({
            message: "Only pending bookings can be cancelled",
          });
        }

        res.send(result);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
    });

    // Server home route
    app.get("/", (req, res) => {
      res.send("StudioSpace server is running");
    });

    // Start server after MongoDB connection
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

run();