"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg">
        <p className="text-sm font-bold text-slate-800 mb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function DashboardCharts({ categoryData, trendData }) {
  const [rangeDays, setRangeDays] = useState(30);
  const [categoryLimit, setCategoryLimit] = useState("all");

  const visibleTrendData = useMemo(() => {
    if (rangeDays === 30) return trendData;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - rangeDays);

    return trendData.filter((item) => new Date(item.date) >= cutoff);
  }, [rangeDays, trendData]);

  const visibleCategoryData = useMemo(() => {
    if (categoryLimit === "top5") return categoryData.slice(0, 5);
    return categoryData;
  }, [categoryData, categoryLimit]);

  // Format dates for trend chart
  const formattedTrendData = useMemo(() => {
    return visibleTrendData.map(d => {
      const date = new Date(d.date);
      return {
        ...d,
        displayDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      };
    });
  }, [visibleTrendData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 min-w-0">
      {/* Trend Chart */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm min-w-0">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-extrabold tracking-tight text-slate-800">Order Trends</h3>
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setRangeDays(days)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  rangeDays === days
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full min-w-0">
          {formattedTrendData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
              No recent order data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Quotations" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Pie Chart */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm min-w-0">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-extrabold tracking-tight text-slate-800">Products by Category</h3>
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[
              ["all", "All"],
              ["top5", "Top 5"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategoryLimit(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  categoryLimit === value
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full min-w-0">
          {visibleCategoryData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
              No products found in categories.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibleCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {visibleCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', fontWeight: '500', color: '#475569' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
