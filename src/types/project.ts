export interface Project {
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

export const CATEGORIES = ["Residential", "Commercial", "Holiday Homes"] as const; 