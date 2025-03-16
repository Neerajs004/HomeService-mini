import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/user.css";
import { io } from "socket.io-client";


const socket = io("http://localhost:5000");

const UserPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [activeSection, setActiveSection] = useState("services");
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [bookedWorkers, setBookedWorkers] = useState({});
  const [pendingBookings, setPendingBookings] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showWorkerPopup, setShowWorkerPopup] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null); 
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    fetchServices();
    fetchUserName();
    fetchPendingBookings(); // ✅ Fetch pending bookings when component loads
    setTimeout(() => setIsLoading(false), 1500);
  }, [userId]);

  useEffect(() => {
    socket.emit("registerUser", userId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [userId]);
  

  const fetchServices = async () => {
    const response = await fetch("http://localhost:5000/services");
    const data = await response.json();
    setServices(data);
    setShowPopup(true);
  };



  const fetchPendingBookings = async () => {
    const response = await fetch(`http://localhost:5000/pendingBookings?userId=${userId}`);
    const data = await response.json();
    setPendingBookings(data);
  };

  const fetchUserName = async () => {
    try {
      const response = await fetch(`http://localhost:5000/user?userId=${userId}`);
      const data = await response.json(); 
      if (data.username) {
        setUserName(data.username);
        console.log("Fetched User Data:", data.username); // ✅ Ensure correct field is used
      } else {
        console.warn("⚠ No username found in response", data);
      }
    } catch (error) {
      console.error("❌ Error fetching username:", error);
    }  // Fix: Correctly extracting the username
  };

  const fetchWorkers = async (serviceId) => {
    const response = await fetch(`http://localhost:5000/workers?serviceId=${serviceId}&userId=${userId}`);
    const data = await response.json();
    setWorkers(data);
    setShowWorkerPopup(true);
  };

  const fetchBookingDetails = async (bookingId, workerId) => {
    try {
      const response = await fetch(`http://localhost:5000/workerDetails?workerId=${workerId}`);
      const data = await response.json();
      if (data) {
        setBookingDetails(prev => ({
          ...prev,
          [bookingId]: data
        }));
      }
    } catch (error) {
      console.error("❌ Error fetching booking details:", error);
    }
  };

  const toggleBookingDetails = (bookingId, workerId) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null);
    } else {
      setExpandedBookingId(bookingId);
      if (!bookingDetails[bookingId]) {
        fetchBookingDetails(bookingId, workerId);
      }
    }
  };

  const bookWorker = async (workerId) => {
    console.log("Booking worker:", workerId);
  
    if (!selectedService) {
      alert("❌ Error: No service selected!");
      return;
    }
  
    setBookedWorkers((prev) => ({ ...prev, [workerId]: true })); // Mark as booked instantly
  
    try {
      const response = await fetch("http://localhost:5000/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, workerId, serviceId: selectedService }),
      });
  
      const data = await response.json();
      if (data.success) {
        alert("✅ Booking added successfully!");
        setShowWorkerPopup(false);
        fetchPendingBookings(); // Refresh pending bookings
        fetchWorkers(selectedService); // Refresh workers to update availability
      } else {
        alert("❌ Booking failed: " + data.error);
        setBookedWorkers((prev) => ({ ...prev, [workerId]: false })); // Reset if failed
      }
    } catch (error) {
      console.error("❌ Error booking worker:", error);
      setBookedWorkers((prev) => ({ ...prev, [workerId]: false })); // Reset on error
    }
  };
  

  

/*  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }*/

  const renderServices = () => (
    <div className="services-container">
      <h2 className="section-title">Available Services</h2>
      <div className="services-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className="service-card"
            onClick={() => { setSelectedService(service.id); fetchWorkers(service.id); }}
          >
            <div className="service-image-container">
              {service.image ? (
                <img
                  src={service.image}  // Directly using the Cloudinary URL
                  alt={service.name}
                  className="service-image"
                  onError={(e) => e.target.style.display = "none"} // Hide broken images
                />
              ) : (
                <p className="no-image">No Image Available</p>
              )}
            </div>
            <div className="service-info">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  


//viewing worker details
const fetchWorkerDetails = async (workerId) => {
  try {
    const response = await fetch(`http://localhost:5000/workerDetails?workerId=${workerId}`);
    const data = await response.json();
    if (data) {
      setSelectedWorker(data);
    }
  } catch (error) {
    console.error("❌ Error fetching worker details:", error);
  }
};


const fetchMessages = async (receiverId) => {
  setChatUser(receiverId);
  const res = await fetch(`http://localhost:5000/messages?senderId=${userId}&receiverId=${receiverId}`);
  const data = await res.json();
  setMessages(data);
};

const sendMessage = () => {
  if (!newMessage.trim()) return;
  
  socket.emit("sendMessage", { senderId: userId, receiverId: chatUser, message: newMessage });
  setMessages([...messages, { sender_id: userId, message: newMessage }]);
  setNewMessage("");
};


  return (
    <div className="user-"> 

    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Home Services</h2>
          <p className="welcome-text">Welcome, {userName}</p>
        </div>
      
          <nav className="nav-menu">
          <div 
            className={`nav-item ${activeSection === "services" ? 'active' : ''}`}
            onClick={() => { setActiveSection("services"); renderServices(); }}
          >
            <span className="nav-icon">🛠</span>
            <span>Services</span>
          </div>
          <div 
            className={`nav-item ${activeSection === "pending" ? 'active' : ''}`}
            onClick={() => { setActiveSection("pending"); fetchPendingBookings(); }}
          >
            <span className="nav-icon">⏳</span>
            <span>Pending</span>
          </div>

          <div className="nav-item">
            <span className="nav-icon">✅</span>
            <span>Accepted</span>
          </div>

         <div 
            className={`nav-item ${activeSection === "chatbox" ? 'active' : ''}`} 
            onClick={() => setActiveSection("chatbox")}
          >
            <span className="nav-icon">💬</span>
            <span>Chatbox</span>
          </div>


          <div className="nav-item">
            <span className="nav-icon">📜</span>
            <span>History</span>
          </div>
        </nav>

        <div className="nav-item logout">
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <h1>Dashboard</h1>
          <button className="notification-btn">🔔</button>
        </header>

        <div className="content-area">
        {activeSection === "services" && renderServices()} 
          {activeSection === "pending" && (
            <div className="booking-grid">
              {pendingBookings.map((booking) => (
                 <div 
                    key={booking.id} 
                    className={`booking-card ${expandedBookingId === booking.id ? 'expanded' : ''}`}
                  >
                  <div className="booking-header">
                    <span className="service-icon">🛠</span>
                    <div className="booking-info">
                      <h3>{booking.service_name}</h3>
                      <p>{booking.worker_name}</p>
                    </div>
                  </div>
                  <div className="booking-footer">
                    <span className={`status-badge ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                    <button
                      className="view-details-btn pending-section"
                      onClick={() => toggleBookingDetails(booking.id, booking.worker_id)}
                    >
                      {expandedBookingId === booking.id ? 'Hide Details' : 'View Details'}
                    </button>


                  </div>
                       {expandedBookingId === booking.id && bookingDetails[booking.id] && (
                    <div className="booking-details">
                      <div className="details-grid">
                        <div className="worker-profile">
                          {bookingDetails[booking.id].image ? (
                            <img
                              src={bookingDetails[booking.id].image} // ✅ Cloudinary Image URL
                              alt={bookingDetails[booking.id].name}
                              className="worker-thumbnail"
                            />
                          ) : (
                            <p>No Image Available</p>
                          )}
                          <h4>{bookingDetails[booking.id].name}</h4>
                        </div>
                        <div className="details-info">
                          <p><strong>Location:</strong> {bookingDetails[booking.id].location}</p>
                          <p><strong>Rating:</strong> ⭐ {bookingDetails[booking.id].rating}</p>
                          <p><strong>Booking Time:</strong> {bookingDetails[booking.id].booking_time}</p>
                        </div>
                      </div>
                    </div>
                  )}

      
                </div>
              ))}
            </div>
          )}

           {activeSection === "chatbox" && (
              <div>
                <h2>Chat</h2>
                <div>
                  <h3>Contacts</h3>
                  {pendingBookings.map((booking) => (
                    <button key={booking.worker_id} onClick={() => fetchMessages(booking.worker_id)}>
                      {booking.worker_name}
                    </button>
                  ))}
                </div>

                {chatUser && (
                  <div>
                    <h3>Chat with Worker</h3>
                    <div>
                      {messages.map((msg, idx) => (
                        <p key={idx} style={{ textAlign: msg.sender_id === userId ? "right" : "left" }}>
                          {msg.message}
                        </p>
                      ))}
                    </div>
                    <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                    <button onClick={sendMessage}>Send</button>
                  </div>
                )}
              </div>
            )}


          {selectedWorker ? (
              // Display worker details
              <div className="worker-details">
                <button className="back-btn" onClick={() => setSelectedWorker(null)}>← Back</button>
                <h2>{selectedWorker.name}</h2>
                <img src={selectedWorker.image} alt={selectedWorker.name} className="worker-image" />
                <p><strong>Location:</strong> {selectedWorker.location}</p>
                <p><strong>Rating:</strong> ⭐ {selectedWorker.rating}</p>
                <p><strong>Booking Time:</strong> {selectedWorker.booking_time}</p>
              </div>
            ) : (
              <>
                

              </>
            )}
        </div>
      </main>

      
      {showWorkerPopup && (
  <div className="modal-overlay" onClick={(e) => {
    // Only close if clicking the overlay itself, not its children
    if (e.target === e.currentTarget) {
      setShowWorkerPopup(false);
    }
  }}>
    <div className="modal-content workers-modal" onClick={(e) => e.stopPropagation()}>
      <h2>Available Workers</h2>
      
      {workers.length === 0 ? (
        <p>No available workers found.</p>
      ) : (
        <div className="workers-grid">
          {workers.map((worker) => (
            <div key={worker.id} className="worker-card">
               {worker.image ? (
                  <img
                    src={worker.image} // ✅ Cloudinary URL from database
                    alt={worker.name}
                    className="worker-image"
                    onError={(e) => (e.target.src = "/default-avatar.png")} // ✅ Fallback for broken images
                  />
                ) : (
                  <p className="no-image">No Image Available</p>
                )}
              <h3>{worker.name}</h3>
              
              {/* Status indicator */}
              <div className="worker-status">
                <span 
                  className={`status-dot ${worker.status?.toLowerCase() || 'offline'}`}
                ></span>
                <span className="status-text">
                  {worker.status || 'Offline'}
                </span>
              </div>

              <div className="worker-rating">
                <span className="star">⭐</span>
                <span>{worker.rating}</span>
              </div>
              
              <button
                className="book-btn"
                onClick={() => {
                  console.log("Booking worker:", worker.id);
                  bookWorker(worker.id);
                }}
                disabled={worker.status?.toLowerCase() !== 'available'}
              >
                {worker.status?.toLowerCase() === 'available' ? 'Book Now' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      )}
      
      <button 
        className="close-btn" 
        onClick={() => setShowWorkerPopup(false)}
      >
        Close
      </button>
    </div>
  </div>
)}


    
      
    </div>
    </div>
  );
};

export default UserPage;