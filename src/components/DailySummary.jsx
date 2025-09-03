import React, { useEffect, useState } from "react";

const DailySummary = () => {
  const [summary, setSummary] = useState("Loading...");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const data = await response.json();
        setSummary(data.text || "No summary found.");
      } catch (error) {
        console.error(error);
        setSummary("Failed to load summary.");
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="p-6 rounded-xl shadow bg-white">
      <h2 className="text-xl font-bold mb-2">📊 Daily Summary</h2>
      <p className="text-gray-700 whitespace-pre-line">{summary}</p>
    </div>
  );
};

export default DailySummary;
