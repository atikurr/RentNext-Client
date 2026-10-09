"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  BadgeCheck,
  ShieldCheck,
  MapPin,
  Search,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

const benefits = [
  {
    number: "01",
    icon: BadgeCheck,
    title: "Verified Properties",
    description:
      "Discover carefully listed properties with reliable information and quality details.",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "No Hidden Costs",
    description:
      "Enjoy a transparent rental experience with clear property information and pricing.",
  },
  {
    number: "03",
    icon: MapPin,
    title: "Best Locations",
    description:
      "Find comfortable rental properties in locations that match your lifestyle.",
  },
  {
    number: "04",
    icon: Search,
    title: "Easy Property Search",
    description:
      "Use smart filters to quickly find a property that fits your needs and budget.",
  },
];

export default function WhyChooseUs() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1.06, 1, 1.06]
  );

  const backgroundY1 = useTransform(
    scrollYProgress,
    [0, 1],
    [-60, 60]
  );

  const backgroundY2 = useTransform(
    scrollYProgress,
    [0, 1],
    [60, -60]
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-1 sm:py-16 lg:py-20"
    >
      {/* ================= BACKGROUND DECORATION ================= */}

      <motion.div
        style={{ y: backgroundY1 }}
        className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-orange-100/60 blur-3xl"
      />

      <motion.div
        style={{ y: backgroundY2 }}
        className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-orange-50 blur-3xl"
      />

      {/* ================= CONTAINER ================= */}

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">

          {/* ========================================================= */}
          {/* LEFT SIDE */}
          {/* ========================================================= */}

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative"
          >
            {/* Small Label */}

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
              }}
              className="mb-4 flex items-center gap-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <Sparkles size={15} />
              </span>

              <span className="text-sm font-bold uppercase tracking-[0.16em] text-orange-500">
                Why RentNest
              </span>
            </motion.div>

            {/* Heading */}

            <h2 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
              Why should you choose{" "}
              <span className="relative inline-block text-orange-500">
                RentNest?

                <motion.span
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: 0.35,
                    ease: "easeOut",
                  }}
                  className="absolute -bottom-1 left-0 h-1 rounded-full bg-orange-400"
                />
              </span>
            </h2>

            {/* Description */}

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.2,
              }}
              className="mt-5 max-w-lg text-base leading-7 text-slate-500 sm:text-lg"
            >
              We make finding your next rental simple, transparent, and
              comfortable. Everything you need is brought together in one
              place.
            </motion.p>

            {/* ================= IMAGE ================= */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.85,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative mt-7"
            >
              {/* Image Glow */}

              <div className="absolute -inset-3 rounded-[2rem] bg-orange-200/30 blur-2xl" />

              {/* Image Container */}

              <div className="group relative h-[360px] overflow-hidden rounded-[2rem] sm:h-[440px] lg:h-[500px]">
                <motion.div
                  style={{
                    y: imageY,
                    scale: imageScale,
                  }}
                  className="absolute inset-[-25px]"
                >
                  <Image
                    src="/assets/hero.png"
                    alt="Beautiful rental property"
                    fill
                    priority={false}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                </motion.div>

                {/* Image Overlay */}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-white/5" />

                {/* Bottom Glass Card */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.65,
                    duration: 0.6,
                  }}
                  animate={{
                    y: [0, -6, 0],
                  }}
                  className="absolute bottom-5 left-5 rounded-2xl border border-white/30 bg-white/85 px-5 py-4 shadow-xl backdrop-blur-xl"
                >
                  <p className="text-xs font-medium text-slate-500">
                    Your next place
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    Starts with RentNest
                  </p>
                </motion.div>

                {/* Top Right Button */}

                <motion.div
                  animate={{
                    y: [0, 5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/80 text-orange-500 shadow-lg backdrop-blur-xl"
                >
                  <ArrowUpRight size={20} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* ========================================================= */}
          {/* RIGHT SIDE */}
          {/* ========================================================= */}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.13,
                },
              },
            }}
            className="relative"
          >
            {/* Vertical Timeline */}

            <div className="absolute bottom-6 left-[25px] top-6 hidden w-px bg-slate-200 sm:block" />

            <div className="space-y-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <motion.div
                    key={benefit.number}
                    variants={{
                      hidden: {
                        opacity: 0,
                        x: 45,
                        y: 15,
                      },
                      visible: {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        transition: {
                          duration: 0.65,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                    }}
                    whileHover={{
                      x: 7,
                      transition: {
                        duration: 0.25,
                      },
                    }}
                    className="group relative"
                  >
                    <div className="relative flex gap-5 rounded-3xl border border-transparent p-5 transition-all duration-300 hover:border-orange-100 hover:bg-orange-50/50 hover:shadow-lg hover:shadow-orange-100/30 sm:p-6">

                      {/* Icon */}

                      <div className="relative z-10 shrink-0">
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            rotate: -5,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                          }}
                          className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-orange-100 bg-white text-orange-500 shadow-sm transition-all duration-300 group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-200"
                        >
                          <Icon
                            size={21}
                            strokeWidth={2.2}
                          />
                        </motion.div>
                      </div>

                      {/* Content */}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold tracking-widest text-orange-400">
                            {benefit.number}
                          </span>

                          <div className="h-px w-8 bg-slate-200 transition-all duration-300 group-hover:w-14 group-hover:bg-orange-300" />
                        </div>

                        <h3 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                          {benefit.title}
                        </h3>

                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                          {benefit.description}
                        </p>
                      </div>

                      {/* Arrow */}

                      <motion.div
                        initial={{
                          opacity: 0,
                          x: -5,
                        }}
                        whileHover={{
                          opacity: 1,
                          x: 0,
                        }}
                        className="hidden self-center text-orange-500 sm:block"
                      >
                        <ArrowUpRight size={20} />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ================= MINI STATS ================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.35,
              }}
              className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              {/* Stat 1 */}

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-md">
                <p className="text-2xl font-bold text-slate-900">
                  100%
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Simple Experience
                </p>
              </div>

              {/* Stat 2 */}

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-md">
                <p className="text-2xl font-bold text-slate-900">
                  24/7
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Platform Access
                </p>
              </div>

              {/* Stat 3 */}

              <div className="col-span-2 rounded-2xl border border-orange-100 bg-orange-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-orange-100 sm:col-span-1">
                <p className="text-2xl font-bold text-orange-500">
                  Easy
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Property Search
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}