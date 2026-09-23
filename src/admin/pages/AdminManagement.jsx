import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // Read from admins collection (filled by each admin via their profile)
  useEffect(() => {
    return onSnapshot(collection(db, "admins"), (snap) => {
      setAdmins(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/20 border-t-red rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">
          Admin Management
        </h1>
        <p className="text-[12px] text-muted mt-0.5">
          {admins.length} registered admin{admins.length !== 1 ? "s" : ""} ·
          Read-only view
        </p>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-[8px] border border-blue-500/20 bg-blue-500/5">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          className="flex-shrink-0 mt-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-[12px] text-blue-300 leading-relaxed">
          Admin details are managed by each admin from their own{" "}
          <strong>Admin Profile</strong> page. This page shows a read-only view
          of all registered admins for company security verification.
        </p>
      </div>

      {/* Admin grid */}
      {admins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#333"
            strokeWidth="1.2"
            className="mb-3"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p className="text-muted text-[13px] mb-1">No admin profiles found</p>
          <p className="text-muted text-[11px]">
            Admins need to fill in their details from Admin Profile page
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {admins.map((admin, index) => (
            <AdminCard
              key={admin.id}
              admin={admin}
              index={index + 1}
              onClick={() => setSelected(admin)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <AdminDetailModal admin={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/* ── Admin Card ── */
function AdminCard({ admin, index, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-[8px] border border-[#1a1a1a] overflow-hidden text-left w-full
                 hover:border-[#2a2a2a] transition-all duration-200 group"
      style={{ background: "linear-gradient(160deg, #0e0e0e, #0a0a0a)" }}
    >
      {/* Top strip */}
      <div className="h-1 w-full bg-gradient-to-r from-red/60 to-red/10" />

      <div className="p-5">
        {/* Avatar + Admin No. */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div
              className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#222]
                            flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #C1121F, #8b0000)",
              }}
            >
              {admin.photoURL ? (
                <img
                  src={admin.photoURL}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[20px] font-bold text-white">
                  {(admin.name || "A")[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span
              className="inline-block px-2.5 py-1 bg-red/10 border border-red/20
                             rounded-full text-[10px] font-black text-red uppercase tracking-wider"
            >
              Admin #{String(admin.adminNo || index).padStart(3, "0")}
            </span>
          </div>
        </div>

        {/* Info */}
        <p className="font-display font-bold text-[15px] text-white tracking-[-0.02em] leading-tight">
          {admin.name || "Unnamed Admin"}
        </p>
        <p className="text-[11px] text-muted mt-0.5 truncate">{admin.email}</p>

        <div className="mt-3 pt-3 border-t border-[#141414] flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted">Phone</p>
            <p className="text-[12px] text-off font-medium">
              {admin.phone || "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted">NID</p>
            <p className="text-[12px] text-off font-medium">
              {admin.nidNumber ? `****${admin.nidNumber.slice(-4)}` : "—"}
            </p>
          </div>
        </div>

        {/* Click hint */}
        <p
          className="text-[10px] text-muted mt-3 flex items-center gap-1
                      group-hover:text-off transition-colors duration-150"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Click to view full details
        </p>
      </div>
    </button>
  );
}

/* ── Admin Detail Modal ── */
function AdminDetailModal({ admin, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] rounded-[8px] border border-[#1a1a1a] overflow-hidden
                      max-h-[85vh] flex flex-col"
        style={{ background: "#0a0a0a" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <p className="text-[13px] font-bold text-white">Admin Details</p>
          <button onClick={onClose} className="text-muted hover:text-white">
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

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Avatar + basic */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#222] flex-shrink-0
                            flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #C1121F, #8b0000)",
              }}
            >
              {admin.photoURL ? (
                <img
                  src={admin.photoURL}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[28px] font-bold text-white">
                  {(admin.name || "A")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-display font-bold text-[18px] text-white">
                {admin.name || "—"}
              </p>
              <span
                className="inline-block mt-1 px-2.5 py-0.5 bg-red/10 border border-red/20
                               rounded-full text-[10px] font-bold text-red uppercase tracking-wider"
              >
                Admin #{String(admin.adminNo || "—").padStart(3, "0")}
              </span>
            </div>
          </div>

          {/* Details */}
          <DetailSection title="Personal Information">
            <DetailRow label="Full Name" value={admin.name} />
            <DetailRow label="Email" value={admin.email} />
            <DetailRow label="Phone" value={admin.phone} />
            <DetailRow label="Address" value={admin.address} />
          </DetailSection>

          <DetailSection title="Identity Verification">
            <DetailRow
              label="Admin No."
              value={
                admin.adminNo
                  ? `#${String(admin.adminNo).padStart(3, "0")}`
                  : "—"
              }
            />
            <DetailRow label="NID Number" value={admin.nidNumber} sensitive />
          </DetailSection>

          {/* NID Photo */}
          {admin.nidPhotoURL && (
            <DetailSection title="NID Document">
              <div className="rounded-[6px] overflow-hidden border border-[#222] mt-1">
                <img
                  src={admin.nidPhotoURL}
                  alt="NID Document"
                  className="w-full object-contain max-h-[200px] bg-[#111]"
                />
              </div>
              <p className="text-[10px] text-muted mt-2 flex items-center gap-1">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Confidential — Company security record
              </p>
            </DetailSection>
          )}

          {/* Joined */}
          {admin.updatedAt && (
            <p className="text-[11px] text-muted">
              Last updated:{" "}
              {admin.updatedAt.toDate
                ? admin.updatedAt
                    .toDate()
                    .toLocaleDateString("en-BD", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                : "—"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0d0d0d]">
        <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold">
          {title}
        </p>
      </div>
      <div className="px-4 py-3 space-y-2.5">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, sensitive }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] text-muted flex-shrink-0">{label}</span>
      <span className="text-[12px] text-off font-medium text-right break-all">
        {sensitive
          ? `${String(value).slice(0, 4)}****${String(value).slice(-3)}`
          : value}
      </span>
    </div>
  );
}
