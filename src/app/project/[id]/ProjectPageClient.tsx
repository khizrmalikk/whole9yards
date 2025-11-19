"use client";
import { useMemo, useState, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Project } from "@/types/project";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import {
  IconChevronLeft,
  IconChevronRight,
  IconArrowUpRight,
} from "@tabler/icons-react";
import Image from "next/image";

const ProjectNav = ({ visible }: { visible?: boolean }) => (
  <NavBody className="rounded-[40px] border border-white/15 bg-white/[0.04] px-6 py-3 text-white shadow-[0_0_40px_rgba(0,0,0,0.25)] backdrop-blur-xl" visible={visible}>
    <div className="flex items-center gap-4">
      <NavbarLogo />
      {!visible && (
        <span className="hidden text-[0.65rem] uppercase tracking-[0.4em] text-white/60 md:inline-flex">
          Project detail
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
      Contact studio
    </NavbarButton>
  </NavBody>
);

export function ProjectPageClient({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const router = useRouter();

  const nextImage = () => {
    if (project && project.pictures.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % project.pictures.length);
      // Pause auto-scroll when user manually navigates
      setIsAutoScrolling(false);
      // Resume auto-scroll after 5 seconds
      setTimeout(() => setIsAutoScrolling(true), 5000);
    }
  };

  const prevImage = () => {
    if (project && project.pictures.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + project.pictures.length) % project.pictures.length);
      // Pause auto-scroll when user manually navigates
      setIsAutoScrolling(false);
      // Resume auto-scroll after 5 seconds
      setTimeout(() => setIsAutoScrolling(true), 5000);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    // Pause auto-scroll when user manually navigates
    setIsAutoScrolling(false);
    // Resume auto-scroll after 5 seconds
    setTimeout(() => setIsAutoScrolling(true), 5000);
  };

  useEffect(() => {
    const loadProject = async () => {
      try {
        // Try to fetch from API first
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const apiProject = await response.json();
          setProject(apiProject);
          setIsReady(true);
          return;
        }
      } catch (error) {
        console.log("API not available, trying localStorage");
      }

      // Fallback to localStorage
      try {
        const savedProjects = localStorage.getItem("portfolio-projects");
        if (savedProjects) {
          const parsedProjects: Project[] = JSON.parse(savedProjects);
          const foundProject = parsedProjects.find(p => p.id === projectId);
          if (foundProject) {
            setProject(foundProject);
            setIsReady(true);
            return;
          }
        }
      } catch (error) {
        console.log("localStorage not available");
      }

      // Final fallback to demo data
      const fallbackData: Project[] = [
        {
          id: "1",
          thumbnail: "/bgs/UC_06048.JPG",
          title: "Modern Office Space",
          description: "A stunning modern office space in the heart of the city featuring contemporary design elements, open layouts, and premium finishes. This project showcases our ability to create functional yet beautiful commercial spaces that inspire productivity and creativity.",
          category: "Commercial",
          type: "Office",
          size: "2,500 sq ft",
          location: "Downtown Dubai",
          pictures: ["/bgs/UC_06048.JPG", "/bgs/UC_06123.JPG", "/bgs/UC_05990.JPG"],
          createdAt: new Date(),
        },
        {
          id: "2",
          thumbnail: "/bgs/UC_06048.JPG",
          title: "Luxury Apartment",
          description: "Elegant luxury apartment with breathtaking city views, featuring high-end materials, custom furnishings, and a sophisticated color palette that creates a serene living environment.",
          category: "Residential",
          type: "Apartment",
          size: "1,200 sq ft",
          location: "Dubai Marina",
          pictures: ["/bgs/UC_06048.JPG", "/bgs/UC_05990.JPG"],
          createdAt: new Date(),
        },
        {
          id: "3",
          thumbnail: "/bgs/UC_06123.JPG",
          title: "Retail Storefront",
          description: "Prime retail location with high foot traffic, designed to maximize customer engagement through strategic layout, lighting, and visual merchandising elements.",
          category: "Commercial",
          type: "Retail",
          size: "800 sq ft",
          location: "Jumeirah 1",
          pictures: ["/bgs/UC_06123.JPG", "/bgs/UC_06048.JPG"],
          createdAt: new Date(),
        },
        { 
          id: "4", 
          thumbnail: "/bgs/UC_05990.JPG",
          title: "Co-working Space", 
          description: "Modern co-working space designed for productivity and collaboration, featuring flexible layouts, natural lighting, and sustainable materials throughout.",
          category: "Commercial", 
          type: "Office", 
          size: "5,000 sq ft", 
          location: "Business Bay",
          pictures: ["/bgs/UC_05990.JPG", "/bgs/UC_06123.JPG", "/bgs/UC_06048.JPG"],
          createdAt: new Date(),
        },
        { 
          id: "5", 
          thumbnail: "/bgs/UC_06048.JPG",
          title: "Penthouse Suite", 
          description: "Luxurious penthouse with panoramic city views, featuring custom millwork, premium appliances, and carefully curated art pieces that reflect the client's personal style.",
          category: "Residential", 
          type: "Penthouse", 
          size: "3,200 sq ft", 
          location: "Palm Jumeirah",
          pictures: ["/bgs/UC_06048.JPG", "/bgs/UC_05990.JPG", "/bgs/UC_06123.JPG"],
          createdAt: new Date(),
        },
        { 
          id: "6", 
          thumbnail: "/bgs/UC_06123.JPG",
          title: "Creative Studio", 
          description: "Inspiring creative studio space for artists and designers, featuring flexible work areas, abundant natural light, and industrial elements balanced with warm, organic materials.",
          category: "Commercial", 
          type: "Studio", 
          size: "1,800 sq ft", 
          location: "Al Quoz",
          pictures: ["/bgs/UC_06123.JPG", "/bgs/UC_06048.JPG", "/bgs/UC_05990.JPG"],
          createdAt: new Date(),
        },
      ];

      const foundProject = fallbackData.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        setIsReady(true);
      } else {
        // Project not found, but still set ready to show error page
        setIsReady(true);
      }
    };

    loadProject();
  }, [projectId]);

  // Auto-scroll effect
  useEffect(() => {
    if (!project || !isAutoScrolling || project.pictures.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % project.pictures.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [project, isAutoScrolling]);

  const formattedDate = useMemo(() => {
    if (!project?.createdAt) return "—";
    try {
      const date = new Date(project.createdAt);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    } catch {
      return "—";
    }
  }, [project?.createdAt]);

  const detailCards =
    project
      ? [
          { label: "Category", value: project.category },
          { label: "Type", value: project.type },
          { label: "Size", value: project.size },
          { label: "Location", value: project.location },
          { label: "Completion", value: formattedDate },
        ]
      : [];

  // Don't render anything until data is ready
  if (!isReady) {
    return null;
  }

  // Show error page if project not found
  if (!project) {
    return (
      <motion.div 
        className="min-h-screen bg-black flex items-center justify-center"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ 
          type: "tween", 
          ease: "easeInOut", 
          duration: 0.6 
        }}
      >
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Project Not Found</h1>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 border border-white text-white hover:bg-white hover:text-black transition-colors"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-[#050505] text-white"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{
        type: "tween",
        ease: "easeInOut",
        duration: 0.6,
      }}
    >
      <Navbar className="top-6">
        <ProjectNav />
      </Navbar>
      <div className="lg:hidden px-6 py-4 text-white">
        <NavbarLogo />
      </div>

      <section className="relative isolate -mt-24 flex min-h-screen items-center overflow-hidden bg-[#050505] pt-24">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        >
          <Image
            src={project.pictures[currentImageIndex] || project.thumbnail}
            alt={`${project.title} hero image`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyDjckkkfxfkBlm9n"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/70 to-black/20" />
        </motion.div>

        <div className="relative z-10 w-full px-6 py-32 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="max-w-3xl space-y-6 rounded-[48px] border border-white/15 bg-black/50 p-10 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl"
            >
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">
                Featured project
              </p>
              <h1 className="text-4xl font-light leading-tight sm:text-6xl">
                {project.title}
              </h1>
              <p className="text-white/75">{project.description}</p>
              <div className="grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2">
                {detailCards.slice(0, 4).map((detail) => (
                  <div key={detail.label}>
                    <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/40">
                      {detail.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="flex flex-col gap-4 sm:flex-row lg:flex-col"
            >
              <button
                onClick={() => router.push("/#portfolio")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 bg-white/[0.08] px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-white hover:text-black"
              >
                Back to work
              </button>
              <button
                onClick={() => setIsAutoScrolling((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white/80 transition hover:border-white hover:text-white"
              >
                {isAutoScrolling ? "Pause slideshow" : "Resume slideshow"}
              </button>
            </motion.div>
          </div>
        </div>

      </section>

      <section className="relative z-10 px-6 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8 rounded-[40px] border border-white/10 bg-white/[0.02] p-10 backdrop-blur"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                Narrative
              </p>
              <h2 className="mt-2 text-3xl font-light">Project story</h2>
            </div>
            <p className="text-lg text-white/80">{project.description}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {detailCards.map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-3xl border border-white/10 bg-black/30 p-5"
                >
                  <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/40">
                    {detail.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold">{detail.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="rounded-[40px] border border-white/10 bg-white/[0.02] p-10 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                  Next inquiry
                </p>
                <h3 className="mt-2 text-2xl font-light">Shape your space</h3>
              </div>
              <IconArrowUpRight className="text-white/50" />
            </div>
            <p className="mt-6 text-white/70">
              We collaborate on a limited number of projects per quarter to
              maintain a bespoke process. Share floor plans, Pinterest boards, or
              simply your wish list—we’ll guide you through next steps.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <a
                href="mailto:Sana@thew9y.com"
                className="text-sm uppercase tracking-[0.3em] text-white hover:text-white/70"
              >
                Sana@thew9y.com
              </a>
              <a
                href="tel:+971501562323"
                className="text-sm uppercase tracking-[0.3em] text-white hover:text-white/70"
              >
                +971 50 156 2323
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                Gallery
              </p>
              <h2 className="text-4xl font-light">Details that matter</h2>
            </div>
            {project.pictures.length > 1 && (
              <div className="text-sm text-white/60">
                {currentImageIndex + 1} of {project.pictures.length} images
              </div>
            )}
          </motion.div>

          <div className="mt-12 space-y-10">
            <motion.div
              className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative h-[70vh]">
                <Image
                  src={project.pictures[currentImageIndex] || project.thumbnail}
                  alt={`${project.title} gallery hero`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/80" />

                {project.pictures.length > 1 && (
                  <div className="absolute inset-x-0 bottom-6 flex items-center justify-between px-6">
                    <button
                      onClick={prevImage}
                      className="rounded-full border border-white/40 bg-black/40 px-5 py-2 text-sm uppercase tracking-[0.3em] text-white/80 transition hover:border-white hover:text-white"
                    >
                      Prev
                    </button>
                    <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/70">
                      {String(currentImageIndex + 1).padStart(2, "0")} /{" "}
                      {String(project.pictures.length).padStart(2, "0")}
                    </div>
                    <button
                      onClick={nextImage}
                      className="rounded-full border border-white/40 bg-black/40 px-5 py-2 text-sm uppercase tracking-[0.3em] text-white/80 transition hover:border-white hover:text-white"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-wrap items-center justify-between gap-2"
            >
              {project.pictures.map((src, index) => (
                <button
                  key={src}
                  onClick={() => goToImage(index)}
                  className={`h-1 w-full flex-1 rounded-full transition-all ${
                    currentImageIndex === index
                      ? "bg-white"
                      : "bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Jump to image ${index + 1}`}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
} 