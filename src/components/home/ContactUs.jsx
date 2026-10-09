"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Send,
  Clock3,
  MessageCircle,
  Sparkles,
} from "lucide-react";

const contactItems = [
  {
    icon: Mail,
    title: "Email Us",
    value: "support@rentnest.com",
    description: "We'll reply within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    value: "+880 1234-567890",
    description: "Mon - Sat, 9:00 AM - 6:00 PM",
  },
  {
    icon: MapPin,
    title: "Our Location",
    value: "Dhaka, Bangladesh",
    description: "Serving renters & owners nationwide",
  },
];

export default function ContactUs() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-orange-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
            <MessageCircle size={16} />
            Lets Talk
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Have Questions?
            <span className="block text-orange-500">
              We are Here to Help.
            </span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
            Whether you are looking for your next home or want to list your
            property, our team is ready to help you every step of the way.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white sm:p-9 lg:p-10"
          >
            {/* Glow */}
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20">
                <Sparkles size={26} />
              </div>

              <h3 className="text-2xl font-bold sm:text-3xl">
                Lets make your
                <span className="block text-orange-400">
                  rental journey easier.
                </span>
              </h3>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                Need help finding a property, understanding a listing, or
                getting your property published? Reach out to the RentNest
                team.
              </p>

              {/* Contact Items */}
              <div className="mt-8 space-y-5">
                {contactItems.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                      }}
                      className="group flex items-start gap-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-orange-400 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white">
                        <Icon size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.title}
                        </p>

                        <p className="mt-1 text-sm font-medium text-orange-400">
                          {item.value}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Availability */}
              <div className="mt-9 flex items-center gap-3 border-t border-white/10 pt-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Clock3 size={17} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Support available
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Usually responds within a few hours
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10"
          >
            <div className="mb-7">
              <p className="text-sm font-semibold text-orange-500">
                Contact Form
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                Send us a message
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Fill out the form and our team will get back to you soon.
              </p>
            </div>

            <form className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Your Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject
                </label>

                <input
                  id="subject"
                  type="text"
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  rows={5}
                  placeholder="Write your message here..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:bg-orange-600"
              >
                Send Message
                <Send
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </motion.button>

              <p className="text-center text-xs text-slate-400">
                We respect your privacy and never share your information.
              </p>
            </form>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 flex flex-col items-center justify-between gap-5 rounded-2xl border border-orange-100 bg-orange-50/70 px-6 py-5 sm:flex-row sm:px-8"
        >
          <div>
            <p className="font-bold text-slate-900">
              Ready to find your next home?
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Explore verified rental properties on RentNest.
            </p>
          </div>

          <motion.a
            href="/properties"
            whileHover={{ x: 3 }}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
          >
            Browse Properties
            <ArrowRight size={17} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}