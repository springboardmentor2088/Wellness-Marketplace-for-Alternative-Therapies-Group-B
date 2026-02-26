import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Order, type Profile } from '../api'
import { ClipboardList, Package, Activity, ShoppingBag, Table } from 'lucide-react'

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

                <section className="bg-white rounded-[3rem] border border-brand-100/50 p-10 shadow-xl shadow-brand-500/5">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <Table size={24} className="text-brand-600" /> Order History
                        </h2>
                        <span className="bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100">
                            {orders.length} Total Orders
                        </span>
                    </div>

                    <OrdersErrorBoundary>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Product</th>
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Qty</th>
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Price</th>
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {orders.length > 0 ? (
                                        orders.map((order, idx) => {
                                            const safeProductName = order.product?.name ?? `Product #${order.productId ?? 'N/A'}`
                                            const safeProductInitial = safeProductName?.charAt(0) || 'P'
                                            const safeDate = order.orderDate
                                                ? new Date(order.orderDate).toLocaleString()
                                                : 'N/A'
                                            const safeQuantity = order.quantity ?? 0
                                            const safeTotal = Number(order.totalPrice ?? 0)
                                            const displayTotal = safeTotal.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })
                                            const status = order.deliveryStatus || order.status || 'PENDING'
                                            const statusClass =
                                                status === 'DELIVERED'
                                                    ? 'border-emerald-200 text-emerald-600 bg-emerald-50'
                                                    : status === 'CANCELLED'
                                                        ? 'border-rose-200 text-rose-600 bg-rose-50'
                                                        : 'border-amber-200 text-amber-600 bg-amber-50'

                                            return (
                                                <motion.tr
                                                    key={order.orderId ?? idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="group hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <td className="py-6 pl-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-xs">
                                                                {safeProductInitial}
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-slate-900 block">
                                                                    {safeProductName}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                                    ID: {order.orderId ?? 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 text-sm font-bold text-slate-600 tabular-nums">
                                                        {safeDate}
                                                    </td>
                                                    <td className="py-6 text-sm font-black text-slate-900">
                                                        {safeQuantity}
                                                    </td>
                                                    <td className="py-6 text-sm font-black text-brand-600 tracking-tight">
                                                        ₹ {displayTotal}
                                                    </td>
                                                    <td className="py-6">
                                                        <span
                                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusClass}`}
                                                        >
                                                            {status}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <div className="bg-slate-50 inline-block p-10 rounded-full mb-6 border border-slate-100">
                                                    <ShoppingBag size={48} className="text-slate-200" />
                                                </div>
                                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                                    No orders found
                                                </p>
                                                <p className="text-slate-500 text-sm mt-2 font-medium">
                                                    Your marketplace activity will appear here.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </OrdersErrorBoundary>
                </section>
            </motion.div>
        </DashboardLayout>
    )
}
