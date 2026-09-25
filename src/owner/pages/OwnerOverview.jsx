import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function bdDate(ts) {
  if (!ts?.toDate) return null;
  return new Date(
    ts.toDate().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
  );
}
const startOf = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const S_COLORS = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

export default function OwnerOverview() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [presence, setPresence] = useState({});

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (s) =>
      setOrders(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
  }, []);
  useEffect(
    () =>
      onSnapshot(collection(db, "products"), (s) =>
        setProducts(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      ),
    [],
  );
  useEffect(
    () =>
      onSnapshot(collection(db, "admins"), (s) =>
        setAdmins(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      ),
    [],
  );
  useEffect(
    () =>
      onSnapshot(collection(db, "presence"), (s) => {
        const m = {};
        s.docs.forEach((d) => (m[d.id] = d.data()));
        setPresence(m);
      }),
    [],
  );

  const tod = startOf(new Date());
  const yest = new Date(tod);
  yest.setDate(yest.getDate() - 1);
  const mon = new Date();
  mon.setDate(1);
  mon.setHours(0, 0, 0, 0);

  const delivered = orders.filter((o) => o.status === "delivered");
  const todayOrders = orders.filter((o) => {
    const d = bdDate(o.createdAt);
    return d && d >= tod;
  });
  const yestOrders = orders.filter((o) => {
    const d = bdDate(o.createdAt);
    return d && d >= yest && d < tod;
  });
  const monthOrders = orders.filter((o) => {
    const d = bdDate(o.createdAt);
    return d && d >= mon;
  });
  const totalRev = delivered.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const monthRev = monthOrders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + (o.totalAmount || 0), 0);
  const todayRev = todayOrders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + (o.totalAmount || 0), 0);
  const lowStock = products.filter((p) => (p.stock ?? 999) <= 5);

  const isOnline = (uid) => {
    const p = presence[uid];
    if (!p?.lastSeen) return false;
    if (p.online === false) return false;
    const last = p.lastSeen?.toDate
      ? p.lastSeen.toDate()
      : new Date(p.lastSeen);
    return Date.now() - last.getTime() < 2 * 60 * 1000;
  };
  const onlineAdmins = admins.filter((a) => isOnline(a.id));

  // 7-day trend
  const trend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const day = orders.filter((o) => {
      const od = bdDate(o.createdAt);
      return od && od >= d && od < next;
    });
    return {
      date: d.toLocaleDateString("en-BD", { month: "short", day: "2-digit" }),
      orders: day.length,
      revenue: day
        .filter((o) => o.status === "delivered")
        .reduce((s, o) => s + (o.totalAmount || 0), 0),
    };
  });

  const statusDist = Object.entries(
    orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const stats = [
    {
      label: "Today's Orders",
      value: todayOrders.length,
      sub: "vs yesterday: " + yestOrders.length,
      color: "#3b82f6",
    },
    {
      label: "Total Orders",
      value: orders.length,
      sub: "All time",
      color: "#8b5cf6",
    },
    {
      label: "Month Orders",
      value: monthOrders.length,
      sub: "This month",
      color: "#06b6d4",
    },
    {
      label: "Today Revenue",
      value: "৳" + todayRev.toLocaleString(),
      sub: "Delivered only",
      color: "#22c55e",
    },
    {
      label: "Month Revenue",
      value: "৳" + monthRev.toLocaleString(),
      sub: "This month",
      color: "#eab308",
    },
    {
      label: "Total Revenue",
      value: "৳" + totalRev.toLocaleString(),
      sub: "All delivered",
      color: "#C1121F",
    },
    {
      label: "Pending",
      value: orders.filter((o) => o.status === "pending").length,
      sub: "Awaiting action",
      color: "#f59e0b",
    },
    {
      label: "Delivered",
      value: delivered.length,
      sub: "Completed",
      color: "#22c55e",
    },
    {
      label: "Admins Online",
      value: onlineAdmins.length + "/" + admins.length,
      sub: "Right now",
      color: "#eab308",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">
          Business Overview
        </h1>
        <p className="text-[12px] text-muted mt-0.5">
          Real-time data from all Firestore collections
        </p>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div
          className="rounded-[8px] border px-5 py-4"
          style={{
            borderColor: "rgba(234,179,8,0.3)",
            background: "rgba(234,179,8,0.05)",
          }}
        >
          <p
            className="text-[12px] font-bold mb-2"
            style={{ color: "#eab308" }}
          >
            ⚠ Low Stock — {lowStock.length} product
            {lowStock.length > 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <Link
                key={p.id}
                to="/owner/inventory"
                className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-[11px] font-semibold text-white border"
                style={{
                  background: "rgba(234,179,8,0.1)",
                  borderColor: "rgba(234,179,8,0.2)",
                }}
              >
                {p.name}{" "}
                <span style={{ color: "#eab308" }}>({p.stock ?? 0} left)</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[8px] border border-[#1a1a1a] px-4 py-4 relative overflow-hidden"
            style={{ background: "linear-gradient(160deg,#0e0e0e,#0a0a0a)" }}
          >
            <div
              className="absolute top-0 right-0 w-12 h-12 rounded-full opacity-10"
              style={{
                background: s.color,
                filter: "blur(16px)",
                transform: "translate(30%,-30%)",
              }}
            />
            <p className="text-[20px] font-display font-extrabold text-white tracking-[-0.03em] leading-none">
              {s.value}
            </p>
            <p className="text-[11px] font-semibold text-off mt-1.5">
              {s.label}
            </p>
            <p className="text-[10px] text-muted mt-0.5">{s.sub}</p>
            <div
              className="absolute bottom-0 left-0 h-[2px] w-full opacity-40"
              style={{ background: s.color }}
            />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Order + Revenue trend */}
        <div
          className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
          style={{ background: "#0e0e0e" }}
        >
          <div className="px-5 py-4 border-b border-[#1a1a1a]">
            <p className="text-[13px] font-bold text-white">7-Day Trend</p>
            <p className="text-[10px] text-muted mt-0.5">Orders & Revenue</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={trend}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="go" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#666", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#666", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #222",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                  labelStyle={{ color: "#aaa" }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#3b82f6"
                  fill="url(#go)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#eab308"
                  fill="url(#gr)"
                  strokeWidth={2}
                  yAxisId={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status pie */}
        <div
          className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
          style={{ background: "#0e0e0e" }}
        >
          <div className="px-5 py-4 border-b border-[#1a1a1a]">
            <p className="text-[13px] font-bold text-white">
              Order Status Distribution
            </p>
          </div>
          <div className="p-4 flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={statusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {statusDist.map((e) => (
                    <Cell key={e.name} fill={S_COLORS[e.name] || "#444"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #222",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {statusDist.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: S_COLORS[s.name] || "#444" }}
                  />
                  <span className="text-[11px] text-off capitalize flex-1">
                    {s.name}
                  </span>
                  <span className="text-[11px] font-bold text-white">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin presence widget */}
      <div
        className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
        style={{ background: "#0e0e0e" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div>
            <p className="text-[13px] font-bold text-white">Admin Activity</p>
            <p className="text-[10px] text-muted mt-0.5">
              {onlineAdmins.length} online right now
            </p>
          </div>
          <Link
            to="/owner/admin-management"
            className="text-[11px] font-semibold transition-colors"
            style={{ color: "#eab308" }}
          >
            Manage Admins →
          </Link>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {admins.length === 0 ? (
            <p className="text-[12px] text-muted col-span-full py-4 text-center">
              No admin profiles found
            </p>
          ) : (
            admins.map((a) => {
              const online = isOnline(a.id);
              const p = presence[a.id];
              const lastSeen = p?.lastSeen?.toDate
                ? p.lastSeen.toDate().toLocaleString("en-BD", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Dhaka",
                  })
                : "—";
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-[6px] border border-[#1a1a1a]"
                  style={{ background: "#111" }}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px]"
                      style={{
                        background: "linear-gradient(135deg,#eab308,#a16207)",
                        color: "#000",
                      }}
                    >
                      {(a.name || "A")[0].toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#111]`}
                      style={{ background: online ? "#22c55e" : "#444" }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-white truncate">
                      {a.name || "Admin"}
                    </p>
                    <p className="text-[10px] text-muted">
                      {online ? "Online" : lastSeen}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
