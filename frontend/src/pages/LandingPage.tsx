import { Link } from "react-router-dom";
import { TopNav } from "../components/TopNav";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Star,
  Heart,
  Activity,
  ChevronRight,
} from "lucide-react";

export function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // fixed easing
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      <TopNav />

      <main>
        {/* HERO */}
        <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <h1 className="text-5xl lg:text-7xl font-black leading-tight text-slate-900">
                  Find the{" "}
                  <span className="text-brand-600">Right Therapy</span> for
                  Your Wellness
                </h1>

                <p className="text-xl text-slate-600 max-w-lg font-medium">
                  Connecting you with trusted holistic health practitioners and
                  wellness solutions in one seamless experience.
                </p>

                <div className="flex gap-4 pt-4">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link
                      to="/register?role=PATIENT"
                      className="flex items-center gap-2 rounded-2xl bg-brand-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-brand-700 transition"
                    >
                      Book a Session
                      <ArrowRight size={18} />
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link
                      to="/register?role=PRACTITIONER"
                      className="flex items-center rounded-2xl border px-8 py-4 text-lg font-bold text-slate-700 hover:border-brand-500 hover:text-brand-600 transition"
                    >
                      Join as Practitioner
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="relative"
              >
                <div className="overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    src="https://images.pexels.com/photos/3738341/pexels-photo-3738341.jpeg"
                    alt="Wellness"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* THERAPIES */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-900">
                  Popular Therapies
                </h2>
                <p className="text-slate-500 font-medium">
                  Explore treatments tailored to your wellness goals.
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    name: "Acupuncture",
                    description:
                      "Traditional Chinese medicine to balance energy flow.",
                    icon: <Activity className="text-brand-600" />,
                  },
                  {
                    name: "Ayurveda",
                    description:
                      "Ancient Indian system of integrative medicine.",
                    icon: <Heart className="text-rose-500" />,
                  },
                  {
                    name: "Chiropractic",
                    description:
                      "Expert spinal adjustments for nerve system health.",
                    icon: <Star className="text-amber-500" />,
                  },
                ].map((therapy) => (
                  <motion.div
                    key={therapy.name}
                    variants={itemVariants}
                    whileHover={{ y: -10 }}
                    className="rounded-3xl bg-[#F8FAFC] p-8 shadow-lg border transition"
                  >
                    <div className="mb-4">{therapy.icon}</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {therapy.name}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {therapy.description}
                    </p>
                    <button className="flex items-center gap-2 mt-4 text-sm font-bold text-brand-600 hover:gap-3 transition">
                      Explore <ChevronRight size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-brand-600 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <Heart
              size={40}
              className="mx-auto mb-6"
              fill="currentColor"
            />
            <h2 className="text-4xl font-black mb-4">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="mb-8 text-brand-100">
              Join thousands on the path to holistic healing.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-brand-600 px-8 py-4 rounded-2xl font-bold shadow hover:bg-brand-50 transition"
            >
              Create Your Account
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-10 border-t bg-white text-center text-slate-400 text-sm">
        © 2026 Wellness Hub Marketplace. All rights reserved.
      </footer>
    </div>
  );
}
