import React from "react";

const PaymentButton = ({ amount = 100, packageName = "Demo Package" }) => {
  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const options = {
      key: "rzp_test_xxxxxx", // <-- apna Razorpay test key
      amount: amount * 100,
      currency: "INR",
      name: "My Company",
      description: `Payment for ${packageName}`,
      handler: function (response) {
        console.log("Payment Success:", response);
        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: "User Name",
        email: "user@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <button
      onClick={handlePayment}
      style={{
        backgroundColor: "#3399cc",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
      }}
    >
      Pay ₹{amount}
    </button>
  );
};

export default PaymentButton;
