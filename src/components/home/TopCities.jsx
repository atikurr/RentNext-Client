"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, Building2, MapPin, Sparkles } from "lucide-react";

const cities = [
  {
    name: "Dhaka",
    description: "Find modern apartments and comfortable homes across Dhaka.",
    properties: "120+ Properties",
    image: "/assets/hero.png",
  },
  {
    name: "Chattogram",
    description:
      "Explore comfortable rental homes in one of Bangladesh's major cities.",
    properties: "80+ Properties",
    image: "/assets/hero.png",
  },
  {
    name: "Sylhet",
    description:
      "Discover peaceful homes and apartments in beautiful Sylhet.",
    properties: "60+ Properties",
    image: "/assets/hero.png",
  },
];

export default function TopCities() {
  return (
    <section className="relative overflow-hidden bg-white py-4 sm:py-4 lg:py-4">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-100 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-orange-50 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
            <Sparkles size={16} />
            Popular Locations
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Explore Top{" "}
            <span className="text-orange-500">Cities</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Discover verified rental properties in some of the most popular
            cities across Bangladesh.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {cities.map((city, index) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
              }}
              whileHover={{ y: -8 }}
              className="group relative h-[430px] overflow-hidden rounded-3xl bg-slate-900 shadow-xl"
            >
              {/* Image */}
              <Image
                src={city.image}
                alt={`${city.name} rental properties`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute inset-0 bg-orange-500/0 transition duration-500 group-hover:bg-orange-500/10" />

              {/* Top Badge */}
              <div className="absolute left-5 top-5">
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
                  <MapPin size={14} className="text-orange-400" />
                  Bangladesh
                </div>
              </div>

              {/* Arrow */}
              <div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-md transition duration-300 group-hover:border-orange-500 group-hover:bg-orange-500">
                <ArrowUpRight size={20} />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-orange-300">
                  <Building2 size={15} />
                  {city.properties}
                </div>

                <h3 className="text-3xl font-bold text-white">
                  {city.name}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/75">
                  {city.description}
                </p>

                {/* Explore Link */}
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white">
                  Explore Properties
                  <ArrowUpRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}