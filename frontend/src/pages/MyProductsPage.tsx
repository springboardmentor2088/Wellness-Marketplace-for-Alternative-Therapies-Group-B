import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Product, type Profile } from '../api'
import { formatImageUrl } from '../utils/image'
import { Package, Plus, Edit2, Trash2, X, CloudUpload, Activity, AlertCircle, Save, ClipboardList, CheckCircle2 } from 'lucide-react'

interface ProductForm {
    name: string
    description: string
    price: string
    image: File | null
}

export function MyProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [form, setForm] = useState<ProductForm>({ name: '', description: '', price: '', image: null })
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const userProfile = await api.getProfile()
            setProfile(userProfile)
            const myProducts = await api.getProviderProducts(userProfile.id)
            setProducts(myProducts)
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product)
            setForm({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                image: null
            })
        } else {
            setEditingProduct(null)
            setForm({ name: '', description: '', price: '', image: null })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile) return
        setSubmitting(true)

        const formData = new FormData()
        formData.append('name', form.name)
        formData.append('description', form.description)
        formData.append('price', form.price)
        formData.append('providerId', profile.id.toString())
        if (form.image) formData.append('image', form.image)

        try {
            if (editingProduct?.productId) {
                await api.updateProduct(editingProduct.productId, formData)
                setMessage({ text: 'Product updated successfully!', type: 'success' })
            } else {
                await api.createProduct(formData)
                setMessage({ text: 'Product created successfully!', type: 'success' })
            }
            setIsModalOpen(false)
            fetchData()
            setTimeout(() => setMessage(null), 3000)
        } catch (err) {
            setMessage({ text: 'Operation failed.', type: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!profile || !window.confirm('Are you sure you want to delete this product?')) return
        try {
            await api.deleteProduct(id, profile.id)
            setMessage({ text: 'Product deleted.', type: 'success' })
            fetchData()
            setTimeout(() => setMessage(null), 3000)
        } catch (err) {
            setMessage({ text: 'Failed to delete.', type: 'error' })
        }
    }

    const sidebarItems = [
        { label: 'Overview', path: '/practitioner', icon: <Activity size={20} /> },
        { label: 'My Products', path: '/my-products', active: true, icon: <Package size={20} /> },
        { label: 'Product Orders', path: '/product-orders', icon: <ClipboardList size={20} /> },
    ]

    if (loading || !profile) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
                <Activity size={32} className="text-brand-600" />
            </motion.div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading shop...</p>
        </div>
    )

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
            >
                <header className="bg-gradient-to-r from-brand-600 to-violet-600 p-12 rounded-[3.5rem] text-white shadow-xl shadow-brand-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-5xl font-black mb-4 flex items-center gap-4">
                            <Package size={48} /> Practitioner Shop
                        </h1>
                        <p className="text-white/80 text-lg font-medium max-w-xl">
                            Build your wellness catalog and empower your clients with premium gear.
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-white text-brand-600 px-10 py-5 rounded-[2rem] font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-3 active:scale-95"
                    >
                        <Plus size={24} /> New Product
                    </button>
                </header>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-6 rounded-3xl border flex items-center gap-4 font-black text-sm ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        {message.text}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {products.length > 0 ? (
                        products.map((product, idx) => (
                            <motion.div
                                key={product.productId}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 overflow-hidden group hover:border-brand-300 transition-all flex flex-col"
                            >
                                <div className="h-56 bg-slate-50 relative overflow-hidden">
                                    {product.imageUrl ? (
                                        <img
                                            src={formatImageUrl(product.imageUrl)}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                            <Package size={64} />
                                        </div>
                                    )}
                                    <div className="absolute top-6 left-6">
                                        <span className="bg-white/95 backdrop-blur-md text-brand-600 px-4 py-2 rounded-2xl font-black text-xs shadow-lg">
                                            ₹ {product.price.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-10 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 truncate">{product.name}</h3>
                                    <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                                        {product.description}
                                    </p>

                                    <div className="mt-auto flex gap-3">
                                        <button
                                            onClick={() => handleOpenModal(product)}
                                            className="flex-1 bg-slate-50 text-slate-900 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
                                        >
                                            <Edit2 size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => product.productId && handleDelete(product.productId)}
                                            className="bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl font-black hover:bg-rose-100 transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border border-brand-100 shadow-xl shadow-brand-500/5">
                            <div className="bg-slate-50 inline-block p-16 rounded-full mb-8">
                                <Package size={80} className="text-slate-200" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-3">Your store is empty</h2>
                            <p className="text-slate-500 text-lg font-medium mb-10">Add your first wellness product to start selling.</p>
                            <button
                                onClick={() => handleOpenModal()}
                                className="bg-brand-600 text-white px-12 py-5 rounded-2xl font-black shadow-xl shadow-brand-600/30 hover:bg-brand-700 transition-all"
                            >
                                List a Product
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-brand-600 to-violet-600 p-10 text-white flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black">{editingProduct ? 'Update Product' : 'Add New Product'}</h2>
                                    <p className="text-white/70 font-medium">Enter product details and upload an image.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Product Name</label>
                                        <input
                                            required
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="e.g. Ergonomic Yoga Mat"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 font-bold text-slate-900 focus:bg-white focus:border-brand-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Price (INR)</label>
                                        <input
                                            required
                                            type="number"
                                            value={form.price}
                                            onChange={e => setForm({ ...form, price: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 font-bold text-slate-900 focus:bg-white focus:border-brand-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Description</label>
                                    <textarea
                                        required
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Tell your clients about this product..."
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-5 px-6 font-bold text-slate-900 focus:bg-white focus:border-brand-500 transition-all outline-none resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Product Image</label>
                                    <div className="relative group cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setForm({ ...form, image: e.target.files?.[0] || null })}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center group-hover:bg-brand-50 group-hover:border-brand-200 transition-all">
                                            <CloudUpload size={40} className="text-slate-300 mb-4 group-hover:text-brand-600 transition-all" />
                                            <p className="text-sm font-black text-slate-900 mb-1">
                                                {form.image ? form.image.name : 'Click or drop product image'}
                                            </p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">PNG or JPG up to 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-slate-900 text-white rounded-3xl py-6 font-black text-lg shadow-2xl hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {submitting ? <Activity size={24} className="animate-spin" /> : <Save size={24} />}
                                    {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}
