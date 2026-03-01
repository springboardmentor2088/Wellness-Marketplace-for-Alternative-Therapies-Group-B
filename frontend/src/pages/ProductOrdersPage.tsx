import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Order, type Profile } from '../api'
import { ClipboardList, Package, Activity, ShoppingBag } from 'lucide-react'

class OrdersErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error: unknown) {
        console.error('Error rendering orders table:', error)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="py-20 text-center">
                    <div className="bg-slate-50 inline-block p-10 rounded-full mb-6 border border-slate-100">
                        <ShoppingBag size={48} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                        Unable to display orders
                    </p>
                    <p className="text-slate-500 text-sm mt-2 font-medium">
                        An unexpected error occurred while loading your order history.
                    </p>
                </div>
            )
        }

        return this.props.children
    }
}

export function ProductOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const userProfile = await api.getProfile()
            setProfile(userProfile)

            let fetchedOrders: Order[] = []
            if (userProfile.role === 'CLIENT') {
                fetchedOrders = await api.getUserOrders(userProfile.id)
            } else if (userProfile.role === 'PROVIDER') {
                fetchedOrders = await api.getProviderOrders(userProfile.id)
            }
            setOrders(fetchedOrders)
        } catch (err) {
            console.error('Failed to fetch orders:', err)
        } finally {
            setLoading(false)
        }
    }

    const sidebarItems = profile?.role === 'CLIENT' ? [
        { label: 'Dashboard', path: '/user', icon: <Activity size={20} /> },
        { label: 'Products', path: '/products', icon: <ShoppingBag size={20} /> },
        { label: 'Product Orders', path: '/product-orders', active: true, icon: <ClipboardList size={20} /> },
    ] : [
        { label: 'Overview', path: '/practitioner', icon: <Activity size={20} /> },
        { label: 'My Products', path: '/my-products', icon: <Package size={20} /> },
        { label: 'Product Orders', path: '/product-orders', active: true, icon: <ClipboardList size={20} /> },
    ]

    if (loading || !profile) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
                <Activity size={32} className="text-brand-600" />
            </motion.div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading order history...</p>
        </div>
    )

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <header className="bg-gradient-to-r from-brand-600 to-indigo-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-brand-500/20">
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <ClipboardList size={36} /> {profile.role === 'CLIENT' ? 'My Purchases' : 'Store Orders'}
                    </h1>
                    <p className="text-white/80 font-medium flex items-center gap-2">
                        Track and manage all product transactions in your wellness journey.
                    </p>
                </header>

                <section className="">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <ShoppingBag size={24} className="text-brand-600" /> Recent Purchases
                        </h2>
                        <span className="bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100">
                            {orders.length} Total Orders
                        </span>
                    </div>

                    <OrdersErrorBoundary>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {orders.length > 0 ? (
                                orders.map((order, idx) => {
                                    const statusClass =
                                        order.deliveryStatus === 'DELIVERED'
                                            ? 'border-emerald-200 text-emerald-600 bg-emerald-50'
                                            : 'border-amber-200 text-amber-600 bg-amber-50'

                                    return (
                                        <motion.div
                                            key={order.orderId ?? idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-white rounded-[3rem] border border-brand-100/50 p-8 shadow-xl shadow-brand-500/5 flex flex-col gap-6 group hover:border-brand-300 transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                                                    {order.productImage ? (
                                                        <img
                                                            src={`http://localhost:8080/${order.productImage}`}
                                                            alt={order.productName}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                            <Package size={40} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusClass}`}>
                                                    {order.deliveryStatus}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                                                    {order.productName}
                                                </h3>
                                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                                    Ordered: {new Date(order.orderDate).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Quantity</span>
                                                    <span className="text-sm font-black text-slate-900">{order.quantity} Units</span>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Price</span>
                                                    <span className="text-sm font-black text-brand-600">₹ {order.totalAmount.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 rounded-3xl p-5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-brand-600 shadow-sm border border-brand-100/50">
                                                        <Activity size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Status Tracking</span>
                                                        <span className="text-xs font-bold text-slate-600 block">
                                                            {order.deliveryStatus === 'DELIVERED' ? 'Arrived on ' : 'Expected '}
                                                            {new Date(order.deliveryDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })
                            ) : (
                                <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border border-brand-100 shadow-xl shadow-brand-500/5">
                                    <div className="bg-slate-50 inline-block p-16 rounded-full mb-8">
                                        <ShoppingBag size={80} className="text-slate-200" />
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-3">No orders yet</h2>
                                    <p className="text-slate-500 text-lg font-medium">Your marketplace activity will appear here.</p>
                                </div>
                            )}
                        </div>
                    </OrdersErrorBoundary>
                </section>
            </motion.div>
        </DashboardLayout>
    )
}
