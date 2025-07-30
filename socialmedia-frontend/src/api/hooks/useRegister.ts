import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateUser, User } from "../types";
import { authApi } from "../auth";
import { toast } from "sonner";

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUser) => authApi.register(userData),

    onSuccess: (user: User, variables: CreateUser) => {
      toast.success(`Account created! Welcome ${user.email} 🎉`);

      queryClient.removeQueries({ queryKey: ["user"] });

      console.log("New user created:", user);
      console.log("Registration data used:", variables);
    },

    onError: (error: Error, variables: CreateUser) => {
      console.error("Registration failed:", error);

      if (error.message.includes("email")) {
        toast.error(`Email ${variables.email} is already taken`);
      } else if (error.message.includes("password")) {
        toast.error("Password requirements not met");
      } else if (error.message.includes("validation")) {
        toast.error("Please check your information and try again");
      } else {
        toast.error(`Registration failed: ${error.message}`);
      }
    },

    onMutate: (variables: CreateUser) => {
      toast.loading(`Creating account for ${variables.email}...`, {
        id: "register",
      });

      console.log("Attempting to register:", variables.email);
    },

    onSettled: (data) => {
      toast.dismiss("register");

      if (data) {
        console.log("Registration completed successfully");
      } else {
        console.log("Registration failed");
      }
    },
  });
};
