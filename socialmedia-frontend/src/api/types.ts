// Types For Posts
export interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  published: boolean;
  rating: number | null;
  created_at: string;
  user_id: number;
  owner: {
    id: number;
    email: string;
    created_at: string;
  };
}

export interface PostWithVote {
  Post: Post;
  Votes: number;
  Upvotes: number;
  Downvotes: number;
}

export interface CreatePost {
  title: string;
  content: string;
  category: string;
  published?: boolean;
  rating?: number | null;
}

export interface UpdatePost {
  title: string;
  content: string;
  category: string;
  published?: boolean;
  rating?: number | null;
}

// Types For Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface CreateUser {
  email: string;
  password: string;
  phone_number?: string;
}

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface ApiError extends Error {
  response?: {
    status: number;
    data: unknown;
  };
  code?: string;
}
