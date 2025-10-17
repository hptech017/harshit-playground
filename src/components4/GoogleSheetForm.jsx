// // https://script.google.com/macros/s/AKfycbyBzD2YEN7zJh7ZWEK_IR0oqyhSWNbParszOzy0di-57WULdtNcbPd5eDnV72W-B51B3Q/exec



// // 1CttVkNITxwPnPiFhz7VwF-yTCmBe97AzW40jVEtD1BM

// function doPost(e) {
//   try {
//     // Agar payload khali hai
//     if (!e.postData || !e.postData.contents) {
//       return ContentService
//         .createTextOutput(JSON.stringify({ result: "error", message: "No data received" }))
//         .setMimeType(ContentService.MimeType.JSON);
//     }

//     // JSON parse karna
//     var data = JSON.parse(e.postData.contents);

//     // Sheet ID + Sheet name
//     var sheet = SpreadsheetApp.openById("1mi0Oyo5favPOak9DLnbYz_aYOw6bWr-L0hwGOSgIIDc").getSheetByName("Sheet1");

//     // Row append karna
//     sheet.appendRow([new Date(), data.name, data.email, data.message]);

//     // Proper JSON response
//     return ContentService
//       .createTextOutput(JSON.stringify({ result: "success" }))
//       .setMimeType(ContentService.MimeType.JSON);

//   } catch (err) {
//     return ContentService
//       .createTextOutput(JSON.stringify({ result: "error", message: err.toString() }))
//       .setMimeType(ContentService.MimeType.JSON);
//   }
// }


import { useState } from "react";

export default function GoogleSheetForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
// https://script.google.com/macros/s/AKfycbyF3heXMEG5ODiy1EHKDkeETSLk9YBjrKvAN5lwPEy-0gyY0HVGmhdJKwwMJLwXlgWunA/exec
const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus("Sending...");

  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbx1Hhxp6RYzbxdjbkAlqnIsU8qhxTWk0UNKifmqOxnzdGA1Fuu1wsaWVAo0KhL6lcEfaQ/exec", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
      mode: 'no-cors' // 'cors' by default, change to 'no-cors' if needed
    });

    // Pehle response text le lo for debugging
    const text = await res.text();
    console.log("Raw response:", text);

    // Fir JSON parse karna
    const data = JSON.parse(text);

    if (data.result === "success") {
      setStatus("✅ Data added to Google Sheet!");
      setForm({ name: "", email: "", message: "" });
    } else {
      setStatus("❌ Failed: " + data.message);
    }
  } catch (err) {
    setStatus("⚠️ Error: " + err.message);
  }
};


  return (
    <div className="p-4 max-w-md mx-auto border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold mb-4">Submit to Google Sheet</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="message"
          placeholder="Message"
          value={form.message}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
      <p className="mt-3 text-sm text-gray-700">{status}</p>
    </div>
  );
}
