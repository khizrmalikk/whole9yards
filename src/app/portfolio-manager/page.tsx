"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff, IconUpload, IconX, IconHome, IconFilter, IconGrid3x3, IconList } from "@tabler/icons-react";
import { DatabaseService } from "@/lib/database";
import { upload } from '@vercel/blob/client';
import imageCompression from 'browser-image-compression';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

interface Project {
  id: string;
  pictures: string[];
  thumbnail: string;
  description: string;
  title: string;
  category: "Residential" | "Commercial" | "Holiday Homes";
  type: string;
  size: string;
  location: string;
  createdAt: Date;
}

const CATEGORIES = ["Residential", "Commercial", "Holiday Homes"] as const;

export default function PortfolioManager() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [clickedProjectId, setClickedProjectId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    title: "",
    description: "",
    category: "Residential",
    type: "",
    size: "",
    location: "",
    pictures: [],
    thumbnail: "",
  });

  // Check authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem("portfolio-auth");
    if (authStatus === "authenticated") {
      setIsAuthenticated(true);
      loadProjects();
    }
  }, []);

  const handleLogin = () => {
    // Replace with your actual password
    if (password === "admin123") {
      setIsAuthenticated(true);
      localStorage.setItem("portfolio-auth", "authenticated");
      loadProjects();
    } else {
      alert("Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("portfolio-auth");
  };

  const loadProjects = async () => {
    try {
      // Try to load from Supabase first
      const supabaseProjects = await DatabaseService.getAllProjects();
      if (supabaseProjects.length > 0) {
        setProjects(supabaseProjects);
        return;
      }
    } catch (error) {
      console.log("Supabase not configured, falling back to localStorage");
    }

    // Fallback to localStorage
    const savedProjects = localStorage.getItem("portfolio-projects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  };

  const saveProjects = async (updatedProjects: Project[]) => {
    // Save to localStorage as backup
    localStorage.setItem("portfolio-projects", JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1, // Compress to max 1MB
      maxWidthOrHeight: 1920, // Max resolution 1920px
      useWebWorker: true,
      fileType: 'image/jpeg', // Convert to JPEG for better compression
      quality: 0.8, // 80% quality - good balance of quality/size
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)}MB → Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      return compressedFile;
    } catch (error) {
      console.warn('Compression failed, using original file:', error);
      return file; // Fallback to original if compression fails
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Compress image before upload for better performance
      const compressedFile = await compressImage(file);
      
      // Generate unique filename to avoid conflicts
      const fileExtension = 'jpg'; // Always use jpg after compression
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const uniqueFilename = `${timestamp}-${randomSuffix}.${fileExtension}`;
      
      // Use client-side upload to Vercel Blob
      const blob = await upload(uniqueFilename, compressedFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      
      return blob.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload image');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pictures' | 'thumbnail') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      if (type === 'thumbnail') {
        // Upload single thumbnail
        const url = await uploadImage(files[0]);
        setFormData(prev => ({
          ...prev,
          thumbnail: url
        }));
      } else {
        // Upload multiple pictures
        const uploadPromises = Array.from(files).map(file => uploadImage(file));
        const urls = await Promise.all(uploadPromises);
        setFormData(prev => ({
          ...prev,
          pictures: [...(prev.pictures || []), ...urls]
        }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number, type: 'pictures' | 'thumbnail') => {
    if (type === 'thumbnail') {
      setFormData(prev => ({
        ...prev,
        thumbnail: ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        pictures: prev.pictures?.filter((_, index) => index !== indexToRemove) || []
      }));
    }
  };

  const handleAddProject = async () => {
    if (!formData.title || !formData.description) {
      alert("Please fill in required fields");
      return;
    }

    try {
      const projectData = {
        title: formData.title!,
        description: formData.description!,
        category: formData.category as Project["category"],
        type: formData.type!,
        size: formData.size!,
        location: formData.location!,
        pictures: formData.pictures!,
        thumbnail: formData.thumbnail!,
      };

      // Try to save to Supabase first
      try {
        const newProject = await DatabaseService.createProject(projectData);
        const updatedProjects = [...projects, newProject];
        setProjects(updatedProjects);
      } catch (error) {
        console.log("Supabase not configured, saving to localStorage");
        // Fallback to localStorage
        const newProject: Project = {
          id: Date.now().toString(),
          ...projectData,
          createdAt: new Date(),
        };
        const updatedProjects = [...projects, newProject];
        await saveProjects(updatedProjects);
      }

      setIsAddingProject(false);
      resetForm();
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project. Please try again.');
    }
  };

  const handleEditProject = async () => {
    if (!editingProject || !formData.title || !formData.description) {
      alert("Please fill in required fields");
      return;
    }

    try {
      const updates = {
        title: formData.title!,
        description: formData.description!,
        category: formData.category as Project["category"],
        type: formData.type!,
        size: formData.size!,
        location: formData.location!,
        pictures: formData.pictures!,
        thumbnail: formData.thumbnail!,
      };

      // Try to update in Supabase first
      try {
        const updatedProject = await DatabaseService.updateProject(editingProject.id, updates);
        const updatedProjects = projects.map(project =>
          project.id === editingProject.id ? updatedProject : project
        );
        setProjects(updatedProjects);
      } catch (error) {
        console.log("Supabase not configured, saving to localStorage");
        // Fallback to localStorage
        const updatedProjects = projects.map(project =>
          project.id === editingProject.id ? { ...project, ...updates } : project
        );
        await saveProjects(updatedProjects);
      }

      setEditingProject(null);
      resetForm();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      // Try to delete from Supabase first
      try {
        await DatabaseService.deleteProject(id);
        const updatedProjects = projects.filter(project => project.id !== id);
        setProjects(updatedProjects);
      } catch (error) {
        console.log("Supabase not configured, removing from localStorage");
        // Fallback to localStorage
        const updatedProjects = projects.filter(project => project.id !== id);
        await saveProjects(updatedProjects);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Residential",
      type: "",
      size: "",
      location: "",
      pictures: [],
      thumbnail: "",
    });
  };

  const handleProjectClick = (projectId: string) => {
    setClickedProjectId(projectId);
    setTimeout(() => {
      router.push(`/project/${projectId}`);
    }, 250);
  };

  // Get unique types from all projects
  const getUniqueTypes = () => {
    const types = projects.map(project => project.type).filter(Boolean);
    return [...new Set(types)];
  };

  // Filter and sort projects
  const getFilteredAndSortedProjects = () => {
    let filtered = projects;

    // Filter by category
    if (filterCategory !== "All") {
      filtered = filtered.filter(project => project.category === filterCategory);
    }

    // Filter by type
    if (filterType !== "All") {
      filtered = filtered.filter(project => project.type === filterType);
    }

    // Sort projects
    switch (sortBy) {
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "category":
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredProjects = getFilteredAndSortedProjects();

  const totalProjects = projects.length;
  const countByCategory = (category: Project["category"]) =>
    projects.filter((project) => project.category === category).length;
  const residentialCount = countByCategory("Residential");
  const commercialCount = countByCategory("Commercial");
  const averageGallerySize =
    totalProjects === 0
      ? 0
      : Math.round(
          projects.reduce(
            (acc, project) => acc + (project.pictures?.length || 0),
            0,
          ) / totalProjects,
        );

  const percentage = (count: number) =>
    totalProjects === 0 ? "0%" : `${Math.round((count / totalProjects) * 100)}%`;

  const managerStats = [
    { label: "Total projects", value: totalProjects.toString().padStart(2, "0") },
    { label: "Residential share", value: percentage(residentialCount) },
    {
      label: "Commercial share",
      value: percentage(commercialCount),
    },
    {
      label: "Avg. gallery size",
      value: totalProjects === 0 ? "—" : `${averageGallerySize} images`,
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
        <Image
          src="/bgs/UC_06048.JPG"
          alt="Studio mood"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mx-4 w-full max-w-lg"
        >
          <div className="rounded-[40px] border border-white/10 bg-black/50 p-10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">
              Secure access
            </p>
            <h1 className="mt-4 text-3xl font-light leading-tight">
              Portfolio manager
            </h1>
            <p className="mt-2 text-white/70">
              Enter your studio passphrase to edit projects, upload galleries, and
              publish new work.
            </p>
            <div className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-white focus:ring-white/40"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleLogin}
                className="w-full rounded-full border border-white bg-white text-xs font-semibold uppercase tracking-[0.4em] text-black transition hover:bg-white/90"
                size="lg"
              >
                Enter studio
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/90" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-white/60 transition hover:text-white"
        >
          <IconHome size={16} />
          Back to site
        </Link>

        <section className="mt-8 rounded-[48px] border border-white/10 bg-white/[0.02] p-10 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">
                Internal tools
              </p>
              <h1 className="text-4xl font-light leading-tight sm:text-5xl">
                Curate, edit, and publish the studio portfolio with intent.
              </h1>
              <p className="max-w-2xl text-base text-white/70">
                Upload new case studies, tune categories, and keep every project
                aligned with the aesthetic clients experience on the site.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => setIsAddingProject(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/[0.06] px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-white/[0.15] hover:text-white"
                variant="ghost"
              >
                <IconPlus size={18} />
                Add project
              </Button>
              <Button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white/80 transition hover:border-white hover:text-white"
                variant="ghost"
              >
                Logout
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {managerStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-black/30 p-6"
              >
                <p className="text-3xl font-light">{stat.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.4em] text-white/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 py-2 text-xs uppercase tracking-[0.3em] text-white hover:bg-white/10 hover:text-white"
            >
              <IconFilter size={16} />
              Filters
            </Button>

            <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/[0.04] p-1">
              <Button
                onClick={() => setViewMode("grid")}
                size="icon"
                variant="ghost"
                className={`h-10 w-10 rounded-full ${viewMode === "grid" ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
              >
                <IconGrid3x3 size={16} />
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                size="icon"
                variant="ghost"
                className={`h-10 w-10 rounded-full ${viewMode === "list" ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
              >
                <IconList size={16} />
              </Button>
            </div>
          </div>

          <div className="text-sm uppercase tracking-[0.3em] text-white/50">
            {filteredProjects.length} shown · {projects.length} total
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.02] p-6 backdrop-blur"
          >
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-white/80">Category</Label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">Type</Label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="All">All Types</option>
                  {getUniqueTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">Sort By</Label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="category">By Category</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFilterCategory("All");
                    setFilterType("All");
                    setSortBy("newest");
                  }}
                  variant="ghost"
                  className="w-full rounded-2xl border border-white/20 bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.3em] text-white hover:bg-white/10 hover:text-white"
                >
                  Clear
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-12">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: clickedProjectId === project.id ? 0 : 1,
                    scale: clickedProjectId === project.id ? 0.9 : 1,
                    x: clickedProjectId === project.id ? -100 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] text-white backdrop-blur transition hover:border-white/30"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-black/20"
                        style={{
                          backgroundImage: project.thumbnail
                            ? `url(${project.thumbnail})`
                            : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/50 to-black/80" />
                      {!project.thumbnail && (
                        <div className="relative z-10 flex h-full items-center justify-center text-sm uppercase tracking-[0.3em] text-white/60">
                          No image
                        </div>
                      )}
                    </div>
                    <CardHeader className="space-y-2">
                      <CardTitle className="text-2xl font-semibold">
                        {project.title}
                      </CardTitle>
                      <p className="text-sm uppercase tracking-[0.3em] text-white/40">
                        {project.category}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-white/70 line-clamp-3">
                        {project.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-xs text-white/60">
                        <div>
                          <p className="uppercase tracking-[0.3em] text-[0.6rem]">
                            Type
                          </p>
                          <p className="mt-1 text-white">{project.type}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.3em] text-[0.6rem]">
                            Size
                          </p>
                          <p className="mt-1 text-white">{project.size}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="uppercase tracking-[0.3em] text-[0.6rem]">
                            Location
                          </p>
                          <p className="mt-1 text-white">{project.location}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                          setFormData(project);
                        }}
                        className="rounded-full border border-white/10 text-white/80 transition hover:border-white hover:text-white"
                      >
                        <IconEdit size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="rounded-full border border-white/10 text-white/80 transition hover:border-white hover:text-red-400"
                      >
                        <IconTrash size={18} />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: clickedProjectId === project.id ? 0 : 1,
                    x: clickedProjectId === project.id ? -100 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="flex flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] text-white backdrop-blur transition hover:border-white/30 md:flex-row"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="relative h-48 w-full overflow-hidden md:h-auto md:w-56">
                      <div
                        className="absolute inset-0 bg-black/20"
                        style={{
                          backgroundImage: project.thumbnail
                            ? `url(${project.thumbnail})`
                            : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />
                      {!project.thumbnail && (
                        <div className="relative z-10 flex h-full items-center justify-center text-sm uppercase tracking-[0.3em] text-white/60">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                            {project.category}
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold">
                            {project.title}
                          </h3>
                          <p className="mt-4 text-sm text-white/70 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-white/60 md:grid-cols-4">
                            <div>
                              <p className="uppercase tracking-[0.3em] text-[0.6rem]">
                                Type
                              </p>
                              <p className="mt-1 text-white">{project.type}</p>
                            </div>
                            <div>
                              <p className="uppercase tracking-[0.3em] text-[0.6rem]">
                                Size
                              </p>
                              <p className="mt-1 text-white">{project.size}</p>
                            </div>
                            <div>
                              <p className="uppercase tracking-[0.3em] text-[0.6rem]">
                                Location
                              </p>
                              <p className="mt-1 text-white">{project.location}</p>
                            </div>
                            <div>
                              <p className="uppercase tracking-[0.3em] text-[0.6rem]">
                                Gallery
                              </p>
                              <p className="mt-1 text-white">
                                {project.pictures?.length || 0} images
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProject(project);
                              setFormData(project);
                            }}
                            className="rounded-full border border-white/10 text-white/80 transition hover:border-white hover:text-white"
                          >
                            <IconEdit size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="rounded-full border border-white/10 text-white/80 transition hover:border-white hover:text-red-400"
                          >
                            <IconTrash size={18} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {filteredProjects.length === 0 && (
          <div className="mt-16 text-center text-white/60">
            <p className="text-lg">No projects match your filters.</p>
            <p className="text-sm text-white/40">
              Adjust filters or add a new project to populate this view.
            </p>
          </div>
        )}
      </div>

      {(isAddingProject || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/15 bg-black/80 p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  {editingProject ? "Edit project" : "Add new project"}
                </p>
                <h2 className="text-3xl font-light">
                  {editingProject ? editingProject.title : "Project details"}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsAddingProject(false);
                  setEditingProject(null);
                  resetForm();
                }}
                className="rounded-full border border-white/10 text-white/70 hover:text-white"
              >
                <IconX size={18} />
              </Button>
            </div>

            <div className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white/80">
                  Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="rounded-2xl border border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/60 focus:ring-white/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/80">
                  Description *
                </Label>
                <textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-2xl border border-white/15 bg-white/5 p-4 text-white placeholder:text-white/40 focus:border-white/60 focus:ring-white/30"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white/80">
                    Category
                  </Label>
                  <select
                    id="category"
                    value={formData.category || "Residential"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value as Project["category"],
                      }))
                    }
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-white/80">
                    Type
                  </Label>
                  <Input
                    id="type"
                    type="text"
                    value={formData.type || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="rounded-2xl border border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/60 focus:ring-white/30"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-white/80">
                    Size
                  </Label>
                  <Input
                    id="size"
                    type="text"
                    value={formData.size || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, size: e.target.value }))
                    }
                    className="rounded-2xl border border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/60 focus:ring-white/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white/80">
                    Location
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="rounded-2xl border border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-white/60 focus:ring-white/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="text-white/80">
                  Thumbnail image
                </Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => handleImageUpload(e, "thumbnail")}
                  disabled={isUploading}
                  className="rounded-2xl border border-dashed border-white/20 bg-white/5 text-white file:text-white"
                />
                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <IconUpload className="animate-spin" size={16} />
                    Uploading…
                  </div>
                )}
                {formData.thumbnail && (
                  <div className="relative inline-block">
                    <img
                      src={formData.thumbnail}
                      alt="Thumbnail preview"
                      className="h-24 w-24 rounded-2xl border border-white/15 object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImage(0, "thumbnail")}
                      className="absolute -right-2 -top-2 rounded-full border border-white/20 bg-black/60 text-white"
                    >
                      <IconX size={14} />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pictures" className="text-white/80">
                  Gallery images
                </Label>
                <Input
                  id="pictures"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={(e) => handleImageUpload(e, "pictures")}
                  disabled={isUploading}
                  className="rounded-2xl border border-dashed border-white/20 bg-white/5 text-white file:text-white"
                />
                {formData.pictures && formData.pictures.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {formData.pictures.map((pic, index) => (
                      <div key={index} className="relative">
                        <img
                          src={pic}
                          alt={`Picture ${index + 1}`}
                          className="h-20 w-20 rounded-2xl border border-white/20 object-cover"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(index, "pictures")}
                          className="absolute -right-2 -top-2 rounded-full border border-white/20 bg-black/60 text-white"
                        >
                          <IconX size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddingProject(false);
                  setEditingProject(null);
                  resetForm();
                }}
                disabled={isUploading}
                className="rounded-full border border-white/20 px-6 py-2 text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                className="rounded-full border border-white bg-white px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black hover:bg-white/90"
                onClick={editingProject ? handleEditProject : handleAddProject}
                disabled={isUploading}
              >
                {isUploading ? "Uploading…" : editingProject ? "Update" : "Add"} project
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 