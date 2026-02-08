import { useEffect, useState } from "react";
import { api } from "../api/client";
import SummaryCards from "../components/SummaryCards";
import DriversCharts from "../components/DriversChart";
import RiskTable from "../components/RiskTable";
import Recommendations from "../components/Recommendations";

function App() {
  const [summary, setSummary] = useState<any>(null);
  const [drivers, setDrivers] = useState<any>(null);
  const [riskFactors, setRiskFactors] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const summaryData = await api.getSummary();
      const driversData = await api.getDrivers();
      const riskData = await api.getRiskFactors();
      const recData = await api.getRecommendations();

      setSummary(summaryData);
      setDrivers(driversData);
      setRiskFactors(riskData);
      setRecommendations(recData);
    };

    fetchData();
  }, []);

  if (!summary || !drivers || !riskFactors || !recommendations) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <SummaryCards {...summary} />
      <DriversCharts monthly={drivers.monthly} />
      <RiskTable
        staleDeals={riskFactors.staleDeals}
        underperformingReps={riskFactors.underperformingReps}
      />
      <Recommendations recommendations={recommendations} />
    </div>
  );
}

export default App;
