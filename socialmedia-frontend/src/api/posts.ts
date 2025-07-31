import { apiFetch } from "./client";
import type { CreatePost, Post, PostWithVote, UpdatePost } from "./types";

export const postApi = {
  // GET /posts - Get all posts
  getPosts: async (limit = 10, skip = 0, search = ""): Promise<PostWithVote[]> => {
    return apiFetch(`/posts?limit=${limit}&skip=${skip}&search=${search}`);
  },

  // GET /posts/{id} - Get single post
  getPost: async (id: number): Promise<PostWithVote> => {
    return apiFetch(`/posts/${id}`);
  },

  // GET /posts/profileposts - Get user's own posts
  getProfilePosts: async (limit = 10, skip = 0): Promise<PostWithVote[]> => {
    return apiFetch(`/posts/profileposts?limit=${limit}&skip=${skip}`);
  },

  // POST /posts = Create New Post

  createPost: async (data: CreatePost): Promise<Post> => {
    return apiFetch("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // PUT /posts/{id} - Update existing post

  updatePost: async (id: number, data: UpdatePost): Promise<Post> => {
    return apiFetch(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // DELETE /posts/{id} - Delete post
  deletePost: async (id: number): Promise<void> => {
    return apiFetch(`/posts/${id}`, {
      method: "DELETE",
    });
  },
};
