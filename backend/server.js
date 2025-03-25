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

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Store connected users
const onlineUsers = new Map();
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
   const sqlWorker = "SELECT * FROM workers WHERE id = ?"; // Assuming workers use "name" instead of "username"
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
      // **Check Workers table before Users table**
    db.query(sqlWorker, [username], async (err, workerResults) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (workerResults.length > 0) {
        const match = await bcrypt.compare(password, workerResults[0].password);
        if (match) {
          return res.json({
            success: true,
            message: "Worker login successful",
            role: "worker",
            user: { id: workerResults[0].id, name: workerResults[0].name },
            redirect: "worker"
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

//fetching users
app.get("/users", (req, res) => {
  const sql = "SELECT id, username, email FROM user";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    res.json(results);
  });
});
//fetch all workers
app.get("/all-workers", (req, res) => {
  const sql = `
    SELECT w.id, w.name, w.email, s.name AS service_name 
    FROM workers w
    LEFT JOIN services s ON w.service_id = s.id`; // Ensure workers are linked to services

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    
    
    res.json(results);
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

  // If no parameters, return all workers
  if (!serviceId || !userId) {
    const sql = "SELECT id, name, email, service_id FROM workers";
    return db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: "Database error", details: err.message });
      return res.json(results);
    });
  }

  // Otherwise, return filtered workers
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

//get services
app.get("/services", (req, res) => {
  const sql = "SELECT id, name, description, image FROM services"; // Ensure 'image' column contains Cloudinary URLs
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json(results); // Directly return the data since images are URLs
  });
});


//get report
app.get("/admin-reports", (req, res) => {
  const sql = "SELECT * FROM reports ORDER BY year DESC, month DESC LIMIT 12";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });

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


app.get("/worker/:workerId", async (req, res) => {
  const workerId = req.params.workerId;
  console.log(`Fetching worker details for ID: ${workerId}`); // Debugging log

  const query = `
    SELECT id, name, email, phone, latitude, longitude, image, status, rating
    FROM workers WHERE id = ?
  `;

  db.query(query, [workerId], async (err, result) => {
    if (err) {
      console.error("Database error:", err); // Log error
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    if (result.length === 0) {
      console.warn(`Worker not found for ID: ${workerId}`); // Log missing worker
      return res.status(404).json({ error: "Worker not found" });
    }

    let worker = result[0];

    // Reverse Geocoding for location
    try {
      console.log(`Fetching location for lat: ${worker.latitude}, lon: ${worker.longitude}`);
      const geoRes = await axios.get("https://nominatim.openstreetmap.org/reverse", {
        params: {
          lat: worker.latitude,
          lon: worker.longitude,
          format: "json"
        }
      });
      worker.location = geoRes.data.display_name || "Unknown Location";
    } catch (geoError) {
      console.error("Geocoding error:", geoError); // Log geocoding failure
      worker.location = "Location not found";
    }

    res.json(worker);
  });
});


app.get("/worker/:workerId/pendingBookings", async (req, res) => {
  const { workerId } = req.params;
  if (!workerId) return res.status(400).json({ error: "Worker ID required" });

  const sql = `
    SELECT 
      b.id AS booking_id, 
      u.id AS user_id,
      u.username AS user_name, 
      u.phone AS user_phone,
      u.latitude, 
      u.longitude,
      s.name AS service_name, 
      b.status, 
      b.created_at
    FROM bookings b
    JOIN user u ON b.user_id = u.id
    JOIN services s ON b.service_id = s.id
    WHERE b.worker_id = ? AND b.status = 'pending'
  `;

  db.query(sql, [workerId], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length === 0) return res.json([]); // Return empty array if no bookings

    // Convert latitude & longitude to location using OpenStreetMap API
    const updatedResults = await Promise.all(
      results.map(async (booking) => {
        try {
          const geoRes = await axios.get("https://nominatim.openstreetmap.org/reverse", {
            params: {
              lat: booking.latitude,
              lon: booking.longitude,
              format: "json",
            },
          });

          booking.user_location = geoRes.data.display_name || "Location not found";
        } catch (geoError) {
          booking.user_location = "Location not found";
        }
        return booking;
      })
    );

    res.json(updatedResults);
  });
});



app.post("/booking/:bookingId/update", (req, res) => {
  const { bookingId } = req.params;
  const { status, workerId } = req.body; // Include workerId in request body

  if (!["accepted", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  // Update booking status
  const updateBookingSql = "UPDATE bookings SET status = ? WHERE id = ?";
  db.query(updateBookingSql, [status, bookingId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error while updating booking" });

    // If booking is cancelled, update worker status to "available"
    if (status === "cancelled") {
      const updateWorkerSql = "UPDATE workers SET status = 'available' WHERE id = ?";
      db.query(updateWorkerSql, [workerId], (err, workerResult) => {
        if (err) return res.status(500).json({ error: "Database error while updating worker status" });

        return res.json({ success: true, message: `Booking ${status} and worker set to available` });
      });
    } else {
      // If accepted, just return success
      return res.json({ success: true, message: `Booking ${status} successfully` });
    }
  });
});


  app.get("/worker/:workerId/acceptedBookings", (req, res) => {
    const { workerId } = req.params;
  
    const sql = `
      SELECT b.user_id, u.username
      FROM bookings b
      JOIN user u ON b.user_id = u.id
      WHERE b.worker_id = ? AND b.status = 'accepted'
    `;
  
    db.query(sql, [workerId], (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    });
  });
  


//message
io.on("connection", (socket) => {
  console.log("New user connected", socket.id);

  socket.on("registerUser", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("sendMessage", ({ senderId, receiverId, message, senderType }) => {
    const sql = "INSERT INTO messages (sender_id, receiver_id, message, sender_type, timestamp) VALUES (?, ?, ?, ?, NOW())";
    
    db.query(sql, [senderId, receiverId, message, senderType], (err) => {
      if (err) return console.error("Message saving failed:", err);
  
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", { senderId, message, senderType });
      }
    });
  });
  


  socket.on("disconnect", () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
    console.log("User disconnected", socket.id);
  });
});

//chat history
app.get("/messages", (req, res) => {
  const { senderId, receiverId } = req.query;

  const sql = `
    SELECT sender_id, receiver_id, message, timestamp, sender_type 
    FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY timestamp ASC
  `;

  db.query(sql, [senderId, receiverId, receiverId, senderId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

app.post("/updateBookingExpenses", (req, res) => {
  const { bookingId, workerFee, additionalExpenses } = req.body;

  if (!bookingId || workerFee === undefined || additionalExpenses === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const totalAmount = parseFloat(workerFee) + parseFloat(additionalExpenses); // Calculate total

  const sql = "UPDATE bookings SET worker_fee = ?, additional_expenses = ?, amount = ? WHERE id = ?";

  db.query(sql, [workerFee, additionalExpenses, totalAmount, bookingId], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    res.json({ success: true, message: "Booking updated with total amount", totalAmount });
  });
});


app.get("/getLatestBookingId", (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  const sql = "SELECT id FROM bookings WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    
    if (results.length === 0) return res.status(404).json({ error: "No booking found" });

    res.json({ success: true, bookingId: results[0].id });
  });
});




// **Start the Server**
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});