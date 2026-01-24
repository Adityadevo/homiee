"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import NavBar from "@/components/Navbar";

type RequestItem = {
  _id: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  listing: { 
    _id: string; 
    location?: string; 
    rent?: number;
    propertyType?: string;
    listingType?: string;
    description?: string;
  };
  sender?: { name?: string; city?: string; age?: number; gender?: string };
  receiver?: { name?: string; city?: string; age?: number; gender?: string };
};

export default function RequestsPage() {
  const [tab, setTab] = useState<"incoming" | "sent">("incoming");
  const [incoming, setIncoming] = useState<RequestItem[]>([]);
  const [sent, setSent] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<RequestItem[]>("/requests/incoming"),
      apiFetch<RequestItem[]>("/requests/sent")
    ]).then(([inc, snt]) => {
      setIncoming(inc);
      setSent(snt);
    }).finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: "accepted" | "rejected") {
    await apiFetch(`/requests/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status })
    });
    setIncoming((items) =>
      items.map((it) => (it._id === id ? { ...it, status } : it))
    );
  }

  const list = tab === "incoming" ? incoming : sent;

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-xl animate-pulse text-gray-700">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 px-4 py-8 pb-24">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">Requests</h1>
        
        <div className="flex rounded-xl bg-white p-1 shadow-md border border-gray-200">
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
              tab === "incoming" 
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white" 
                : "text-gray-600"
            }`}
            onClick={() => setTab("incoming")}
          >
            Incoming ({incoming.length})
          </button>
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
              tab === "sent" 
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white" 
                : "text-gray-600"
            }`}
            onClick={() => setTab("sent")}
          >
            Sent ({sent.length})
          </button>
        </div>

        <div className="space-y-4">
          {list.map((r) => (
            <div
              key={r._id}
              className="rounded-2xl bg-white p-5 shadow-md border border-gray-200"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-bold text-xl text-gray-800 mb-1">
                    ₹{r.listing?.rent}/month
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    📍 {r.listing?.location}
                  </div>
                  {r.listing?.propertyType && (
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-bold border border-purple-300">
                      {r.listing.propertyType} • {r.listing.listingType}
                    </span>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs uppercase font-bold rounded-full ${
                  r.status === "accepted" 
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : r.status === "rejected"
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                }`}>
                  {r.status}
                </span>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">
                  {tab === "incoming" ? "From" : "To"}
                </div>
                <div className="font-bold text-gray-800">
                  {tab === "incoming" ? r.sender?.name : r.receiver?.name}
                </div>
                <div className="text-sm text-gray-600">
                  {tab === "incoming" 
                    ? `${r.sender?.age ? r.sender.age + 'y' : ''} ${r.sender?.gender || ''} • ${r.sender?.city || ''}`
                    : `${r.receiver?.age ? r.receiver.age + 'y' : ''} ${r.receiver?.gender || ''} • ${r.receiver?.city || ''}`
                  }
                </div>
              </div>

              {/* Description */}
              {r.listing?.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {r.listing.description}
                </p>
              )}

              {/* Actions */}
              {tab === "incoming" && r.status === "pending" && (
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => updateStatus(r._id, "rejected")}
                    className="flex-1 rounded-xl bg-black text-white py-2 font-bold hover:bg-gray-900 transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => updateStatus(r._id, "accepted")}
                    className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          ))}
          {list.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 opacity-30">📨</div>
              <p className="text-gray-600 text-lg">
                No {tab === "incoming" ? "incoming" : "sent"} requests yet
              </p>
            </div>
          )}
        </div>
      </div>
        <NavBar />
    </div>

  );
}
