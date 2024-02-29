const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const usersCollection = client.db("foodSupply").collection("users");
    const suppliesCollection = client.db("foodSupply").collection("supplies");
    const donationsCollection = client.db("foodSupply").collection("donations");
    const volunteersCollection = client
      .db("foodSupply")
      .collection("volunteers");

    // ==============================================================
    // USER COLLECTION
    // ==============================================================

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await usersCollection.insertOne({
        name,
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    // ==============================================================
    // FOOD SUPPLY COLLECTION
    // ==============================================================

    // post supply
    app.post("/api/v1/supplies", async (req, res) => {
      const newSupply = req.body;

      // Insert supply into the database
      await suppliesCollection.insertOne(newSupply);

      res.status(201).json({
        success: true,
        message: "Supply inserted successfully",
      });
    });

    // get supplies
    app.get("/api/v1/supplies", async (req, res) => {
      const result = await suppliesCollection.find().toArray();

      res.status(201).json({
        success: true,
        message: "Supplies retrieved successfully",
        data: result,
      });
    });

    // get supply
    app.get("/api/v1/supplies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await suppliesCollection.findOne(query);

      res.status(201).json({
        success: true,
        message: "Supply retrieved successfully",
        data: result,
      });
    });

    // update supply
    app.patch("/api/v1/supplies/:id", async (req, res) => {
      const updatedSupply = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const updateInDb = {
        $set: {
          supplyImg: updatedSupply.supplyImg,
          supplyTitle: updatedSupply.supplyTitle,
          supplyCategory: updatedSupply.supplyCategory,
          supplyQuantity: updatedSupply.supplyQuantity,
          supplyDesc: updatedSupply.supplyDesc,
        },
      };

      const result = await suppliesCollection.findOneAndUpdate(
        query,
        updateInDb
      );

      res.status(201).json({
        success: true,
        message: "Supply updated successfully",
      });
    });

    // delete supply
    app.delete("/api/v1/supplies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await suppliesCollection.deleteOne(query);

      res.status(201).json({
        success: true,
        message: "Supply deleted successfully",
        res: result,
      });
    });

    // ==============================================================
    // DONATION SUPPLY COLLECTION
    // ==============================================================

    // post supply donation
    app.post("/api/v1/donations", async (req, res) => {
      const newDonation = req.body;

      // Insert supply donation into the database
      await donationsCollection.insertOne(newDonation);

      res.status(201).json({
        success: true,
        message: "Supply donation inserted successfully",
      });
    });

    // get supplies donation
    app.get("/api/v1/donations", async (req, res) => {
      const result = await donationsCollection.find().toArray();

      res.status(201).json({
        success: true,
        message: "Supplies donation retrieved successfully",
        data: result,
      });
    });

    // ==============================================================
    // VOLUNTEERS COLLECTION
    // ==============================================================

    // post volunteer
    app.post("/api/v1/volunteers", async (req, res) => {
      const newVolunteer = req.body;

      // Insert supply donation into the database
      await volunteersCollection.insertOne(newVolunteer);

      res.status(201).json({
        success: true,
        message: "Volunteer inserted successfully",
      });
    });



    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
