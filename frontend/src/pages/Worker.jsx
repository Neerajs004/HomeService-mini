import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Star, Clock, DollarSign, Bell, Settings, Home, User, LogOut, Mail, Phone, MapPin, Calendar, Briefcase
} from "lucide-react";
import "../styles/WorkerDashboard.css";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function WorkerDashboard() {
  const [activeSection, setActiveSection] = useState("home");
  const { workerId } = useParams(); // Get worker ID from URL
  const [worker, setWorker] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showRatePopup, setShowRatePopup] = useState(false);
  const [rate, setRate] = useState(0);
  const [additionalExpense, setAdditionalExpense] = useState(0);

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/worker/${workerId}`);
        const data = await response.json();
        setWorker(data);
      } catch (error) {
        console.error("Error fetching worker details:", error);
      }
    };

    fetchWorkerDetails();
      fetchAcceptedBookingsworker(); // Fetch accepted users on load    
  }, [workerId]);

  useEffect(() => {
    socket.emit("registerUser", workerId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [workerId]);

  const fetchPendingBookingsworker = async () => {
    try {
      const response = await fetch(`http://localhost:5000/worker/${workerId}/pendingBookings`);
      const data = await response.json();
      setPendingBookings(data);
      setActiveSection("jobs"); // Set active section to jobs when fetching bookings
    } catch (error) {
      console.error("Error fetching pending bookings:", error);
    }
  };
  
  
  const fetchAcceptedBookingsworker = async () => {
    try {
      const response = await fetch(`http://localhost:5000/worker/${workerId}/acceptedBookings`);
      const data = await response.json();
      setAcceptedBookings(data);
    } catch (error) {
      console.error("Error fetching accepted bookings:", error);
    }
  };

  
  const updateBookingStatusworker = async (bookingId, status) => {
    try {
      await fetch(`http://localhost:5000/booking/${bookingId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, workerId }),
      });
  
      fetchPendingBookingsworker();   // Refresh pending jobs
      fetchAcceptedBookingsworker();  // Refresh accepted users for chat
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };
  

  const fetchMessages = async (userId) => {
    setChatUser(userId);
    const res = await fetch(`http://localhost:5000/messages?senderId=${workerId}&receiverId=${userId}`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    socket.emit("sendMessage", { senderId: workerId, receiverId: chatUser, message: newMessage });
    setMessages([...messages, { sender_id: workerId, message: newMessage }]);
    setNewMessage("");
  };
  // Handle rate submission
  const handleRateSubmit = () => {
    if (rate <= 0) {
      alert("Please enter a valid rate.");
      return;
    }

    const totalAmount = rate + additionalExpense;
    const message = `Please pay ₹${totalAmount} for the work done. Rate: ₹${rate}, Additional Expense: ₹${additionalExpense}.`;

    socket.emit("sendMessage", { senderId: workerId, receiverId: chatUser, message });
    setMessages([...messages, { sender_id: workerId, message }]);
    setShowRatePopup(false);
    setRate(0);
    setAdditionalExpense(0);
  };

  
  if (!worker) {
    return <p>Loading worker details...</p>;
  }

  return (
    <div className="page-containerworker">
      <nav className="top-navbarworker">
        <div className="nav-leftworker">
          <Home className="nav-iconworker" />
          <span className="brand-nameworker">ServicePro</span>
        </div>
        <div className="nav-middleworker">
          <button className="nav-btnworker" onClick={() => setActiveSection("home")}>
            <Home className="icon-smworker" /> Home
          </button>
          <button className="nav-btnworker" onClick={fetchPendingBookingsworker}>
            <Briefcase className="icon-smworker" /> Jobs
          </button>
          <button className="nav-btnworker" onClick={() => setActiveSection("chatbox")}>
            <Mail className="icon-smworker" /> Messages
          </button>
        </div>
        <div className="nav-rightworker">
          <button className="notification-btnworker">
            <Bell className="icon-smworker" />
            <span className="notification-badgeworker">3</span>
          </button>
          <div className="nav-avatarworker">
            <img src="/placeholder.svg?height=32&width=32" alt="Worker" />
          </div>
        </div>
      </nav>

      <div className="dashboard-container1worker">
        <aside className="sidebarworker">
          <div className="profile-sectionworker">
            <img src={worker.image || "/placeholder.svg"} alt="Worker" className="worker-avatarworker" />
            <span className="status-badgeworker">{worker.status || "Unavailable"}</span>

            <div className="worker-infoworker">
              <h2>{worker.name}</h2>

              <div className="info-gridworker">
                <div className="info-itemworker">
                  <Phone className="info-iconworker" />
                  <span>{worker.phone ? worker.phone : "Phone not available"}</span>
                </div>
                <div className="info-itemworker">
                  <Mail className="info-iconworker" />
                  <span>{worker.email || "Not available"}</span>
                </div>
                <div className="info-itemworker">
                  <MapPin className="info-iconworker" />
                  <span>{worker.location || "Fetching location..."}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-contentworker">
          {/* Home section - only show when activeSection is "home" */}
          {activeSection === "home" && (
            <section className="stats-sectionworker">
              <div className="stat-cardworker">
                <h3>Rating</h3>
                <div className="ratingworker">
                  <Star className="star-iconworker" />
                  <span className="rating-valueworker">{worker.rating || "N/A"}</span>
                </div>
              </div>
              <div className="stat-cardworker">
                <h3>Completed Jobs</h3>
                <div className="completed-jobsworker">
                  <span className="job-countworker">{worker.completed_jobs || 0}</span>
                  <div className="progress-barworker">
                    <div className="progressworker" style={{ width: `${worker.job_progress || 0}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="stat-cardworker">
                <h3>Earnings</h3>
                <div className="earningsworker">
                  <DollarSign className="dollar-iconworker" />
                  <span className="amountworker">{worker.earnings || "0"}</span>
                </div>
              </div>
            </section>
          )}

          {/* Jobs section - only show when activeSection is "jobs" */}
          {activeSection === "jobs" && (
            <div className="jobs-containerworker">
              <h2>Pending Bookings</h2>
              <div className="jobs-gridworker">
              {pendingBookings.length > 0 ? (
  pendingBookings.map((booking) => (
    <div key={booking.booking_id} className="job-cardworker">
      <h3>Service: {booking.service_name}</h3>
      <p>Name: {booking.user_name}</p>
      <p>Location: {booking.user_location}</p> {/* Now displays actual address */}
      <p>Phone: {booking.user_phone}</p>
      <p>Requested On: {new Date(booking.created_at).toLocaleString()}</p>
      <button onClick={() => updateBookingStatusworker(booking.booking_id, "accepted")} className="accept-btnworker">Accept</button>
      <button onClick={() => updateBookingStatusworker(booking.booking_id, "cancelled")} className="cancel-btnworker">Cancel</button>
    </div>
  ))
) : (
  <p>No pending bookings.</p>
)}

              </div>
            </div>
          )}

          {/* Chat section - only show when activeSection is "chatbox" */}
          {activeSection === "chatbox" && (
  <div className="chat-containerworker">
    <div className="contacts-sectionworker">
      <h3>Contacts</h3>
      {acceptedBookings.map((booking) => (
        <button 
          key={booking.user_id} 
          onClick={() => fetchMessages(booking.user_id)}
          className={`contact-btnworker ${chatUser === booking.user_id ? 'active-chatworker' : ''}`}
        >
          {booking.username}
        </button>
      ))}
    </div>

    {chatUser && (
      <div className="chat-windowworker">
        <h3>Chat with {acceptedBookings.find(booking => booking.user_id === chatUser)?.username || `User ${chatUser}`}</h3>
        <div className="messages-containerworker">
          {messages.map((msg, idx) => {
            const isWorker = msg.sender_id === workerId;
            return (
              <div 
                key={idx} 
                className={isWorker ? "outgoing-messageworker" : "incoming-messageworker"}
              >
                <span className={`message-labelworker ${isWorker ? 'worker-labelworker' : 'user-labelworker'}`}>
                  {isWorker ? worker.name : acceptedBookings.find(booking => booking.user_id === chatUser)?.username || `User ${chatUser}`}
                </span>
                {msg.message}
                {msg.timestamp && (
                  <div className="message-timeworker">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="message-inputworker">
          <input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
          <button onClick={() => setShowRatePopup(true)}>Request Payment</button>
        </div>
      </div>
    )}
         {/* Rate Popup */}
         {showRatePopup && (
        <div className="rate-popup-overlay">
          <div className="rate-popup-container">
            <h3>Request Payment</h3>
            <div className="rate-input-field">
              <label>Rate (₹):</label>
              <input 
                type="number" 
                value={rate} 
                onChange={(e) => setRate(parseFloat(e.target.value))}
                min="0"
              />
            </div>
            <div className="rate-input-field">
              <label>Additional Expense (₹):</label>
              <input 
                type="number" 
                value={additionalExpense} 
                onChange={(e) => setAdditionalExpense(parseFloat(e.target.value))}
                min="0"
              />
            </div>
            <div className="rate-popup-buttons">
              <button onClick={handleRateSubmit}>Submit</button>
              <button onClick={() => setShowRatePopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
  </div>
)}
        </main>
      </div>
    </div>
  );
}