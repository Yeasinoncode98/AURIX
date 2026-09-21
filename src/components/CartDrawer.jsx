import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate()
  const { items, remove, inc, dec, clear, totalQty, totalAmount } = useCart()

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[1100] bg-black/70 backdrop-blur-[4px] transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 right-0 h-full z-[1200] w-full max-w-[420px] flex flex-col
          bg-[#0e0e0e] border-l border-border transition-transform duration-500
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ willChange: 'transform' }}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="font-display font-extrabold text-[18px] tracking-[-0.02em] text-white">Cart</span>
            {totalQty > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red text-white text-[10px] font-bold">
                {totalQty}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {items.length > 0 && (
              <button onClick={clear}
                className="text-[10px] tracking-wider2 uppercase text-muted hover:text-red transition-colors duration-200">
                Clear all
              </button>
            )}
            <button onClick={onClose} aria-label="Close cart"
              className="w-8 h-8 flex items-center justify-center text-muted hover:text-white transition-colors duration-200">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <p className="text-[13px] text-muted text-center">Your cart is empty.<br/>Add a headphone to get started.</p>
          </div>
        )}

        {/* Items */}
        {items.length > 0 && (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.map(item => (
              <div key={item.id}
                className="flex gap-4 p-4 rounded-[4px] border border-border bg-[#141414]
                           hover:border-[#2e2e2e] transition-colors duration-200">
                {/* Image */}
                <div className="w-20 h-20 flex-shrink-0 bg-surface rounded-[3px] flex items-center justify-center overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-[80%] object-contain" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider2 text-muted">{item.color}</p>
                      <p className="font-display font-bold text-[15px] tracking-[-0.02em] text-white leading-tight mt-0.5">
                        {item.name}
                      </p>
                    </div>
                    <button onClick={() => remove(item.id)} aria-label="Remove item"
                      className="text-muted hover:text-red transition-colors duration-200 flex-shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty controls */}
                    <div className="flex items-center gap-0 border border-border rounded-[3px] overflow-hidden">
                      <button onClick={() => dec(item.id)}
                        className="w-7 h-7 flex items-center justify-center text-muted hover:text-white hover:bg-[#1e1e1e]
                                   transition-colors duration-150 text-[14px]">
                        −
                      </button>
                      <span className="w-8 text-center text-[13px] font-medium text-white border-x border-border">
                        {item.qty}
                      </span>
                      <button onClick={() => inc(item.id)}
                        className="w-7 h-7 flex items-center justify-center text-muted hover:text-white hover:bg-[#1e1e1e]
                                   transition-colors duration-150 text-[14px]">
                        +
                      </button>
                    </div>

                    <span className="font-display font-bold text-[15px] tracking-[-0.02em] text-white">
                      ৳{(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-6 space-y-4">
            {/* Subtotal */}
            <div className="space-y-2">
              <div className="flex justify-between text-[12px] text-muted">
                <span>Subtotal ({totalQty} {totalQty === 1 ? 'item' : 'items'})</span>
                <span>৳{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[12px] text-muted">
                <span>Shipping</span>
                <span className="text-off italic">Select at checkout</span>
              </div>
              <div className="flex justify-between font-display font-extrabold text-[18px] tracking-[-0.02em] text-white pt-2 border-t border-border">
                <span>Total</span>
                <span>৳{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => { onClose(); navigate('/checkout') }}
              className="btn-primary w-full justify-center" style={{ fontSize: '12px', padding: '14px 20px' }}>
              Proceed to Checkout
            </button>
            <button onClick={onClose}
              className="btn-ghost w-full justify-center" style={{ fontSize: '11px', padding: '12px 20px' }}>
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
