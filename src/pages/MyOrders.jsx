import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

/* ── Status config ── */
const STATUS_STEPS = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
];

const STATUS_INFO = {
  pending: {
    color: "#f59e0b",
    label: "Pending",
    icon: "⏳",
    desc: "Order received, verifying payment",
  },
  confirmed: {
    color: "#3b82f6",
    label: "Confirmed",
    icon: "✅",
    desc: "Payment verified, preparing your order",
  },
  preparing: {
    color: "#8b5cf6",
    label: "Preparing",
    icon: "📦",
    desc: "Your order is being packed",
  },
  shipped: {
    color: "#06b6d4",
    label: "Shipped",
    icon: "🚚",
    desc: "Out for delivery to your address",
  },
  delivered: {
    color: "#22c55e",
    label: "Delivered",
    icon: "🎉",
    desc: "Order delivered successfully",
  },
  cancelled: {
    color: "#C1121F",
    label: "Cancelled",
    icon: "❌",
    desc: "This order has been cancelled",
  },
};

export default function MyOrders() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    // Load orders — filter client-side by userId OR userEmail
    const unsub = onSnapshot(
      collection(db, "orders"),
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((o) => o.userId === user.uid || o.userEmail === user.email);
        data.sort((a, b) => {
          const at = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const bt = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return bt - at;
        });
        setOrders(data);
        setFetching(false);
      },
      (err) => {
        setFetching(false);
      },
    );

    return unsub;
  }, [user, loading, navigate]);

  if (loading || fetching)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ paddingTop: "var(--nav-h)" }}
      >
        <div className="w-6 h-6 border-2 border-white/20 border-t-red rounded-full animate-spin" />
      </div>
    );

  return (
    <main style={{ paddingTop: "var(--nav-h)" }}>
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container-inner py-4 flex items-center gap-2 text-[11px] text-muted">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-white">My Orders</span>
        </div>
      </div>

      <div className="container-inner py-14">
        {/* Header */}
        <div className="mb-10">
          <div className="eyebrow mb-3">
            <span className="eyebrow-line" />
            <span className="eyebrow-text">Order History</span>
          </div>
          <h1 className="font-display font-extrabold text-[32px] tracking-[-0.03em] text-white">
            My Orders
          </h1>
          <p className="text-[13px] text-muted mt-1">
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#444"
                strokeWidth="1.2"
              >
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            </div>
            <p className="text-off text-[14px]">No orders yet</p>
            <Link
              to="/shop"
              className="btn-primary"
              style={{ fontSize: "11px", padding: "11px 22px" }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={selected === order.id}
                onToggle={() =>
                  setSelected(selected === order.id ? null : order.id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ── Order Card ── */
function OrderCard({ order, expanded, onToggle }) {
  const { user } = useAuth();
  const info = STATUS_INFO[order.status] || STATUS_INFO.pending;
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const subtotal =
    order.subtotal ?? order.totalAmount - (order.deliveryFee ?? 0);
  const codAmount = order.totalAmount - (order.deliveryFee ?? 0);

  // Cancellable: only pending or confirmed
  const canCancel = ["pending", "confirmed"].includes(order.status);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = async () => {
    if (!user) return;
    setCancelling(true);
    try {
      const orderId = order.orderId || order.id;
      // 1. Update order status to cancelled
      await updateDoc(doc(db, "orders", order.id), {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
        cancelledBy: "customer",
        cancelledByUid: user.uid,
      });
      // 2. Create refund request (delivery fee was pre-paid)
      const refundAmount = order.deliveryFee ?? 0;
      await setDoc(doc(db, "refunds", orderId), {
        orderId,
        orderDocId: order.id,
        customerId: user.uid,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        senderNumber: order.senderNumber,
        trxId: order.trxId,
        paymentLabel: order.paymentLabel,
        deliveryFee: refundAmount,
        refundAmount,
        totalAmount: order.totalAmount,
        subtotal: order.subtotal,
        items: order.items || [],
        cancelledAt: serverTimestamp(),
        status: "pending", // pending | refunded
        refundedAt: null,
        refundTrxId: null,
        refundTo: null,
        adminMessage: null,
        refundedBy: null,
      });
      toast.success("Order cancelled. Refund request created.");
      setShowConfirm(false);
    } catch {
      toast.error("Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const orderDate = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleDateString("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Dhaka",
      })
    : "—";

  return (
    <div
      className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
      style={{ background: "linear-gradient(160deg,#0e0e0e,#0a0a0a)" }}
    >
      {/* Card header — always visible */}
      <button onClick={onToggle} className="w-full text-left">
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4
                        hover:bg-white/[0.02] transition-colors duration-150"
        >
          <div className="flex items-center gap-4">
            {/* Status icon */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[18px]"
              style={{
                background: `${info.color}15`,
                border: `1px solid ${info.color}30`,
              }}
            >
              {info.icon}
            </div>
            <div>
              <p className="font-mono font-bold text-[13px] text-red">
                {order.orderId || order.id}
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                {orderDate} · {(order.items || []).length} item(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Status badge */}
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
              style={{
                color: info.color,
                background: `${info.color}10`,
                borderColor: `${info.color}30`,
              }}
            >
              {info.label}
            </span>
            {/* Total */}
            <div className="text-right">
              <p className="font-display font-bold text-[15px] text-white">
                ৳{order.totalAmount?.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted">Order Total</p>
            </div>
            {/* Chevron */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#555"
              strokeWidth="2"
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s ease",
                flexShrink: 0,
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expandable details */}
      {expanded && (
        <div className="border-t border-[#1a1a1a]">
          {/* ── Order Tracking ── */}
          {!isCancelled ? (
            <div className="px-5 py-5 border-b border-[#141414]">
              <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold mb-4">
                Order Tracking
              </p>
              <div className="relative">
                {/* Progress line */}
                <div
                  className="absolute top-4 left-4 right-4 h-[1px] bg-[#1a1a1a]"
                  style={{ zIndex: 0 }}
                >
                  <div
                    className="h-full transition-all duration-700 ease-in-out"
                    style={{
                      background: "#C1121F",
                      width:
                        stepIndex >= 0
                          ? `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%`
                          : "0%",
                    }}
                  />
                </div>

                {/* Steps */}
                <div
                  className="relative flex justify-between"
                  style={{ zIndex: 1 }}
                >
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= stepIndex;
                    const current = i === stepIndex;
                    const sInfo = STATUS_INFO[step];
                    return (
                      <div
                        key={step}
                        className="flex flex-col items-center gap-2"
                      >
                        {/* Circle */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                          style={{
                            background: done ? "#C1121F" : "#111",
                            border: current
                              ? "2px solid #C1121F"
                              : done
                                ? "none"
                                : "1px solid #2a2a2a",
                            boxShadow: current
                              ? "0 0 12px rgba(193,18,31,0.5)"
                              : "none",
                          }}
                        >
                          {done ? (
                            i === stepIndex ? (
                              <span className="text-[12px]">{sInfo.icon}</span>
                            ) : (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                          )}
                        </div>
                        {/* Label */}
                        <span
                          className="text-[9px] uppercase tracking-wider font-semibold text-center"
                          style={{
                            color: done
                              ? current
                                ? "#C1121F"
                                : "#aaa"
                              : "#444",
                          }}
                        >
                          {sInfo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current status description */}
              <div
                className="mt-4 px-4 py-3 rounded-[6px] border"
                style={{
                  background: `${info.color}08`,
                  borderColor: `${info.color}20`,
                }}
              >
                <p
                  className="text-[12px] font-semibold"
                  style={{ color: info.color }}
                >
                  {info.desc}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 border-b border-[#141414]">
              <div className="flex items-center gap-3 px-4 py-3 rounded-[6px] bg-red/5 border border-red/20">
                <span className="text-[18px]">❌</span>
                <div>
                  <p className="text-[12px] font-bold text-red">
                    Order Cancelled
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    This order has been cancelled
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Items ── */}
          <div className="px-5 py-4 border-b border-[#141414]">
            <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold mb-3">
              Items Ordered
            </p>
            <div className="space-y-3">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-[4px] border border-[#1a1a1a] bg-[#111]
                                  flex items-center justify-center overflow-hidden flex-shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-muted">
                      Qty: {item.qty} × ৳{item.price?.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[13px] font-bold text-white flex-shrink-0">
                    ৳
                    {(item.subtotal ?? item.price * item.qty)?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Payment + Delivery ── */}
          <div className="px-5 py-4 border-b border-[#141414] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold mb-2">
                Payment
              </p>
              <p className="text-[12px] text-off">
                {order.paymentLabel} · TRX:{" "}
                <span className="font-mono text-white">{order.trxId}</span>
              </p>
              <p className="text-[12px] text-green-400 mt-1 font-semibold">
                ✓ Delivery fee ৳{order.deliveryFee} already paid
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold mb-2">
                Delivery
              </p>
              <p className="text-[12px] text-off">{order.deliveryLabel}</p>
              <p className="text-[12px] text-muted mt-1">
                {order.deliveryAddress}
              </p>
            </div>
          </div>

          {/* ── Bill Summary ── */}
          <div className="px-5 py-4">
            <div className="flex justify-between text-[12px] text-muted mb-1.5">
              <span>Product Total</span>
              <span>৳{subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[12px] text-green-400 mb-1.5 font-semibold">
              <span>Delivery (Pre-Paid)</span>
              <span>৳{order.deliveryFee?.toLocaleString()} ✓</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[12px] text-green-400 mb-1.5">
                <span>Discount ({order.couponCode})</span>
                <span>− ৳{order.discount?.toLocaleString()}</span>
              </div>
            )}
            <div
              className="flex justify-between font-display font-extrabold text-[16px] text-white
                            pt-3 border-t border-[#1a1a1a] mt-2"
            >
              <span>Pay at Door</span>
              <span className="text-red">৳{codAmount?.toLocaleString()}</span>
            </div>
          </div>

          {/* ── Cancel Button ── */}
          {canCancel && (
            <div className="px-5 pb-4">
              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full py-2.5 rounded-[6px] border border-red/30 bg-red/5
                             text-[12px] font-semibold text-red hover:bg-red/10 transition-all"
                >
                  Cancel Order
                </button>
              ) : (
                <div className="rounded-[6px] border border-red/30 bg-red/5 p-4 space-y-3">
                  <p className="text-[12px] text-white font-semibold">
                    Cancel this order?
                  </p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    You paid ৳{order.deliveryFee} delivery fee in advance. A
                    refund request will be created automatically.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-2 rounded-[6px] border border-[#222] text-[11px] text-muted hover:text-white transition-colors"
                    >
                      Keep Order
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex-1 py-2 rounded-[6px] bg-red text-white text-[11px] font-semibold
                                 hover:bg-red/90 transition-colors disabled:opacity-60"
                    >
                      {cancelling ? "Cancelling..." : "Yes, Cancel"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Refund Status (for cancelled orders) ── */}
          {isCancelled && order.deliveryFee > 0 && (
            <RefundStatus
              orderId={order.orderId || order.id}
              deliveryFee={order.deliveryFee}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ── Refund Status Component ── */
function RefundStatus({ orderId, deliveryFee }) {
  const [refund, setRefund] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "refunds", orderId), (snap) => {
      if (snap.exists()) setRefund(snap.data());
    });
    return unsub;
  }, [orderId]);

  if (!refund)
    return (
      <div className="px-5 pb-4">
        <div className="px-4 py-3 rounded-[6px] border border-yellow-500/20 bg-yellow-500/5">
          <p className="text-[11px] font-semibold text-yellow-500">
            ⏳ Refund Pending
          </p>
          <p className="text-[10px] text-muted mt-0.5">
            ৳{deliveryFee} delivery fee refund request submitted. Admin will
            process soon.
          </p>
        </div>
      </div>
    );

  const fmtDate = (ts) =>
    ts?.toDate
      ? ts.toDate().toLocaleString("en-BD", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Dhaka",
        })
      : "—";

  if (refund.status === "refunded")
    return (
      <div className="px-5 pb-4">
        <div className="rounded-[6px] border border-green-500/20 bg-green-500/5 p-4 space-y-2">
          <p className="text-[12px] font-bold text-green-400">
            ✅ Refund Completed
          </p>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted">Amount Refunded</span>
              <span className="font-bold text-white">
                ৳{refund.refundAmount?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Refunded To</span>
              <span className="text-off">{refund.refundTo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">TRX ID</span>
              <span className="font-mono text-white">{refund.refundTrxId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Date</span>
              <span className="text-off">{fmtDate(refund.refundedAt)}</span>
            </div>
            {refund.adminMessage && (
              <div className="pt-2 border-t border-[#1a1a1a]">
                <p className="text-[10px] text-muted mb-0.5">
                  Message from AURIX
                </p>
                <p className="text-[12px] text-off italic">
                  "{refund.adminMessage}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );

  return (
    <div className="px-5 pb-4">
      <div className="px-4 py-3 rounded-[6px] border border-yellow-500/20 bg-yellow-500/5">
        <p className="text-[11px] font-semibold text-yellow-500">
          ⏳ Refund Pending
        </p>
        <p className="text-[10px] text-muted mt-0.5">
          ৳{refund.refundAmount} refund request submitted. Admin will process
          shortly.
        </p>
      </div>
    </div>
  );
}
