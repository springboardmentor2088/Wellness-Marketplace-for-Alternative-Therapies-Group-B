import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Profile, Booking } from '../api';
import { DashboardLayout } from '../components/DashboardLayout';
import { CheckCircle2, XCircle, FileText, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function PractitionerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [degreeFile, setDegreeFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const sidebarItems = [
    { label: 'Dashboard', path: '/practitioner' },
    { label: 'Profile', path: '/practitioner/profile' },
    { label: 'Upload Degree', path: '/practitioner/degree' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.getProfile();
      setProfile(res);
      if (res.id) {
        const bookingRes = await api.getPractitionerBookings(res.id);
        setBookings(bookingRes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const saveProfile = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await api.updateProfile(profile);
      setMessage('Profile updated successfully');
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDegreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDegreeFile(e.target.files[0]);
    }
  };

  const uploadDegree = async () => {
    if (!degreeFile || !profile) return;
    setLoading(true);
    try {
      await api.uploadDegree(degreeFile, profile.id);
      setMessage('Degree uploaded successfully');
      fetchProfile();
    } catch (err) {
      console.error(err);
      setMessage('Failed to upload degree');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20">
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Practitioner Dashboard
            </h2>
            <p className="text-gray-400">Welcome back, {profile.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {profile.verificationStatus === 'VERIFIED' ? (
              <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-500/30">
                <CheckCircle2 size={16} /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-semibold border border-amber-500/30">
                <XCircle size={16} /> {profile.verificationStatus}
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-400" /> Profile Details
            </h3>
            <div className="space-y-4">
              {['name', 'city', 'country', 'specialization'].map((field) => (
                <div key={field}>
                  <label className="block text-sm text-gray-400 capitalize">{field}:</label>
                  <input
                    type="text"
                    name={field}
                    value={(profile as any)[field] || ''}
                    onChange={handleProfileChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              ))}
              <button
                onClick={saveProfile}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </section>

          <section className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-emerald-400" /> Verification
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-dashed border-white/20">
                <label className="block text-sm text-gray-400 mb-2 font-medium">Upload Degree (PDF):</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleDegreeChange}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 transition-all"
                />
              </div>
              <button
                onClick={uploadDegree}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Degree'}
              </button>

              {profile.degreeFile && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-emerald-400">Degree Uploaded</p>
                      <p className="text-xs text-emerald-400/60">Verified security status</p>
                    </div>
                  </div>
                  <a
                    href={`http://localhost:8080/api/degree/${profile.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold uppercase tracking-wider text-emerald-400 hover:underline"
                  >
                    View PDF
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-purple-400" /> Recent Bookings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-4 font-semibold text-gray-400">User ID</th>
                  <th className="pb-4 font-semibold text-gray-400">Date</th>
                  <th className="pb-4 font-semibold text-gray-400">Status</th>
                  <th className="pb-4 font-semibold text-gray-400">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={booking.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 font-medium text-gray-200">#USER_{booking.userId}</td>
                      <td className="py-4 text-gray-400">
                        {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${booking.status === 'CONFIRMED' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                            booking.status === 'CANCELLED' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                              'border-blue-500/30 text-blue-400 bg-blue-500/10'
                          }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500 text-sm">{booking.notes || '-'}</td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500 italic">No bookings found yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {message && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-8 right-8 bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl z-50"
          >
            {message}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
