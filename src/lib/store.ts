import { create } from "zustand";
import type { Organization, User } from "@/types/database";

interface AppState {
  organization: Organization | null;
  currentUser: User | null;
  sidebarOpen: boolean;
  setOrganization: (org: Organization) => void;
  setCurrentUser: (user: User) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  organization: null,
  currentUser: null,
  sidebarOpen: true,
  setOrganization: (org) => set({ organization: org }),
  setCurrentUser: (user) => set({ currentUser: user }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

// Demo organization and user for development
export const DEMO_ORG: Organization = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Acme Corp",
  slug: "acme-corp",
  logo_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_USER: User = {
  id: "00000000-0000-0000-0000-000000000002",
  org_id: DEMO_ORG.id,
  email: "admin@acme.com",
  full_name: "Admin User",
  role: "owner",
  avatar_url: null,
  is_available: true,
  created_at: new Date().toISOString(),
};
