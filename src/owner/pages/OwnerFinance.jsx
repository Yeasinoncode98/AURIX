import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

function bdDate(ts) {
  if (!ts?.toDate) return null;
  return new Date(
    ts.toDate().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
  );
}

export default function OwnerFinance() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");

  useEffect(
    () =>
      onSnapshot(collection(db, "orders"), (s) => {
        setOrders(s.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }),
    [],
  );

  const filterOrders = () => {
    const now = new Date();
    if (range === "week") {
      const t = new Date();
      t.setDate(t.getDate() - 7);
      return orders.filter((o) => {
        const d = bdDate(o.createdAt);
        return d && d >= t;
      });
    }
    if (range === "month") {
      const t = new Date();
      t.setDate(1);
      t.setHours(0, 0, 0, 0);
      return orders.filter((o) => {
        const d = bdDate(o.createdAt);
        return d && d >= t;
      });
    }
    if (range === "year") {
      const t = new Date();
      t.setMonth(0);
      t.setDate(1);
      t.setHours(0, 0, 0, 0);
      return orders.filter((o) => {
        const d = bdDate(o.createdAt);
        return d && d >= t;
      });
    }
    return orders;
  };

  const fo = filterOrders();
  const delivered = fo.filter((o) => o.status === "delivered");
  const pending = fo.filter((o) => o.status === "pending");
  const cancelled = fo.filter((o) => o.status === "cancelled");

  const grossRevenue = delivered.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const deliveryCollected = delivered.reduce(
    (s, o) => s + (o.deliveryFee || 0),
    0,
  );
  const productRevenue = grossRevenue - deliveryCollected;
  const discountGiven = fo
    .filter((o) => o.discount > 0)
    .reduce((s, o) => s + (o.discount || 0), 0);
  const pendingValue = pending.reduce((s, o) => s + (o.totalAmount || 0), 0);

  // Monthly breakdown (last 6 months)
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setMonth(next.getMonth() + 1);
    const month = orders.filter((o) => {
      const od = bdDate(o.createdAt);
      return od && od >= d && od < next;
    });
    return {
      month: d.toLocaleDateString("en-BD", { month: "short", year: "2-digit" }),
      revenue: month
        .filter((o) => o.status === "delivered")
        .reduce((s, o) => s + (o.totalAmount || 0), 0),
      orders: month.length,
    };
  }).reverse();

  // Payment method breakdown
  const paymentMethods = fo.reduce((acc, o) => {
    if (!o.paymentLabel) return acc;
    acc[o.paymentLabel] = (acc[o.paymentLabel] || 0) + (o.deliveryFee || 0);
    return acc;
  }, {});

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">
            Finance & Revenue
          </h1>
          <p className="text-[12px] text-muted mt-0.5">
            Based on delivered orders only · No product cost data available
          </p>
        </div>
        <div className="flex gap-1.5">
          {[
            ["week", "7 Days"],
            ["month", "This Month"],
            ["year", "This Year"],
            ["all", "All Time"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setRange(v)}
              className={`px-3 py-2 rounded-[6px] text-[11px] font-semibold border transition-all
                ${range === v ? "text-black border-yellow-500" : "bg-[#0e0e0e] text-muted border-[#1a1a1a] hover:text-white"}`}
              style={
                range === v
                  ? { background: "linear-gradient(135deg,#eab308,#a16207)" }
                  : {}
              }
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-[8px] border px-4 py-3 text-[12px] text-muted"
        style={{
          borderColor: "rgba(234,179,8,0.2)",
          background: "rgba(234,179,8,0.03)",
        }}
      >
        ℹ Revenue figures are gross order totals from delivered orders. Product
        cost, salaries, and operational expenses are not tracked — profit/loss
        cannot be calculated from available data.
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          {
            label: "Gross Revenue",
            value: "৳" + grossRevenue.toLocaleString(),
            sub: "Delivered orders",
            color: "#22c55e",
          },
          {
            label: "Product Revenue",
            value: "৳" + productRevenue.toLocaleString(),
            sub: "Excl. delivery fees",
            color: "#eab308",
          },
          {
            label: "Delivery Collected",
            value: "৳" + deliveryCollected.toLocaleString(),
            sub: "Pre-paid fees",
            color: "#3b82f6",
          },
          {
            label: "Discount Given",
            value: "৳" + discountGiven.toLocaleString(),
            sub: "Coupon deductions",
            color: "#C1121F",
          },
          {
            label: "Pending Value",
            value: "৳" + pendingValue.toLocaleString(),
            sub: "Awaiting delivery",
            color: "#f59e0b",
          },
          {
            label: "Delivered Orders",
            value: delivered.length,
            sub: "Completed",
            color: "#22c55e",
          },
          {
            label: "Cancelled Orders",
            value: cancelled.length,
            sub: "Lost revenue",
            color: "#C1121F",
          },
          {
            label: "Avg Order Value",
            value: delivered.length
              ? "৳" +
                Math.round(grossRevenue / delivered.length).toLocaleString()
              : "—",
            sub: "Per delivered order",
            color: "#8b5cf6",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[8px] border border-[#1a1a1a] px-4 py-4 relative overflow-hidden"
            style={{ background: "#0e0e0e" }}
          >
            <div
              className="absolute top-0 right-0 w-12 h-12 rounded-full opacity-10"
              style={{
                background: s.color,
                filter: "blur(16px)",
                transform: "translate(30%,-30%)",
              }}
            />
            <p className="text-[18px] font-bold text-white tracking-[-0.02em]">
              {s.value}
            </p>
            <p className="text-[11px] font-semibold text-off mt-1">{s.label}</p>
            <p className="text-[10px] text-muted mt-0.5">{s.sub}</p>
            <div
              className="absolute bottom-0 left-0 h-[2px] w-full opacity-40"
              style={{ background: s.color }}
            />
          </div>
        ))}
      </div>

      {/* Revenue trend chart */}
      <div
        className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
        style={{ background: "#0e0e0e" }}
      >
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <p className="text-[13px] font-bold text-white">
            Monthly Revenue Trend
          </p>
          <p className="text-[10px] text-muted mt-0.5">
            Last 6 months — delivered orders only
          </p>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={monthly}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#666", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#666", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                }
              />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: 6,
                  fontSize: 11,
                }}
                formatter={(v) => [`৳${v.toLocaleString()}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#eab308"
                fill="url(#gr)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment methods */}
      <div
        className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
        style={{ background: "#0e0e0e" }}
      >
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <p className="text-[13px] font-bold text-white">
            Delivery Fee by Payment Method
          </p>
        </div>
        <div className="p-5 space-y-3">
          {Object.entries(paymentMethods).map(([method, amount]) => (
            <div key={method} className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-off">
                {method}
              </span>
              <span className="text-[13px] font-bold text-white">
                ৳{amount.toLocaleString()}
              </span>
            </div>
          ))}
          {Object.keys(paymentMethods).length === 0 && (
            <p className="text-muted text-[12px]">No payment data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
