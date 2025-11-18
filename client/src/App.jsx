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
  DownloadCloud,
  Activity,
  MapPin,
  Database,
  TrendingUp,
  FileText,
} from "lucide-react";

// KPI card component
const KpiCard = ({ icon, title, value, foot }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
        <div>
          <div className="text-xs text-slate-500 uppercase font-semibold">
            {title}
          </div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
        </div>
      </div>
      <div className="text-xs text-slate-400">{foot}</div>
    </div>
  </div>
);

export default function App() {
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
  }, [messages, loading]);

  const sendQuery = async (q) => {
    if (!q || !q.trim()) return;
    const userText = q.trim();
    setMessages((m) => [
      ...m,
      { id: Date.now(), from: "user", text: userText },
    ]);
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/analyze/", {
        query: userText,
      });
      const payload = res.data;

      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: "bot", text: payload.summary },
      ]);

      if (payload.data?.length > 0) {
        const cleaned = payload.data.map((r) => ({
          year: r.year ?? r.Year,
          locality: r.locality ?? r.Locality,
          price_per_sqft: Number(r.price_per_sqft ?? r.Price_Per_SqFt ?? 0),
          demand_index: Number(r.demand_index ?? r.Demand_Index ?? 0),
          supply_units: Number(r.supply_units ?? r.Supply_Units ?? 0),
        }));

        setResult({
          data: cleaned,
          summary: payload.summary,
          locality: payload.locality ?? cleaned[0]?.locality,
        });
        setActiveLocality(payload.locality ?? cleaned[0]?.locality);
      } else setResult(null);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 2,
          from: "bot",
          text: "Server error. Ensure backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    sendQuery(query);
    setQuery("");
  };

  const kpiValues = (() => {
    if (!result) return { avgPrice: "—", avgDemand: "—", records: 0 };
    const avgPrice = Math.round(
      result.data.reduce((s, r) => s + r.price_per_sqft, 0) / result.data.length
    );
    const avgDemand = Math.round(
      result.data.reduce((s, r) => s + r.demand_index, 0) / result.data.length
    );
    return {
      avgPrice: `₹${avgPrice}`,
      avgDemand: `${avgDemand}/100`,
      records: result.data.length,
    };
  })();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 p-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Activity />
            </div>
            <div>
              <div className="text-lg font-bold">EstateBot AI</div>
              <div className="text-xs text-slate-400">
                Real Estate Market Analyzer
              </div>
            </div>
          </div>
          <nav className="flex-1">
            <ul className="space-y-1">
              <li className="py-2 px-3 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-3">
                <MapPin /> Localities
              </li>
              <li className="py-2 px-3 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-3">
                <TrendingUp /> Trends
              </li>
              <li className="py-2 px-3 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-3">
                <Database /> Data
              </li>
              <li className="py-2 px-3 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-3">
                <FileText /> Reports
              </li>
            </ul>
          </nav>
          <div className="mt-auto">
            <button className="w-full flex items-center gap-2 justify-center py-2 bg-slate-900 text-white rounded-lg">
              <DownloadCloud /> Export Report
            </button>
            <div className="text-xs text-slate-400 mt-3">v1.0 • Local Dev</div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">
          {/* Topbar */}
          <header className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 rounded-lg bg-white border">
                <Menu />
              </button>
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-sm border"
              >
                <Search className="text-slate-400" />
                <input
                  className="outline-none text-sm w-72"
                  placeholder="Ask: Analyze Wakad or Compare Baner and Hinjewadi"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="ml-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm"
                >
                  Analyze
                </button>
              </form>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold">Ambar</span>
                <span className="text-xs text-slate-400">Admin</span>
              </div>
              <button className="p-2 rounded-lg bg-white border">
                <LogOut />
              </button>
            </div>
          </header>

          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <KpiCard
              icon={<MapPin />}
              title="Top Locality"
              value={activeLocality ?? "—"}
              foot="Selected"
            />
            <KpiCard
              icon={<TrendingUp />}
              title="Avg Demand Index"
              value={kpiValues.avgDemand}
              foot="Last 3 years"
            />
            <KpiCard
              icon={<Database />}
              title="Data Points"
              value={kpiValues.records}
              foot="Records"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-bold mb-2">
                Price Trends (INR/SqFt)
              </h3>
              {result?.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={result.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price_per_sqft"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  No data — run an analysis
                </div>
              )}
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-bold mb-2">Demand vs Supply</h3>
              {result?.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="demand_index"
                      name="Demand Index"
                      fill="#f97316"
                    />
                    <Bar
                      dataKey="supply_units"
                      name="Supply Units"
                      fill="#cbd5e1"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  No data — run an analysis
                </div>
              )}
            </div>
          </div>

          {/* Chat + Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border flex flex-col h-96">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Chat</h4>
                <div className="text-xs text-slate-400">Live</div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 p-1">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl max-w-[85%] ${
                      m.from === "user"
                        ? "bg-indigo-600 text-white self-end"
                        : "bg-slate-50 text-slate-800 self-start"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className="mt-3 flex gap-2" onSubmit={handleSubmit}>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 border rounded-full px-3 py-2 text-sm"
                  placeholder="Type a question — e.g., 'Analyze Wakad'"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-full"
                >
                  Send
                </button>
              </form>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border overflow-x-auto">
              <h4 className="font-semibold mb-2">Raw Data</h4>
              <table className="min-w-full text-sm border-collapse">
                <thead className="text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="text-left p-2">Year</th>
                    <th className="text-left p-2">Locality</th>
                    <th className="text-right p-2">Price/SqFt</th>
                    <th className="text-right p-2">Demand Index</th>
                    <th className="text-right p-2">Supply</th>
                  </tr>
                </thead>
                <tbody>
                  {result?.data.length > 0 ? (
                    result.data.map((r, i) => (
                      <tr key={i}>
                        <td className="p-2">{r.year}</td>
                        <td className="p-2">{r.locality}</td>
                        <td className="p-2 text-right">₹{r.price_per_sqft}</td>
                        <td className="p-2 text-right">{r.demand_index}</td>
                        <td className="p-2 text-right">{r.supply_units}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-slate-400 text-center"
                      >
                        No data to display
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
