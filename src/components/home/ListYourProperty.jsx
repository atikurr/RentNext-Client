"use client";

import { motion } from "framer-motion";
import {
  Home,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const benefits = [
  "Reach potential tenants",
  "Manage your property easily",
  "Receive booking requests",
];

export default function ListYourProperty() {
  return (
    <section className="relative overflow-hidden bg-white py-14 sm:py-18 lg:py-20">
      {/* Background */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-orange-100/60 blur-3xl" />

        <div className="absolute -right-40 top-0 h-80 w-80 rounded-full bg-orange-50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 35,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative overflow-hidden rounded-[2rem] bg-slate-950"
        >
          {/* Orange Glow */}

          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-orange-500 blur-3xl"
          />

          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.08, 0.18, 0.08],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-orange-500 blur-3xl"
          />

          <div className="relative grid items-center gap-10 px-7 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.2fr_0.8fr] lg:px-14 lg:py-14">

            {/* =================================================
                LEFT
            ================================================== */}

            <div>
              {/* Badge */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: -15,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400"
              >
                <Sparkles size={15} />
                For Property Owners
              </motion.div>

              {/* Heading */}

              <h2 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Have a property to rent?
                <span className="mt-1 block text-orange-500">
                  List it on RentNest.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
                Connect your property with potential tenants and manage your
                rental journey through one simple platform.
              </p>

              {/* Benefits */}

              <div className="mt-7 space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                    }}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-400">
                      <CheckCircle2 size={15} />
                    </span>

                    {benefit}
                  </motion.div>
                ))}
              </div>

              {/* CTA */}

              <motion.a
                href="/dashboard/owner/add-property"
                whileHover={{
                  scale: 1.04,
                  x: 3,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-600"
              >
                List Your Property
                <ArrowRight size={18} />
              </motion.a>
            </div>

            {/* =================================================
                RIGHT VISUAL
            ================================================== */}

            <div className="relative flex min-h-[300px] items-center justify-center lg:min-h-[340px]">

              {/* Orbit */}

              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute h-64 w-64 rounded-full border border-dashed border-orange-500/20 sm:h-72 sm:w-72"
              />

              {/* Main Circle */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.15,
                }}
                className="relative z-10 flex h-52 w-52 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl sm:h-60 sm:w-60"
              >
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-orange-500 text-white shadow-2xl shadow-orange-500/30"
                >
                  <Home size={45} strokeWidth={1.7} />
                </motion.div>
              </motion.div>

              {/* Floating Card 1 */}

              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-0 top-8 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl"
              >
                <p className="text-xs text-slate-400">
                  Reach tenants
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  Faster
                </p>
              </motion.div>

              {/* Floating Card 2 */}

              <motion.div
                animate={{
                  y: [0, 8, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-8 right-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl"
              >
                <p className="text-xs text-slate-400">
                  Property management
                </p>

                <p className="mt-1 text-sm font-bold text-orange-400">
                  Simple
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}