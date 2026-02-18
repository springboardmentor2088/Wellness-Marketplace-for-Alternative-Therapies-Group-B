import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Profile, Booking } from '../api';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Star, MapPin, Search, Calendar, Sparkles, X } from 'lucide-react';

export function MarketplacePage() {
    const [practitioners, setPractitioners] = useState<Profile[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingPractitioner, setBookingPractitioner] = useState<Profile | null>(null);
    const [bookingNotes, setBookingNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const parts = await api.getAllPractitioners();
            setPractitioners(parts.filter(p => p.role === 'PROVIDER'));
            const me = await api.getProfile();
            setProfile(me);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBook = async () => {
        if (!bookingPractitioner || !profile) return;
        setLoading(true);
        try {
            const bookingData: Booking = {
                userId: profile.id,
                practitionerId: bookingPractitioner.id,
                status: 'PENDING',
                notes: bookingNotes
            };
            await api.createBooking(bookingData);
            setMessage(`Successfully requested booking with ${bookingPractitioner.name}`);
            setBookingPractitioner(null);
            setBookingNotes('');
        } catch (err) {
            console.error(err);
            setMessage('Failed to book session. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredPractitioners = practitioners.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.specialization && p.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <DashboardLayout sidebarItems={[
            { label: 'Marketplace', active: true, path: '/marketplace' },
            { label: 'My Dashboard', path: profile?.role === 'PROVIDER' ? '/practitioner' : '/user' }
        ]}>
            <div className="p-8 max-w-7xl mx-auto space-y-12 min-h-screen">
                <header className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-5xl font-black text-white tracking-tighter">
                            Discover <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">Alternative Therapies</span>
                        </h1>
                        <p className="text-gray-400 text-xl font-medium mt-4">Connect with verified practitioners for a holistic life.</p>
                    </motion.div>

                    <div className="max-w-2xl mx-auto relative group mt-8">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="Search by name or specialization (e.g., Ayurveda, Acupuncture)"
                            className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all text-lg shadow-2xl backdrop-blur-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPractitioners.map((p, idx) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={p.id}
                            className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-[2.5rem] p-4 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-[0_0_50px_-12px_rgba(6,182,212,0.3)] flex flex-col"
                        >
                            <div className="relative h-48 w-full rounded-[2rem] overflow-hidden mb-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="text-white/20" size={64} />
                                </div>
                                {p.verificationStatus === 'VERIFIED' && (
                                    <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg backdrop-blur-md">
                                        <CheckCircle2 size={12} /> Verified
                                    </div>
                                )}
                            </div>

                            <div className="px-4 pb-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">{p.name}</h3>
                                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                                        <Star size={16} fill="currentColor" /> 4.9
                                    </div>
                                </div>

                                <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-4">
                                    {p.specialization || 'General Wellness'}
                                </p>

                                <div className="space-y-2 mb-8 text-gray-400 text-sm">
                                    <p className="flex items-center gap-2">
                                        <MapPin size={14} className="text-gray-500" /> {p.city || 'Remote'}, {p.country}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-500" /> Next available: Tomorrow
                                    </p>
                                </div>

                                <button
                                    onClick={() => setBookingPractitioner(p)}
                                    className="w-full mt-auto bg-white text-black font-black py-4 rounded-2xl hover:bg-cyan-400 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-black/20"
                                >
                                    Book Session
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </main>

                <AnimatePresence>
                    {bookingPractitioner && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                                onClick={() => setBookingPractitioner(null)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative bg-gray-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6">
                                    <button onClick={() => setBookingPractitioner(null)} className="text-gray-500 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <h2 className="text-3xl font-black text-white mb-2">Book Session</h2>
                                <p className="text-gray-400 mb-8 font-medium">Request a new appointment with <span className="text-cyan-400">{bookingPractitioner.name}</span></p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Message / Notes</label>
                                        <textarea
                                            placeholder="Share what you hope to achieve in this session..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-500/50 min-h-[120px]"
                                            value={bookingNotes}
                                            onChange={(e) => setBookingNotes(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        onClick={handleBook}
                                        disabled={loading}
                                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-cyan-500/20 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Confirm Request'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {message && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 border border-cyan-500/30 text-cyan-400 px-8 py-4 rounded-full shadow-2xl z-50 font-bold"
                    >
                        {message}
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
}
