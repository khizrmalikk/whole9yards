"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff, IconUpload, IconX, IconHome, IconFilter, IconGrid3x3, IconList } from "@tabler/icons-react";
import { DatabaseService } from "@/lib/database";
import Link from "next/link";
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

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload image';
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, use the response text
          errorMessage = await response.text() || errorMessage;
        }
      } else {
        // If not JSON, get the text response
        const textResponse = await response.text();
        errorMessage = textResponse || `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const { url } = await response.json();
    return url;
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
    // Wait for animation to complete before navigating
    setTimeout(() => {
      window.location.href = `/portfolio/${projectId}`;
    }, 300);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Portfolio Manager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full cursor-pointer text-white hover:text-gray-300"
                  >
                    {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                  </Button>
                </div>
              </div>
                          <Button
              onClick={handleLogin}
              className="w-full cursor-pointer bg-white text-black hover:bg-gray-200"
              size="lg"
            >
                Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button - Mobile */}
        <div className="md:hidden mb-4">
          <Button asChild variant="secondary" size="sm">
            <Link href="/" className="flex items-center">
              <IconHome size={16} />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Back Button - Desktop */}
            <div className="hidden md:block mt-2">
              <Button asChild variant="secondary">
                <Link href="/" className="flex items-center">
                  <IconHome size={20} />
                  Back to Home
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-white">Portfolio Manager</h1>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => setIsAddingProject(true)}
              variant="default"
              className="cursor-pointer"
            >
              <IconPlus size={20} />
              Add Project
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="cursor-pointer"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Filter and View Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="cursor-pointer bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <IconFilter size={16} />
              Filters
            </Button>
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-800 rounded-md p-1">
              <Button
                onClick={() => setViewMode("grid")}
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="cursor-pointer"
              >
                <IconGrid3x3 size={16} />
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="cursor-pointer"
              >
                <IconList size={16} />
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-white/70 text-sm">
            {filteredProjects.length} of {projects.length} projects
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Category</Label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Type</Label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="All">All Types</option>
                  {getUniqueTypes().map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Sort By</Label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white"
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
                  variant="outline"
                  className="cursor-pointer bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Projects Display */}
        {viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: clickedProjectId === project.id ? 0 : 1, 
                  scale: clickedProjectId === project.id ? 0.9 : 1,
                  x: clickedProjectId === project.id ? -100 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="overflow-hidden bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div
                    className="h-48 bg-cover bg-center bg-gray-200"
                    style={{ 
                      backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : 'none'
                    }}
                  >
                    {!project.thumbnail && (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-white">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>Category: {project.category}</div>
                      <div>Type: {project.type}</div>
                      <div>Size: {project.size}</div>
                      <div>Location: {project.location}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                        setFormData(project);
                      }}
                      className="text-white hover:text-gray-300 cursor-pointer"
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
                      className="text-white hover:text-red-400 cursor-pointer"
                    >
                      <IconTrash size={18} />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4 mb-8">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: clickedProjectId === project.id ? 0 : 1,
                  x: clickedProjectId === project.id ? -100 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="flex flex-col md:flex-row">
                    <div
                      className="w-full md:w-48 h-32 bg-cover bg-center bg-gray-200 flex-shrink-0"
                      style={{ 
                        backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : 'none'
                      }}
                    >
                      {!project.thumbnail && (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
                            <div>
                              <span className="font-medium">Category:</span> {project.category}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span> {project.type}
                            </div>
                            <div>
                              <span className="font-medium">Size:</span> {project.size}
                            </div>
                            <div>
                              <span className="font-medium">Location:</span> {project.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProject(project);
                              setFormData(project);
                            }}
                            className="text-white hover:text-gray-300 cursor-pointer"
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
                            className="text-white hover:text-red-400 cursor-pointer"
                          >
                            <IconTrash size={18} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No projects found</div>
            <div className="text-gray-500 text-sm">Try adjusting your filters or add a new project</div>
          </div>
        )}

        {/* Add/Edit Project Modal */}
        {(isAddingProject || editingProject) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6 text-white">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description *</Label>
                  <textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-white">Category</Label>
                    <select
                      id="category"
                      value={formData.category || "Residential"}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Project["category"] }))}
                      className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-white">Type</Label>
                    <Input
                      id="type"
                      type="text"
                      value={formData.type || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size" className="text-white">Size</Label>
                    <Input
                      id="size"
                      type="text"
                      value={formData.size || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-white">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail" className="text-white">Thumbnail Image</Label>
                  <div className="space-y-2">
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => handleImageUpload(e, 'thumbnail')}
                      disabled={isUploading}
                      className="bg-gray-800 border-gray-700 text-white file:text-white"
                    />
                    {isUploading && (
                      <div className="flex items-center space-x-2 text-white">
                        <IconUpload className="animate-spin" size={16} />
                        <span className="text-sm text-white">Uploading...</span>
                      </div>
                    )}
                    {formData.thumbnail && (
                      <div className="relative inline-block">
                        <img 
                          src={formData.thumbnail} 
                          alt="Thumbnail preview" 
                          className="h-20 w-20 object-cover rounded border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeImage(0, 'thumbnail')}
                          className="absolute -top-2 -right-2 h-6 w-6 cursor-pointer"
                        >
                          <IconX size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pictures" className="text-white">Additional Pictures</Label>
                  <div className="space-y-2">
                    <Input
                      id="pictures"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={(e) => handleImageUpload(e, 'pictures')}
                      disabled={isUploading}
                      className="bg-gray-800 border-gray-700 text-white file:text-white"
                    />
                    {formData.pictures && formData.pictures.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.pictures.map((pic, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={pic} 
                              alt={`Picture ${index + 1}`} 
                              className="h-20 w-20 object-cover rounded border"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeImage(index, 'pictures')}
                              className="absolute -top-2 -right-2 h-6 w-6 cursor-pointer"
                            >
                              <IconX size={12} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6 text-white">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsAddingProject(false);
                    setEditingProject(null);
                    resetForm();
                  }}
                  disabled={isUploading}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="bg-white text-black hover:bg-gray-200"
                  onClick={editingProject ? handleEditProject : handleAddProject}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : editingProject ? "Update" : "Add"} Project
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 