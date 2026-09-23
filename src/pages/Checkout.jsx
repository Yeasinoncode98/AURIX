import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const DELIVERY = {
  dhaka:   { label: 'Inside Dhaka',   fee: 80  },
  outside: { label: 'Outside Dhaka',  fee: 130 },
}

const PAYMENT = {
  bkash: { label: 'bKash',  number: '01869583817', trxLen: 10, color: '#E2136E' },
  nagad: { label: 'Nagad',  number: '01627800198', trxLen: 8,  color: '#F6821F' },
}

/* ── reusable field wrapper ── */
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-wider2 uppercase text-muted">
        {label} {required && <span className="text-red">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red mt-0.5">{error}</p>}
    </div>
  )
}

/* ── shared input style ── */
const inputCls = (err) =>
  `w-full bg-[#111] border ${err ? 'border-red' : 'border-border'} rounded-[4px] px-4 py-3
   text-[14px] text-white placeholder-muted outline-none transition-colors duration-200
   focus:border-[#444] focus:ring-0`

export default function Checkout() {
  const { items, totalAmount, clear } = useCart()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  /* ── form state ── */
  const [form, setForm] = useState({
    name: '', phone: '', address: '',
    delivery: '', payment: '',
    senderNumber: '', trxId: '',
  })
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  /* ── derived ── */
  const deliveryFee  = DELIVERY[form.delivery]?.fee ?? 0
  const totalWithFee = totalAmount + deliveryFee
  const trxLen       = PAYMENT[form.payment]?.trxLen ?? 0

  /* ── validation ── */
  const validate = () => {
    const e = {}
    if (!form.name.trim())                          e.name = 'Name is required'
    if (!/^01[3-9]\d{8}$/.test(form.phone))        e.phone = 'Enter a valid BD phone number'
    if (!form.address.trim())                       e.address = 'Delivery address is required'
    if (!form.delivery)                             e.delivery = 'Select a delivery location'
    if (!form.payment)                              e.payment = 'Select a payment method'
    if (form.payment) {
      if (!/^01[3-9]\d{8}$/.test(form.senderNumber))
        e.senderNumber = 'Enter a valid sender number'
      if (form.trxId.length !== trxLen)
        e.trxId = `Transaction ID must be exactly ${trxLen} characters`
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setPlacing(true)

    try {
      // Generate unique order ID
      const orderId = 'AX-' + Date.now().toString(36).toUpperCase()

      // Build the order document — everything admin will need
      const orderData = {
        orderId,
        status: 'pending',           // pending → confirmed → shipped → delivered
        createdAt: serverTimestamp(),

        // Customer info
        customerName:  form.name,
        customerPhone: form.phone,
        deliveryAddress: form.address,
        userId: currentUser?.uid || null,
        userEmail: currentUser?.email || null,

        // Delivery
        deliveryZone:   form.delivery,                    // 'dhaka' | 'outside'
        deliveryLabel:  DELIVERY[form.delivery].label,    // 'Inside Dhaka' | 'Outside Dhaka'

        // Payment
        paymentMethod:  form.payment,                     // 'bkash' | 'nagad'
        paymentLabel:   PAYMENT[form.payment].label,      // 'bKash' | 'Nagad'
        paymentNumber:  PAYMENT[form.payment].number,     // merchant number
        senderNumber:   form.senderNumber,                // customer's number
        trxId:          form.trxId,                       // transaction ID

        // Order items — snapshot of what was ordered
        items: items.map(item => ({
          id:       item.id,
          slug:     item.slug,
          name:     item.name,
          price:    item.price,
          qty:      item.qty,
          image:    item.image,
          subtotal: item.price * item.qty,
        })),

        // Financials — clear breakdown for admin
        subtotal:    totalAmount,          // product price only (e.g. ৳598)
        deliveryFee: deliveryFee,          // already paid via bKash/Nagad (e.g. ৳130)
        totalAmount: totalWithFee,         // full order value (e.g. ৳728)
        codAmount:   totalAmount,          // customer pays at door = product only (delivery already paid)
      }

      // Save to Firestore → orders/{orderId}
      await setDoc(doc(collection(db, 'orders'), orderId), orderData)

      clear()
      navigate('/order-success', {
        state: {
          orderId,
          name:        form.name,
          payment:     PAYMENT[form.payment].label,
          delivery:    DELIVERY[form.delivery].label,
          total:       totalWithFee,
          subtotal:    totalAmount,
          deliveryFee: deliveryFee,
        },
      })
    } catch (err) {
      console.error('Order save failed:', err)
      setPlacing(false)
      setErrors({ submit: 'Failed to place order. Please try again.' })
    }
  }

  /* ── empty cart guard ── */
  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.2">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      </div>
      <p className="text-off text-[14px]">Your cart is empty.</p>
      <Link to="/shop" className="btn-primary" style={{ fontSize: '11px', padding: '11px 22px' }}>
        Back to Shop
      </Link>
    </div>
  )

  return (
    <main style={{ paddingTop: 'var(--nav-h)' }}>
      {/* breadcrumb */}
      <div className="border-b border-border">
        <div className="container-inner py-4 flex items-center gap-2 text-[11px] text-muted">
          <Link to="/" className="hover:text-white transition-colors duration-150">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-white transition-colors duration-150">Shop</Link>
          <span>/</span>
          <span className="text-white">Checkout</span>
        </div>
      </div>

      <div className="container-inner py-14">
        {/* page heading */}
        <div className="mb-10">
          <div className="eyebrow mb-3"><span className="eyebrow-line" /><span className="eyebrow-text">Secure Checkout</span></div>
          <h1 className="font-display font-extrabold text-[34px] tracking-[-0.03em] text-white">Complete Your Order</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">

            {/* ══ LEFT COLUMN ══ */}
            <div className="space-y-8">

              {/* ── Section 1: Customer Details ── */}
              <Section num="01" title="Customer Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Full Name" required error={errors.name}>
                    <input
                      type="text" placeholder="e.g. Md. Rahim Hossain"
                      value={form.name} onChange={e => set('name', e.target.value)}
                      className={inputCls(errors.name)} />
                  </Field>
                  <Field label="Phone Number" required error={errors.phone}>
                    <input
                      type="tel" placeholder="01XXXXXXXXX"
                      value={form.phone} onChange={e => set('phone', e.target.value)}
                      className={inputCls(errors.phone)} />
                  </Field>
                </div>
                <Field label="Full Delivery Address" required error={errors.address}>
                  <textarea
                    rows={3} placeholder="House, Road, Area, City"
                    value={form.address} onChange={e => set('address', e.target.value)}
                    className={inputCls(errors.address) + ' resize-none'} />
                </Field>
              </Section>

              {/* ── Section 2: Delivery Location ── */}
              <Section num="02" title="Delivery Location">
                {errors.delivery && <p className="text-[11px] text-red -mt-2 mb-1">{errors.delivery}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(DELIVERY).map(([key, info]) => (
                    <DeliveryOption
                      key={key}
                      id={key}
                      label={info.label}
                      fee={info.fee}
                      selected={form.delivery === key}
                      onSelect={() => set('delivery', key)}
                    />
                  ))}
                </div>
                {form.delivery && (
                  <p className="text-[12px] text-off mt-3 pl-1">
                    Delivery fee: <span className="text-white font-semibold">৳{DELIVERY[form.delivery].fee}</span>
                  </p>
                )}
              </Section>

              {/* ── Section 3: Payment ── */}
              <Section num="03" title="Courier Fee Payment">
                <p className="text-[13px] text-muted -mt-1 mb-4 leading-relaxed">
                  Pay the courier fee in advance via bKash or Nagad. Send to the number shown and enter your transaction details below.
                </p>
                {errors.payment && <p className="text-[11px] text-red mb-2">{errors.payment}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {Object.entries(PAYMENT).map(([key, info]) => (
                    <PaymentOption
                      key={key}
                      id={key}
                      info={info}
                      selected={form.payment === key}
                      onSelect={() => { set('payment', key); set('trxId', '') }}
                    />
                  ))}
                </div>

                {form.payment && (
                  <div className="space-y-5 animate-fade-in">
                    {/* Number display card */}
                    <div className="flex items-center justify-between px-5 py-4 rounded-[6px] border border-border"
                      style={{ background: 'linear-gradient(135deg, #161616, #111)' }}>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider2 text-muted mb-1">
                          Send {form.delivery ? `৳${deliveryFee}` : 'courier fee'} to (Send Money)
                        </p>
                        <p className="font-display font-extrabold text-[22px] tracking-[-0.02em] text-white">
                          {PAYMENT[form.payment].number}
                        </p>
                        <p className="text-[11px] text-muted mt-0.5">{PAYMENT[form.payment].label} Number</p>
                      </div>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: PAYMENT[form.payment].color + '22', border: `1px solid ${PAYMENT[form.payment].color}44` }}>
                        <span className="text-[11px] font-bold" style={{ color: PAYMENT[form.payment].color }}>
                          {form.payment === 'bkash' ? 'bK' : 'Ng'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Your Sender Number" required error={errors.senderNumber}>
                        <input
                          type="tel" placeholder="01XXXXXXXXX"
                          value={form.senderNumber} onChange={e => set('senderNumber', e.target.value)}
                          className={inputCls(errors.senderNumber)} />
                      </Field>
                      <Field
                        label={`Transaction ID (${trxLen} characters)`}
                        required error={errors.trxId}>
                        <input
                          type="text"
                          placeholder={form.payment === 'bkash' ? 'e.g. DIK9P12LHN' : 'e.g. 75YQWZD5'}
                          maxLength={trxLen}
                          value={form.trxId}
                          onChange={e => set('trxId', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                          className={inputCls(errors.trxId)}
                          style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }}
                        />
                        <span className="text-[10px] text-muted text-right">{form.trxId.length}/{trxLen}</span>
                      </Field>
                    </div>
                  </div>
                )}
              </Section>
            </div>

            {/* ══ RIGHT COLUMN — Order Summary ══ */}
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+24px)]">
              <div className="rounded-[8px] border border-border overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #141414 0%, #0f0f0f 100%)' }}>
                <div className="px-6 py-5 border-b border-border">
                  <h3 className="font-display font-bold text-[16px] tracking-[-0.02em] text-white">Order Summary</h3>
                  <p className="text-[11px] text-muted mt-0.5">{items.reduce((s,i) => s + i.qty, 0)} item(s)</p>
                </div>

                {/* items list */}
                <div className="px-6 py-4 space-y-4 max-h-[280px] overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-14 h-14 flex-shrink-0 rounded-[4px] border border-border bg-surface
                                      flex items-center justify-center overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-[80%] object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white leading-tight truncate">{item.name}</p>
                        <p className="text-[11px] text-muted">Qty: {item.qty}</p>
                      </div>
                      <span className="text-[13px] font-semibold text-white flex-shrink-0">
                        ৳{(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* totals */}
                <div className="px-6 py-5 border-t border-border space-y-3">
                  <div className="flex justify-between text-[13px] text-muted">
                    <span>Product Subtotal</span>
                    <span className="text-off">৳{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-muted">
                    <span>Delivery Fee <span className="text-[10px]">(advance via {form.payment ? PAYMENT[form.payment].label : 'bKash/Nagad'})</span></span>
                    <span className={form.delivery ? 'text-off' : 'text-muted italic'}>
                      {form.delivery ? `৳${deliveryFee}` : 'Select location'}
                    </span>
                  </div>

                  {/* Total payable now (delivery fee) */}
                  {form.delivery && form.payment && (
                    <div className="flex justify-between text-[12px] pt-2 border-t border-border">
                      <span className="text-green-400 font-semibold">Pay Now (Delivery Only)</span>
                      <span className="text-green-400 font-bold">৳{deliveryFee}</span>
                    </div>
                  )}

                  {/* COD amount */}
                  {form.delivery && (
                    <div className="flex justify-between text-[12px]">
                      <span className="text-muted">Pay at Door (Products)</span>
                      <span className="text-off font-semibold">৳{totalAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-display font-extrabold text-[18px] tracking-[-0.02em]
                                  text-white pt-3 border-t border-border">
                    <span>Order Total</span>
                    <span>৳{totalWithFee.toLocaleString()}</span>
                  </div>
                  {form.delivery && (
                    <p className="text-[10px] text-muted leading-relaxed">
                      ৳{deliveryFee} delivery paid now · ৳{totalAmount.toLocaleString()} paid at door
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  {errors.submit && (
                    <p className="text-[11px] text-red text-center mb-3">{errors.submit}</p>
                  )}
                  <button
                    type="submit"
                    disabled={placing}
                    className="btn-primary w-full justify-center relative overflow-hidden"
                    style={{ padding: '15px 20px', fontSize: '12px', opacity: placing ? 0.8 : 1 }}>
                    {placing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Placing Order...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        Place Order
                      </span>
                    )}
                  </button>
                  <p className="text-[10px] text-muted text-center mt-3 leading-relaxed">
                    By placing this order you agree to our terms and conditions.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease forwards; }
      `}</style>
    </main>
  )
}

/* ── Section wrapper ── */
function Section({ num, title, children }) {
  return (
    <div className="rounded-[8px] border border-border overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #141414 0%, #0f0f0f 100%)' }}>
      <div className="flex items-center gap-4 px-6 py-5 border-b border-border">
        <span className="w-7 h-7 rounded-full border border-red/50 flex items-center justify-center
                         text-[11px] font-bold text-red flex-shrink-0">
          {num}
        </span>
        <h3 className="font-display font-bold text-[16px] tracking-[-0.02em] text-white">{title}</h3>
      </div>
      <div className="px-6 py-6 space-y-5">{children}</div>
    </div>
  )
}

/* ── Delivery option card ── */
function DeliveryOption({ id, label, fee, selected, onSelect }) {
  return (
    <button type="button" onClick={onSelect}
      className={`relative flex items-center gap-4 px-5 py-4 rounded-[6px] border text-left
                  transition-all duration-200 w-full cursor-pointer
                  ${selected
                    ? 'border-red bg-red/5'
                    : 'border-border hover:border-[#333] bg-[#111]'}`}>
      {/* Radio circle */}
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                       ${selected ? 'border-red' : 'border-[#444]'}`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-red" />}
      </div>
      <div>
        <p className={`text-[13px] font-semibold ${selected ? 'text-white' : 'text-off'}`}>{label}</p>
        <p className="text-[11px] text-muted mt-0.5">৳{fee} delivery charge</p>
      </div>
      {selected && (
        <span className="absolute top-3 right-3 text-[9px] uppercase tracking-wider2 font-bold text-red">
          Selected
        </span>
      )}
    </button>
  )
}

/* ── Payment option card ── */
function PaymentOption({ id, info, selected, onSelect }) {
  return (
    <button type="button" onClick={onSelect}
      className={`relative flex items-center gap-4 px-5 py-4 rounded-[6px] border text-left
                  transition-all duration-200 w-full cursor-pointer
                  ${selected
                    ? 'border-[#555] bg-[#141414]'
                    : 'border-border hover:border-[#333] bg-[#111]'}`}
      style={selected ? { borderColor: info.color + '66', background: info.color + '08' } : {}}>
      {/* Radio */}
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0`}
        style={{ borderColor: selected ? info.color : '#444' }}>
        {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: info.color }} />}
      </div>
      <div className="flex-1">
        <p className={`text-[13px] font-semibold ${selected ? 'text-white' : 'text-off'}`}>{info.label}</p>
        <p className="text-[11px] text-muted mt-0.5">{info.number}</p>
      </div>
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: info.color + '22' }}>
        <span className="text-[10px] font-bold" style={{ color: info.color }}>
          {id === 'bkash' ? 'bK' : 'Ng'}
        </span>
      </div>
    </button>
  )
}
