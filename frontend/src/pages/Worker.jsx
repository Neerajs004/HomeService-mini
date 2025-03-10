import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Star, Clock, DollarSign, Bell, Settings, Home, User, LogOut, Mail, Phone, MapPin, Calendar, Briefcase
} from "lucide-react";
import "../styles/WorkerDashboard.css";

export default function WorkerDashboard() {
  const { workerId } = useParams(); // Get worker ID from URL
  const [worker, setWorker] = useState(null);

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

  if (!worker) {
    return <p>Loading worker details...</p>;
  }

  return (
    <div className="page-container">
      <nav className="top-navbar">
        <div className="nav-left">
          <Home className="nav-icon" />
          <span className="brand-name">ServicePro</span>
        </div>
        <div className="nav-middle">
          <button className="nav-btn"><Home className="icon-sm" /> Home</button>
          <button className="nav-btn"><Briefcase className="icon-sm" /> Jobs</button>
          <button className="nav-btn"><Mail className="icon-sm" /> Messages</button>
        </div>
        <div className="nav-right">
          <button className="notification-btn">
            <Bell className="icon-sm" />
            <span className="notification-badge">3</span>
          </button>
          <div className="nav-avatar">
            <img src="/placeholder.svg?height=32&width=32" alt="Worker" />
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="profile-section">
            <div className="profile-image-container">
              <img src={worker.image || "/placeholder.svg"} alt="Worker" className="worker-avatar" />
              <span className="status-badge">{worker.status || "Unavailable"}</span>
            </div>

            <div className="worker-info">
              <h2>{worker.name}</h2>
              <p className="worker-title">{worker.profession}</p>

              <div className="info-grid">
                <div className="info-item">
                  <Phone className="info-icon" />
                  <span>{worker.phone}</span>
                </div>
                <div className="info-item">
                  <Mail className="info-icon" />
                  <span>{worker.email}</span>
                </div>
                <div className="info-item">
                  <MapPin className="info-icon" />
                  <span>{worker.address}</span>
                </div>
                <div className="info-item">
                  <Calendar className="info-icon" />
                  <span>Joined: {worker.joined_date}</span>
                </div>
              </div>

              <div className="skill-tags">
                {worker.skills?.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <section className="stats-section">
            <div className="stat-card">
              <h3>Rating</h3>
              <div className="rating">
                <Star className="star-icon" />
                <span className="rating-value">{worker.rating || "N/A"}</span>
              </div>
            </div>
            <div className="stat-card">
              <h3>Completed Jobs</h3>
              <div className="completed-jobs">
                <span className="job-count">{worker.completed_jobs || 0}</span>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${worker.job_progress || 0}%` }}></div>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <h3>Earnings</h3>
              <div className="earnings">
                <DollarSign className="dollar-icon" />
                <span className="amount">{worker.earnings || "0"}</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
