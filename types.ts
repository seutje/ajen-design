export type ProjectImage = string | { url: string; alt?: string };

export interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  description: string;
  images: ProjectImage[];
  year: string;
  client?: string;
}

export interface Exhibition {
  id: string;
  title: string;
  date: string; // ISO format YYYY-MM-DD
  location: string;
  link?: string;
}

export interface SiteContent {
  logoUrl?: string;
  heroLogoUrl?: string;
  projects: Project[];
  exhibitions: Exhibition[];
  contactEmail: string;
}

export type ContentContextType = {
  content: SiteContent;
  updateContent: (newContent: SiteContent) => void;
  isAdmin: boolean;
};