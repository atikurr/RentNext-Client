"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  CalendarCheck,
  CreditCard,
  KeyRound,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Search Property",
    description:
      "Search rental properties by location, property type, and budget to find places that match your needs.",
    icon: Search,
  },
  {
    number: "02",
    title: "View Details",
    description:
      "Explore property images, pricing, location, amenities, and important details before making your decision.",
    icon: Building2,
  },
  {
    number: "03",
    title: "Booking Request",
    description:
      "Found the right property? Send a booking request directly to the property owner.",
    icon: CalendarCheck,
  },
  {
    number: "04",
    title: "Secure Payment",
    description:
      "Once your booking is approved, complete the payment securely through the RentNest platform.",
    icon: CreditCard,
  },
  {
    number: "05",
    title: "Move Into Your Home",
    description:
      "After everything is confirmed, you're ready to move into your new rental home.",
    icon: KeyRound,
  },
];

export default function HowRentNestWorks() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-14 sm:py-18 lg:py-20">
      {/* =====================================================
          BACKGROUND IMAGE
      ====================================================== */}

      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/assets/how-it-works-bg.png')",
          }}
        />

        {/* Soft center wash */}
        <div className="absolute inset-0 bg-white/5" />

        {/* Center readability */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.86)_0%,rgba(255,255,255,0.35)_32%,rgba(255,255,255,0)_68%)]" />
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/75 px-4 py-2 text-sm font-semibold text-orange-500 shadow-sm backdrop-blur-md"
          >
            <Sparkles size={15} />
            Simple Process
          </motion.div>

          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
            How{" "}
            <span className="text-orange-500">RentNest</span>{" "}
            Works
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            From finding your perfect property to moving into your new home,
            RentNest keeps the entire rental journey simple.
          </p>
        </motion.div>

        {/* =====================================================
            DESKTOP
        ====================================================== */}

        <div className="relative mx-auto mt-8 hidden h-[700px] max-w-[1200px] lg:block">

          {/* =================================================
              ORBIT
          ================================================== */}

          <div className="absolute left-1/2 top-1/2 h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2">

            {/* Outer dotted orbit */}

            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 rounded-full border-[2px] border-dashed border-orange-400/70"
            />

            {/* Inner orbit */}

            <div className="absolute inset-[42px] rounded-full border border-orange-300/50" />

            {/* Orbit dots */}

            {[0, 72, 144, 216, 288].map((rotation) => (
              <motion.span
                key={rotation}
                style={{
                  transform: `rotate(${rotation}deg) translateY(-235px)`,
                }}
                className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 shadow-lg shadow-orange-300"
              />
            ))}
          </div>

          {/* =================================================
              CENTER HUB
          ================================================== */}

          <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">

            {/* Glow */}

            <div className="absolute -inset-8 rounded-full bg-orange-100/50 blur-3xl" />

            {/* Center */}

            <div className="relative flex h-[270px] w-[270px] flex-col items-center justify-center rounded-full border border-orange-200 bg-white/88 shadow-2xl shadow-orange-200/40 backdrop-blur-xl">

              {/* Progress ring */}

              <svg
                className="absolute -inset-[8px] h-[286px] w-[286px] -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="47"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-orange-100"
                />

                <motion.circle
                  cx="50"
                  cy="50"
                  r="47"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="text-orange-500"
                  strokeDasharray="295"
                  animate={{
                    strokeDashoffset:
                      295 - ((activeStep + 1) / steps.length) * 295,
                  }}
                  transition={{
                    duration: 0.8,
                  }}
                />
              </svg>

              {/* House style logo */}

              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-[72px] w-[72px] items-center justify-center rounded-3xl bg-orange-500 text-white shadow-xl shadow-orange-200"
              >
                {(() => {
                  const Icon = steps[activeStep].icon;
                  return <Icon size={34} strokeWidth={2} />;
                })()}
              </motion.div>

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                Step {steps[activeStep].number}
              </p>

              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                Rent<span className="text-orange-500">Nest</span>
              </h3>

              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <span>Simple</span>
                <span className="text-orange-400">•</span>
                <span>Secure</span>
                <span className="text-orange-400">•</span>
                <span>Better Living</span>
              </div>
            </div>
          </div>

          {/* =================================================
              01 TOP CENTER
          ================================================== */}

          <StepCard
            step={steps[0]}
            active={activeStep === 0}
            onClick={() => setActiveStep(0)}
            className="absolute left-1/2 top-0 z-20 w-[310px] -translate-x-1/2"
          />

          {/* =================================================
              02 RIGHT
          ================================================== */}

          <StepCard
            step={steps[1]}
            active={activeStep === 1}
            onClick={() => setActiveStep(1)}
            className="absolute right-0 top-[185px] z-20 w-[310px]"
          />

          {/* =================================================
              03 BOTTOM RIGHT
          ================================================== */}

          <StepCard
            step={steps[2]}
            active={activeStep === 2}
            onClick={() => setActiveStep(2)}
            className="absolute bottom-[5px] right-[6%] z-20 w-[310px]"
          />

          {/* =================================================
              04 BOTTOM LEFT
          ================================================== */}

          <StepCard
            step={steps[3]}
            active={activeStep === 3}
            onClick={() => setActiveStep(3)}
            className="absolute bottom-[5px] left-[25%] z-20 w-[310px]"
          />

          {/* =================================================
              05 LEFT
          ================================================== */}

          <StepCard
            step={steps[4]}
            active={activeStep === 4}
            onClick={() => setActiveStep(4)}
            className="absolute left-0 top-[185px] z-20 w-[310px]"
          />
        </div>

        {/* =====================================================
            MOBILE
        ====================================================== */}

        <div className="mt-10 lg:hidden">
          <div className="relative">

            <div className="absolute bottom-8 left-[25px] top-8 w-px bg-orange-200" />

            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const active = activeStep === index;

                return (
                  <motion.button
                    key={step.number}
                    type="button"
                    onClick={() => setActiveStep(index)}
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
                      delay: index * 0.08,
                    }}
                    className="relative z-10 flex w-full items-start gap-4 text-left"
                  >
                    <div
                      className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl ${
                        active
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                          : "border border-orange-100 bg-white text-orange-500"
                      }`}
                    >
                      <Icon size={21} />
                    </div>

                    <div
                      className={`flex-1 rounded-3xl border p-5 backdrop-blur-xl ${
                        active
                          ? "border-orange-200 bg-white/95 shadow-lg shadow-orange-100/50"
                          : "border-white bg-white/75"
                      }`}
                    >
                      <span className="text-xs font-bold tracking-widest text-orange-500">
                        {step.number}
                      </span>

                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        {step.title}
                      </h3>

                      <AnimatePresence>
                        {active && (
                          <motion.p
                            initial={{
                              opacity: 0,
                              height: 0,
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                            }}
                            className="mt-2 overflow-hidden text-sm leading-6 text-slate-500"
                          >
                            {step.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   STEP CARD
========================================================= */

function StepCard({ step, active, onClick, className }) {
  const Icon = step.icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{
        opacity: 0,
        scale: 0.92,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -6,
      }}
      className={`${className} text-left`}
    >
      <div
        className={`relative overflow-hidden rounded-[1.7rem] border p-5 backdrop-blur-md transition-all duration-300 ${
          active
            ? "border-orange-300 bg-white/92 shadow-2xl shadow-orange-200/60"
            : "border-white/70 bg-white/68 shadow-xl shadow-slate-300/20 hover:border-orange-200 hover:bg-white/85"
        }`}
      >
        {/* Active glow */}

        {active && (
          <motion.div
            layoutId="activeCardGlow"
            className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-orange-100 blur-2xl"
          />
        )}

        <div className="relative flex gap-4">

          {/* Icon */}

          <motion.div
            animate={{
              scale: active ? 1.08 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 18,
            }}
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              active
                ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                : "bg-orange-50 text-orange-500"
            }`}
          >
            <Icon size={23} strokeWidth={2} />
          </motion.div>

          {/* Content */}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-orange-500">
                {step.number}
              </span>

              {active && (
                <motion.span
                  layoutId="activeDot"
                  className="h-1.5 w-1.5 rounded-full bg-orange-500"
                />
              )}
            </div>

            <h3 className="mt-1 text-lg font-bold leading-tight text-slate-900">
              {step.title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {step.description}
            </p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}