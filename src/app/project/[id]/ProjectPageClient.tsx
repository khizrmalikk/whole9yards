"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Project } from "@/types/project";
import { Navbar, NavBody, NavItems, NavbarLogo, NavbarButton } from "@/components/ui/resizable-navbar";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

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
          location: "Downtown Manhattan",
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
          location: "Brooklyn Heights",
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
          location: "SoHo District",
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
          location: "Midtown West",
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
          location: "Upper East Side",
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
          location: "Williamsburg",
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
      className="min-h-screen bg-black text-white"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ 
        type: "tween", 
        ease: "easeInOut", 
        duration: 0.6 
      }}
      style={{ position: "relative", zIndex: 2 }}
    >
      {/* Navbar - restored to original position for stickiness */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems
            items={[
              { name: "Home", link: "/" },
              { name: "About", link: "#" },
              { name: "Contact", link: "#" },
            ]}
          />
          <NavbarButton href="#" variant="secondary">
            Contact Us
          </NavbarButton>
        </NavBody>
      </Navbar>

      {/* Hero Section with Main Image - accounting for navbar */}
      <section className="h-screen relative overflow-hidden -mt-20">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${project.pictures[currentImageIndex] || project.thumbnail}')` }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="absolute bottom-8 left-8 right-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">{project.title}</h1>
            <div className="flex flex-wrap gap-6 text-lg">
              <span className="text-white/80">Category: <span className="text-white">{project.category}</span></span>
              <span className="text-white/80">Type: <span className="text-white">{project.type}</span></span>
              <span className="text-white/80">Size: <span className="text-white">{project.size}</span></span>
              <span className="text-white/80">Location: <span className="text-white">{project.location}</span></span>
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.button
          onClick={() => router.back()}
          className="absolute top-24 left-16 px-4 py-2 border border-white/50 text-white hover:bg-white/10 transition-colors backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          ← Back
        </motion.button>
      </section>

      {/* Project Details */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8">About This Project</h2>
            <p className="text-lg leading-relaxed text-white/90">
              {project.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Project Gallery
          </motion.h2>

          {/* Main Image Display with Navigation */}
          <motion.div
            className="relative mb-8 group"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            onMouseEnter={() => setIsAutoScrolling(false)}
            onMouseLeave={() => setIsAutoScrolling(true)}
          >
            <img
              src={project.pictures[currentImageIndex] || project.thumbnail}
              alt={`${project.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-[70vh] object-cover rounded-lg"
            />
            
            {/* Navigation Arrows */}
            {project.pictures.length > 1 && (
              <>
                {/* Left Arrow */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm z-10"
                  aria-label="Previous image"
                >
                  <IconChevronLeft size={24} />
                </button>
                
                {/* Right Arrow */}
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm z-10"
                  aria-label="Next image"
                >
                  <IconChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image Counter and Auto-scroll Indicator */}
            {project.pictures.length > 1 && (
              <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  {currentImageIndex + 1} / {project.pictures.length}
                </div>
                {isAutoScrolling && (
                  <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Auto</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Image Dots Indicator */}
          {project.pictures.length > 1 && (
            <motion.div
              className="flex justify-center space-x-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {project.pictures.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentImageIndex === index 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  );
} 