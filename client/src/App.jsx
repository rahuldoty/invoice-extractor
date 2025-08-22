import { useState } from "react";
import axios from "axios";
import { endpoints } from "./lib/api";

export default function App() {
  const [file, setFile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [summary, setSummary] = useState("");

  const uploadFile = async () => {
    try {
      if (!file) {
        alert("Please choose a file first");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(endpoints.upload, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setDraft(res.data.draft);
    } catch (err) {
      console.error("Upload failed:", err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`Upload failed: ${serverMsg}`);
    }
  };

  const confirmInvoice = async () => {
    const res = await axios.post(endpoints.invoices, draft);
    setInvoice(res.data);

    const sum = await axios.post(endpoints.summary(res.data._id));
    setSummary(sum.data.summary);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Invoice Extractor</h1>

      {!draft && (
        <div className="flex flex-col items-center gap-4 border p-6 rounded-xl shadow bg-white">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={e => setFile(e.target.files[0])}
            className="border p-2 rounded"
          />
          <button
            onClick={uploadFile}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Upload & Extract
          </button>
        </div>
      )}

      {draft && !summary && (
        <div className="w-full max-w-md mt-6 bg-white p-6 shadow rounded-xl">
          <h2 className="font-semibold mb-4">Review Invoice</h2>
          {["invoiceNumber", "invoiceDate", "customerName", "totalAmount"].map(key => (
            <div key={key} className="mb-3">
              <label className="block text-sm font-medium">{key}</label>
              <input
                type="text"
                value={draft[key]}
                onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>
          ))}
          <button
            onClick={confirmInvoice}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Confirm & Summarize
          </button>
        </div>
      )}

      {summary && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">AI Summary</h2>
          <p className="text-gray-700">{summary}</p>
        </div>
      )}
    </div>
  );
}
