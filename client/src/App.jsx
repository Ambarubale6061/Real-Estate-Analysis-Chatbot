import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Menu,
  LogOut,
  Search,
  MapPin,
  TrendingUp,
  Database,
} from "lucide-react";

const KPI = ({ icon, title, value, foot }) => (
  <div className="kpi-card">
    <div className="kpi-icon">{icon}</div>
    <div className="kpi-text">
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">{foot}</div>
    </div>
  </div>
);

export default function App() {
  const API_URL = "https://real-estate-backend-aiv1.onrender.com/api/analyze/";

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 0,
      from: "bot",
      text: "Hello! Ask me to analyze a locality like 'Wakad' or 'Kothrud'.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeLocality, setActiveLocality] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendQuery = async (q) => {
    if (!q.trim()) return;

    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text: q }]);
    setLoading(true);

    try {
      const res = await axios.post(API_URL, {
        query: q,
      });

      const payload = res.data;

      // Bot reply
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "bot", text: payload.summary },
      ]);

      // Data clean
      if (payload.data?.length > 0) {
        const cleaned = payload.data.map((r) => ({
          year: r.year ?? r.Year,
          locality: r.locality ?? r.Locality,
          price_per_sqft: Number(r.price_per_sqft ?? r.Price_Per_SqFt ?? 0),
          demand_index: Number(r.demand_index ?? r.Demand_Index ?? 0),
          supply_units: Number(r.supply_units ?? r.Supply_Units ?? 0),
        }));

        setResult({ data: cleaned, summary: payload.summary });
        setActiveLocality(payload.locality ?? cleaned[0]?.locality);
      } else {
        setResult(null);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: "bot",
          text: "Server error. Ensure backend is live.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuery(query);
    setQuery("");
  };

  const kpiValues = (() => {
    if (!result) return { avgPrice: "—", avgDemand: "—", records: 0 };

    const avgPrice = Math.round(
      result.data.reduce((sum, r) => sum + r.price_per_sqft, 0) /
        result.data.length
    );

    const avgDemand = Math.round(
      result.data.reduce((sum, r) => sum + r.demand_index, 0) /
        result.data.length
    );

    return {
      avgPrice: `₹${avgPrice}`,
      avgDemand: `${avgDemand}/100`,
      records: result.data.length,
    };
  })();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">RE Analysis Bot</div>
        <nav className="menu">
          <div className="menu-item">
            <MapPin /> Localities
          </div>
          <div className="menu-item">
            <TrendingUp /> Trends
          </div>
          <div className="menu-item">
            <Database /> Data
          </div>
        </nav>
      </aside>

      <main className="main">
        {/* Search */}
        <form onSubmit={handleSubmit} className="search-bar">
          <Search className="search-icon" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Analyze Wakad or Compare Baner/Hinjewadi"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {/* KPIs */}
        <div className="kpi-container">
          <KPI
            icon={<MapPin />}
            title="Top Locality"
            value={activeLocality ?? "—"}
            foot="Selected"
          />
          <KPI
            icon={<TrendingUp />}
            title="Avg Demand Index"
            value={kpiValues.avgDemand}
            foot="Last 3 years"
          />
          <KPI
            icon={<Database />}
            title="Data Points"
            value={kpiValues.records}
            foot="Records"
          />
        </div>

        {/* Chat */}
        <div className="chat-box">
          {messages.map((m) => (
            <div key={m.id} className={`message ${m.from}`}>
              {m.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Table */}
        {result?.data?.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Locality</th>
                <th>Price/SqFt</th>
                <th>Demand Index</th>
                <th>Supply</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((r, i) => (
                <tr key={i}>
                  <td>{r.year}</td>
                  <td>{r.locality}</td>
                  <td>₹{r.price_per_sqft}</td>
                  <td>{r.demand_index}</td>
                  <td>{r.supply_units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
