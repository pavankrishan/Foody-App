import { getCurrentUser, signOut, signIn, createUser } from "@/lib/appwrite";
import { User } from "@/type";
import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  fetchAuthenticatedUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logoutUser: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),

  // ✅ Fetch user safely
  fetchAuthenticatedUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getCurrentUser();

      if (user) {
        set({ isAuthenticated: true, user: user as User });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch (e) {
      console.log("fetchAuthenticatedUser error", e);
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Login user
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      await signIn({ email, password });
      const user = await getCurrentUser();
      if (user) {
        set({ isAuthenticated: true, user: user as User });
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // <-- pass error to UI
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Register new user
  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      await createUser({ email, password, name });
      const user = await getCurrentUser();
      if (user) {
        set({ isAuthenticated: true, user: user as User });
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Logout user
  logoutUser: async () => {
    set({ isLoading: true });
    try {
      await signOut();
      set({ isAuthenticated: false, user: null });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
