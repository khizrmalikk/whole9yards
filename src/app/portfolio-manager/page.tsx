"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff, IconUpload, IconX } from "@tabler/icons-react";
import { DatabaseService } from "@/lib/database";

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
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
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
      alert('Failed to upload image. Please try again.');
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">Portfolio Manager</h1>
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </button>
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-black text-white p-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Portfolio Manager</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsAddingProject(true)}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <IconPlus size={20} />
              <span>Add Project</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
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
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{project.description}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Category: {project.category}</div>
                  <div>Type: {project.type}</div>
                  <div>Size: {project.size}</div>
                  <div>Location: {project.location}</div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => {
                      setEditingProject(project);
                      setFormData(project);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <IconEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add/Edit Project Modal */}
        {(isAddingProject || editingProject) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category || "Residential"}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Project["category"] }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <input
                      type="text"
                      value={formData.type || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Size</label>
                    <input
                      type="text"
                      value={formData.size || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'thumbnail')}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <IconUpload className="animate-spin" size={16} />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    )}
                    {formData.thumbnail && (
                      <div className="relative inline-block">
                        <img 
                          src={formData.thumbnail} 
                          alt="Thumbnail preview" 
                          className="h-20 w-20 object-cover rounded border"
                        />
                        <button
                          onClick={() => removeImage(0, 'thumbnail')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <IconX size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Additional Pictures</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, 'pictures')}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isUploading}
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
                            <button
                              onClick={() => removeImage(index, 'pictures')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <IconX size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setIsAddingProject(false);
                    setEditingProject(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={editingProject ? handleEditProject : handleAddProject}
                  className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : editingProject ? "Update" : "Add"} Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 