"use client";
import { Navbar, NavBody, NavItems, NavbarLogo, NavbarButton } from "@/components/ui/resizable-navbar";
import { motion, useInView } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Project } from "@/types/project";
import Link from "next/link";

// Fallback data for when no projects exist
const fallbackData: Project[] = [
  { 
    id: "1", 
    thumbnail: "/bgs/UC_06048.JPG",
    title: "Modern Office Space", 
    description: "A stunning modern office space in the heart of the city featuring contemporary design elements, open layouts, and premium finishes. This project showcases our ability to create functional yet beautiful commercial spaces that inspire productivity and creativity. The design incorporates natural light, sustainable materials, and flexible workspaces that adapt to the evolving needs of modern businesses.",
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
    description: "Elegant luxury apartment with breathtaking city views, featuring high-end materials, custom furnishings, and a sophisticated color palette that creates a serene living environment. Every detail has been carefully considered to create a harmonious balance between comfort and style, from the custom millwork to the curated art collection.",
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
    description: "Prime retail location with high foot traffic, designed to maximize customer engagement through strategic layout, lighting, and visual merchandising elements. The space combines modern aesthetics with practical functionality, creating an inviting atmosphere that encourages exploration and enhances the shopping experience.",
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

interface CardProps {
  data: Project;
  index: number;
  isFullWidth: boolean;
}

const Card = ({ data, index, isFullWidth }: CardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: "-100px 0px -100px 0px" // Trigger animation when card is 100px from viewport
  });

  return (
    <Link href={`/project/${data.id}`} className="block" style={{ gridColumn: isFullWidth ? 'span 2' : 'span 1' }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={isInView ? { 
          opacity: 1, 
          y: 0, 
          scale: 1 
        } : { 
          opacity: 0, 
          y: 100, 
          scale: 0.9 
        }}
        transition={{ 
          duration: 0.8, 
          delay: index * 0.1, // Stagger animation based on card index
          ease: "easeOut" 
        }}
        className={`relative overflow-hidden h-screen bg-cover bg-center cursor-pointer group`}
        style={{ 
          backgroundImage: `url('${data.thumbnail}')`
        }}
      >
        {/* Dark overlay for better text visibility */}
        <motion.div 
          className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        
        {/* Content positioned at bottom left */}
        <motion.div 
          className="absolute bottom-8 left-8 text-white group-hover:transform group-hover:translate-y-[-8px] transition-transform duration-300"
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { 
            opacity: 1, 
            x: 0 
          } : { 
            opacity: 0, 
            x: -50 
          }}
          transition={{ 
            duration: 0.8, 
            delay: index * 0.1 + 0.4,
            ease: "easeOut" 
          }}
        >
          <motion.h3 
            className="text-5xl font-bold mb-4 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { 
              opacity: 1, 
              y: 0 
            } : { 
              opacity: 0, 
              y: 30 
            }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1 + 0.6 
            }}
          >
            {data.title}
          </motion.h3>
          <motion.div 
            className="space-y-2 text-sm font-[400] tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { 
              opacity: 1, 
              y: 0 
            } : { 
              opacity: 0, 
              y: 20 
            }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1 + 0.8 
            }}
          >
            <div className="flex items-center space-x-4">
              <span className="text-white/80">Category:</span>
              <span>{data.category}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/80">Type:</span>
              <span>{data.type}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/80">Size:</span>
              <span>{data.size}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/80">Location:</span>
              <span>{data.location}</span>
            </div>
          </motion.div>
          
          {/* Click indicator */}
          <motion.div
            className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0 } : { opacity: 0 }}
          >
            <span className="text-white/60 text-sm">Click to view project →</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </Link>
  );
};

const ProjectGrid = ({ items }: { items: Project[] }) => {
  const renderCards = () => {
    const cards = [];
    let index = 0;
    let cardIndex = 0; // For animation staggering
    
    while (index < items.length) {
      const remaining = items.length - index;
      
      if (remaining >= 3 && remaining % 3 === 0) {
        // Multiple of 3: Big card + 2 half cards pattern
        const groupsOf3 = Math.floor(remaining / 3);
        
        for (let group = 0; group < groupsOf3; group++) {
          // Full width card
          cards.push(
            <Card 
              key={items[index].id} 
              data={items[index]} 
              isFullWidth={true} 
              index={cardIndex}
            />
          );
          index++;
          cardIndex++;
          
          // Two half cards
          cards.push(
            <Card 
              key={items[index].id} 
              data={items[index]} 
              isFullWidth={false} 
              index={cardIndex}
            />
          );
          index++;
          cardIndex++;
          cards.push(
            <Card 
              key={items[index].id} 
              data={items[index]} 
              isFullWidth={false} 
              index={cardIndex}
            />
          );
          index++;
          cardIndex++;
        }
      } else if (remaining === 2) {
        // Exactly 2 remaining: pair of half cards
        cards.push(
          <Card 
            key={items[index].id} 
            data={items[index]} 
            isFullWidth={false} 
            index={cardIndex}
          />
        );
        index++;
        cardIndex++;
        cards.push(
          <Card 
            key={items[index].id} 
            data={items[index]} 
            isFullWidth={false} 
            index={cardIndex}
          />
        );
        index++;
        cardIndex++;
      } else if (remaining % 2 === 0 && remaining >= 4) {
        // Even number >= 4: pairs of half cards
        const pairsToCreate = Math.min(2, remaining / 2); // Create max 2 pairs at a time
        for (let pair = 0; pair < pairsToCreate; pair++) {
          cards.push(
            <Card 
              key={items[index].id} 
              data={items[index]} 
              isFullWidth={false} 
              index={cardIndex}
            />
          );
          index++;
          cardIndex++;
          cards.push(
            <Card 
              key={items[index].id} 
              data={items[index]} 
              isFullWidth={false} 
              index={cardIndex}
            />
          );
          index++;
          cardIndex++;
        }
      } else {
        // Odd number or single item: one full card then pairs
        cards.push(
          <Card 
            key={items[index].id} 
            data={items[index]} 
            isFullWidth={true} 
            index={cardIndex}
          />
        );
        index++;
        cardIndex++;
        
        // Rest as pairs
        while (index < items.length) {
          cards.push(
            <Card 
              key={items[index].id} 
              data={items[index]} 
              isFullWidth={false} 
              index={cardIndex}
            />
          );
          index++;
          cardIndex++;
          if (index < items.length) {
            cards.push(
              <Card 
                key={items[index].id} 
                data={items[index]} 
                isFullWidth={false} 
                index={cardIndex}
              />
            );
            index++;
            cardIndex++;
          }
        }
      }
    }
    
    return cards;
  };

  return (
    <div className="grid grid-cols-2 w-full">
      {renderCards()}
    </div>
  );
};

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Trigger the loading animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Load projects
    const loadProjects = async () => {
      try {
        // Try to fetch from API first
        const response = await fetch('/api/projects');
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

  return (
    <motion.div 
      className="min-h-screen"
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ 
        type: "tween", 
        ease: "easeInOut", 
        duration: 0.6 
      }}
    >
      {/* Navbar without motion wrapper to preserve scroll animation */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems
            items={[
              { name: "Home", link: "#" },
              { name: "About", link: "#" },
              { name: "Contact", link: "#" },
            ]}
          />
          <NavbarButton href="#" variant="secondary">
            Contact Us
          </NavbarButton>
        </NavBody>
      </Navbar>

      <section className="flex flex-col items-center justify-center h-screen overflow-hidden">
        {/* Background image with zoom animation */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bgs/UC_05990.JPG')" }}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        
        {/* Overlay */}
        <motion.div 
          className="absolute inset-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        />
        
        {/* Content with delayed animation */}
        <motion.div 
          className="absolute bottom-8 left-8 flex flex-col items-start"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
          transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl text-white mb-4 font-[400] tracking-tight">THE WHOLE 9 YARDS</h1>
          <p className="text-white text-lg max-w-xl font-[400] tracking-tight">
            The whole 9 yards is a platform for startups to connect with investors and mentors.
          </p>
        </motion.div>
      </section>

      {/* About Us Section */}
      <section className="min-h-screen bg-black text-white py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-12 text-center tracking-tight"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            ABOUT US
          </motion.h2>
          
          <div className="space-y-8 text-lg leading-relaxed font-[400]">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Here at The Whole Nine Yards we create distinctive interiors that are understated and soulful, weaving together a delicate balance of diverse materials and contemporary design. Inspired by the Japanese philosophy of wabi-sabi, an aesthetic that focuses on finding the beauty in imperfection, Our Design Studio will create a bespoke plan to transform your space.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Founded by Sana Malik, who has over ten years of experience as a designer, The whole nine yards has a personal approach to every design, and clients will work closely with Sana at all stages. Building relationships with her clients gives Sana the opportunity to create designs that are personal, unique and understand the needs of the client and the space, so that your home tells your story.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              We use many different kinds of materials paired with muted and desaturated colours to create an organic space that feels calm. Sana&apos;s designs are eclectic and characterful, preferring to follow the flow of the space and be guided by her client&apos;s personal taste. The company leans towards using textiles and buying furniture that is built to last, as well as reupholstering existing furniture, sourcing out products unique to the needs of each specific project.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              We also specialize in furnishing holiday rentals where our curated selection of furniture pieces combines sleek aesthetics with functionality. From space-saving sofa bed to stylish vanity unit, each piece is carefully chosen to complement the design while offering practicality and comfort.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              viewport={{ once: true }}
            >
              Sana&apos;s experience in the industry has given her the opportunity to build relationships with specialist suppliers that offer high end craft, from sourcing anything from materials to bespoke joinery and upholstery.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Projects Grid Section */}
      <ProjectGrid items={projects} />

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 tracking-tight">THE WHOLE 9 YARDS</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                Creating distinctive interiors that are understated and soulful, weaving together a delicate balance of diverse materials and contemporary design.
              </p>
              <p className="text-white/60 text-sm">
                Founded by Sana Malik
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-bold mb-6 tracking-tight">QUICK LINKS</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                    Portfolio
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/80 hover:text-white transition-colors duration-200">
                    Contact
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-bold mb-6 tracking-tight">GET IN TOUCH</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Email</p>
                  <a href="mailto:hello@thewhole9yards.com" className="text-white/80 hover:text-white transition-colors duration-200">
                    hello@thewhole9yards.com
                  </a>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Phone</p>
                  <a href="tel:+1234567890" className="text-white/80 hover:text-white transition-colors duration-200">
                    +1 (234) 567-8900
                  </a>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Follow Us</p>
                  <div className="flex space-x-4 mt-2">
                    <a href="#" className="text-white/60 hover:text-white transition-colors duration-200">
                      Instagram
                    </a>
                    <a href="#" className="text-white/60 hover:text-white transition-colors duration-200">
                      LinkedIn
                    </a>
                    <a href="#" className="text-white/60 hover:text-white transition-colors duration-200">
                      Pinterest
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <motion.div
            className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-white/60 text-sm mb-4 md:mb-0">
              © 2024 The Whole 9 Yards. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
                Terms of Service
              </a>
            </div>
          </motion.div>
        </div>
      </footer>
    </motion.div>
  );
}
