import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

function bdDate(ts) {
  if (!ts?.toDate) return null;
  return new Date(
    ts.toDate().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
  );
}

export default function OwnerAdminPerformance() {
  const [orders, setOrders] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [range, setRange] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onSnapshot(collection(db, "orders"), (s) => {
        setOrders(s.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }),
    [],
  );
  useEffect(
    () =>
      onSnapshot(collection(db, "admins"), (s) =>
        setAdmins(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      ),
    [],
  );

  const filterDate = (o) => {
    const d = bdDate(o.createdAt);
    if (!d) return false;
    const now = new Date();
    if (range === "today") {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return d >= t;
    }
    if (range === "week") {
      const t = new Date();
      t.setDate(t.getDate() - 7);
      return d >= t;
    }
    if (range === "month") {
      const t = new Date();
      t.setDate(1);
      t.setHours(0, 0, 0, 0);
      return d >= t;
    }
    return true;
  };

  const filteredOrders = orders.filter(filterDate);

  // Per-admin stats from handledBy field
  const adminStats = admins
    .map((a) => {
      const handled = filteredOrders.filter((o) => o.handledBy?.uid === a.id);
      const confirmed = handled.filter((o) =>
        ["confirmed", "preparing", "shipped", "delivered"].includes(o.status),
      ).length;
      const delivered = handled.filter((o) => o.status === "delivered").length;
      const revenue = handled
        .filter((o) => o.status === "delivered")
        .reduce((s, o) => s + (o.totalAmount || 0), 0);
      const lastAction = handled.reduce((latest, o) => {
        const d = o.updatedAt?.toDate ? o.updatedAt.toDate() : null;
        return d && (!latest || d > latest) ? d : latest;
      }, null);
      return {
        ...a,
        handled: handled.length,
        confirmed,
        delivered,
        revenue,
        lastAction,
      };
    })
    .sort((a, b) => b.handled - a.handled);

  const fmtDate = (d) =>
    d
      ? d.toLocaleDateString("en-BD", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Dhaka",
        })
      : "—";

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">
            Admin Performance
          </h1>
          <p className="text-[12px] text-muted mt-0.5">
            Based on existing handledBy field on orders
          </p>
        </div>
        <div className="flex gap-1.5">
          {[
            ["all", "All Time"],
            ["month", "This Month"],
            ["week", "This Week"],
            ["today", "Today"],
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
        className="rounded-[8px] border border-[#1a1a1a] px-4 py-3 text-[12px] text-muted"
        style={{ background: "#0d0d0d" }}
      >
        ℹ Only orders where an admin changed status are counted. Orders with no
        handledBy value are excluded. Historical data before the handledBy
        feature was added is not available.
      </div>

      <div
        className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
        style={{ background: "#0a0a0a" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[600px]">
            <thead>
              <tr className="border-b border-[#151515]">
                {[
                  "Admin",
                  "Orders Handled",
                  "Confirmed",
                  "Delivered",
                  "Revenue Generated",
                  "Last Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] uppercase tracking-wider2 text-muted font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f0f0f]">
              {adminStats.map((a, i) => (
                <tr key={a.id} className="hover:bg-[#0d0d0d] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg,#eab308,#a16207)",
                          color: "#000",
                        }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {a.name || "Admin"}
                        </p>
                        <p className="text-muted text-[10px]">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-white text-[14px]">
                    {a.handled}
                  </td>
                  <td className="px-4 py-3 text-blue-400 font-semibold">
                    {a.confirmed}
                  </td>
                  <td className="px-4 py-3 text-green-400 font-semibold">
                    {a.delivered}
                  </td>
                  <td className="px-4 py-3 font-bold text-white">
                    ৳{a.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted text-[11px]">
                    {fmtDate(a.lastAction)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {adminStats.length === 0 && (
            <p className="text-center text-muted text-[12px] py-10">
              No admin activity data found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
