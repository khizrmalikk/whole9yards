"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { motion, useInView } from "motion/react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Project } from "@/types/project";
import Link from "next/link";
import Image from "next/image";

// Fallback data for when no projects exist
const fallbackData: Project[] = [
  {
    id: "1",
    thumbnail: "/bgs/UC_06048.JPG",
    title: "Modern Office Space",
    description:
      "A stunning modern office space in the heart of the city featuring contemporary design elements, open layouts, and premium finishes. This project showcases our ability to create functional yet beautiful commercial spaces that inspire productivity and creativity. The design incorporates natural light, sustainable materials, and flexible workspaces that adapt to the evolving needs of modern businesses.",
    category: "Commercial",
    type: "Office",
    size: "2,500 sq ft",
    location: "Downtown Manhattan",
    pictures: ["/bgs/UC_06048.JPG", "/bgs/UC_06123.JPG", "/bgs/UC_05990.JPG"],
    createdAt: new Date(),
  },
  {
    id: "2",
    thumbnail: "/bgs/UC_06048.JPG",
    title: "Luxury Apartment",
    description:
      "Elegant luxury apartment with breathtaking city views, featuring high-end materials, custom furnishings, and a sophisticated color palette that creates a serene living environment. Every detail has been carefully considered to create a harmonious balance between comfort and style, from the custom millwork to the curated art collection.",
    category: "Residential",
    type: "Apartment",
    size: "1,200 sq ft",
    location: "Brooklyn Heights",
    pictures: ["/bgs/UC_06048.JPG", "/bgs/UC_05990.JPG"],
    createdAt: new Date(),
  },
  {
    id: "3",
    thumbnail: "/bgs/UC_06123.JPG",
    title: "Retail Storefront",
    description:
      "Prime retail location with high foot traffic, designed to maximize customer engagement through strategic layout, lighting, and visual merchandising elements. The space combines modern aesthetics with practical functionality, creating an inviting atmosphere that encourages exploration and enhances the shopping experience.",
    category: "Commercial",
    type: "Retail",
    size: "800 sq ft",
    location: "SoHo District",
    pictures: ["/bgs/UC_06123.JPG", "/bgs/UC_06048.JPG"],
    createdAt: new Date(),
  },
  // {
  //   id: "4",
  //   thumbnail: "/bgs/UC_05990.JPG",
  //   title: "Co-working Space",
  //   description: "Modern co-working space designed for productivity and collaboration, featuring flexible layouts, natural lighting, and sustainable materials throughout. The design promotes community interaction while providing quiet zones for focused work, incorporating biophilic design elements that enhance well-being and creativity.",
  //   category: "Commercial",
  //   type: "Office",
  //   size: "5,000 sq ft",
  //   location: "Midtown West",
  //   pictures: ["/bgs/UC_05990.JPG", "/bgs/UC_06123.JPG", "/bgs/UC_06048.JPG"],
  //   createdAt: new Date(),
  // },
  // {
  //   id: "5",
  //   thumbnail: "/bgs/UC_06048.JPG",
  //   title: "Penthouse Suite",
  //   description: "Luxurious penthouse with panoramic city views, featuring custom millwork, premium appliances, and carefully curated art pieces that reflect the client's personal style. The design seamlessly blends indoor and outdoor living spaces, creating a sophisticated urban retreat that maximizes natural light and architectural details.",
  //   category: "Residential",
  //   type: "Penthouse",
  //   size: "3,200 sq ft",
  //   location: "Upper East Side",
  //   pictures: ["/bgs/UC_06048.JPG", "/bgs/UC_05990.JPG", "/bgs/UC_06123.JPG"],
  //   createdAt: new Date(),
  // },
  // {
  //   id: "6",
  //   thumbnail: "/bgs/UC_06123.JPG",
  //   title: "Creative Studio",
  //   description: "Inspiring creative studio space for artists and designers, featuring flexible work areas, abundant natural light, and industrial elements balanced with warm, organic materials. The design supports various creative processes while maintaining an atmosphere that stimulates innovation and artistic expression.",
  //   category: "Commercial",
  //   type: "Studio",
  //   size: "1,800 sq ft",
  //   location: "Williamsburg",
  //   pictures: ["/bgs/UC_06123.JPG", "/bgs/UC_06048.JPG", "/bgs/UC_05990.JPG"],
  //   createdAt: new Date(),
  // },
];

const heroHighlights = [
  {
    tag: "Residential",
    title: "Layered homes",
    description:
      "Understated apartments and villas that balance calm palettes with one-of-a-kind objects.",
  },
  {
    tag: "Hospitality",
    title: "Boutique stays",
    description:
      "Sculpted guest experiences for rentals and hotels with resilient materials and curated art.",
  },
  {
    tag: "Commercial",
    title: "Purposeful workspaces",
    description:
      "Studios and offices that pair ergonomic planning with tactile finishes and lighting.",
  },
];

const studioMetrics = [
  { label: "Years crafting interiors", value: "10+" },
  { label: "Completed spaces", value: "120" },
  { label: "Cities we service", value: "3" },
  { label: "Custom pieces sourced", value: "350+" },
];

const aboutHighlights = [
  {
    title: "Bespoke partnership",
    description:
      "We keep the studio intentionally small so every client collaborates directly with Sana—from mood boards and sourcing to the final styling day.",
  },
  {
    title: "Layered materiality",
    description:
      "Our wabi-sabi lens pairs limewash, raw timber, handmade textiles, and curated art to create soulful rooms that feel collected rather than staged.",
  },
  {
    title: "Purposeful furnishing",
    description:
      "We mix heirloom-quality pieces with vintage finds, reupholster what you love, and source statement items that add character without visual noise.",
  },
];

const missionPillars = [
  {
    title: "Contemporary calm",
    description:
      "Clean architectural lines soften with tactile fabrics and artful lighting to create quietly confident spaces.",
    focus: "Aesthetic",
  },
  {
    title: "Space fluency",
    description:
      "Smart planning ensures every square foot works hard—whether it is a family home, boutique rental, or collaborative workspace.",
    focus: "Planning",
  },
  {
    title: "Premium craft",
    description:
      "A trusted network of artisans delivers bespoke joinery, upholstery, and finishes that age beautifully.",
    focus: "Craft",
  },
  {
    title: "Thoughtful palettes",
    description:
      "Layered neutrals, warm woods, and muted metals set the tone while tailored colour accents keep each project distinct.",
    focus: "Colour",
  },
];

interface CardProps {
  data: Project;
  index: number;
}

const Card = ({ data, index }: CardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px 0px -100px 0px", // Trigger animation when card is 100px from viewport
  });

  return (
    <Link
      href={`/project/${data.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={
          isInView
            ? {
                opacity: 1,
                y: 0,
                scale: 1,
              }
            : {
                opacity: 0,
                y: 100,
                scale: 0.9,
              }
        }
        transition={{
          duration: 0.8,
          delay: index * 0.1, // Stagger animation based on card index
          ease: "easeOut",
        }}
        className="relative h-[520px] overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm"
      >
        <div className="absolute inset-0">
          <Image
            src={data.thumbnail}
            alt={data.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={index < 3}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyDjckkkfxfkBlm9n"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80 transition-opacity duration-500 group-hover:from-black/30 group-hover:via-black/60 group-hover:to-black/90" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-8 text-white">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-white/70">
            <span className="rounded-full border border-white/40 px-3 py-1 text-xs font-semibold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{data.category}</span>
          </div>

          <div className="space-y-5">
            <motion.h3
              className="text-4xl font-semibold tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {
                      opacity: 0,
                      y: 30,
                    }
              }
              transition={{
                duration: 0.6,
                delay: index * 0.1 + 0.3,
              }}
            >
              {data.title}
            </motion.h3>

            <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
              <div>
                <p className="text-white/60">Type</p>
                <p className="font-medium">{data.type}</p>
              </div>
              <div>
                <p className="text-white/60">Size</p>
                <p className="font-medium">{data.size}</p>
              </div>
              <div className="col-span-2">
                <p className="text-white/60">Location</p>
                <p className="font-medium">{data.location}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-white/70">
              <span>View project</span>
              <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const ProjectGrid = ({
  items,
  categories,
  activeCategory,
  onCategoryChange,
}: {
  items: Project[];
  categories: string[];
  activeCategory: string;
  onCategoryChange: (value: string) => void;
}) => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">
            Featured work
          </p>
          <h2 className="text-4xl font-light tracking-tight text-white sm:text-5xl">
            Projects we&apos;re proud of
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
                activeCategory === category
                  ? "border-white bg-white text-black"
                  : "border-white/30 text-white/70 hover:border-white hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <Card key={item.id} data={item} index={index} />
        ))}
      </div>
    </div>
  );
};

const HomeNav = ({ visible }: { visible?: boolean }) => (
  <NavBody
    className="rounded-[40px] border border-white/15 bg-white/[0.04] px-6 py-3 text-white shadow-[0_0_40px_rgba(0,0,0,0.25)] backdrop-blur-xl"
    visible={visible}
  >
    <div className="flex items-center gap-4">
      <NavbarLogo />
      {!visible && (
        <span className="hidden text-[0.65rem] uppercase tracking-[0.4em] text-white/60 md:inline-flex">
          Interior studio
        </span>
      )}
    </div>
    <NavItems
      className="text-[0.65rem] uppercase tracking-[0.4em] text-white/60"
      items={[
        { name: "Home", link: "/" },
        { name: "About", link: "/#about" },
        { name: "Portfolio", link: "/#portfolio" },
      ]}
    />
    <NavbarButton
      href="mailto:Sana@thew9y.com"
      className="rounded-full border-white/50 px-6 py-2 text-[0.65rem] uppercase tracking-[0.4em]"
    >
      Start a project
    </NavbarButton>
  </NavBody>
);

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    // Trigger the loading animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Load projects
    const loadProjects = async () => {
      try {
        // Try to fetch from API first
        const response = await fetch("/api/projects");
        if (response.ok) {
          const apiProjects = await response.json();
          if (apiProjects.length > 0) {
            setProjects(apiProjects);
            return;
          }
        }
      } catch (error) {
        console.log("API not available, trying localStorage");
      }

      // Fallback to localStorage
      try {
        const savedProjects = localStorage.getItem("portfolio-projects");
        if (savedProjects) {
          const parsedProjects = JSON.parse(savedProjects);
          if (parsedProjects.length > 0) {
            setProjects(parsedProjects);
            return;
          }
        }
      } catch (error) {
        console.log("localStorage not available");
      }

      // Final fallback to demo data
      setProjects(fallbackData);
    };

    loadProjects();

    return () => clearTimeout(timer);
  }, []);

  const categoryOptions = useMemo(() => {
    const source = projects.length ? projects : fallbackData;
    const unique = Array.from(new Set(source.map((project) => project.category)));
    return ["All", ...unique];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (categoryFilter === "All") {
      return projects;
    }
    return projects.filter((project) => project.category === categoryFilter);
  }, [projects, categoryFilter]);

  return (
    <motion.div
      className="min-h-screen"
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{
        type: "tween",
        ease: "easeInOut",
        duration: 0.6,
      }}
    >
      {/* Navbar */}
      <Navbar className="top-6">
        <HomeNav />
      </Navbar>

      {/* Hero */}
      <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#050505] text-white">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <Image
            src="/bgs/UC_05990.JPG"
            alt="Hero background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyDjckkkfxfkBlm9n"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/70 to-black/30" />
        </motion.div>

        <div className="relative z-10 w-full">
          <motion.div
            className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-24 sm:px-8 lg:px-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 40 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <div className="max-w-3xl space-y-7 rounded-[48px] border border-white/15 bg-black/40 p-10 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">
                The whole 9 yards
              </p>
              <h1 className="text-4xl font-light leading-tight sm:text-6xl">
                Distinctive interiors that feel collected, calm, and deeply
                personal.
              </h1>
              <p className="text-lg text-white/75">
                A Dubai-based design studio crafting residences, boutique
                hospitality, and elevated rentals across the UAE, New York, and
                London.
              </p>
              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Link
                  href="/#portfolio"
                  className="inline-flex items-center justify-center rounded-full border border-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.4em] transition hover:bg-white hover:text-black"
                >
                  View portfolio
                </Link>
                <Link
                  href="mailto:Sana@thew9y.com"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white/80 transition hover:border-white hover:text-white"
                >
                  Book a call
                </Link>
              </div>
              <div className="grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-3">
                {heroHighlights.map((highlight) => (
                  <div key={highlight.title} className="space-y-1">
                    <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/40">
                      {highlight.tag}
                    </p>
                    <p className="text-lg font-semibold">{highlight.title}</p>
                    <p className="text-sm text-white/70">
                      {highlight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Us & Mission Section */}
      <section
        id="about"
        className="bg-[#050505] text-white px-6 py-24 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-7xl space-y-16">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                About the studio
              </p>
              <h3 className="text-4xl font-light leading-tight sm:text-5xl">
                Understated interiors with soul, crafted with rigor.
              </h3>
              <p className="text-lg text-white/70">
                The Whole 9 Yards designs homes, hospitality concepts, and
                rentals that feel collected over time. We listen intently, study
                how you live, and translate that into calm, refined rooms.
              </p>
              <p className="text-lg text-white/70">
                Inspired by wabi-sabi, we balance imperfect textures with
                tailored detailing so every space is livable, tactile, and
                deeply personal.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 md:gap-6">
                {studioMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <p className="text-3xl font-light">{metric.value}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/60">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              className="rounded-[32px] border border-white/10 bg-white/[0.02] p-8 backdrop-blur"
            >
              <div className="space-y-6">
                {aboutHighlights.map((item, index) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-white/5 bg-black/40 p-6"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h4 className="mt-3 text-2xl font-semibold">{item.title}</h4>
                    <p className="mt-2 text-base text-white/70">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="rounded-[40px] border border-white/10 bg-white/[0.02] p-8 sm:p-10 backdrop-blur"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                  Our mission
                </p>
                <h3 className="text-3xl font-light sm:text-4xl">
                  Every project balances serenity, function, and craft.
                </h3>
              </div>
              <p className="max-w-xl text-base text-white/70">
                We develop concepts that respect the architecture, honor your
                routines, and introduce premium finishes that feel as good as
                they look.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {missionPillars.map((pillar) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="rounded-3xl border border-white/10 bg-black/40 p-6"
                >
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">
                    {pillar.focus}
                  </span>
                  <h4 className="mt-4 text-xl font-semibold">
                    {pillar.title}
                  </h4>
                  <p className="mt-3 text-sm text-white/70">
                    {pillar.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid Section */}
      <section id="portfolio" className="min-h-screen bg-[#050505] text-white">
        <ProjectGrid
          items={filteredProjects}
          categories={categoryOptions}
          activeCategory={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 space-y-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/[0.02] p-8 text-center md:flex-row md:items-center md:justify-between md:text-left"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                Start a conversation
              </p>
              <h3 className="mt-3 text-3xl font-light sm:text-4xl">
                Ready for a thoughtful redesign?
              </h3>
              <p className="mt-2 text-base text-white/70">
                We take on a limited number of projects each quarter to ensure a
                tailored experience from concept to install.
              </p>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <Link
                href="mailto:Sana@thew9y.com"
                className="inline-flex items-center justify-center rounded-full border border-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] transition hover:bg-white hover:text-black"
              >
                Email the studio
              </Link>
              <Link
                href="tel:+971501562323"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-white hover:text-white"
              >
                Call +971 50 156 2323
              </Link>
            </div>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h4 className="text-2xl font-bold tracking-tight">
                THE WHOLE 9 YARDS
              </h4>
              <p className="text-white/75">
                A Dubai-based studio designing soulful interiors across the UAE,
                New York, and London.
              </p>
              <p className="text-sm text-white/50">Founded by Sana Malik</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h5 className="text-sm uppercase tracking-[0.3em] text-white/50">
                Explore
              </h5>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a href="/" className="hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/#about" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="/#portfolio" className="hover:text-white">
                    Portfolio
                  </a>
                </li>
                <li>
                  <a href="/portfolio-manager" className="hover:text-white">
                    Portfolio manager
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h5 className="text-sm uppercase tracking-[0.3em] text-white/50">
                Visit / follow
              </h5>
              <div className="space-y-4 text-white/80">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                    Email
                  </p>
                  <a
                    href="mailto:Sana@thew9y.com"
                    className="text-lg hover:text-white"
                  >
                    Sana@thew9y.com
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                    Phone
                  </p>
                  <a href="tel:+971501562323" className="text-lg hover:text-white">
                    +971 50 156 2323
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="https://www.instagram.com/thewhole9yards.ae/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm uppercase tracking-[0.3em] text-white/70 hover:text-white"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between"
          >
            <p>© {new Date().getFullYear()} The Whole 9 Yards. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white">
                Terms of Service
              </a>
            </div>
          </motion.div>
        </div>
      </footer>
    </motion.div>
  );
}
