import React, { useEffect, useState } from "react";

const DailySummary = () => {
  const [summary, setSummary] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch("http://43.217.240.242/v1/workflows/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer app-7fqSMLFApYE7LycJLXTnNySy"
          },
          body: JSON.stringify({
            "inputs": {
              "workflow_id": "5NOuouhmVAR6ohir"
            },
            "user": "1"
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch summary');
        }

        const data = await response.json();
        setSummary(data.data?.outputs?.text || "No summary available.");
      } catch (error) {
        console.error('Error fetching summary:', error);
        setSummary("Failed to load summary from Dify.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="p-6 rounded-xl shadow bg-white">
      <h2 className="text-xl font-bold mb-2 flex items-center space-x-2">
        <span>🤖</span>
        <span>Daily Summary</span>
      </h2>
      
      {loading ? (
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Generating summary...</span>
        </div>
      ) : (
        <>

          <div className="text-gray-700 leading-relaxed">
            {summary.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500 flex items-center space-x-2">
            <span>⚡</span>
            <span>Powered by AI</span>
            <span>•</span>
            <span>Updated {new Date().toLocaleTimeString()}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default DailySummary;
