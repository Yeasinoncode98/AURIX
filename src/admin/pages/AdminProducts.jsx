import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', tagline: '', price: '', badge: '', color: '', stock: '',
  description: '', longDescription: '', image: '', imageMode: 'url',
  categories: [],
  // specs as key-value pairs
  specs: [{ key: '', val: '' }],
  features: [{ icon: 'driver', title: '', desc: '' }],
  fullSpecs: [{ key: '', val: '' }],
  inBox: [''],
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)   // product being edited
  const [deleting, setDeleting] = useState(null)   // confirm delete

  useEffect(() => {
    return onSnapshot(collection(db, 'products'), snap => {
      const data = snap.docs.map(d => ({
        ...d.data(),      // data first (numericId as 'id' field)
        docId: d.id,      // then docId = actual Firestore string document ID
      }))
      data.sort((a, b) => (a.id || 0) - (b.id || 0))
      setProducts(data)
      setLoading(false)
    })
  }, [])

  // Load categories for product form
  useEffect(() => {
    return onSnapshot(collection(db, 'categories'), snap =>
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [])

  const handleEdit = (product) => { setEditing(product); setShowForm(true) }
  const handleAdd  = ()        => { setEditing(null);    setShowForm(true) }

  const handleDelete = async (product) => {
    try {
      const docId = product.docId || product.slug || String(product.id)
      await deleteDoc(doc(db, 'products', docId))
      toast.success('Product deleted')
      setDeleting(null)
    } catch {
      toast.error('Failed to delete product')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">Products</h1>
          <p className="text-[12px] text-muted mt-0.5">{products.length} products in store</p>
        </div>
        <button onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-red text-white rounded-[6px]
                     text-[12px] font-semibold hover:bg-red/90 transition-colors duration-150">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </button>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            categories={categories}
            onEdit={() => handleEdit(product)}
            onDelete={() => setDeleting(product)}
          />
        ))}
      </div>

      {/* Add/Edit form modal */}
      {showForm && (
        <ProductFormModal
          product={editing}
          categories={categories}
          existingCount={products.length}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
          onClick={() => setDeleting(null)}>
          <div className="rounded-[8px] border border-[#1a1a1a] p-6 w-full max-w-[360px]"
            style={{ background: '#0e0e0e' }}
            onClick={e => e.stopPropagation()}>
            <p className="text-[15px] font-bold text-white mb-2">Delete Product?</p>
            <p className="text-[13px] text-muted mb-5">
              "{deleting.name}" will be permanently removed from the store.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)}
                className="flex-1 py-2.5 rounded-[6px] border border-[#222] text-[12px]
                           text-muted hover:text-white transition-colors duration-150">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleting)}
                className="flex-1 py-2.5 rounded-[6px] bg-red text-white text-[12px]
                           font-semibold hover:bg-red/90 transition-colors duration-150">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Product Card ── */
function ProductCard({ product, categories, onEdit, onDelete }) {
  const stock = product.stock ?? null
  const isLow = stock !== null && stock <= 5

  // Resolve category names from ids
  const productCats = (product.categories || [])
    .map(id => categories.find(c => c.id === id))
    .filter(Boolean)

  return (
    <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden hover:border-[#252525]
                    transition-colors duration-150"
      style={{ background: 'linear-gradient(160deg, #0e0e0e, #0a0a0a)' }}>
      {/* Image */}
      <div className="h-[160px] bg-[#111] flex items-center justify-center border-b border-[#1a1a1a] relative">
        {product.image ? (
          <img src={product.image} alt={product.name}
            className="h-[130px] w-full object-contain px-4"/>
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        )}
        {product.badge && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red text-white text-[9px]
                           font-bold uppercase tracking-wider rounded-full">
            {product.badge}
          </span>
        )}
        {isLow && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-500
                           text-[9px] font-bold border border-yellow-500/30 rounded-full">
            Low Stock
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-[14px] font-bold text-white leading-tight">{product.name}</p>
            <p className="text-[11px] text-muted mt-0.5">{product.tagline}</p>
          </div>
          <p className="font-display font-extrabold text-[16px] text-red flex-shrink-0">
            ৳{product.price?.toLocaleString()}
          </p>
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke={isLow ? '#f59e0b' : '#666'} strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <span className={`text-[11px] font-semibold ${isLow ? 'text-yellow-500' : 'text-muted'}`}>
              {stock !== null ? `${stock} in stock` : 'Stock not set'}
            </span>
          </div>
          <span className="text-[10px] text-muted">{product.color}</span>
        </div>

        {/* Categories */}
        {productCats.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {productCats.map(cat => (
              <span key={cat.id}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold border"
                style={{
                  color: cat.color || '#aaa',
                  background: `${cat.color || '#666'}15`,
                  borderColor: `${cat.color || '#666'}30`,
                }}>
                {cat.icon} {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onEdit}
            className="flex-1 py-2 rounded-[6px] bg-[#141414] border border-[#222] text-[11px]
                       font-semibold text-white hover:border-[#333] transition-all duration-150">
            Edit
          </button>
          <button onClick={onDelete}
            className="py-2 px-3 rounded-[6px] bg-red/5 border border-red/20 text-[11px]
                       font-semibold text-red hover:bg-red/10 transition-all duration-150">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Product Form Modal ── */
function ProductFormModal({ product, categories, existingCount, onClose }) {
  const isEdit = !!product

  const parseKV = (obj) => obj
    ? Object.entries(obj).map(([key, val]) => ({ key, val }))
    : [{ key: '', val: '' }]

  const [form, setForm] = useState(() => {
    if (!isEdit) return { ...EMPTY_FORM, imageBase64: '', imageMode: 'url', categories: [] }

    // Safe parse specs/fullSpecs — Firestore returns plain objects
    const parseObj = (obj) => {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [{ key: '', val: '' }]
      const entries = Object.entries(obj)
      return entries.length ? entries.map(([key, val]) => ({ key: String(key), val: String(val) })) : [{ key: '', val: '' }]
    }

    // Safe parse features
    const parseFeatures = (arr) => {
      if (!Array.isArray(arr) || !arr.length) return [{ icon: 'driver', title: '', desc: '' }]
      return arr.map(f => ({
        icon:  String(f.icon  || 'driver'),
        title: String(f.title || ''),
        desc:  String(f.desc  || ''),
      }))
    }

    // Safe parse inBox — ensure all strings
    const parseInBox = (arr) => {
      if (!Array.isArray(arr) || !arr.length) return ['']
      return arr.map(i => String(i || ''))
    }

    return {
      name:            product.name || '',
      tagline:         product.tagline || '',
      price:           String(product.price || ''),
      badge:           product.badge || '',
      color:           product.color || '',
      stock:           String(product.stock ?? ''),
      categories:      Array.isArray(product.categories) ? product.categories : [],
      description:     product.description || '',
      longDescription: product.longDescription || '',
      image:           (typeof product.image === 'string' && !product.image.startsWith('data:'))
                         ? product.image : '',
      imageMode:       (typeof product.image === 'string' && product.image.startsWith('data:'))
                         ? 'upload' : 'url',
      imageBase64:     (typeof product.image === 'string' && product.image.startsWith('data:'))
                         ? product.image : '',
      specs:           parseObj(product.specs),
      features:        parseFeatures(product.features),
      fullSpecs:       parseObj(product.fullSpecs),
      inBox:           parseInBox(product.inBox),
    }
  })

  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(isEdit && product.image ? product.image : '')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  /* ── Image handlers ── */
  const handleImageFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm(f => ({ ...f, imageBase64: ev.target.result, imageMode: 'upload' }))
      setPreview(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  /* ── Array field helpers ── */
  const addKV    = (field) => set(field, [...form[field], { key: '', val: '' }])
  const removeKV = (field, i) => set(field, form[field].filter((_, idx) => idx !== i))
  const setKV    = (field, i, k, v) => {
    const arr = [...form[field]]; arr[i] = { ...arr[i], [k]: v }; set(field, arr)
  }
  const addFeature    = () => set('features', [...form.features, { icon: 'driver', title: '', desc: '' }])
  const removeFeature = (i) => set('features', form.features.filter((_, idx) => idx !== i))
  const setFeature    = (i, k, v) => {
    const arr = [...form.features]; arr[i] = { ...arr[i], [k]: v }; set('features', arr)
  }
  const addInBox    = () => set('inBox', [...form.inBox, ''])
  const removeInBox = (i) => set('inBox', form.inBox.filter((_, idx) => idx !== i))
  const setInBox    = (i, v) => { const arr = [...form.inBox]; arr[i] = v; set('inBox', arr) }

  /* ── Save ── */
  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)
    try {
      // docId = actual Firestore document ID (string slug like "aurix-pro")
      const slug = isEdit
        ? String(product.docId || product.slug || product.id)
        : form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const imageVal = form.imageMode === 'upload' ? form.imageBase64 : form.image.trim()

      // Numeric id — preserve on edit
      const numericId = isEdit
        ? (typeof product.id === 'number' ? product.id : (product.numId || existingCount + 1))
        : existingCount + 1

      // Safe convert specs/fullSpecs kv-pairs → plain object
      const toPlainObj = (arr) => {
        const obj = {}
        if (!Array.isArray(arr)) return obj
        arr.forEach(r => {
          const k = String(r.key || '').trim()
          const v = String(r.val || '').trim()
          if (k) obj[k] = v
        })
        return obj
      }

      // Safe features array
      const cleanFeatures = (Array.isArray(form.features) ? form.features : [])
        .filter(f => String(f.title || '').trim())
        .map(f => ({
          icon:  String(f.icon  || 'driver'),
          title: String(f.title || '').trim(),
          desc:  String(f.desc  || '').trim(),
        }))

      // Safe inBox array — ensure all items are strings
      const cleanInBox = (Array.isArray(form.inBox) ? form.inBox : [])
        .map(i => String(i || '').trim())
        .filter(Boolean)

      // Safe categories array
      const cleanCategories = (Array.isArray(form.categories) ? form.categories : [])
        .filter(Boolean)
        .map(String)

      const data = {
        id:              numericId,
        slug,
        name:            form.name.trim(),
        tagline:         form.tagline.trim(),
        price:           Number(form.price),
        badge:           form.badge.trim() || null,
        color:           form.color.trim(),
        stock:           form.stock !== '' ? Number(form.stock) : 0,
        categories:      cleanCategories,
        description:     form.description.trim(),
        longDescription: form.longDescription.trim(),
        image:           imageVal,
        specs:           toPlainObj(form.specs),
        features:        cleanFeatures,
        fullSpecs:       toPlainObj(form.fullSpecs),
        inBox:           cleanInBox,
        updatedAt:       serverTimestamp(),
      }

      if (!isEdit) data.createdAt = serverTimestamp()

      await setDoc(doc(db, 'products', slug), data, { merge: true })
      toast.success(isEdit ? 'Product updated successfully' : 'Product added successfully')
      onClose()
    } catch (err) {
      console.error('Save error:', err)
      toast.error(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] overflow-y-auto"
      onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="w-full max-w-[700px] rounded-[8px] border border-[#1a1a1a] overflow-hidden"
          style={{ background: '#0a0a0a' }}
          onClick={e => e.stopPropagation()}>

          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] sticky top-0 z-10"
            style={{ background: '#0a0a0a' }}>
            <p className="text-[14px] font-bold text-white">
              {isEdit ? `Edit — ${product.name}` : 'Add New Product'}
            </p>
            <button onClick={onClose} className="text-muted hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">

            {/* Basic Info */}
            <Section title="Basic Info">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FField label="Product Name *">
                  <input value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="AURIX Pro" className={iCls}/>
                </FField>
                <FField label="Tagline">
                  <input value={form.tagline} onChange={e => set('tagline', e.target.value)}
                    placeholder="Reference-grade studio headphone" className={iCls}/>
                </FField>
                <FField label="Price (৳) *">
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                    placeholder="449" className={iCls}/>
                </FField>
                <FField label="Stock Quantity">
                  <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)}
                    placeholder="50" className={iCls}/>
                </FField>
                <FField label="Badge (optional)">
                  <input value={form.badge} onChange={e => set('badge', e.target.value)}
                    placeholder="Best Seller, New, Limited..." className={iCls}/>
                </FField>
                <FField label="Color">
                  <input value={form.color} onChange={e => set('color', e.target.value)}
                    placeholder="Midnight Black" className={iCls}/>
                </FField>
              </div>
            </Section>

            {/* Categories */}
            {categories.length > 0 && (
              <Section title="Categories">
                <p className="text-[11px] text-muted -mt-1">
                  Select one or more categories — product will appear under these filters in the Shop.
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {categories.map(cat => {
                    const selected = form.categories.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          set('categories', selected
                            ? form.categories.filter(id => id !== cat.id)
                            : [...form.categories, cat.id]
                          )
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                    text-[11px] font-semibold border transition-all duration-150
                                    ${selected
                                      ? 'text-white border-transparent'
                                      : 'bg-[#111] border-[#1a1a1a] text-muted hover:border-[#333] hover:text-white'
                                    }`}
                        style={selected ? {
                          background: cat.color || '#C1121F',
                          borderColor: cat.color || '#C1121F',
                          boxShadow: `0 0 12px ${cat.color || '#C1121F'}40`,
                        } : {}}>
                        {cat.icon && <span>{cat.icon}</span>}
                        {cat.name}
                        {selected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
                {form.categories.length > 0 && (
                  <p className="text-[10px] text-muted mt-1">
                    {form.categories.length} categor{form.categories.length > 1 ? 'ies' : 'y'} selected
                  </p>
                )}
              </Section>
            )}

            {/* Image */}
            <Section title="Product Image">
              <div className="flex gap-2 mb-3">
                {['url', 'upload'].map(m => (
                  <button key={m} type="button"
                    onClick={() => set('imageMode', m)}
                    className={`px-3 py-1.5 rounded-[4px] text-[11px] font-semibold border
                                transition-all duration-150
                                ${form.imageMode === m
                                  ? 'bg-red text-white border-red'
                                  : 'bg-[#141414] text-muted border-[#222] hover:text-white'}`}>
                    {m === 'url' ? '🔗 URL' : '📁 Upload'}
                  </button>
                ))}
              </div>
              {form.imageMode === 'url' ? (
                <input value={form.image}
                  onChange={e => { set('image', e.target.value); setPreview(e.target.value) }}
                  placeholder="https://i.imgur.com/xxxxx.jpeg" className={iCls}/>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-[100px]
                                  border-2 border-dashed border-[#222] rounded-[6px] cursor-pointer
                                  hover:border-[#333] transition-colors duration-150 bg-[#0d0d0d]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                  <p className="text-[11px] text-muted mt-1">Click to upload (max 2MB)</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFile}/>
                </label>
              )}
              {preview && (
                <div className="mt-3 w-[80px] h-[80px] rounded-[6px] border border-[#222]
                                bg-[#111] flex items-center justify-center overflow-hidden">
                  <img src={preview} alt="" className="w-full h-full object-contain p-1"/>
                </div>
              )}
            </Section>

            {/* Description */}
            <Section title="Descriptions">
              <FField label="Short Description">
                <textarea value={form.description} rows={2}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Short product description..." className={`${iCls} resize-none`}/>
              </FField>
              <FField label="Long Description">
                <textarea value={form.longDescription} rows={4}
                  onChange={e => set('longDescription', e.target.value)}
                  placeholder="Detailed product story..." className={`${iCls} resize-none`}/>
              </FField>
            </Section>

            {/* Specs */}
            <Section title="Quick Specs (shown on card)">
              {form.specs.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={row.key} onChange={e => setKV('specs', i, 'key', e.target.value)}
                    placeholder="Driver" className={`${iCls} flex-1`}/>
                  <input value={row.val} onChange={e => setKV('specs', i, 'val', e.target.value)}
                    placeholder="50mm Beryllium" className={`${iCls} flex-1`}/>
                  <button onClick={() => removeKV('specs', i)} className="text-muted hover:text-red">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
              <AddBtn onClick={() => addKV('specs')} label="Add Spec"/>
            </Section>

            {/* Full Specs */}
            <Section title="Full Specifications (detail page)">
              {form.fullSpecs.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={row.key} onChange={e => setKV('fullSpecs', i, 'key', e.target.value)}
                    placeholder="Frequency Response" className={`${iCls} flex-1`}/>
                  <input value={row.val} onChange={e => setKV('fullSpecs', i, 'val', e.target.value)}
                    placeholder="5Hz – 40kHz" className={`${iCls} flex-1`}/>
                  <button onClick={() => removeKV('fullSpecs', i)} className="text-muted hover:text-red">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
              <AddBtn onClick={() => addKV('fullSpecs')} label="Add Full Spec"/>
            </Section>

            {/* Features */}
            <Section title="Features (detail page)">
              {form.features.map((f, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input value={f.title} onChange={e => setFeature(i, 'title', e.target.value)}
                    placeholder="Feature title" className={`${iCls} w-[140px]`}/>
                  <input value={f.desc} onChange={e => setFeature(i, 'desc', e.target.value)}
                    placeholder="Feature description" className={`${iCls} flex-1`}/>
                  <button onClick={() => removeFeature(i)} className="text-muted hover:text-red mt-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
              <AddBtn onClick={addFeature} label="Add Feature"/>
            </Section>

            {/* In Box */}
            <Section title="What's in the Box">
              {form.inBox.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={item} onChange={e => setInBox(i, e.target.value)}
                    placeholder="AURIX Pro Headphone" className={`${iCls} flex-1`}/>
                  <button onClick={() => removeInBox(i)} className="text-muted hover:text-red">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
              <AddBtn onClick={addInBox} label="Add Item"/>
            </Section>

          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-[#1a1a1a] sticky bottom-0"
            style={{ background: '#0a0a0a' }}>
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-[6px] border border-[#222] text-[12px]
                         text-muted hover:text-white transition-colors duration-150">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-[6px] bg-red text-white text-[12px]
                         font-semibold hover:bg-red/90 transition-colors duration-150
                         disabled:opacity-60 flex items-center justify-center gap-2">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving...</>
                : isEdit ? 'Save Changes' : 'Add Product'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── small helpers ── */
const iCls = `w-full bg-[#111] border border-[#1a1a1a] rounded-[4px] px-3 py-2
              text-[13px] text-white placeholder-muted outline-none
              focus:border-[#333] transition-colors duration-150`

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold border-b border-[#151515] pb-2">
        {title}
      </p>
      {children}
    </div>
  )
}
function FField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-muted font-medium">{label}</label>
      {children}
    </div>
  )
}
function AddBtn({ onClick, label }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1.5 text-[11px] text-muted hover:text-white
                 transition-colors duration-150 mt-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      {label}
    </button>
  )
}
