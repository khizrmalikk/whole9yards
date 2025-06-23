import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET() {
  try {
    const projects = await DatabaseService.getAllProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('API Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const projectData = await request.json();
    const project = await DatabaseService.createProject(projectData);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('API Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
} 