const BASE_URL = "http://localhost:4000";

// Helper to append logs to frontend
function logToPanel(message: string, data?: any) {
  const panel = document.getElementById("api-logs");
  if (panel) {
    panel.innerText += "\n" + message;
    if (data) {
      panel.innerText += "\n" + JSON.stringify(data, null, 2);
    }
    panel.scrollTop = panel.scrollHeight; // auto-scroll
  }
}

async function fetchJSON<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  logToPanel(`Fetching: ${url}`);
  const res = await fetch(url);

  if (!res.ok) {
    logToPanel(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
    throw new Error(`Failed to fetch ${path}`);
  }

  const data = await res.json();
  logToPanel(`Response from ${path}:`, data);
  return data;
}

export const api = {
  getSummary: () => fetchJSON("/api/summary"),
  getDrivers: () => fetchJSON("/api/drivers"),
  getRiskFactors: () => fetchJSON("/api/risk-factors"),
  getRecommendations: () => fetchJSON("/api/recommendations"),
  getRevenueTrend: () => fetchJSON("/api/revenue-trend"),
};
