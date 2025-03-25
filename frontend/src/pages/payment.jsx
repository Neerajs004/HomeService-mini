import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [upiAddress, setUpiAddress] = useState("");
  const [amount, setAmount] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    // Fetch booking amount
    fetch(`http://localhost:5000/getBookingAmount?bookingId=${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAmount(data.amount);
        } else {
          alert("Failed to fetch amount");
        }
      })
      .catch((err) => console.error("Error fetching amount:", err));
  }, [bookingId]);

  const handlePayment = () => {
    if (!upiAddress) {
      alert("Please enter a valid UPI address");
      return;
    }
  
    // Your UPI ID (Replace with your actual UPI ID)
    const merchantUpiId = "vinayakrishnan107@okicici";  // Example: abc123@upi
  
    // Generate UPI payment URL
    const upiUrl = `upi://pay?pa=${merchantUpiId}&pn=ServiceProvider&mc=&tid=&tr=${bookingId}&tn=Service Payment&am=${amount}&cu=INR`;
  
    // Redirect to UPI app
    window.location.href = upiUrl;
  
    setTimeout(() => {
      fetch("http://localhost:5000/confirmPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsPaid(true);
            alert("Payment Successful");
            navigate("/user"); // Redirect after payment
          } else {
            alert("Payment verification failed");
          }
        });
    }, 5000); // Simulate verification delay
  };
  

  return (
    <div className="payment-container">
      <h2>Payment Page</h2>
      <p>Amount: ₹{amount}</p>
      <input
        type="text"
        placeholder="Enter UPI Address"
        value={upiAddress}
        onChange={(e) => setUpiAddress(e.target.value)}
      />
      <button onClick={handlePayment} disabled={isPaid}>
        {isPaid ? "Paid" : "Pay Now"}
      </button>
    </div>
  );
};

export default payment;
