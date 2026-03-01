import React from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag, Calendar, CreditCard,
    TrendingUp, User
} from 'lucide-react';
import { type PatientAnalytics as AnalyticsData, type Booking, type Order } from '../api';

interface Props {
    data: AnalyticsData | null;
    loading: boolean;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

const ActivityCard = ({ label, value, icon, color, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-brand-500/5 group hover:border-brand-300 transition-all"
    >
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 mb-6 w-fit transition-transform group-hover:scale-110`}>
            {React.cloneElement(icon, { className: color })}
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        </div>
    </motion.div>
);

export const PatientActivity: React.FC<Props> = ({ data, loading }) => {
    if (loading || !data) {
        return (
            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-44 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100" />
                    ))}
                </div>
                <div className="h-96 bg-slate-50 animate-pulse rounded-[3rem]" />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-12">
            {/* Spend Summary */}
            <section>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Activity Hub</h2>
                        <p className="text-sm text-slate-500 font-medium">Tracking your wellness journey and investments.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ActivityCard
                        label="Total Invested"
                        value={formatCurrency(data.totalSpent)}
                        icon={<CreditCard size={20} />}
                        color="text-brand-600"
                        delay={0.1}
                    />
                    <ActivityCard
                        label="Sessions Attended"
                        value={data.sessionsAttended.toString()}
                        icon={<Calendar size={20} />}
                        color="text-indigo-600"
                        delay={0.2}
                    />
                    <ActivityCard
                        label="Monthly Spend"
                        value={formatCurrency(data.monthlySpent)}
                        icon={<ShoppingBag size={20} />}
                        color="text-violet-600"
                        delay={0.3}
                    />
                    <ActivityCard
                        label="Yearly Spend"
                        value={formatCurrency(data.yearlySpent)}
                        icon={<TrendingUp size={20} />}
                        color="text-emerald-600"
                        delay={0.4}
                    />
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Sessions */}
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-brand-500/5"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <Calendar className="text-brand-500" /> Recent Sessions
                    </h3>
                    <div className="space-y-4">
                        {data.recentSessions && data.recentSessions.length > 0 ? data.recentSessions.map((session: Booking, idx: number) => (
                            <div key={session.id || idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] group hover:bg-brand-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl text-brand-600 shadow-sm transition-transform group-hover:scale-110">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Expert ID #{session.practitionerId}</p>
                                        <p className="text-[10px] font-bold text-slate-400">
                                            {session.bookingDate ? new Date(session.bookingDate).toLocaleDateString() : 'Date Pending'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-brand-600">{formatCurrency(session.sessionFee || 0)}</p>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded-full">
                                        {session.status}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center py-10 text-slate-400 font-medium italic">No sessions found</p>
                        )}
                    </div>
                </motion.section>

                {/* Recent Orders */}
                <motion.section
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-brand-500/5"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <ShoppingBag className="text-violet-500" /> Product Purchases
                    </h3>
                    <div className="space-y-4">
                        {data.recentOrders && data.recentOrders.length > 0 ? data.recentOrders.map((order: Order, idx: number) => (
                            <div key={order.orderId || idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] group hover:bg-violet-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shadow-sm transition-transform group-hover:scale-110">
                                        {order.productImage ? (
                                            <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-violet-600">
                                                <ShoppingBag size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{order.productName}</p>
                                        <p className="text-[10px] font-bold text-slate-400">Qty: {order.quantity}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-violet-600">{formatCurrency(order.totalAmount)}</p>
                                    <p className="text-[10px] font-bold text-slate-400">
                                        {new Date(order.orderDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center py-10 text-slate-400 font-medium italic">No orders found</p>
                        )}
                    </div>
                </motion.section>
            </div>
        </div>
    );
};
