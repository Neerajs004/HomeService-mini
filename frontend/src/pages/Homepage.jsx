import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
//import UserPage from './UserPage.jsx'; // ✅ Correct import

import premiumImage from '../assets/first.jpg';
import hero1 from '../assets/hero1.jpg';

//import '../styles/Homepage.css';

// Simple Component Building Blocks
const Button = ({ children, variant = "primary", size, className = "", onClick, ...props }) => {
  const baseClass = 'home-btn';
  const variantClass = `home-btn-${variant}`;
  const sizeClass = size ? `home-btn-${size}` : '';

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "", ...props }) => (
  <div className={`home-card ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = "", ...props }) => (
  <div className={`home-card-content ${className}`} {...props}>
    {children}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input className={`home-input ${className}`} {...props} />
);

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="home-modal-overlay" onClick={() => onOpenChange(false)}>
      <div className="home-modal" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, onClose }) => (
  <div className="home-modal-content">
    {children}
    <button className="home-closebtn" onClick={onClose}>Close</button>
  </div>
);

const DialogHeader = ({ children }) => (
  <div className="home-modal-header">{children}</div>
);

const DialogTitle = ({ children }) => (
  <h2 className="home-modal-title">{children}</h2>
);

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [loginType, setLoginType] = useState('');
  const [activeSection, setActiveSection] = useState('suggested');
  const [showServices, setShowServices] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const navigate = useNavigate(); // ✅ Must be inside the component

 



  const services = {
    suggested: [
      { 
        id: 1, 
        name: 'Plumbing', 
        image: '/src/assets/img3.jpg',
        description: 'Professional plumbing services for your home'
      },
      { 
        id: 2, 
        name: 'Electrical', 
        image: '/src/assets/img2.jpg',
        description: 'Expert electrical repairs and installations'
      },
      { 
        id: 3, 
        name: 'HVAC', 
        image: '/api/placeholder/400/300',
        description: 'Complete heating and cooling solutions'
      }
    ],
    allservices: [
      { 
        id: 4, 
        name: 'Cleaning', 
        image: '/src/assets/img5.jpg',
        description: 'Professional home cleaning services'
      },
      { 
        id: 5, 
        name: 'Gardening', 
        image: '/src/assets/img4.jpg',
        description: 'Expert landscaping and garden maintenance'
      }
    ],
    requested: [
      { 
        id: 6, 
        name: 'Painting', 
        image: '/src/assets/img6.jpg',
        description: 'Interior and exterior painting services'
      },
      { 
        id: 7, 
        name: 'Carpentry', 
        image: '/src/assets/img1.jpg',
        description: 'Custom woodwork and repairs'
      }
    ],
    completed: [
      { 
        id: 8, 
        name: 'Roofing', 
        image: '/src/assets/img7.jpg',
        description: 'Professional roof repairs and installation'
      },
      { 
        id: 9, 
        name: 'Fencing', 
        image: '/api/placeholder/400/300',
        description: 'Quality fencing solutions'
      }
    ]
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.home-menu-content') && !event.target.closest('.menu-trigger')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setShowLoginModal(false);
      setShowSignupModal(false);
    }
  };

  const handleUserLogin = async (identifier, password, isWorker = false) => {
    console.log("Attempting login with:", identifier, password, "isWorker:", isWorker);
  
    try {
      const requestBody = isWorker
        ? { workerId: Number(identifier), password } // ✅ Send worker ID
        : { username: identifier, password }; // ✅ Send username for users/admins
  
      console.log("Sending requestBody:", requestBody); // Debugging log
  
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
      console.log("Server Response:", data); // Debugging log
  
      if (data.redirect === "admin") {
        navigate(`/admin/${data.user.id}`);
      } else if (data.redirect === "worker") {
        navigate(`/worker/${data.user.id}`);
      } else if (data.redirect === "user") {
        navigate(`/user/${data.user.id}`);
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
    }
  };
  

  const handleUserSignup = async (username, location, email, phone, password) => {
    try {
      const formattedLocation = encodeURIComponent(location.trim());
      const locationResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${formattedLocation}&format=json`
      );
      const locationData = await locationResponse.json();

      if (!locationData || locationData.length === 0) {
        alert("Location not found. Please enter a valid location.");
        return;
      }

      const latitude = locationData[0].lat;
      const longitude = locationData[0].lon;

      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, location, email, phone, password, latitude, longitude }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Signup successful!");
        navigate("/app1");
      } else {
        alert("Signup failed: " + data.error);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred during signup. Please try again.");
    }
  };

  const handleLogin = (type) => {
    setLoginType(type);
    setShowLoginModal(true);
    setIsMenuOpen(false);
  };

  const handleExploreClick = () => {
    setShowServices(true);
    setActiveSection('suggested');
  };

  const handleSectionClick = (section) => {
    setActiveSection(section.toLowerCase());
  };

  return (
    <div className="home min-h-screen bg-gray-50">
       <style>
        {`
         :root {
  /* Home-specific variables */
  --home-primary-gradient: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  --home-surface-color: #ffffff;
  --home-text-primary: #1f2937;
  --home-text-secondary: #4b5563;
}

/* Layout */
.home-container {
    --home-primary-gradient: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  --home-surface-color: #ffffff;
  --home-text-primary: #1f2937;
  --home-text-secondary: #4b5563;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  position: relative;
}

/* Header */
.home-header {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  position: fixed;
  width: 100%;
  z-index: 50;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  padding: 0.75rem 0;
}

.home-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 3.5rem;
}

.home-logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.home-site-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--home-text-primary);
  letter-spacing: -0.025em;
}

/* Buttons */
.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  gap: 0.5rem;
}

.home-btn-primary {
  background: var(--home-primary-gradient);
  color: white;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
}

.home-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
}

.home-btn-outline {
  background-color: white;
  border: 1px solid #e5e7eb;
  color: var(--home-text-primary);
}

.home-btn-outline:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.home-btn-ghost {
  background: transparent;
  color: var(--home-text-primary);
}

.home-btn-ghost:hover {
  background-color: #f3f4f6;
}

/* Hero Section */
.home-hero {
  padding-top: 5rem;
  position: relative;
}

.home-hero-image {
  width: 100%;
  height: 600px;
  object-fit: scale-down;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.home-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.6)
  );
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.home-hero-content {
  max-width: 800px;
  padding: 2rem;
  color: white;
}

.home-hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  letter-spacing: -0.025em;
}

/* Services Section */
.home-services-container {
  padding: 4rem 0;
}

.home-section-title {
  font-size: 2.25rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 3rem;
  letter-spacing: -0.025em;
}

.home-service-categories {
  background: var(--home-surface-color);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 2rem;
  transition: all 0.3s ease;
}

.home-category-list {
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.home-service-cards {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 0.5rem;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
  transition: all 0.3s ease;
}

.home-service-cards::-webkit-scrollbar {
  display: none;
}

.home-card {
  min-width: 300px;
  background: var(--home-surface-color);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f1f5f9;
}

.home-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -4px rgba(0, 0, 0, 0.1);
}

.home-service-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.home-card-content {
  padding: 1.5rem;
}

/* Premium Section */
.home-premium-section {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  padding: 6rem 0;
  opacity: 0;
  animation: home-fadeIn 0.5s ease forwards;
}

.home-premium-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.home-premium-image {
  width: 100%;
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Modal Styles */
.home-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  opacity: 0;
  animation: home-fadeIn 0.3s ease forwards;
}

.home-modal {
  background: var(--home-surface-color);
  border-radius: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  position: relative;
  transform: scale(0.95);
  opacity: 0;
  animation: home-scaleIn 0.3s ease forwards;
}

.home-modal-content {
  padding: 2rem;
}

.home-modal-header {
  margin-bottom: 1.5rem;
}

.home-modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--home-text-primary);
}

.home-closebtn {
  margin-top: 15px;
  font-size: 0.875rem;
  width: 78px;
  height: 36px;
  border-radius: 10px;
  background-color: #ef2020;
  color: white;
}

.home-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
  margin-bottom: 1rem;
}

.home-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

/* Footer */
.home-footer {
  background-color: #1f2937;
  color: white;
  padding: 4rem 0;
}

.home-footer-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4rem;
}

.home-footer-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #f3f4f6;
}

.home-complaint-textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #374151;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  margin-bottom: 1rem;
  resize: vertical;
}

.home-quick-links {
  list-style: none;
}

.home-quick-links li {
  margin-bottom: 0.75rem;
  opacity: 0.8;
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.home-quick-links li:hover {
  opacity: 1;
}

/* Animation utility classes */
.home-animated-background {
  position: relative;
  overflow: hidden;
}

.home-animated-background::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: translateX(-100%);
  animation: home-shimmer 2s infinite;
}

/* Menu Overlay Styles */
.home-menu-overlay {
  position: fixed;
  top: 5rem;
  left: 0;
  width: 100%;
  height: calc(100vh - 5rem);
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 40;
  opacity: 0;
  animation: home-fadeIn 0.3s ease forwards;
}

.home-menu-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  height: 100%;
  background-color: white;
  padding: 2rem;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(-100%);
  animation: home-slideIn 0.3s ease forwards;
}

.home-menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Home-specific Animations */
@keyframes home-fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes home-slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes home-scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes home-shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Responsive Design for Homepage */
@media (max-width: 1024px) {
  .home-premium-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .home-footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .home-hero-title {
    font-size: 2.5rem;
  }
  
  .home-service-categories {
    flex-direction: column;
  }
  
  .home-category-list {
    min-width: 100%;
  }
  
  .home-footer-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .home-hero-image {
    height: 400px;
  }
  
  .home-section-title {
    font-size: 1.875rem;
  }
}
        `}
        </style>
      <header className="home-header">
        <div className="home-header-content">
          <div className="home-logo-section">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMenuToggle}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 menu-trigger"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
            <h1 className="home-site-title">HomeServices</h1>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => handleLogin('user')}
              className="transition-transform duration-200 hover:scale-105"
            >
              Login
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowSignupModal(true)}
              className="transition-transform duration-200 hover:scale-105"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="home-menu-overlay" onClick={handleMenuToggle}>
          <div className="home-menu-content" onClick={e => e.stopPropagation()}>
            <div className="home-menu-buttons">
              <Button 
                variant="primary" 
                className="w-full justify-start transition-transform duration-200 hover:scale-105"
                onClick={() => handleLogin('admin')}
              >
                Admin Login
              </Button>
              <Button 
                variant="primary" 
                className="w-full justify-start transition-transform duration-200 hover:scale-105"
                onClick={() => handleLogin('worker')}
              >
                Worker Login
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="transition-all duration-300 ease-in-out">
        <div className="home-hero">
          {!showServices ? (
            <div className="container pt-20">
              <div className="relative overflow-hidden">
                <img src={hero1} alt="Hero" className="home-hero-image" />
                <div className="home-hero-overlay">
                  <div className="home-hero-content">
                    <h2 className="home-hero-title animate-fade-in">Professional Home Services</h2>
                    <p className="text-xl mb-8 animate-fade-in delay-200">Expert service providers at your doorstep</p>
                    <Button 
                      size="lg" 
                      onClick={handleExploreClick}
                      className="animate-fade-in delay-300 transition-transform duration-200 hover:scale-105"
                    >
                      Explore Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="home-services-container animate-fade-in">
              <h2 className="home-section-title">Discover Our Services</h2>
              <div className="home-service-categories">
                <div className="home-category-list">
                  {['Suggested', 'AllServices', 'Requested', 'Completed'].map((section) => (
                    <Button
                      key={section}
                      variant={activeSection === section.toLowerCase() ? 'primary' : 'ghost'}
                      onClick={() => handleSectionClick(section)}
                      className={`justify-start w-full transition-colors duration-200 ${
                        activeSection === section.toLowerCase() ? 'active' : ''
                      }`}
                    >
                      {section}
                      <ChevronRight className="ml-2" size={16} />
                    </Button>
                  ))}
                </div>
                <div className="home-service-cards">
                  {services[activeSection].map((service) => (
                    <Card key={service.id} className="transform transition-all duration-300">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="home-service-image"
                      />
                      <CardContent>
                        <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                        <p className="text-gray-600 mb-4">{service.description}</p>
                        <Button 
                          variant="outline" 
                          className="w-full transition-transform duration-200 hover:scale-105"
                          onClick={() => handleLogin('user')}
                        >
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="home-premium-section">
          <div className="container">
            <div className="home-premium-grid">
              <div className="transform transition-all duration-300 hover:scale-105">
                <img src={premiumImage} alt="Premium Services" className="home-premium-image" />
              </div>
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-4">Premium Services</h2>
                <p className="text-gray-600 mb-6">
                  Upgrade to premium for exclusive benefits and priority service
                </p>
                <Button className="transition-transform duration-200 hover:scale-105"  onClick={() => handleLogin('user')}>
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="container">
          <div className="home-footer-grid">
            <div className="animate-fade-in">
              <h3 className="home-footer-title">Contact Us</h3>
              <p className="mb-2">Phone: +1 234 567 890</p>
              <p>Email: support@homeservices.com</p>
            </div>
            <div className="animate-fade-in delay-100">
              <h3 className="home-footer-title">Complaint Box</h3>
              <textarea
                className="home-complaint-textarea transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Write your complaint here..."
              />
              <Button className="transition-transform duration-200 hover:scale-105">
                Submit
              </Button>
            </div>
            <div className="animate-fade-in delay-200">
              <h3 className="home-footer-title">Quick Links</h3>
              <ul className="home-quick-links">
                <li className="transition-all duration-200 hover:translate-x-2">About Us</li>
                <li className="transition-all duration-200 hover:translate-x-2">Terms of Service</li>
                <li className="transition-all duration-200 hover:translate-x-2">Privacy Policy</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <Dialog 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
      >
        <DialogContent onClose={() => setShowLoginModal(false)}>
          <DialogHeader>
            <DialogTitle>
              {loginType.charAt(0).toUpperCase() + loginType.slice(1)} Login
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input id="login-username"
              placeholder="Username" 
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            <Input 
              id="login-password"
              type="password" 
              placeholder="Password"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
                 <Button 
              onClick={() => {
                const identifier = document.getElementById("login-username").value;
                const password = document.getElementById("login-password").value;
                const isWorker = loginType === "worker"; // ✅ Detect if worker login

                // ✅ Convert input to number if worker is logging in
                const finalIdentifier = isWorker ? Number(identifier) : identifier;

                handleUserLogin(finalIdentifier, password, isWorker);
              }}
            >
              Login
            </Button>
            <Button className="w-full transition-transform duration-200 hover:scale-105" onClick={()=>{setShowSignupModal(true); onClose();}
             }>
              Signup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showSignupModal} 
        onOpenChange={setShowSignupModal}
      >
        <DialogContent onClose={() => setShowSignupModal(false)}>
          <DialogHeader>
            <DialogTitle>Sign Up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              id="signup-username"
              placeholder="Username"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            <Input 
              id="signup-location"
              placeholder="Location"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            <Input 
              id="signup-phone"
              placeholder="Phone Number"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            <Input 
              id="signup-email"
              placeholder="Email"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            <Input 
              id="signup-password"
              type="password" 
              placeholder="Password"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            <Input 
              type="password" 
              placeholder="Confirm Password"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            <Button className="w-full transition-transform duration-200 hover:scale-105"
             onClick={() => {
              const username = document.getElementById("signup-username").value;
              const location = document.getElementById("signup-location").value;
              const email = document.getElementById("signup-email").value;
              const phone = document.getElementById("signup-phone").value;
              const password = document.getElementById("signup-password").value;
              handleUserSignup(username, location, email, phone, password);
            }}>
              Sign Up
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;