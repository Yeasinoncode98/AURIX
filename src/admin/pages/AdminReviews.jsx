import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, query, orderBy,
  doc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminReviews() {
  const { user, profile } = useAuth()
  const [reviews,  setReviews]  = useState([])
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')   // all | unanswered
  const [replyId,  setReplyId]  = useState(null)
  const [replyText,setReplyText]= useState('')
  const [sending,  setSending]  = useState(false)

  // Load products for name lookup
  useEffect(() => {
    return onSnapshot(collection(db, 'products'), snap =>
      // docId = actual Firestore string document ID (slug like "aurix-pro")
      setProducts(snap.docs.map(d => ({ ...d.data(), docId: d.id })))
    )
  }, [])

  // Load all reviews from each product's reviews subcollection
  useEffect(() => {
    if (products.length === 0) {
      setLoading(false)  // no products = no reviews, stop spinner
      return
    }

    const unsubs = []
    const allReviews = {}

    products.forEach(product => {
      // product.id could be numeric — use docId (string slug) for Firestore path
      const pid = String(product.docId || product.slug || product.id)
      const q = query(
        collection(db, 'products', pid, 'reviews'),
        orderBy('createdAt', 'desc')
      )
      const unsub = onSnapshot(q, snap => {
        allReviews[pid] = snap.docs.map(d => ({
          id: d.id,
          productId: pid,
          productName: product.name,
          ...d.data(),
        }))
        // Flatten all reviews, sort by newest
        const flat = Object.values(allReviews).flat()
        flat.sort((a, b) => {
          const at = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0)
          const bt = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0)
          return bt - at
        })
        setReviews(flat)
        setLoading(false)
      }, () => setLoading(false))
      unsubs.push(unsub)
    })

    return () => unsubs.forEach(u => u())
  }, [products])

  const productName = (id) => products.find(p => p.docId === id)?.name || id

  const filtered = filter === 'unanswered'
    ? reviews.filter(r => !r.adminReply)
    : reviews

  const sendReply = async (review) => {
    if (!replyText.trim()) return
    setSending(true)
    try {
      await updateDoc(
        doc(db, 'products', review.productId, 'reviews', review.id),
        {
          adminReply: replyText.trim(),
          adminReplyBy: profile?.name || user?.email,
          adminReplyAt: serverTimestamp(),
        }
      )
      toast.success('Reply sent successfully')
      setReplyId(null)
      setReplyText('')
    } catch {
      toast.error('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  const deleteReply = async (review) => {
    try {
      await updateDoc(
        doc(db, 'products', review.productId, 'reviews', review.id),
        { adminReply: null, adminReplyBy: null, adminReplyAt: null }
      )
      toast.success('Reply removed')
    } catch {
      toast.error('Failed to remove reply')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-white/20 border-t-red rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">Reviews</h1>
          <p className="text-[12px] text-muted mt-0.5">{reviews.length} total reviews</p>
        </div>
        <div className="flex gap-2">
          {['all', 'unanswered'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-[6px] text-[11px] font-semibold uppercase tracking-wider
                          border transition-all duration-150
                          ${filter === f
                            ? 'bg-red text-white border-red'
                            : 'bg-[#0e0e0e] text-muted border-[#1a1a1a] hover:text-white hover:border-[#333]'}`}>
              {f === 'all' ? `All (${reviews.length})` : `Unanswered (${reviews.filter(r => !r.adminReply).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.2" className="mb-3">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p className="text-muted text-[13px]">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(review => (
            <div key={review.id}
              className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #0e0e0e, #0a0a0a)' }}>

              {/* Review header */}
              <div className="flex items-start justify-between px-5 py-4 border-b border-[#141414]">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                                  text-[13px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #C1121F, #8b0000)' }}>
                    {(review.userName || review.userEmail || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      {review.userName || review.userEmail || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Stars rating={review.rating || 0}/>
                      <span className="text-[10px] text-muted">
                        {review.createdAt?.toDate
                          ? review.createdAt.toDate().toLocaleDateString('en-BD', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Product badge */}
                <span className="px-2.5 py-1 bg-[#141414] border border-[#222] rounded-[4px]
                                 text-[10px] text-off font-medium">
                  {productName(review.productId)}
                </span>
              </div>

              {/* Review body */}
              <div className="px-5 py-4">
                <p className="text-[13px] text-off leading-relaxed">{review.comment || review.text || '—'}</p>

                {/* Admin reply */}
                {review.adminReply && (
                  <div className="mt-4 pl-4 border-l-2 border-red/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-red uppercase tracking-wider">AURIX Reply</span>
                      <span className="text-[10px] text-muted">by {review.adminReplyBy}</span>
                    </div>
                    <p className="text-[12px] text-off leading-relaxed">{review.adminReply}</p>
                    <button onClick={() => deleteReply(review)}
                      className="text-[10px] text-muted hover:text-red mt-1 transition-colors">
                      Remove reply
                    </button>
                  </div>
                )}

                {/* Reply form */}
                {replyId === review.id ? (
                  <div className="mt-4 space-y-2">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write your reply to this review..."
                      rows={3}
                      className="w-full bg-[#111] border border-[#1a1a1a] rounded-[6px] px-4 py-3
                                 text-[13px] text-white placeholder-muted outline-none resize-none
                                 focus:border-[#333] transition-colors duration-150"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => sendReply(review)} disabled={sending}
                        className="px-4 py-2 bg-red text-white rounded-[6px] text-[11px] font-semibold
                                   hover:bg-red/90 transition-colors duration-150 disabled:opacity-60">
                        {sending ? 'Sending...' : 'Send Reply'}
                      </button>
                      <button onClick={() => { setReplyId(null); setReplyText('') }}
                        className="px-4 py-2 bg-[#141414] border border-[#222] text-muted rounded-[6px]
                                   text-[11px] hover:text-white transition-colors duration-150">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setReplyId(review.id)
                      setReplyText(review.adminReply || '')
                    }}
                    className="mt-3 flex items-center gap-1.5 text-[11px] text-muted
                               hover:text-white transition-colors duration-150">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {review.adminReply ? 'Edit Reply' : 'Reply'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i <= rating ? '#C1121F' : 'none'}
          stroke="#C1121F" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}
