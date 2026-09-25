import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useReactToPrint } from "react-to-print";
import toast from "react-hot-toast";
import { StatusBadge } from "./AdminDashboard";

const STATUS_FLOW = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrders() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null); // order detail drawer
  const [memoOrder, setMemoOrder] = useState(null); // cash memo

  // Real-time orders
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  // Filtered orders
  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      (o.orderId || o.id).toLowerCase().includes(s) ||
      o.customerName?.toLowerCase().includes(s) ||
      o.customerPhone?.includes(s);
    return matchStatus && matchSearch;
  });

  // Pending first
  const sorted = [
    ...filtered.filter((o) => o.status === "pending"),
    ...filtered.filter((o) => o.status !== "pending"),
  ];

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        handledBy: {
          uid: user?.uid,
          name: profile?.name || user?.email,
          email: user?.email,
        },
        updatedAt: serverTimestamp(),
      });
      toast.success(`Order updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update order");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/20 border-t-red rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-6 space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">
            Orders
          </h1>
          <p className="text-[12px] text-muted mt-0.5">
            {orders.length} total orders
          </p>
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
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
            className="w-full bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px]
                       pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-muted
                       outline-none focus:border-[#333] transition-colors duration-150"
          />
        </div>
        {/* Status filter */}
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
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-[6px] text-[11px] font-semibold uppercase tracking-wider
                          transition-all duration-150 border
                          ${
                            filterStatus === s
                              ? "bg-red text-white border-red"
                              : "bg-[#0e0e0e] text-muted border-[#1a1a1a] hover:border-[#333] hover:text-white"
                          }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div
        className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
        style={{ background: "#0a0a0a" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[900px]">
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
                  "Actions",
                  "Cash Memo",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] uppercase tracking-wider2
                                         text-muted font-semibold whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f0f0f]">
              {sorted.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusChange={updateStatus}
                  onView={() => setSelected(order)}
                  onMemo={() => setMemoOrder(order)}
                />
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <p className="text-center text-muted text-[12px] py-10">
              No orders found
            </p>
          )}
        </div>
      </div>

      {/* ── Order Detail Drawer ── */}
      {selected && (
        <OrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
          onMemo={() => {
            setMemoOrder(selected);
            setSelected(null);
          }}
        />
      )}

      {/* ── Cash Memo Modal ── */}
      {memoOrder && (
        <CashMemoModal order={memoOrder} onClose={() => setMemoOrder(null)} />
      )}
    </div>
  );
}

/* ── Order Row ── */
function OrderRow({ order, onStatusChange, onView, onMemo }) {
  const isPending = order.status === "pending";
  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];

  return (
    <tr
      className={`hover:bg-[#0d0d0d] transition-colors duration-100
                    ${isPending ? "border-l-2 border-l-yellow-500" : ""}`}
    >
      {/* Order ID */}
      <td className="px-4 py-3">
        <button
          onClick={onView}
          className="font-mono font-bold text-red text-[11px] hover:text-red/80 transition-colors"
        >
          {order.orderId || order.id}
        </button>
        <p className="text-muted text-[10px] mt-0.5">
          {order.createdAt?.toDate
            ? order.createdAt.toDate().toLocaleDateString("en-BD", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </p>
      </td>

      {/* Customer */}
      <td className="px-4 py-3">
        <p className="font-semibold text-white">{order.customerName}</p>
        <p className="text-muted text-[10px]">{order.customerPhone}</p>
      </td>

      {/* Payment */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-green-400 text-[10px]">✓</span>
          <span className="text-[11px] font-semibold text-green-400">
            Delivery Fee Paid
          </span>
        </div>
        <p className="text-muted text-[10px] mt-0.5">
          {order.paymentLabel} · ৳{order.deliveryFee}
        </p>
      </td>

      {/* Items */}
      <td className="px-4 py-3">
        <p className="text-white font-semibold">
          {order.items?.length || 0} item(s)
        </p>
        <p className="text-muted text-[10px] truncate max-w-[120px]">
          {order.items?.map((i) => i.name).join(", ")}
        </p>
      </td>

      {/* Amount */}
      <td className="px-4 py-3 font-bold text-white">
        ৳{order.totalAmount?.toLocaleString()}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={order.status} />
      </td>

      {/* Handled By */}
      <td className="px-4 py-3">
        {order.handledBy ? (
          <>
            <p className="text-white text-[11px] font-semibold">
              {order.handledBy.name}
            </p>
            <p className="text-muted text-[10px]">{order.handledBy.email}</p>
          </>
        ) : (
          <span className="text-muted text-[10px]">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onView}
            className="px-2.5 py-1 bg-[#141414] border border-[#222] rounded-[4px]
                       text-[10px] text-muted hover:text-white hover:border-[#333] transition-all duration-150"
          >
            View
          </button>
          {nextStatus && nextStatus !== "cancelled" && (
            <button
              onClick={() => onStatusChange(order.id, nextStatus)}
              className="px-2.5 py-1 bg-red/10 border border-red/20 rounded-[4px]
                         text-[10px] text-red hover:bg-red/20 transition-all duration-150 capitalize"
            >
              → {nextStatus}
            </button>
          )}
        </div>
      </td>

      {/* Cash Memo */}
      <td className="px-4 py-3">
        <button
          onClick={onMemo}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#222]
                     rounded-[4px] text-[10px] text-muted hover:text-white hover:border-[#333]
                     transition-all duration-150"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Memo
        </button>
      </td>
    </tr>
  );
}

/* ── Order Detail Drawer ── */
function OrderDrawer({ order, onClose, onStatusChange, onMemo }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[100]" onClick={onClose} />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-[480px] z-[101] overflow-y-auto
                      border-l border-[#1a1a1a]"
        style={{ background: "#0a0a0a" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] sticky top-0"
          style={{ background: "#0a0a0a" }}
        >
          <div>
            <p className="text-[11px] uppercase tracking-wider2 text-muted">
              Order Details
            </p>
            <p className="font-display font-bold text-[16px] text-red mt-0.5">
              {order.orderId || order.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-white"
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

        <div className="p-6 space-y-5">
          {/* Status update */}
          <div className="rounded-[8px] border border-[#1a1a1a] p-4">
            <p className="text-[10px] uppercase tracking-wider2 text-muted mb-3">
              Update Status
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(order.id, s);
                  }}
                  className={`px-3 py-1.5 rounded-[6px] text-[11px] font-semibold capitalize
                              border transition-all duration-150
                              ${
                                order.status === s
                                  ? "bg-red text-white border-red"
                                  : "bg-[#141414] text-muted border-[#1a1a1a] hover:border-[#333] hover:text-white"
                              }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Customer info */}
          <DrawerSection title="Customer">
            <DrawerRow label="Name" value={order.customerName} />
            <DrawerRow label="Phone" value={order.customerPhone} />
            <DrawerRow label="Address" value={order.deliveryAddress} />
            <DrawerRow label="Zone" value={order.deliveryLabel} />
          </DrawerSection>

          {/* Payment */}
          <DrawerSection title="Payment">
            <DrawerRow label="Method" value={order.paymentLabel} />
            <DrawerRow label="Sent From" value={order.senderNumber} />
            <DrawerRow label="TRX ID" value={order.trxId} mono />
            <DrawerRow label="Paid To" value={order.paymentNumber} />
            <DrawerRow label="Delivery Fee" value={`৳${order.deliveryFee}`} />
          </DrawerSection>

          {/* Items */}
          <DrawerSection title="Items Ordered">
            {(order.items || []).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2
                                      border-b border-[#111] last:border-0"
              >
                <div>
                  <p className="text-[12px] font-semibold text-white">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-muted">
                    Qty: {item.qty} × ৳{item.price?.toLocaleString()}
                  </p>
                </div>
                <span className="text-[12px] font-bold text-white">
                  ৳{item.subtotal?.toLocaleString()}
                </span>
              </div>
            ))}
          </DrawerSection>

          {/* Financials */}
          <DrawerSection title="Summary">
            <DrawerRow
              label="Subtotal"
              value={`৳${order.subtotal?.toLocaleString()}`}
            />
            <DrawerRow
              label="Delivery Fee"
              value={`৳${order.deliveryFee?.toLocaleString()}`}
            />
            <DrawerRow
              label="Total"
              value={`৳${order.totalAmount?.toLocaleString()}`}
              highlight
            />
          </DrawerSection>

          {/* Handled by */}
          {order.handledBy && (
            <DrawerSection title="Last Updated By">
              <DrawerRow label="Name" value={order.handledBy.name} />
              <DrawerRow label="Email" value={order.handledBy.email} />
            </DrawerSection>
          )}

          {/* Cash memo button */}
          <button
            onClick={onMemo}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[6px]
                       border border-[#222] bg-[#111] text-[12px] font-semibold text-white
                       hover:border-[#333] transition-all duration-150"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Generate Cash Memo
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Cash Memo Modal + Print ── */
function CashMemoModal({ order, onClose }) {
  const customerRef = useRef(null);
  const companyRef = useRef(null);

  const printCustomer = useReactToPrint({ content: () => customerRef.current });
  const printCompany = useReactToPrint({ content: () => companyRef.current });

  const orderDate = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Dhaka",
      })
    : new Date().toLocaleString("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Dhaka",
      });

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-[600px] rounded-[8px] border border-[#1a1a1a]
                        overflow-hidden max-h-[90vh] flex flex-col"
          style={{ background: "#0a0a0a" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] flex-shrink-0">
            <p className="text-[13px] font-bold text-white">Cash Memo</p>
            <div className="flex items-center gap-2">
              {/* Print Customer Copy */}
              <button
                onClick={printCustomer}
                className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2a2a2a] rounded-[6px]
                           text-[11px] font-semibold text-white hover:border-[#444] transition-colors duration-150"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Customer Copy
              </button>

              {/* Print Company Copy */}
              <button
                onClick={printCompany}
                className="flex items-center gap-2 px-3 py-2 bg-red text-white rounded-[6px]
                           text-[11px] font-semibold hover:bg-red/90 transition-colors duration-150"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Company Copy
              </button>

              <button
                onClick={onClose}
                className="text-muted hover:text-white ml-1"
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
          </div>

          {/* Info tip */}
          <div className="px-5 py-2 text-[11px] flex items-center gap-2 flex-shrink-0 bg-blue-500/10 text-blue-400">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Choose which copy to print — Customer Copy or Company Copy — each
            prints separately.
          </div>

          {/* ── Preview area ── */}
          <div className="overflow-y-auto flex-1 divide-y divide-[#1a1a1a]">
            {/* CUSTOMER COPY ref */}
            <div ref={customerRef}>
              <MemoContent
                order={order}
                orderDate={orderDate}
                copy="Customer Copy"
              />
            </div>

            {/* COMPANY COPY ref */}
            <div ref={companyRef}>
              <MemoContent
                order={order}
                orderDate={orderDate}
                copy="Company Copy"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Single memo page — white paper, deep black text ── */
function MemoContent({ order, orderDate, copy }) {
  const isCompany = copy === "Company Copy";
  const deliveryFee = Number(order.deliveryFee ?? 0);
  const totalAmount = Number(order.totalAmount ?? 0);
  const subtotal = Number(order.subtotal ?? totalAmount - deliveryFee);

  // All inline styles use deep black/dark for print clarity on white paper
  const S = {
    page: {
      fontFamily: "'Courier New', Courier, monospace",
      background: "#ffffff",
      color: "#111111",
      padding: "24px 32px",
      fontSize: 12,
    },
    center: { textAlign: "center" },
    brand: {
      fontSize: 26,
      fontWeight: 900,
      color: "#C1121F",
      letterSpacing: -1,
    },
    sub: {
      fontSize: 9,
      color: "#555555",
      letterSpacing: 3,
      textTransform: "uppercase",
      marginTop: 2,
    },
    badge: {
      display: "inline-block",
      marginTop: 8,
      padding: "2px 14px",
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: isCompany ? "#ffffff" : "#C1121F",
      background: isCompany ? "#111111" : "#ffffff",
      border: `1.5px solid ${isCompany ? "#111111" : "#C1121F"}`,
    },
    hr: { borderTop: "1px solid #aaaaaa", margin: "10px 0" },
    hrDash: { borderTop: "1px dashed #aaaaaa", margin: "10px 0" },
    secTitle: {
      fontSize: 9,
      color: "#555555",
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 5,
      fontWeight: 700,
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
      gap: 8,
    },
    lbl: { color: "#555555", flexShrink: 0, fontSize: 11 },
    val: {
      color: "#111111",
      fontWeight: 600,
      textAlign: "right",
      wordBreak: "break-all",
      fontSize: 11,
    },
    valMono: {
      color: "#111111",
      fontWeight: 700,
      textAlign: "right",
      fontFamily: "monospace",
      letterSpacing: "0.06em",
      fontSize: 11,
      wordBreak: "break-all",
    },
    valGreen: {
      color: "#166534",
      fontWeight: 700,
      textAlign: "right",
      fontSize: 11,
    },
    codBox: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 14px",
      borderRadius: 4,
      background: "#f3f3f3",
      border: "2px solid #111111",
      marginTop: 10,
    },
    codLbl: {
      fontSize: 9,
      color: "#555555",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    codSub: { fontSize: 9, color: "#888888", marginTop: 2 },
    codAmt: { fontSize: 22, fontWeight: 900, color: "#C1121F" },
    footer: {
      textAlign: "center",
      marginTop: 14,
      fontSize: 9,
      color: "#888888",
    },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.center}>
        <div style={S.brand}>AURIX</div>
        <div style={S.sub}>Premium Headphones</div>
        <div style={S.badge}>{copy}</div>
      </div>

      <div style={S.hr} />

      {/* Order */}
      <div style={S.secTitle}>Order Info</div>
      <div style={S.row}>
        <span style={S.lbl}>Order ID</span>
        <span style={{ ...S.val, fontWeight: 800 }}>
          {order.orderId || order.id}
        </span>
      </div>
      <div style={S.row}>
        <span style={S.lbl}>Date</span>
        <span style={S.val}>{orderDate}</span>
      </div>
      <div style={S.row}>
        <span style={S.lbl}>Status</span>
        <span style={S.val}>{(order.status || "pending").toUpperCase()}</span>
      </div>

      <div style={S.hrDash} />

      {/* Customer */}
      <div style={S.secTitle}>Customer Details</div>
      <div style={S.row}>
        <span style={S.lbl}>Name</span>{" "}
        <span style={S.val}>{order.customerName || "—"}</span>
      </div>
      <div style={S.row}>
        <span style={S.lbl}>Phone</span>{" "}
        <span style={S.val}>{order.customerPhone || "—"}</span>
      </div>
      <div style={S.row}>
        <span style={S.lbl}>Address</span>
        <span style={{ ...S.val, maxWidth: "60%", lineHeight: 1.5 }}>
          {order.deliveryAddress || "—"}
        </span>
      </div>
      <div style={S.row}>
        <span style={S.lbl}>Zone</span>{" "}
        <span style={S.val}>{order.deliveryLabel || "—"}</span>
      </div>

      <div style={S.hrDash} />

      {/* Delivery payment */}
      <div style={S.secTitle}>Advance Payment — Delivery Fee</div>
      <div style={S.row}>
        <span style={S.lbl}>Paid Via</span>{" "}
        <span style={S.val}>{order.paymentLabel || "—"}</span>
      </div>
      <div style={S.row}>
        <span style={S.lbl}>Sender No.</span>{" "}
        <span style={S.val}>{order.senderNumber || "—"}</span>
      </div>
      <div style={S.row}>
        <span style={S.lbl}>TRX ID</span>{" "}
        <span style={S.valMono}>{order.trxId || "—"}</span>
      </div>
      <div style={S.row}>
        <span style={S.lbl}>Amount Paid</span>{" "}
        <span style={S.valGreen}>৳{deliveryFee} ✓ PAID</span>
      </div>

      <div style={S.hrDash} />

      {/* Items */}
      <div style={S.secTitle}>Items Ordered</div>
      {(order.items || []).map((item, i) => (
        <div key={i} style={S.row}>
          <span style={S.lbl}>
            {item.name} × {item.qty}
          </span>
          <span style={S.val}>
            ৳{(item.subtotal ?? item.price * item.qty)?.toLocaleString()}
          </span>
        </div>
      ))}

      <div style={S.hr} />

      {/* Financials */}
      <div style={S.row}>
        <span style={S.lbl}>Product Total</span>
        <span style={S.val}>৳{subtotal?.toLocaleString()}</span>
      </div>
      <div style={S.row}>
        <span style={{ ...S.lbl, color: "#166534" }}>
          Delivery Fee (Pre-Paid ✓)
        </span>
        <span style={S.valGreen}>৳{deliveryFee?.toLocaleString()}</span>
      </div>

      {/* COD box — big prominent */}
      <div style={S.codBox}>
        <div>
          <div style={S.codLbl}>Customer Pays at Door</div>
          <div style={S.codSub}>
            Delivery ৳{deliveryFee} already paid via {order.paymentLabel}
          </div>
        </div>
        <div style={S.codAmt}>৳{subtotal?.toLocaleString()}</div>
      </div>

      <div style={{ ...S.row, marginTop: 8 }}>
        <span style={{ ...S.lbl, color: "#888888" }}>Full Order Value</span>
        <span style={{ ...S.val, color: "#888888" }}>
          ৳{totalAmount?.toLocaleString()}
        </span>
      </div>

      {/* Footer */}
      <div style={S.footer}>Thank you for choosing AURIX · aurix.com</div>
    </div>
  );
}

/* ── small helpers ── */
function MemoRow({ label, value, bold, mono, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4,
        fontSize: 12,
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      <span style={{ color: "#555555", flexShrink: 0 }}>{label}</span>
      <span
        style={{
          color: highlight ? "#166534" : bold ? "#111111" : "#333333",
          fontWeight: bold ? 700 : 400,
          fontFamily: mono ? "monospace" : "inherit",
          textAlign: "right",
          wordBreak: "break-all",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function DrawerSection({ title, children }) {
  return (
    <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0d0d0d]">
        <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold">
          {title}
        </p>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function DrawerRow({ label, value, mono, highlight }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] text-muted flex-shrink-0">{label}</span>
      <span
        className={`text-right text-[12px] break-all
        ${highlight ? "text-white font-bold text-[13px]" : "text-off font-medium"}
        ${mono ? "font-mono tracking-wider" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
