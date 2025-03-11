
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import '../styles/admin.css';

// Define our own Button component
const Button = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  };
  
  const sizeStyles = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md text-sm",
  };
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};

// Table components
const Table = ({ children }) => <div className="w-full overflow-auto"><table className="w-full border-collapse">{children}</table></div>;
const TableHeader = ({ children }) => <thead>{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children }) => <tr className="border-b">{children}</tr>;
const TableHead = ({ children }) => <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{children}</th>;
const TableCell = ({ children }) => <td className="p-4 align-middle">{children}</td>;

// Badge component
const Badge = ({ children, variant = "default" }) => {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    destructive: "bg-red-100 text-red-800",
    secondary: "bg-gray-100 text-gray-800",
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantStyles[variant]}`}>
      {children}
    </span>
  );
};

// Card components with animation
const Card = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`rounded-lg border bg-white shadow-sm transition-all duration-500 ${className} ${
        isVisible 
          ? "opacity-100 transform translate-y-0" 
          : "opacity-0 transform translate-y-4"
      }`}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children }) => <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>;
const CardContent = ({ children }) => <div className="p-6 pt-0">{children}</div>;

// Icon components
const Icon = ({ d, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d={d} />
  </svg>
);

// Lucide icons paths
const Icons = {
  Users: () => <Icon d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  Briefcase: () => <Icon d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 4h6v3H9V4z" />,
  AlertTriangle: () => <Icon d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 17h.01M12 9v4" />,
  FileText: () => <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 8V2l6 6h-6zM16 13H8M16 17H8M10 9H8" />,
  Settings: () => <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />,
  LogOut: () => <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  Bell: () => <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />,
  Search: () => <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  Home: () => <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
};

// Toast notification component
const Toast = ({ message, type = "info", onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };
  
  return (
    <div 
      className={`fixed top-4 right-4 p-4 rounded-md text-white ${bgColors[type]} shadow-md z-50 transition-all duration-300 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      }`}
    >
      <div className="flex items-center">
        <span>{message}</span>
        <button 
          onClick={() => setIsVisible(false)} 
          className="ml-4 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Modal component
const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Simplified chart component with animation
const BarChart = ({ data }) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const start = performance.now();
    
    const animate = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, []);
  
  const maxValue = Math.max(...data.map(item => Math.max(item.users, item.workers)));
  const chartHeight = 300;
  const barWidth = 30;
  const gap = 10;
  const groupWidth = (barWidth * 2) + gap;
  const chartWidth = data.length * (groupWidth + gap);
  
  return (
    <div className="w-full overflow-auto">
      <svg width={chartWidth} height={chartHeight} style={{margin: '0 auto', display: 'block'}}>
        {/* Y Axis */}
        <line x1="40" y1="20" x2="40" y2={chartHeight - 40} stroke="#ccc" />
        <text x="20" y="30" fontSize="12" textAnchor="middle">
          {maxValue}
        </text>
        <text x="20" y={chartHeight/2} fontSize="12" textAnchor="middle">
          {Math.floor(maxValue/2)}
        </text>
        <text x="20" y={chartHeight - 45} fontSize="12" textAnchor="middle">
          0
        </text>
        
        {/* X Axis */}
        <line x1="40" y1={chartHeight - 40} x2={chartWidth + 40} y2={chartHeight - 40} stroke="#ccc" />
        
        {/* Bars */}
        {data.map((item, index) => {
          const x = 50 + (index * (groupWidth + gap));
          const userHeight = (item.users / maxValue) * (chartHeight - 60) * animationProgress;
          const workerHeight = (item.workers / maxValue) * (chartHeight - 60) * animationProgress;
          
          return (
            <g key={index}>
              {/* User bar */}
              <rect 
                x={x} 
                y={chartHeight - 40 - userHeight} 
                width={barWidth} 
                height={userHeight} 
                fill="#8884d8" 
                rx="2" 
              />
              
              {/* Worker bar */}
              <rect 
                x={x + barWidth + gap} 
                y={chartHeight - 40 - workerHeight} 
                width={barWidth} 
                height={workerHeight} 
                fill="#82ca9d" 
                rx="2" 
              />
              
              {/* X-axis label */}
              <text 
                x={x + barWidth + gap/2} 
                y={chartHeight - 20} 
                fontSize="12" 
                textAnchor="middle"
              >
                {item.name}
              </text>
            </g>
          );
        })}
        
        {/* Legend */}
        <rect x={chartWidth - 120} y="20" width="15" height="15" fill="#8884d8" rx="2" />
        <text x={chartWidth - 100} y="33" fontSize="12">Users</text>
        <rect x={chartWidth - 120} y="45" width="15" height="15" fill="#82ca9d" rx="2" />
        <text x={chartWidth - 100} y="58" fontSize="12">Workers</text>
      </svg>
    </div>
  );
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  
  
  // Simulate loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // User Management Data
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Customer" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Customer" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Customer" },
  ]

  // Worker Management Data
  const workers = [
    { id: 1, name: "Alice Brown", email: "alice@example.com", service: "Plumbing" },
    { id: 2, name: "Charlie Davis", email: "charlie@example.com", service: "Electrical" },
    { id: 3,  name: "Eva Green", email: "eva@example.com", service: "Cleaning" },
  ]

  // Dispute Resolution Data
  const disputes = [
    { id: 1, worker: "Alice Brown", customer: "John Doe", issue: "Incomplete work", status: "Open" },
    { id: 2, worker: "Charlie Davis", customer: "Jane Smith", issue: "Delayed service", status: "In Progress" },
    { id: 3, worker: "Eva Green", customer: "Bob Johnson", issue: "Poor quality", status: "Resolved" },
  ]

  // Report Management Data
  const chartData = [
    { name: "Jan", users: 400, workers: 240, amt: 2400 },
    { name: "Feb", users: 300, workers: 139, amt: 2210 },
    { name: "Mar", users: 200, workers: 980, amt: 2290 },
    { name: "Apr", users: 278, workers: 390, amt: 2000 },
    { name: "May", users: 189, workers: 480, amt: 2181 },
    { name: "Jun", users: 239, workers: 380, amt: 2500 },
  ]

  // Service Management Data
  const services = [
    { id: 1, name: "Plumbing", workers: 15, status: "Active" },
    { id: 2, name: "Electrical", workers: 12, status: "Active" },
    { id: 3, name: "Cleaning", workers: 20, status: "Active" },
    { id: 4, name: "Gardening", workers: 8, status: "Inactive" },
  ]

  // User Management Component
  const UserManagement = () => (
    <div>
      <h2 className="section-title">User Management</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="action-button">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  // Worker Management Component
  const WorkerManagement = () => (
    <div>
      <h2 className="section-title">Worker Management</h2>
      <Button className="add-button">Add New Worker</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((worker) => (
            <TableRow key={worker.id}>
              <TableCell>{worker.name}</TableCell>
              <TableCell>{worker.email}</TableCell>
              <TableCell>{worker.service}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="action-button">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  // Dispute Resolution Component
  const DisputeResolution = () => (
    <div>
      <h2 className="section-title">Dispute Resolution</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Worker</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Issue</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disputes.map((dispute) => (
            <TableRow key={dispute.id}>
              <TableCell>{dispute.worker}</TableCell>
              <TableCell>{dispute.customer}</TableCell>
              <TableCell>{dispute.issue}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    dispute.status === "Open" ? "destructive" : dispute.status === "In Progress" ? "warning" : "success"
                  }
                >
                  {dispute.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  Resolve
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  // Report Management Component
  const ReportManagement = () => (
    <div>
      <h2 className="section-title">Reports</h2>
      <div className="stats-grid">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="stat-value">1,234</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="stat-value">567</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="stat-value">890</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="stat-value">12</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User and Worker Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  )

  // Service Management Component
  const ServiceManagement = () => (
    <div>
      <h2 className="section-title">Service Management</h2>
      <Button className="add-button">Add New Service</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service Name</TableHead>
            <TableHead>Number of Workers</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>{service.name}</TableCell>
              <TableCell>{service.workers}</TableCell>
              <TableCell>
                <Badge variant={service.status === "Active" ? "success" : "secondary"}>{service.status}</Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="action-button">
                  Edit
                </Button>
                <Button variant={service.status === "Active" ? "destructive" : "default"} size="sm">
                  {service.status === "Active" ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderContent = () => {
    switch(activeTab) {
      case "users":
        return <UserManagement />;
      case "workers":
        return <WorkerManagement />;
      case "disputes":
        return <DisputeResolution />;
      case "reports":
        return <ReportManagement />;
      case "services":
        return <ServiceManagement />;
      default:
        return <UserManagement />;
    }
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar1 ${sidebarCollapsed ? 'sidebar1-collapsed' : ''}`}>
        <div className="sidebar1-header">
          <h1 className="dashboard-title">Admin Dashboard</h1>
        </div>
        <nav className="sidebar1-nav1">
          <button
            className={`nav-item1 ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Icons.Users className="nav-icon1" />
            <span className="nav-text1">Users</span>
          </button>
          <button
            className={`nav-item1 ${activeTab === "workers" ? "active" : ""}`}
            onClick={() => setActiveTab("workers")}
          >
            <Icons.Briefcase className="nav-icon1" />
            <span className="nav-text1">Workers</span>
          </button>
          <button
            className={`nav-item1 ${activeTab === "disputes" ? "active" : ""}`}
            onClick={() => setActiveTab("disputes")}
          >
            <Icons.AlertTriangle className="nav-icon1" />
            <span className="nav-text1">Disputes</span>
          </button>
          <button
            className={`nav-item1 ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <Icons.FileText className="nav-icon1" />
            <span className="nav-text1">Reports</span>
          </button>
          <button
            className={`nav-item1 ${activeTab === "services" ? "active" : ""}`}
            onClick={() => setActiveTab("services")}
          >
            <Icons.Settings className="nav-icon1" />
            <span className="nav-text1">Services</span>
          </button>
        </nav>
        <div className="sidebar1-footer">
          <Button variant="outline" className="logout-button">
            <Icons.LogOut className="logout-icon" />
            <span className="logout-text">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="main-content-admin">
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>

      {/* Toast notification */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
        />
      )}

      {/* Modal */}
      {showModal && (
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          title={modalTitle}
        >
          {modalContent}
        </Modal>
      )}
    </div>
  )
}

