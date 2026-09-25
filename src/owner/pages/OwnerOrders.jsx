import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const STATUS_COLOR = {
  pending: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  confirmed: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  preparing: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  shipped: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  delivered: "text-green-400 bg-green-500/10 border-green-500/20",
  cancelled: "text-red bg-red/10 border-red/20",
};

export default function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    return onSnapshot(collection(db, "orders"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        const at = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const bt = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return bt - at;
      });
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const filtered = orders.filter((o) => {
    const s = search.toLowerCase();
    const matchS =
      !s ||
      (o.orderId || o.id).toLowerCase().includes(s) ||
      o.customerName?.toLowerCase().includes(s) ||
      o.customerPhone?.includes(s);
    const matchF = filter === "all" || o.status === filter;
    let matchD = true;
    if (dateFrom || dateTo) {
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : null;
      if (d) {
        if (dateFrom) matchD = matchD && d >= new Date(dateFrom);
        if (dateTo) {
          const e = new Date(dateTo);
          e.setHours(23, 59, 59, 999);
          matchD = matchD && d <= e;
        }
      }
    }
    return matchS && matchF && matchD;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">
          All Orders
        </h1>
        <p className="text-[12px] text-muted mt-0.5">
          {orders.length} total · Read-only view
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#666"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by Order ID, Name, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-muted outline-none focus:border-[#333]"
          />
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] px-3 py-2.5 text-[12px] text-white outline-none [color-scheme:dark]"
          />
          <span className="text-muted text-[12px]">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] px-3 py-2.5 text-[12px] text-white outline-none [color-scheme:dark]"
          />
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {[
          "all",
          "pending",
          "confirmed",
          "preparing",
          "shipped",
          "delivered",
          "cancelled",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-[6px] text-[11px] font-semibold uppercase tracking-wider border transition-all
              ${filter === s ? "text-black border-yellow-500" : "bg-[#0e0e0e] text-muted border-[#1a1a1a] hover:text-white"}`}
            style={
              filter === s
                ? { background: "linear-gradient(135deg,#eab308,#a16207)" }
                : {}
            }
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
        style={{ background: "#0a0a0a" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[800px]">
            <thead>
              <tr className="border-b border-[#151515]">
                {[
                  "Order ID",
                  "Customer",
                  "Payment",
                  "Items",
                  "Amount",
                  "Status",
                  "Handled By",
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
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="hover:bg-[#0d0d0d] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <p
                      className="font-mono font-bold text-[11px]"
                      style={{ color: "#eab308" }}
                    >
                      {o.orderId || o.id}
                    </p>
                    <p className="text-muted text-[10px]">
                      {o.createdAt?.toDate
                        ? o.createdAt.toDate().toLocaleDateString("en-BD", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{o.customerName}</p>
                    <p className="text-muted text-[10px]">{o.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] font-semibold text-green-400">
                      ✓ Fee Paid
                    </p>
                    <p className="text-muted text-[10px]">
                      {o.paymentLabel} · ৳{o.deliveryFee}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-off">
                    {o.items?.length || 0} item(s)
                  </td>
                  <td className="px-4 py-3 font-bold text-white">
                    ৳{o.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLOR[o.status] || "text-muted bg-[#141414] border-[#222]"}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {o.handledBy ? (
                      <>
                        <p className="text-white text-[11px] font-semibold">
                          {o.handledBy.name}
                        </p>
                        <p className="text-muted text-[10px]">
                          {o.handledBy.email}
                        </p>
                      </>
                    ) : (
                      <span className="text-muted text-[10px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-muted text-[12px] py-10">
              No orders found
            </p>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[100]"
            onClick={() => setSelected(null)}
          />
          <div
            className="fixed right-0 top-0 h-full w-full max-w-[460px] z-[101] overflow-y-auto border-l border-[#1a1a1a]"
            style={{ background: "#0a0a0a" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] sticky top-0"
              style={{ background: "#0a0a0a" }}
            >
              <div>
                <p className="text-[11px] uppercase tracking-wider2 text-muted">
                  Order Details — Read Only
                </p>
                <p
                  className="font-bold text-[15px] mt-0.5"
                  style={{ color: "#eab308" }}
                >
                  {selected.orderId || selected.id}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted hover:text-white"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4 text-[12px]">
              {[
                ["Customer", selected.customerName],
                ["Phone", selected.customerPhone],
                ["Address", selected.deliveryAddress],
                ["Zone", selected.deliveryLabel],
                ["Status", (selected.status || "").toUpperCase()],
                ["Payment", selected.paymentLabel],
                ["Sender No.", selected.senderNumber],
                ["TRX ID", selected.trxId],
                ["Delivery Fee", "৳" + (selected.deliveryFee || 0)],
                ["Subtotal", "৳" + (selected.subtotal || 0)],
                ["Total", "৳" + (selected.totalAmount || 0)],
                [
                  "Handled By",
                  selected.handledBy?.name +
                    (selected.handledBy?.email
                      ? " (" + selected.handledBy.email + ")"
                      : ""),
                ],
              ]
                .filter((r) => r[1])
                .map(([l, v]) => (
                  <div
                    key={l}
                    className="flex justify-between gap-4 py-1.5 border-b border-[#111]"
                  >
                    <span className="text-muted flex-shrink-0">{l}</span>
                    <span className="text-off font-medium text-right break-all">
                      {v}
                    </span>
                  </div>
                ))}
              {(selected.items || []).length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold mb-2">
                    Items
                  </p>
                  {selected.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-1.5 border-b border-[#111]"
                    >
                      <span className="text-off">
                        {item.name} × {item.qty}
                      </span>
                      <span className="font-bold text-white">
                        ৳
                        {(
                          item.subtotal ?? item.price * item.qty
                        )?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
