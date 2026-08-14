export interface NodeConfig {
  id: string;
  type: "trigger" | "qubit" | "action" | "logic";
  title: string;
  icon: string;
  color: string;
  borderColor: string;
  aiConfig: string;
  target?: string;
}

export type QuadrantType = "projects" | "ideas" | "study" | "mindset";

export interface QuadrantItem {
  id: string;
  quadrant: QuadrantType;
  title: string;
  description: string;
  tags: string[]; // No background boxes behind these tags as per rules
  status: "Active" | "Pending" | "Completed" | "Blocked";
  priority: "high" | "medium" | "low";
  createdAt: number;
  updatedAt: number;
  links?: string;
}

export interface PlatformItem {
  id: string;
  name: string;
  url: string;
  status: "active" | "maintenance" | "disconnected";
  category: string;
  notes?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: number;
}
