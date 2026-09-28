import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminRefunds() {
  const { user, profile } = useAuth();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    refundAmount: "",
    refundTo: "",
    refundTrxId: "",
    adminMessage: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(
    () =>
      onSnapshot(collection(db, "refunds"), (s) => {
        const data = s.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const at = a.cancelledAt?.toDate
            ? a.cancelledAt.toDate()
            : new Date(0);
          const bt = b.cancelledAt?.toDate
            ? b.cancelledAt.toDate()
            : new Date(0);
          return bt - at;
        });
        setRefunds(data);
        setLoading(false);
      }),
    [],
  );

  const filtered = refunds.filter((r) => {
    const s = search.toLowerCase();
    const matchS =
      !s ||
      r.orderId?.toLowerCase().includes(s) ||
      r.customerName?.toLowerCase().includes(s) ||
      r.customerPhone?.includes(s);
    const matchF =
      filter === "all"
        ? true
        : filter === "pending"
          ? r.status === "pending"
          : r.status === "refunded";
    return matchS && matchF;
  });

  const pendingCount = refunds.filter((r) => r.status === "pending").length;
  const pendingAmount = refunds
    .filter((r) => r.status === "pending")
    .reduce((s, r) => s + (r.refundAmount || 0), 0);
  const doneAmount = refunds
    .filter((r) => r.status === "refunded")
    .reduce((s, r) => s + (r.refundAmount || 0), 0);

  const openRefund = (r) => {
    setSelected(r);
    setForm({
      refundAmount: String(r.refundAmount || r.deliveryFee || ""),
      refundFrom: "",
      refundTo: r.senderNumber || "",
      refundTrxId: "",
      adminMessage: "",
    });
  };

  const processRefund = async () => {
    if (
      !form.refundAmount ||
      !form.refundFrom ||
      !form.refundTo ||
      !form.refundTrxId
    ) {
      toast.error("Fill all required fields");
      return;
    }
    if (selected.status === "refunded") {
      toast.error("Already refunded");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "refunds", selected.id), {
        status: "refunded",
        refundAmount: Number(form.refundAmount),
        refundFrom: form.refundFrom,
        refundTo: form.refundTo,
        refundTrxId: form.refundTrxId,
        adminMessage: form.adminMessage,
        refundedAt: serverTimestamp(),
        refundedBy: { uid: user?.uid, name: profile?.name || user?.email },
      });
      toast.success("Refund processed successfully");
      setSelected(null);
    } catch {
      toast.error("Failed to process refund");
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (ts) =>
    ts?.toDate
      ? ts.toDate().toLocaleDateString("en-BD", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Dhaka",
        })
      : "—";

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/20 border-t-red rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">
            Refund Requests
          </h1>
          <p className="text-[12px] text-muted mt-0.5">
            {refunds.length} total · {pendingCount} pending
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending Refunds", value: pendingCount, color: "#f59e0b" },
          {
            label: "Pending Amount",
            value: "৳" + pendingAmount.toLocaleString(),
            color: "#C1121F",
          },
          {
            label: "Refunded Amount",
            value: "৳" + doneAmount.toLocaleString(),
            color: "#22c55e",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[8px] border border-[#1a1a1a] px-4 py-4 relative overflow-hidden"
            style={{ background: "#0e0e0e" }}
          >
            <div
              className="absolute top-0 right-0 w-10 h-10 rounded-full opacity-10"
              style={{
                background: s.color,
                filter: "blur(12px)",
                transform: "translate(30%,-30%)",
              }}
            />
            <p className="text-[18px] font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider2 mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
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
        <div className="flex gap-1.5">
          {["all", "pending", "refunded"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-[6px] text-[11px] font-semibold uppercase tracking-wider border transition-all
                ${filter === f ? "bg-red text-white border-red" : "bg-[#0e0e0e] text-muted border-[#1a1a1a] hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
        style={{ background: "#0a0a0a" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[750px]">
            <thead>
              <tr className="border-b border-[#151515]">
                {[
                  "Order ID",
                  "Customer",
                  "Contact",
                  "Delivery Paid",
                  "Refund Amount",
                  "Cancelled",
                  "Status",
                  "Action",
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
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[#0d0d0d] transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[11px] text-red">
                    {r.orderId}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {r.customerName}
                  </td>
                  <td className="px-4 py-3 text-off">{r.customerPhone}</td>
                  <td className="px-4 py-3 text-off">
                    ৳{r.deliveryFee?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-white">
                    ৳{r.refundAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted text-[11px]">
                    {fmtDate(r.cancelledAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                      ${r.status === "refunded" ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "pending" ? (
                      <button
                        onClick={() => openRefund(r)}
                        className="px-3 py-1.5 bg-red text-white text-[10px] font-semibold rounded-[4px] hover:bg-red/90 transition-colors"
                      >
                        Process Refund
                      </button>
                    ) : (
                      <button
                        onClick={() => openRefund(r)}
                        className="px-3 py-1.5 bg-[#141414] border border-[#222] text-muted text-[10px] rounded-[4px] hover:text-white transition-colors"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-muted text-[12px] py-10">
              No refund requests found
            </p>
          )}
        </div>
      </div>

      {/* Refund modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-[480px] rounded-[8px] border border-[#1a1a1a] overflow-hidden max-h-[90vh] flex flex-col"
            style={{ background: "#0a0a0a" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] flex-shrink-0">
              <div>
                <p className="text-[13px] font-bold text-white">
                  {selected.status === "refunded"
                    ? "Refund Details"
                    : "Process Refund"}
                </p>
                <p className="text-[11px] text-muted mt-0.5 font-mono">
                  {selected.orderId}
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
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {/* Order info */}
              <div className="rounded-[6px] border border-[#1a1a1a] p-4 space-y-2 text-[12px]">
                {[
                  ["Customer", selected.customerName],
                  ["Phone", selected.customerPhone],
                  [
                    "Items",
                    (selected.items || []).map((i) => i.name).join(", "),
                  ],
                  ["Delivery Paid", "৳" + (selected.deliveryFee || 0)],
                  ["Refund Amount", "৳" + (selected.refundAmount || 0)],
                  ["Sender No.", selected.senderNumber],
                  ["TRX ID", selected.trxId],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between gap-4">
                    <span className="text-muted">{l}</span>
                    <span className="text-off font-medium text-right break-all">
                      {v || "—"}
                    </span>
                  </div>
                ))}
              </div>

              {selected.status === "refunded" ? (
                <div className="rounded-[6px] border border-green-500/20 bg-green-500/5 p-4 space-y-2 text-[12px]">
                  <p className="text-green-400 font-bold mb-2">
                    ✅ Refund Completed
                  </p>
                  {[
                    ["Refunded Amount", "৳" + (selected.refundAmount || 0)],
                    ["Refunded From", selected.refundFrom],
                    ["Refunded To", selected.refundTo],
                    ["TRX ID", selected.refundTrxId],
                    ["By", selected.refundedBy?.name],
                    ["Message", selected.adminMessage],
                  ]
                    .filter((r) => r[1])
                    .map(([l, v]) => (
                      <div key={l} className="flex justify-between gap-4">
                        <span className="text-muted">{l}</span>
                        <span className="text-off font-medium text-right">
                          {v}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <>
                  {/* Refund form */}
                  {[
                    {
                      label: "Refund Amount (৳) *",
                      key: "refundAmount",
                      type: "number",
                      placeholder: "80",
                    },
                    {
                      label: "Refund From (Admin bKash/Nagad No.) *",
                      key: "refundFrom",
                      type: "tel",
                      placeholder: "Admin number sending from",
                    },
                    {
                      label: "Refund To (Customer number) *",
                      key: "refundTo",
                      type: "tel",
                      placeholder: "01XXXXXXXXX",
                    },
                    {
                      label: "Refund TRX ID *",
                      key: "refundTrxId",
                      type: "text",
                      placeholder: "Transaction ID",
                    },
                    {
                      label: "Message to Customer (optional)",
                      key: "adminMessage",
                      type: "text",
                      placeholder: "Your delivery fee has been refunded.",
                    },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-[11px] text-muted font-medium block mb-1.5">
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        value={form[f.key]}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, [f.key]: e.target.value }))
                        }
                        placeholder={f.placeholder}
                        className="w-full bg-[#111] border border-[#1a1a1a] rounded-[4px] px-3 py-2.5 text-[13px] text-white placeholder-muted outline-none focus:border-[#333]"
                      />
                    </div>
                  ))}
                  <button
                    onClick={processRefund}
                    disabled={saving}
                    className="w-full py-3 bg-red text-white rounded-[6px] text-[12px] font-semibold hover:bg-red/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Refund"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
