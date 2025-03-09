const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cloudinary = require("cloudinary").v2;
const axios = require("axios"); // Install axios if not installed (npm install axios)
const multer = require("multer");
require("dotenv").config();



const app = express();
app.use(cors());
app.use(bodyParser.json());

// **Session Middleware**
app.use(
  session({
    secret: 'your-secret-key',  // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },  // Set to true if using https
  })
);

const saltRounds = 10;

// **Database Connection**
const db = mysql.createConnection({
  host: "project69group-project69group.f.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_VemAnzjcymEQDqCJU54",
  database: "homeservice",
  port: 21819,
  connectTimeout: 20000, // Set timeout to 20 seconds
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// **Cloudinary Configuration**
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// **Signup API with Password Hashing**
app.post("/signup", async (req, res) => {
  const { username, location, email, phone, password, latitude, longitude } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const sql = "INSERT INTO user (username, location, email, phone, password, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [username, location, email, phone, hashedPassword, latitude, longitude], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Username or email already exists" });
        }
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true, message: "Signup successful" });
    });

  } catch (error) {
    res.status(500).json({ error: "Password encryption failed" });
  }
});


app.post("/login", (req, res) => {
  const { username, password } = req.body;
   // SQL queries to check all three tables
   const sqlAdmin = "SELECT * FROM admin WHERE username = ?";
   const sqlWorker = "SELECT * FROM workers WHERE name = ?"; // Assuming workers use "name" instead of "username"
   const sqlUser = "SELECT * FROM user WHERE username = ?";
 
   // Check Admins table first
   db.query(sqlAdmin, [username], async (err, adminResults) => {
     if (err) return res.status(500).json({ error: "Database error" });
 
     if (adminResults.length > 0) {
       const match = await bcrypt.compare(password, adminResults[0].password);
       if (match) {
        console.log(adminResults[0].username)
         return res.json({
           success: true,
           message: "Admin login successful",
           role: "admin",
           user: { id: adminResults[0].id, username: adminResults[0].username },
           redirect: "admin"
         });
       }
     }
 
     // Check Workers table
     db.query(sqlWorker, [username], async (err, workerResults) => {
       if (err) return res.status(500).json({ error: "Database error" });
       if (workerResults.length > 0) {
         const match = await bcrypt.compare(password, workerResults[0].password);
         if (match) {
           return res.json({
             success: true,
             message: "Worker login successful",
             role: "worker",
             user: { id: workerResults[0].id, username: workerResults[0].name },
             redirect: "worker.jsx"
           });
         }
       }
 
       // Check Users table
       db.query(sqlUser, [username], async (err, userResults) => {
         if (err) return res.status(500).json({ error: "Database error" });
 
         if (userResults.length > 0) {
           const match = await bcrypt.compare(password, userResults[0].password);
           if (match) {
            console.log(userResults[0].id);
             return res.json({
               success: true,
               message: "User login successful",
               role: "user",
               user: { id: userResults[0].id, username: userResults[0].username },
               redirect: "user"
             });
           }
         }
 
         // If no match is found in any table
         return res.status(401).json({ success: false, message: "Invalid username or password" });
       });
     });
   });
});

//fetching username
app.get("/user", (req, res) => {
  const { userId } = req.query;
  const query = "SELECT username FROM user WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json({ username: results[0].username });
  });
});

// **1. Get All Services**
app.get("/services", (req, res) => {
  const sql = "SELECT id, name, description, image FROM services"; // Ensure 'image' column contains Cloudinary URLs
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json(results); // Directly return the data since images are URLs
  });
});



// **2. Get Workers Sorted by Location & Rating**
app.get("/workers", (req, res) => {
  const { serviceId, userId } = req.query;
  if (!serviceId || !userId) return res.status(400).json({ error: "Missing parameters" });

  const sql = `
    SELECT w.*, 
      (6371 * ACOS(COS(RADIANS(u.latitude)) * COS(RADIANS(w.latitude)) * 
      COS(RADIANS(w.longitude) - RADIANS(u.longitude)) + 
      SIN(RADIANS(u.latitude)) * SIN(RADIANS(w.latitude)))) AS distance
    FROM workers w
    JOIN user u ON u.id = ?
    WHERE w.service_id = ? AND w.status = 'available'
    ORDER BY distance ASC, w.rating DESC`;

  db.query(sql, [userId, serviceId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});



app.post("/book", (req, res) => {
  const { userId, workerId, serviceId } = req.body;
  console.log("User ID:", userId);
console.log("Worker ID:", workerId);
console.log("Selected Service:", serviceId);

  if (!userId || !workerId || !serviceId) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Check if the worker is already booked
  const checkBookingSql = "SELECT * FROM bookings WHERE worker_id = ? AND status = 'pending'";
  db.query(checkBookingSql, [workerId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error while checking existing booking" });

    if (results.length > 0) {
      return res.status(400).json({ error: "This worker is already booked!" });
    }

    // Insert booking into bookings table
    const bookingSql = "INSERT INTO bookings (user_id, worker_id, service_id, status) VALUES (?, ?, ?, 'pending')";
    db.query(bookingSql, [userId, workerId, serviceId], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error while inserting booking" });

      // Update worker status to unavailable
      const updateWorkerSql = "UPDATE workers SET status = 'busy' WHERE id = ?";
      db.query(updateWorkerSql, [workerId], (err, updateResult) => {
        if (err) return res.status(500).json({ error: "Failed to update worker status" });

        res.json({ success: true, message: "Booking registered and worker marked as unavailable!" });
      });
    });
  });
});




// **4. Fetch Pending Bookings**
app.get("/pendingBookings", (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "User ID required" });
  const sql = `
  SELECT b.id, w.name AS worker_name, w.id AS worker_id, s.name AS service_name, b.status
  FROM bookings b
  JOIN workers w ON b.worker_id = w.id
  JOIN services s ON b.service_id = s.id
  WHERE b.user_id = ?`;


  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});


app.get("/workerDetails", async (req, res) => {
  const { workerId } = req.query;
  if (!workerId) return res.status(400).json({ error: "Worker ID required" });

  const sql = `
    SELECT w.name, w.image, w.latitude, w.longitude, w.rating, 
           b.created_at AS booking_time
    FROM workers w
    LEFT JOIN bookings b ON w.id = b.worker_id
    WHERE w.id = ?
  `;

  db.query(sql, [workerId], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "Worker not found" });
    const worker = results[0];
    try {
      // Use OpenStreetMap Nominatim API for reverse geocoding
      const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat: worker.latitude,
          lon: worker.longitude,
          format: "json"
        }
      });

      // Extract location name
      worker.location = geoRes.data.display_name || "Unknown Location";
    } catch (geoError) {
      worker.location = "Location not found"; // If API fails
    }
    res.json(worker);
  });
});


// **Start the Server**
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});