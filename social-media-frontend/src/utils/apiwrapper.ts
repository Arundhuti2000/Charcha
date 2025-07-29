// Updated API Configuration with CORS handling
const BASE_URL = "http://127.0.0.1:8000";  // Remove trailing slash

// Types (same as before)
export interface User {
  id: number;
  email: string;
  created_at: string;
  phone_number?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  published: boolean;
  rating?: number;
  created_at: string;
  user_id: number;
  owner: User;
}

export interface PostWithVote {
  Post: Post;
  Votes: number;
  Upvotes: number;
  Downvotes: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  phone_number?: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  category: string;
  published?: boolean;
  rating?: number;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  category: string;
  published?: boolean;
  rating?: number;
}

export interface LoginRequest {
  username: string; // Note: API uses username field for email
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface VoteRequest {
  post_id: number;
  dir: -1 | 0 | 1; // -1 downvote, 0 remove vote, 1 upvote
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Token management
class TokenManager {
  private static readonly TOKEN_KEY = 'social_hub_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);  // Changed to localStorage for persistence
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Base API wrapper class
class ApiWrapper {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/${endpoint}`;  // Add slash here
      
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...TokenManager.getAuthHeaders(),
      };

      const config: RequestInit = {
        mode: 'cors',  // Explicitly set CORS mode
        credentials: 'include',  // Include credentials for CORS
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      console.log('Making request to:', url, 'with config:', config);  // Debug log

      const response = await fetch(url, config);
      
      // Handle different content types
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text as unknown as T;
      }

      console.log('Response:', response.status, data);  // Debug log

      if (!response.ok) {
        let errorMessage = 'An error occurred';
        
        if (typeof data === 'object' && data && 'detail' in data) {
          errorMessage = (data as any).detail;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }

        return {
          error: errorMessage,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);  // Debug log
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // Create FormData for OAuth2 password flow
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    try {
      const url = `${this.baseUrl}/login`;
      
      // Make the request directly without using makeRequest to avoid Content-Type conflicts
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        // Don't set Content-Type header - let browser set it for FormData
        body: formData,
      });

      console.log('Login response status:', response.status);
      
      let data: LoginResponse;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('Login response text:', text);
        throw new Error('Invalid response format');
      }

      console.log('Login response data:', data);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        if (data && typeof data === 'object' && 'detail' in data) {
          errorMessage = (data as any).detail;
        }
        
        return {
          error: errorMessage,
          status: response.status,
        };
      }

      // Store token if login successful
      if (data.access_token) {
        TokenManager.setToken(data.access_token);
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('Login request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async logout(): Promise<void> {
    TokenManager.removeToken();
  }

  // User endpoints
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(`users/${id}`);
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('users/');
  }

  // Post endpoints
  async getAllPosts(params?: {
    limit?: number;
    skip?: number;
    search?: string;
  }): Promise<ApiResponse<PostWithVote[]>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `posts/?${queryString}` : 'posts/';
    
    return this.makeRequest<PostWithVote[]>(endpoint);
  }

  async getUserPosts(params?: {
    limit?: number;
    skip?: number;
  }): Promise<ApiResponse<PostWithVote[]>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.skip) searchParams.append('skip', params.skip.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `posts/profileposts?${queryString}` : 'posts/profileposts';
    
    return this.makeRequest<PostWithVote[]>(endpoint);
  }

  async getPost(id: number): Promise<ApiResponse<PostWithVote>> {
    return this.makeRequest<PostWithVote>(`posts/${id}`);
  }

  async createPost(postData: CreatePostRequest): Promise<ApiResponse<Post>> {
    return this.makeRequest<Post>('posts/', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id: number, postData: UpdatePostRequest): Promise<ApiResponse<Post>> {
    return this.makeRequest<Post>(`posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Vote endpoints
  async vote(voteData: VoteRequest): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('vote/', {
      method: 'POST',
      body: JSON.stringify(voteData),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return TokenManager.getToken() !== null;
  }

  getToken(): string | null {
    return TokenManager.getToken();
  }
}

// Create singleton instance
export const api = new ApiWrapper();

// Export individual functions for easier usage
export const auth = {
  login: (credentials: LoginRequest) => api.login(credentials),
  logout: () => api.logout(),
  isAuthenticated: () => api.isAuthenticated(),
  getToken: () => api.getToken(),
};

export const users = {
  create: (userData: CreateUserRequest) => api.createUser(userData),
  getById: (id: number) => api.getUser(id),
  getCurrent: () => api.getCurrentUser(),
};

export const posts = {
  getAll: (params?: { limit?: number; skip?: number; search?: string }) => 
    api.getAllPosts(params),
  getUserPosts: (params?: { limit?: number; skip?: number }) => 
    api.getUserPosts(params),
  getById: (id: number) => api.getPost(id),
  create: (postData: CreatePostRequest) => api.createPost(postData),
  update: (id: number, postData: UpdatePostRequest) => api.updatePost(id, postData),
  delete: (id: number) => api.deletePost(id),
};

export const votes = {
  vote: (voteData: VoteRequest) => api.vote(voteData),
};

// Debug function to test connection
export const testConnection = async () => {
  try {
    const response = await fetch(`${BASE_URL}/`);
    const data = await response.json();
    console.log('Connection test:', data);
    return data;
  } catch (error) {
    console.error('Connection test failed:', error);
    return null;
  }
};

// Debug function to test login with detailed logging
export const debugLogin = async (email: string, password: string) => {
  console.log('Debug login attempt:', { email, password });
  
  const formData = new FormData();
  formData.append('username', email);  // API expects 'username' field
  formData.append('password', password);
  
  console.log('FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      body: formData,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    try {
      const jsonData = JSON.parse(responseText);
      console.log('Parsed JSON:', jsonData);
      return jsonData;
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return responseText;
    }
  } catch (error) {
    console.error('Debug login failed:', error);
    return null;
  }
};