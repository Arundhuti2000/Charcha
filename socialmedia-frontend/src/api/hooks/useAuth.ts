import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateUser, LoginCredentials, ApiError } from "../types";
import { authApi } from "../auth";
import { tokenUtils } from "@/utils/tokenUtils";
import { toast } from "sonner";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (response, variables) => {
      tokenUtils.set(response.access_token);

      console.log("User logged in:", variables.email);

      queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: authApi.getCurrentUser,
      });

      toast.success(`Welcome Back!👋`);
    },

    onError: (error: Error) => {
      tokenUtils.clear();
      toast.error(`Login failed: ${error.message}`);
    },

    onMutate: () => {
      toast.loading("Signing in...", { id: "login" });
    },

    onSettled: () => {
      toast.dismiss("login");
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: CreateUser) => authApi.register(userData),
    onSuccess: (user) => {
      toast.success(`Account created! Welcome ${user.email} 🎉`);
    },

    onError: (error: Error, variables) => {
      toast.error(`Registration failed for ${variables.email}: ${error.message}`);
    },

    onMutate: (variables) => {
      toast.loading(`Creating account for ${variables.email}...`, { id: "register" });
    },

    onSettled: () => {
      toast.dismiss("register");
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => Promise.resolve(),

    onSuccess: () => {
      tokenUtils.clear();

      queryClient.clear();

      toast.success("Logged out successfully! 👋");
    },
    onError: () => {
      tokenUtils.clear();
      queryClient.clear();
      toast.error("Logout failed, but cleared local data");
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: authApi.getCurrentUser,
    enabled: !!tokenUtils.get() && !tokenUtils.isExpired(),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: ApiError) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
};

// Check if user is authenticated
export const useIsAuthenticated = () => {
  const hasToken = !!tokenUtils.get();
  const isTokenValid = !tokenUtils.isExpired();

  return hasToken && isTokenValid;
};

// Get user info from token (without API call)
export const useTokenUser = () => {
  const decoded = tokenUtils.decode();
  return decoded
    ? {
        userId: decoded.user_id,
        exp: decoded.exp,
        isExpired: tokenUtils.isExpired(),
      }
    : null;
};
