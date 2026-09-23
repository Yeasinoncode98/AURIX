import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, doc, setDoc,
  updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../firebase'
import toast from 'react-hot-toast'

const EMPTY = {
  code: '', type: 'percent', value: '', minOrder: '', description: '', active: false,
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm,setShowForm]= useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting,setDeleting]= useState(null)

  useEffect(() => {
    return onSnapshot(collection(db, 'coupons'), snap => {
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  const toggleActive = async (coupon) => {
    try {
      await updateDoc(doc(db, 'coupons', coupon.id), { active: !coupon.active })
      toast.success(coupon.active ? 'Coupon deactivated' : 'Coupon activated successfully')
    } catch { toast.error('Failed to update coupon') }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'coupons', id))
      toast.success('Coupon deleted')
      setDeleting(null)
    } catch { toast.error('Failed to delete') }
  }

  const activeCoupons = coupons.filter(c => c.active)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-white/20 border-t-red rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">
            Discount Coupons
          </h1>
          <p className="text-[12px] text-muted mt-0.5">
            {coupons.length} coupons · {activeCoupons.length} active
          </p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red text-white rounded-[6px]
                     text-[12px] font-semibold hover:bg-red/90 transition-colors duration-150">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Coupon
        </button>
      </div>

      {/* Active marquee preview */}
      {activeCoupons.length > 0 && (
        <div className="rounded-[8px] border border-green-500/20 bg-green-500/5 overflow-hidden">
          <div className="px-4 py-2 border-b border-green-500/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            <p className="text-[11px] font-semibold text-green-400 uppercase tracking-wider2">
              Live on Shop — Marquee Preview
            </p>
          </div>
          <div className="overflow-hidden py-3 relative">
            <div className="flex gap-8 animate-marquee whitespace-nowrap px-4">
              {[...activeCoupons, ...activeCoupons].map((c, i) => (
                <span key={i} className="text-[13px] font-semibold text-white inline-flex items-center gap-2">
                  <span className="text-red">🏷️</span>
                  Use code <span className="font-mono font-black text-red">{c.code}</span>
                  {' '}—{' '}
                  {c.type === 'percent' ? `${c.value}% OFF` : `৳${c.value} OFF`}
                  {c.minOrder ? ` on orders above ৳${c.minOrder}` : ''}
                  <span className="text-muted mx-4">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coupons grid */}
      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.2" className="mb-3">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <p className="text-muted text-[13px]">No coupons yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map(coupon => (
            <CouponCard key={coupon.id} coupon={coupon}
              onToggle={() => toggleActive(coupon)}
              onEdit={() => { setEditing(coupon); setShowForm(true) }}
              onDelete={() => setDeleting(coupon)}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <CouponFormModal
          coupon={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
          onClick={() => setDeleting(null)}>
          <div className="rounded-[8px] border border-[#1a1a1a] p-6 w-full max-w-[360px]"
            style={{ background: '#0e0e0e' }} onClick={e => e.stopPropagation()}>
            <p className="text-[15px] font-bold text-white mb-2">Delete Coupon?</p>
            <p className="text-[13px] text-muted mb-5">
              Code "<span className="text-red font-mono">{deleting.code}</span>" will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)}
                className="flex-1 py-2.5 rounded-[6px] border border-[#222] text-[12px]
                           text-muted hover:text-white transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleting.id)}
                className="flex-1 py-2.5 rounded-[6px] bg-red text-white text-[12px]
                           font-semibold hover:bg-red/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .animate-marquee { animation: marquee 18s linear infinite; }
      `}</style>
    </div>
  )
}

function CouponCard({ coupon, onToggle, onEdit, onDelete }) {
  return (
    <div className={`rounded-[8px] border overflow-hidden transition-all duration-200
                     ${coupon.active ? 'border-green-500/30' : 'border-[#1a1a1a]'}`}
      style={{ background: 'linear-gradient(160deg, #0e0e0e, #0a0a0a)' }}>
      <div className="px-5 py-4">
        {/* Code + status */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="font-mono font-black text-[20px] tracking-wide text-red">{coupon.code}</span>
            <p className="text-[11px] text-muted mt-0.5">{coupon.description || 'No description'}</p>
          </div>
          <button onClick={onToggle}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0
                        ${coupon.active ? 'bg-green-500' : 'bg-[#222]'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                              transition-all duration-300
                              ${coupon.active ? 'left-[22px]' : 'left-0.5'}`}/>
          </button>
        </div>

        {/* Discount value */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1.5 bg-red/10 border border-red/20 rounded-[6px]
                           text-[14px] font-black text-red">
            {coupon.type === 'percent' ? `${coupon.value}% OFF` : `৳${coupon.value} OFF`}
          </span>
          {coupon.minOrder && (
            <span className="text-[11px] text-muted">min ৳{coupon.minOrder}</span>
          )}
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1.5 text-[11px] font-semibold
                            ${coupon.active ? 'text-green-400' : 'text-muted'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${coupon.active ? 'bg-green-500' : 'bg-[#444]'}`}/>
            {coupon.active ? 'Active on Shop' : 'Inactive'}
          </span>
          <div className="flex gap-1.5">
            <button onClick={onEdit}
              className="px-2.5 py-1 bg-[#141414] border border-[#222] rounded-[4px]
                         text-[10px] text-muted hover:text-white hover:border-[#333] transition-all">
              Edit
            </button>
            <button onClick={onDelete}
              className="px-2.5 py-1 bg-red/5 border border-red/20 rounded-[4px]
                         text-[10px] text-red hover:bg-red/10 transition-all">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CouponFormModal({ coupon, onClose }) {
  const isEdit = !!coupon
  const [form, setForm] = useState(isEdit ? {
    code: coupon.code, type: coupon.type, value: String(coupon.value),
    minOrder: String(coupon.minOrder || ''), description: coupon.description || '',
    active: coupon.active,
  } : { ...EMPTY })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.code.trim() || !form.value) { toast.error('Code and value are required'); return }
    setSaving(true)
    try {
      const id   = form.code.trim().toUpperCase()
      const data = {
        code:        id,
        type:        form.type,
        value:       Number(form.value),
        minOrder:    form.minOrder ? Number(form.minOrder) : 0,
        description: form.description.trim(),
        active:      form.active,
        updatedAt:   serverTimestamp(),
      }
      if (!isEdit) data.createdAt = serverTimestamp()
      await setDoc(doc(db, 'coupons', id), data, { merge: true })
      toast.success(isEdit ? 'Coupon updated successfully' : 'Coupon added successfully')
      onClose()
    } catch { toast.error('Failed to save coupon') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-[8px] border border-[#1a1a1a]"
        style={{ background: '#0a0a0a' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <p className="text-[14px] font-bold text-white">{isEdit ? 'Edit Coupon' : 'New Coupon'}</p>
          <button onClick={onClose} className="text-muted hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <FField label="Coupon Code *">
            <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
              placeholder="SAVE20" className={iCls} style={{ fontFamily:'monospace', letterSpacing:'0.1em' }}/>
          </FField>
          <div className="grid grid-cols-2 gap-3">
            <FField label="Discount Type">
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className={iCls + ' cursor-pointer'}>
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </FField>
            <FField label={form.type === 'percent' ? 'Discount %' : 'Amount (৳)'}>
              <input type="number" value={form.value} onChange={e => set('value', e.target.value)}
                placeholder={form.type === 'percent' ? '20' : '100'} className={iCls}/>
            </FField>
          </div>
          <FField label="Min Order Amount (৳) — optional">
            <input type="number" value={form.minOrder} onChange={e => set('minOrder', e.target.value)}
              placeholder="500" className={iCls}/>
          </FField>
          <FField label="Description">
            <input value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Summer sale — 20% off all products" className={iCls}/>
          </FField>
          <label className="flex items-center gap-3 cursor-pointer">
            <button type="button" onClick={() => set('active', !form.active)}
              className={`relative w-11 h-6 rounded-full transition-all duration-300
                          ${form.active ? 'bg-green-500' : 'bg-[#222]'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                                transition-all duration-300 ${form.active ? 'left-[22px]' : 'left-0.5'}`}/>
            </button>
            <span className="text-[12px] text-off">Active on Shop immediately</span>
          </label>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-[#1a1a1a]">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-[6px] border border-[#222] text-[12px]
                       text-muted hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-[6px] bg-red text-white text-[12px] font-semibold
                       hover:bg-red/90 transition-colors disabled:opacity-60
                       flex items-center justify-center gap-2">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</>
              : isEdit ? 'Save Changes' : 'Create Coupon'}
          </button>
        </div>
      </div>
    </div>
  )
}

const iCls = `w-full bg-[#111] border border-[#1a1a1a] rounded-[4px] px-3 py-2
              text-[13px] text-white placeholder-muted outline-none
              focus:border-[#333] transition-colors duration-150`
function FField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-muted font-medium">{label}</label>
      {children}
    </div>
  )
}
