import { Entity } from "../../common/Repository";

export interface BlogCategory extends Entity {
  title: string;
  slug: string;
}

export interface BlogPost extends Entity {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  categoryId?: string;
  author: string;
  isPublished: boolean;
  publishedAt?: string;
}
