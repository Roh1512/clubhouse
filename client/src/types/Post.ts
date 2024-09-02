import { Like, Comment } from "./Like";
import { User } from "../features/auth/authSlice";
import { ImageResponse } from "../components/ImageCarousel/ImageCarousel";

export type Post = {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  user: User;
  imageUrls: ImageResponse[];
  likes: Like[];
  comments: Comment[];
};

export type PostsLoaderData = {
  all_posts: Post[];
  currentPage: number;
  totalPages: number;
};
