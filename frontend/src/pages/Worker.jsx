import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Star, Clock, DollarSign, Bell, Settings, Home, User, LogOut, Mail, Phone, MapPin, Calendar, Briefcase
} from "lucide-react";
import "../styles/WorkerDashboard.css";

export default function WorkerDashboard() {
  const { workerId } = useParams(); // Get worker ID from URL
  const [worker, setWorker] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [showJobsworker, setShowJobsworker] = useState(false);


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
  }, [workerId]);

  const fetchPendingBookingsworker = async () => {
    try {
      const response = await fetch(`http://localhost:5000/worker/${workerId}/pendingBookings`);
      const data = await response.json();
      setPendingBookings(data);
      setShowJobsworker(true);
    } catch (error) {
      console.error("Error fetching pending bookings:", error);
    }
  };
  

  
  const updateBookingStatusworker = async (bookingId, status) => {
    try {
      await fetch(`http://localhost:5000/booking/${bookingId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, workerId }), // Include workerId
      });
  
      // Refresh bookings after updating
      fetchPendingBookingsworker();
    } catch (error) {
      console.error("Error updating booking:", error);
    }
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
          <button className="nav-btnworker"><Home className="icon-smworker" /> Home</button>
          <button className="nav-btnworker" onClick={fetchPendingBookingsworker}>
            <Briefcase className="icon-smworker" /> Jobs
          </button>

          <button className="nav-btnworker"><Mail className="icon-smworker" /> Messages</button>
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

          {showJobsworker && (
  <div className="jobs-containerworker">
    <h2>Pending Bookings</h2>
    <div className="jobs-gridworker">
      {pendingBookings.length > 0 ? (
        pendingBookings.map((booking) => (
          <div key={booking.booking_id} className="job-cardworker">
            <h3>Service: {booking.service_name}</h3>
            <p>User ID: {booking.user_id}</p>
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

        </main>
      </div>
    </div>



  );
}