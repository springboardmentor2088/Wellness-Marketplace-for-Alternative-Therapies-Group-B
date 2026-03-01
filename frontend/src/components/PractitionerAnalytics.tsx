import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown,
    Calendar, CreditCard, PieChart, Activity
} from 'lucide-react';
import { type PractitionerAnalytics as AnalyticsData } from '../api';

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

const GrowthIndicator = ({ percent }: { percent: number }) => {
    const isPositive = percent >= 0;
    return (
        <div className={`flex items-center gap-1 text-xs font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{isPositive ? '+' : ''}{percent.toFixed(1)}%</span>
        </div>
    );
};

const StatCard = ({ label, value, growth, icon, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-brand-500/5 group hover:border-brand-300 transition-all"
    >
        <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded-2xl bg-brand-50 text-brand-600 transition-transform group-hover:scale-110">
                {icon}
            </div>
            <GrowthIndicator percent={growth} />
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        </div>
    </motion.div>
);

export const PractitionerAnalytics: React.FC<Props> = ({ data, loading }) => {
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

    const accumulatedWorth = data.accumulatedRevenue || (data.totalSessionRevenue + data.totalProductRevenue);

    return (
        <div className="space-y-12 pb-12">
            {/* Revenue Overview */}
            <section>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-brand-600 rounded-2xl text-white shadow-lg shadow-brand-500/20">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Revenue Intelligence</h2>
                        <p className="text-sm text-slate-500 font-medium">Real-time performance metrics and growth trends.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Daily Revenue"
                        value={formatCurrency(data.dailyRevenue)}
                        growth={data.dailyGrowthPercent}
                        icon={<Calendar size={20} />}
                        delay={0.1}
                    />
                    <StatCard
                        label="Weekly Revenue"
                        value={formatCurrency(data.weeklyRevenue)}
                        growth={data.weeklyGrowthPercent}
                        icon={<Activity size={20} />}
                        delay={0.2}
                    />
                    <StatCard
                        label="Monthly Revenue"
                        value={formatCurrency(data.monthlyRevenue)}
                        growth={data.monthlyGrowthPercent}
                        icon={<PieChart size={20} />}
                        delay={0.3}
                    />
                    <StatCard
                        label="Yearly Revenue"
                        value={formatCurrency(data.yearlyRevenue)}
                        growth={data.yearlyGrowthPercent}
                        icon={<TrendingUp size={20} />}
                        delay={0.4}
                    />
                </div>
            </section>

            {/* Revenue Splits & Totals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h3 className="text-xl font-black mb-10 flex items-center gap-3">
                            <CreditCard className="text-brand-400" /> Revenue Distribution
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Session Revenue</p>
                                <p className="text-4xl font-black">{formatCurrency(data.totalSessionRevenue)}</p>
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-500 rounded-full"
                                        style={{ width: `${accumulatedWorth > 0 ? (data.totalSessionRevenue / accumulatedWorth) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Product Revenue</p>
                                <p className="text-4xl font-black">{formatCurrency(data.totalProductRevenue)}</p>
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-violet-500 rounded-full"
                                        style={{ width: `${accumulatedWorth > 0 ? (data.totalProductRevenue / accumulatedWorth) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-12 border-t border-white/10 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Accumulated Worth</p>
                                <p className="text-5xl font-black text-brand-400">{formatCurrency(accumulatedWorth)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">All Time Total</p>
                                <p className="text-2xl font-black text-white/50">{formatCurrency(data.allTimeRevenue)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px]" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-brand-500/5 flex flex-col"
                >
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <PieChart className="text-violet-500" /> Monthly Split
                    </h3>

                    <div className="space-y-8 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full bg-brand-500" />
                                <span className="text-sm font-bold text-slate-700">Sessions</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">{formatCurrency(data.sessionRevenueMonthly)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full bg-violet-500" />
                                <span className="text-sm font-bold text-slate-700">Products</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">{formatCurrency(data.productRevenueMonthly)}</span>
                        </div>

                        <div className="relative pt-8">
                            <div className="h-4 bg-slate-50 rounded-full flex overflow-hidden">
                                <div
                                    className="h-full bg-brand-500"
                                    style={{ width: `${(data.sessionRevenueMonthly / (data.sessionRevenueMonthly + data.productRevenueMonthly || 1)) * 100}%` }}
                                />
                                <div
                                    className="h-full bg-violet-500"
                                    style={{ width: `${(data.productRevenueMonthly / (data.sessionRevenueMonthly + data.productRevenueMonthly || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-brand-50 rounded-3xl border border-brand-100">
                        <p className="text-xs text-brand-700 font-bold leading-relaxed">
                            Your session revenue accounts for {((data.sessionRevenueMonthly / (data.sessionRevenueMonthly + data.productRevenueMonthly || 1)) * 100).toFixed(1)}% of this month's earnings.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
