import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, doc, setDoc,
  updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../firebase'
import toast from 'react-hot-toast'

const ICONS = ['🎧','🎵','🔊','⚡','🏆','🌟','🎯','💎','🔥','🎼']

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [deleting,   setDeleting]   = useState(null)

  useEffect(() => {
    return onSnapshot(collection(db, 'categories'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Sort by createdAt if available, else by name
      data.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const at = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
          const bt = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
          return at - bt
        }
        return (a.name || '').localeCompare(b.name || '')
      })
      setCategories(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    return onSnapshot(collection(db, 'products'), snap =>
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [])

  const productCount = (catId) =>
    products.filter(p => p.categoryId === catId || (p.categories || []).includes(catId)).length

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'categories', id))
      toast.success('Category deleted')
      setDeleting(null)
    } catch { toast.error('Failed to delete category') }
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
          <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">
            Categories
          </h1>
          <p className="text-[12px] text-muted mt-0.5">
            {categories.length} categories · shown as filters on Shop page
          </p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red text-white rounded-[6px]
                     text-[12px] font-semibold hover:bg-red/90 transition-colors duration-150">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Category
        </button>
      </div>

      {/* Shop filter preview */}
      {categories.length > 0 && (
        <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
          style={{ background: '#0d0d0d' }}>
          <div className="px-4 py-2.5 border-b border-[#1a1a1a] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"/>
            <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider2">
              Shop Page Preview — Category Filters
            </p>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            <span className="px-4 py-1.5 rounded-full text-[11px] font-semibold bg-red text-white">
              All
            </span>
            {categories.map(c => (
              <span key={c.id}
                className="px-4 py-1.5 rounded-full text-[11px] font-semibold
                           bg-[#141414] border border-[#222] text-muted">
                {c.icon} {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.2" className="mb-3">
            <path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
          <p className="text-muted text-[13px] mb-1">No categories yet</p>
          <p className="text-muted text-[11px]">Create categories to help customers filter products on the Shop page</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              productCount={productCount(cat.id)}
              onEdit={() => { setEditing(cat); setShowForm(true) }}
              onDelete={() => setDeleting(cat)}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <CategoryFormModal
          category={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
          onClick={() => setDeleting(null)}>
          <div className="rounded-[8px] border border-[#1a1a1a] p-6 w-full max-w-[360px]"
            style={{ background: '#0e0e0e' }} onClick={e => e.stopPropagation()}>
            <p className="text-[15px] font-bold text-white mb-2">Delete Category?</p>
            <p className="text-[13px] text-muted mb-5">
              "<span className="text-white">{deleting.name}</span>" will be removed.
              Products in this category won't be deleted.
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
    </div>
  )
}

/* ── Category Card ── */
function CategoryCard({ category, productCount, onEdit, onDelete }) {
  return (
    <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden hover:border-[#252525]
                    transition-colors duration-150"
      style={{ background: 'linear-gradient(160deg, #0e0e0e, #0a0a0a)' }}>
      <div className="px-5 py-5">
        {/* Icon + name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[8px] flex items-center justify-center text-[22px]
                            border border-[#1a1a1a]"
              style={{ background: category.color ? `${category.color}15` : '#141414',
                       borderColor: category.color ? `${category.color}30` : '#1a1a1a' }}>
              {category.icon || '🎧'}
            </div>
            <div>
              <p className="font-display font-bold text-[15px] text-white">{category.name}</p>
              {category.description && (
                <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{category.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Slug + product count */}
        <div className="flex items-center justify-between mb-4 pt-3 border-t border-[#141414]">
          <div>
            <p className="text-[10px] text-muted">Slug</p>
            <p className="text-[11px] font-mono text-off mt-0.5">{category.id}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted">Products</p>
            <p className="text-[14px] font-bold text-white mt-0.5">{productCount}</p>
          </div>
        </div>

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

/* ── Category Form Modal ── */
function CategoryFormModal({ category, onClose }) {
  const isEdit = !!category
  const [form, setForm] = useState({
    name:        isEdit ? category.name        : '',
    description: isEdit ? category.description : '',
    icon:        isEdit ? category.icon        : '🎧',
    color:       isEdit ? category.color       : '#C1121F',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return }
    setSaving(true)
    try {
      const slug = isEdit
        ? category.id
        : form.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const data = {
        name:        form.name.trim(),
        description: form.description.trim(),
        icon:        form.icon,
        color:       form.color,
        updatedAt:   serverTimestamp(),
      }
      if (!isEdit) data.createdAt = serverTimestamp()

      await setDoc(doc(db, 'categories', slug), data, { merge: true })
      toast.success(isEdit ? 'Category updated successfully' : 'Category added successfully')
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-[8px] border border-[#1a1a1a]"
        style={{ background: '#0a0a0a' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <p className="text-[14px] font-bold text-white">
            {isEdit ? `Edit — ${category.name}` : 'New Category'}
          </p>
          <button onClick={onClose} className="text-muted hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Name */}
          <div>
            <label className="text-[11px] text-muted font-medium block mb-1.5">Category Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Studio, Sport, Wireless" className={iCls}/>
            {form.name && (
              <p className="text-[10px] text-muted mt-1">
                Slug: <span className="font-mono text-off">
                  {form.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}
                </span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] text-muted font-medium block mb-1.5">Description (optional)</label>
            <input value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Short description of this category" className={iCls}/>
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-[11px] text-muted font-medium block mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => set('icon', icon)}
                  className={`w-9 h-9 rounded-[6px] text-[18px] flex items-center justify-center
                              border transition-all duration-150
                              ${form.icon === icon
                                ? 'border-red bg-red/10'
                                : 'border-[#1a1a1a] bg-[#111] hover:border-[#333]'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[11px] text-muted font-medium block mb-2">Accent Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                className="w-10 h-10 rounded-[6px] border border-[#222] bg-[#111] cursor-pointer p-0.5"/>
              <input value={form.color} onChange={e => set('color', e.target.value)}
                placeholder="#C1121F" className={iCls + ' flex-1 font-mono'}/>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-[6px] border border-[#1a1a1a] px-4 py-3 flex items-center gap-3"
            style={{ background: '#0d0d0d' }}>
            <div className="w-9 h-9 rounded-[6px] flex items-center justify-center text-[18px]"
              style={{ background: `${form.color}15`, border: `1px solid ${form.color}30` }}>
              {form.icon}
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white">{form.name || 'Category Name'}</p>
              <p className="text-[10px] text-muted">{form.description || 'Description'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-[#1a1a1a]">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-[6px] border border-[#222] text-[12px]
                       text-muted hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-[6px] bg-red text-white text-[12px]
                       font-semibold hover:bg-red/90 transition-colors disabled:opacity-60
                       flex items-center justify-center gap-2">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</>
              : isEdit ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  )
}

const iCls = `w-full bg-[#111] border border-[#1a1a1a] rounded-[4px] px-3 py-2.5
              text-[13px] text-white placeholder-muted outline-none
              focus:border-[#333] transition-colors duration-150`
