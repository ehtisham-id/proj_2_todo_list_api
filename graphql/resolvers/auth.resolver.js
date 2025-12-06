import { authService } from "../../services/auth.service.js";;

export const authResolver = {
  Mutation: {
    register: async (_, { input }) => {
      await authService.register(input);
      return { message: "User registered successfully" };
    },
    login: async (_, { input }) => authService.login(input),
    refreshToken: async (_, { token }) => authService.refreshAccessToken(token),
  },
};
