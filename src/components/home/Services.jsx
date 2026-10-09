"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Home, KeyRound, ShieldCheck, CreditCard } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./ServicesSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: "find-properties",
    number: "01",
    title: "Find Properties",
    slug: "properties",
    description:
      "Discover rental properties that match your location, budget, and lifestyle. Browse trusted listings and find the right place with less effort.",
    icon: Home,
    image: "/assets/hero.png",
  },
  {
    id: "easy-booking",
    number: "02",
    title: "Easy Booking",
    slug: "properties",
    description:
      "Choose your preferred property and send a booking request through a simple and smooth rental process.",
    icon: KeyRound,
    image: "/assets/hero.png",
  },
  {
    id: "verified-properties",
    number: "03",
    title: "Verified Properties",
    slug: "properties",
    description:
      "Browse admin-approved properties and make your rental decisions with greater confidence and transparency.",
    icon: ShieldCheck,
    image: "/assets/hero.png",
  },
  {
    id: "secure-payment",
    number: "04",
    title: "Secure Payment",
    slug: "properties",
    description:
      "Complete your reservation through a secure payment process designed to keep your transaction simple and reliable.",
    icon: CreditCard,
    image: "/assets/hero.png",
  },
];

/* =========================================================
   SERVICE TILT CARD
========================================================= */

export function ServiceTiltCard({ service }) {
  const cardRef = useRef(null);

  const [spotlight, setSpotlight] = useState({
    x: 0,
    y: 0,
    opacity: 0,
  });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    cardRef.current.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;

    setSpotlight({
      x,
      y,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;

    cardRef.current.style.transform = `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
    `;

    setSpotlight((prev) => ({
      ...prev,
      opacity: 0,
    }));
  };

  return (
    <Link
      ref={cardRef}
      href={`/properties`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={styles.stickyCard}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Cursor Spotlight */}
      <div
        className={styles.spotlight}
        style={{
          left: spotlight.x,
          top: spotlight.y,
          opacity: spotlight.opacity,
        }}
      />

      {/* Left Content */}
      <div className={styles.cardContent}>
        <div className={styles.cardTop}>
          <span className={styles.numberTag}>
            {service.number}
          </span>

          <div className={styles.divider} />

          <span className={styles.scopeTag}>
            RentNest Service
          </span>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.serviceIcon}>
            <service.icon size={25} strokeWidth={1.8} />
          </div>

          <h3 className={styles.cardTitle}>
            {service.title}
          </h3>

          <p className={styles.cardDescription}>
            {service.description}
          </p>
        </div>

        <div className={styles.cardAction}>
          <span>Explore Properties</span>

          <div className={styles.actionIcon}>
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>

      {/* Right Image */}
      <div className={styles.cardMedia}>
        <Image
          src={service.image}
          alt={service.title}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className={styles.mediaImage}
        />

        <div className={styles.mediaOverlay} />

        <div className={styles.imageBadge}>
          <span>RentNest</span>
          <strong>{service.number}</strong>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   SERVICES SECTION
========================================================= */

export default function Services() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean);

    if (!cards.length) return;

    const ctx = gsap.context(() => {
      cards.forEach((card, index) => {
        if (index === cards.length - 1) return;

        const nextCard = cards[index + 1];

        gsap.to(card, {
          scale: 0.9,
          opacity: 0.35,
          filter: "blur(4px)",
          ease: "none",

          scrollTrigger: {
            trigger: nextCard,

            /*
              Exactly like your reference.
              Next card comes from below.
            */
            start: "top 80%",
            end: "top 25%",

            scrub: 0.5,
          },
        });
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="services"
      ref={containerRef}
      className={styles.section}
    >
      <div className={styles.ambientGlow} />

      <div className={styles.inner}>
        {/* =========================
            HEADER
        ========================= */}

        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />

              WHY RENTNEST
            </div>

            <h2 className={styles.heading}>
              Everything you need for a{" "}
              <span>better rental experience.</span>
            </h2>
          </div>

          <div className={styles.headerRight}>
            <p className={styles.subtext}>
              From discovering the right property to making
              secure payments — RentNest makes your complete
              rental journey simple and trustworthy.
            </p>

            <Link
              href="/properties"
              className={styles.viewAll}
            >
              View All Properties
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        {/* =========================
            STACKED CARDS
        ========================= */}

        <div className={styles.cardsStack}>
          {services.map((service, index) => (
            <ServiceTiltCard
              key={service.id}
              service={service}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}