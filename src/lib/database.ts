import { supabase } from './supabase';
import { Project } from '@/types/project';

export class DatabaseService {
  // Get all projects
  static async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    return data || [];
  }

  // Get a single project by ID
  static async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    return data;
  }

  // Create a new project
  static async createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title: project.title,
        description: project.description,
        category: project.category,
        type: project.type,
        size: project.size,
        location: project.location,
        thumbnail: project.thumbnail,
        pictures: project.pictures,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    return data;
  }

  // Update a project
  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return data;
  }

  // Delete a project
  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Note: Image uploads are now handled via Vercel Blob client-side uploads
  // This bypasses the 4.5MB Vercel function limit for large files
  // See /api/upload route for the upload handler
} 