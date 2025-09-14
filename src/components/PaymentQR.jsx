import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import Swal from "sweetalert2";

const PaymentQR = () => {
  const upiID = "6261738082@ybl";
  const amount = "1.00";
  const note = "TestUser123";
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const upiLink = `upi://pay?pa=${upiID}&pn=Harshit&am=${amount}&tn=${note}`;

  // Generate QR Code dynamically using qrcode package
  useEffect(() => {
    QRCode.toDataURL(upiLink)
      .then((url) => {
        setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error("QR Generation failed", err);
      });
  }, []);

  // Poll backend every 5 sec to check for payment
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`https://your-backend.com/api/check-payment?note=${note}&amount=${amount}`);
        const data = await res.json();

        if (data.paid) {
          Swal.fire({
            title: "🎉 Payment Received!",
            text: `Txn ID: ${data.txnId}`,
            icon: "success",
            confirmButtonText: "OK",
          });
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Scan & Pay ₹1</h1>

      {qrCodeUrl ? (
        <img src={qrCodeUrl} alt="UPI QR Code" className="border border-gray-300 rounded" />
      ) : (
        <p>Generating QR...</p>
      )}

      <p className="mt-4 text-sm text-gray-700">Pay to: {upiID}</p>
      <p className="text-xs text-gray-500">Note: {note}</p>
    </div>
  );
};

export default PaymentQR;
