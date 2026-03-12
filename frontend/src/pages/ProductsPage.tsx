import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Product, type Profile } from '../api'
import { formatImageUrl } from '../utils/image'
import { ShoppingBag, Search, Sparkles, ShoppingCart, Plus, Minus, CheckCircle2, AlertCircle, Activity, ClipboardList, Package } from 'lucide-react'

export function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({})
    const [purchaseStatus, setPurchaseStatus] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<number | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const userProfile = await api.getProfile()
            setProfile(userProfile)
            const allProducts = await api.getProducts()
            setProducts(allProducts)

            const initialQuantities: { [key: number]: number } = {}
            allProducts.forEach(p => {
                if (p.productId) initialQuantities[p.productId] = 1
            })
            setQuantities(initialQuantities)
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleQuantityChange = (productId: number, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(1, (prev[productId] || 1) + delta)
        }))
    }

    const handleBuy = async (product: Product) => {
        if (!profile || !product.productId) return

        setIsSubmitting(product.productId)
        try {
            const quantity = quantities[product.productId] || 1
            await api.createOrder({
                productId: product.productId,
                quantity: quantity,
                totalPrice: product.price * quantity
            })

            setPurchaseStatus({ id: product.productId, message: 'Order placed successfully!', type: 'success' })
            setTimeout(() => setPurchaseStatus(null), 3000)
        } catch (err) {
            setPurchaseStatus({ id: product.productId, message: 'Failed to place order.', type: 'error' })
            setTimeout(() => setPurchaseStatus(null), 3000)
        } finally {
            setIsSubmitting(null)
        }
    }

    const sidebarItems = [
        { label: 'Dashboard', path: '/user', icon: <Activity size={20} /> },
        { label: 'Products', path: '/products', active: true, icon: <ShoppingBag size={20} /> },
        { label: 'Product Orders', path: '/product-orders', icon: <ClipboardList size={20} /> },
    ]

    if (loading || !profile) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
                <Activity size={32} className="text-brand-600" />
            </motion.div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading marketplace...</p>
        </div>
    )

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
            >
                <header className="bg-gradient-to-r from-brand-600 to-indigo-600 p-12 rounded-[3rem] text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-5xl font-black mb-4 flex items-center gap-4">
                            <ShoppingBag size={48} /> Wellness Store
                        </h1>
                        <p className="text-white/80 text-lg font-medium max-w-2xl">
                            Elevate your holistic journey with our curated selection of verified wellness products and gear.
                        </p>
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute top-0 right-0 p-10 text-white pointer-events-none"
                    >
                        <Sparkles size={180} />
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.length > 0 ? (
                        products.map((product, idx) => (
                            <motion.div
                                key={product.productId}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-[2.5rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 overflow-hidden group hover:border-brand-300 transition-all flex flex-col"
                            >
                                {/* Product Image */}
                                <div className="h-64 bg-slate-50 relative overflow-hidden">
                                    {product.imageUrl ? (
                                        <img
                                            src={formatImageUrl(product.imageUrl)}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                            <Package size={80} />
                                        </div>
                                    )}
                                    <div className="absolute top-6 right-6">
                                        <span className="bg-white/90 backdrop-blur-md text-brand-600 px-4 py-2 rounded-2xl font-black text-xs shadow-lg">
                                            ₹ {product.price.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-brand-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">
                                        {product.description}
                                    </p>

                                    <div className="mt-auto space-y-6">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</span>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => product.productId && handleQuantityChange(product.productId, -1)}
                                                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-sm font-black text-slate-900 w-4 text-center">
                                                    {product.productId ? (quantities[product.productId] || 1) : 1}
                                                </span>
                                                <button
                                                    onClick={() => product.productId && handleQuantityChange(product.productId, 1)}
                                                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Buy Button & Feedback */}
                                        <div className="relative">
                                            <AnimatePresence mode="wait">
                                                {purchaseStatus?.id === product.productId ? (
                                                    <motion.div
                                                        key="status"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm border ${purchaseStatus?.type === 'success'
                                                            ? 'border-green-500 bg-green-50 text-green-700'
                                                            : 'border-red-500 bg-red-50 text-red-700'
                                                            }`}
                                                    >
                                                        {purchaseStatus?.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                                        {purchaseStatus?.message}
                                                    </motion.div>
                                                ) : (
                                                    <motion.button
                                                        key="button"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        onClick={() => handleBuy(product)}
                                                        disabled={isSubmitting === product.productId}
                                                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-black hover:scale-[1.02] transition-all disabled:opacity-50"
                                                    >
                                                        {isSubmitting === product.productId ? (
                                                            <Activity size={18} className="animate-spin" />
                                                        ) : (
                                                            <ShoppingCart size={18} />
                                                        )}
                                                        {isSubmitting === product.productId ? 'Processing...' : 'Buy Now'}
                                                    </motion.button>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-brand-100 shadow-xl shadow-brand-500/5">
                            <div className="bg-slate-50 inline-block p-12 rounded-full mb-6">
                                <Search size={64} className="text-slate-200" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">No Products Available</h2>
                            <p className="text-slate-500 font-medium">We're working on bringing more wellness items to the store.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </DashboardLayout>
    )
}
