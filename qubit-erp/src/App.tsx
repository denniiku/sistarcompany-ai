import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Network, 
  LayoutDashboard, 
  BrainCircuit, 
  Users, 
  Package, 
  CircleDollarSign, 
  Settings, 
  Save, 
  Play, 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  CheckCircle, 
  ExternalLink, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Edit,
  Database,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw
} from "lucide-react";
import { 
  authenticateUser, 
  db, 
  isUsingLocalFallback, 
  setUseLocalFallback 
} from "./firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  writeBatch
} from "firebase/firestore";
import { 
  NodeConfig, 
  QuadrantItem, 
  PlatformItem, 
  ChatMessage, 
  QuadrantType 
} from "./types";

// Static Default Node Data
const DEFAULT_NODES: Record<string, NodeConfig> = {
  n1: { 
    id: "n1", 
    type: "trigger", 
    title: "HR Node", 
    icon: "users", 
    color: "text-emerald-400", 
    borderColor: "border-emerald-500/30", 
    aiConfig: "Extract core competency data from resumes and send project suitability trigger automatically." 
  },
  n2: { 
    id: "n2", 
    type: "qubit", 
    title: "Qubit Algorithm (Master)", 
    icon: "brain-circuit", 
    color: "text-sky-400", 
    borderColor: "border-sky-500/50", 
    aiConfig: "Perform multivariate optimization by department: achieve perfect balance between OPEX and available resources.",
    target: "Maximize Operating Profit (Minimize Costs)"
  },
  n3: { 
    id: "n3", 
    type: "action", 
    title: "Inventory Node", 
    icon: "package", 
    color: "text-amber-400", 
    borderColor: "border-amber-500/30", 
    aiConfig: "Based on Qubit analysis, automatically send PO to suppliers when inventory shortage is expected under 10% threshold." 
  },
  n4: { 
    id: "n4", 
    type: "logic", 
    title: "Finance Node", 
    icon: "circle-dollar-sign", 
    color: "text-rose-400", 
    borderColor: "border-rose-500/30", 
    aiConfig: "Real-time cash flow monitoring and automatic monthly expenditure limit update calculated by optimization values." 
  }
};

// Initial Seed Data for Cosmo Seed Quadrants
const SEED_QUADRANT_ITEMS: QuadrantItem[] = [
  {
    id: "p1",
    quadrant: "projects",
    title: "Qubit App/Data Factory Int'l",
    description: "24-hour non-stop hyper-intellectual project replication engine and autonomous deployment pipeline.",
    tags: ["Replication", "SaaS", "Core-Engine"],
    status: "Active",
    priority: "high",
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    links: "https://github.com/sistarcompany/qubit-factory"
  },
  {
    id: "p2",
    quadrant: "projects",
    title: "Qubit Commerce & Media (Qubit Ads)",
    description: "Zero-inventory programmatic media buying and viral signal short video creation using Sharon TTS.",
    tags: ["Programmatic", "TTS", "Veo-Video"],
    status: "Active",
    priority: "high",
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    links: "https://commerce.sistarcompany.com"
  },
  {
    id: "i1",
    quadrant: "ideas",
    title: "B2B Arbitrage Autonomous Webhook",
    description: "Identify micro-fluctuations in wholesale raw materials and trigger smart contracts via webhooks.",
    tags: ["Arbitrage", "API-Link", "Smart-Contract"],
    status: "Pending",
    priority: "medium",
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    links: ""
  },
  {
    id: "s1",
    quadrant: "study",
    title: "Model Context Protocol (MCP) Integration",
    description: "Standardize AI context schema to expose ERP node triggers as external tools for Claude & Cursor.",
    tags: ["MCP", "API-Standard", "Security"],
    status: "Active",
    priority: "high",
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    links: "https://modelcontextprotocol.org"
  },
  {
    id: "s2",
    quadrant: "study",
    title: "Rayven 5-layer Data Fabric Blueprint",
    description: "Deep dive into real-time data streaming layers, events ingestion, and middle-automation pipelines.",
    tags: ["Data-Fabric", "Middle-Automation", "Research"],
    status: "Completed",
    priority: "low",
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 10,
    links: ""
  },
  {
    id: "m1",
    quadrant: "mindset",
    title: "One Spark, Infinite Galaxifying",
    description: "A single core concept exploded programmatically into multiple localized micro-brands in hours.",
    tags: ["Unicorn", "Strategy", "Explosion"],
    status: "Active",
    priority: "high",
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 15,
    links: ""
  },
  {
    id: "m2",
    quadrant: "mindset",
    title: "Vibe Working & Strategic Isolation",
    description: "Shifting from linear labor hours to strategic orchestration. Commanders carry a 2-suitcase footprint.",
    tags: ["Productivity", "Orchestration", "Minimalist"],
    status: "Active",
    priority: "medium",
    createdAt: Date.now() - 86400000 * 12,
    updatedAt: Date.now() - 86400000 * 12,
    links: ""
  }
];

const SEED_PLATFORM_ITEMS: PlatformItem[] = [
  {
    id: "pf1",
    name: "n8n Cloud Workflow Builder",
    url: "https://n8n.sistarcompany-ai.com",
    status: "active",
    category: "Workflow",
    notes: "Main event-driven orchestrator connecting nodes",
    createdAt: Date.now() - 86400000 * 10
  },
  {
    id: "pf2",
    name: "Supabase PG Database",
    url: "https://supabase.sistarcompany-ai.com",
    status: "active",
    category: "Database",
    notes: "Secure client-data isolation database layer",
    createdAt: Date.now() - 86400000 * 10
  },
  {
    id: "pf3",
    name: "Google AI Studio Console",
    url: "https://ai.studio.google.com",
    status: "active",
    category: "AI Engine",
    notes: "Telemetry-grounded Gemini 3.7 Pro & Flash playground",
    createdAt: Date.now() - 86400000 * 10
  }
];

export default function App() {
  // App states
  const [activeTab, setActiveTab] = useState<"canvas" | "dashboard">("canvas");
  const [userId, setUserId] = useState<string>("local-fallback-user");
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(false);
  const [isLoadingSync, setIsLoadingSync] = useState<boolean>(true);

  // Node Canvas states
  const [nodes, setNodes] = useState<Record<string, NodeConfig>>(DEFAULT_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("n2");
  const [nodeAIInput, setNodeAIInput] = useState<string>("");
  const [nodeAIResponse, setNodeAIResponse] = useState<string>("");
  const [isNodeAILoading, setIsNodeAILoading] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>("");

  // Cosmo Seed Quadrants & Platform states
  const [quadrantItems, setQuadrantItems] = useState<QuadrantItem[]>([]);
  const [platformItems, setPlatformItems] = useState<PlatformItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Edit/Add modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Partial<QuadrantItem> | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // Platform Edit/Add states
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState<boolean>(false);
  const [editingPlatform, setEditingPlatform] = useState<Partial<PlatformItem> | null>(null);

  // What-If Simulator states
  const [materialCostIncrease, setMaterialCostIncrease] = useState<number>(5);
  const [supplyChainVolatility, setSupplyChainVolatility] = useState<string>("High");
  const [simulationResult, setSimulationResult] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Chatbot states
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "ai",
      text: "Qubit AI active. I am grounded with current HR, Inventory, and Finance states. What would you like to simulate or configure today?",
      timestamp: Date.now()
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Scroll target for chat window
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatLoading]);

  // Authenticate and load sync
  useEffect(() => {
    const initApp = async () => {
      setIsLoadingSync(true);
      const uid = await authenticateUser();
      setUserId(uid);

      if (uid && uid !== "local-fallback-user") {
        setIsFirebaseSynced(true);
        setUseLocalFallback(false);
        
        // Listen to Quadrants
        const qRef = collection(db, `users/${uid}/quadrant_items`);
        const unsubscribeQuadrants = onSnapshot(qRef, (snapshot) => {
          if (snapshot.empty) {
            // Seed default values in Firestore if empty
            const batch = writeBatch(db);
            SEED_QUADRANT_ITEMS.forEach((item) => {
              const docRef = doc(db, `users/${uid}/quadrant_items`, item.id);
              batch.set(docRef, item);
            });
            batch.commit().then(() => {
              showToast("Seeded 4-quadrant workspaces in your private database!");
            });
          } else {
            const items: QuadrantItem[] = [];
            snapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() } as QuadrantItem);
            });
            setQuadrantItems(items.sort((a, b) => b.updatedAt - a.updatedAt));
          }
        }, (error) => {
          console.error("Firestore listening error for quadrants:", error);
          fallbackToLocalStorage();
        });

        // Listen to Platforms
        const pRef = collection(db, `users/${uid}/platform_items`);
        const unsubscribePlatforms = onSnapshot(pRef, (snapshot) => {
          if (snapshot.empty) {
            const batch = writeBatch(db);
            SEED_PLATFORM_ITEMS.forEach((plat) => {
              const docRef = doc(db, `users/${uid}/platform_items`, plat.id);
              batch.set(docRef, plat);
            });
            batch.commit();
          } else {
            const plats: PlatformItem[] = [];
            snapshot.forEach((doc) => {
              plats.push({ id: doc.id, ...doc.data() } as PlatformItem);
            });
            setPlatformItems(plats);
          }
        });

        // Listen to Node Configs
        const nRef = collection(db, `users/${uid}/node_configs`);
        const unsubscribeNodes = onSnapshot(nRef, (snapshot) => {
          if (!snapshot.empty) {
            const loadedNodes: Record<string, NodeConfig> = {};
            snapshot.forEach((doc) => {
              loadedNodes[doc.id] = { id: doc.id, ...doc.data() } as NodeConfig;
            });
            setNodes(loadedNodes);
          } else {
            // Write defaults to firestore
            const batch = writeBatch(db);
            Object.keys(DEFAULT_NODES).forEach((key) => {
              const docRef = doc(db, `users/${uid}/node_configs`, key);
              batch.set(docRef, DEFAULT_NODES[key]);
            });
            batch.commit();
          }
        });

        setIsLoadingSync(false);

        return () => {
          unsubscribeQuadrants();
          unsubscribePlatforms();
          unsubscribeNodes();
        };
      } else {
        fallbackToLocalStorage();
      }
    };

    const fallbackToLocalStorage = () => {
      setIsFirebaseSynced(false);
      setUseLocalFallback(true);
      
      // Load quadrants
      const localQ = localStorage.getItem("qubit_quadrants");
      if (localQ) {
        setQuadrantItems(JSON.parse(localQ));
      } else {
        setQuadrantItems(SEED_QUADRANT_ITEMS);
        localStorage.setItem("qubit_quadrants", JSON.stringify(SEED_QUADRANT_ITEMS));
      }

      // Load platforms
      const localP = localStorage.getItem("qubit_platforms");
      if (localP) {
        setPlatformItems(JSON.parse(localP));
      } else {
        setPlatformItems(SEED_PLATFORM_ITEMS);
        localStorage.setItem("qubit_platforms", JSON.stringify(SEED_PLATFORM_ITEMS));
      }

      // Load nodes
      const localN = localStorage.getItem("qubit_nodes");
      if (localN) {
        setNodes(JSON.parse(localN));
      } else {
        setNodes(DEFAULT_NODES);
        localStorage.setItem("qubit_nodes", JSON.stringify(DEFAULT_NODES));
      }

      setIsLoadingSync(false);
    };

    initApp();
  }, []);

  // Save LocalStorage as a synchronization helper
  const syncLocalStorageAndState = (newQuadrants?: QuadrantItem[], newPlatforms?: PlatformItem[], newNodes?: Record<string, NodeConfig>) => {
    if (newQuadrants) {
      setQuadrantItems(newQuadrants);
      localStorage.setItem("qubit_quadrants", JSON.stringify(newQuadrants));
    }
    if (newPlatforms) {
      setPlatformItems(newPlatforms);
      localStorage.setItem("qubit_platforms", JSON.stringify(newPlatforms));
    }
    if (newNodes) {
      setNodes(newNodes);
      localStorage.setItem("qubit_nodes", JSON.stringify(newNodes));
    }
  };

  // Node Configuration actions
  const activeNode = nodes[selectedNodeId] || DEFAULT_NODES.n2;

  const handleUpdateNodeConfig = (text: string) => {
    const updatedNodes = {
      ...nodes,
      [selectedNodeId]: {
        ...activeNode,
        aiConfig: text
      }
    };
    setNodes(updatedNodes);
    if (!isFirebaseSynced) {
      syncLocalStorageAndState(undefined, undefined, updatedNodes);
    }
  };

  const handleUpdateNodeTarget = (targetVal: string) => {
    const updatedNodes = {
      ...nodes,
      [selectedNodeId]: {
        ...activeNode,
        target: targetVal
      }
    };
    setNodes(updatedNodes);
    if (!isFirebaseSynced) {
      syncLocalStorageAndState(undefined, undefined, updatedNodes);
    }
  };

  const saveWorkflowToDb = async () => {
    setSaveStatus("Saving...");
    try {
      if (isFirebaseSynced) {
        const batch = writeBatch(db);
        Object.keys(nodes).forEach((key) => {
          const docRef = doc(db, `users/${userId}/node_configs`, key);
          batch.set(docRef, nodes[key]);
        });
        await batch.commit();
      } else {
        localStorage.setItem("qubit_nodes", JSON.stringify(nodes));
      }
      setSaveStatus("Success!");
      showToast("Workflow and Node configs saved securely.");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (e: any) {
      setSaveStatus("Failed");
      showToast("Error saving workflow: " + e.message, "error");
      setTimeout(() => setSaveStatus(""), 2000);
    }
  };

  // Run Node-Level AI Optimization
  const handleRunNodeAI = async () => {
    if (!nodeAIInput.trim()) {
      showToast("Please write some test inputs first.", "info");
      return;
    }
    setIsNodeAILoading(true);
    setNodeAIResponse("Connecting node to Gemini optimizer...");
    try {
      const response = await fetch("/api/run-node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: selectedNodeId,
          promptInput: nodeAIInput,
          contextData: activeNode.aiConfig
        })
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setNodeAIResponse(data.output);
      showToast("Node AI evaluation completed.", "success");
    } catch (err: any) {
      setNodeAIResponse(`Node Execution Failed: ${err.message}`);
      showToast("AI Execution Error", "error");
    } finally {
      setIsNodeAILoading(false);
    }
  };

  // Run What-If Strategy Simulator
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationResult("");
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialCostIncrease,
          supplyChainVolatility
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSimulationResult(data.result);
      showToast("Qubit simulation complete: Wavefunction collapsed.", "success");
    } catch (err: any) {
      showToast("Simulation failed: " + err.message, "error");
      setSimulationResult(`Simulation Failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // NLQ Executive Chat
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: chatInput,
      timestamp: Date.now()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const originalInput = chatInput;
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: originalInput,
          history: chatMessages.map(m => ({ role: m.sender === "user" ? "user" : "model", text: m.text }))
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setChatMessages((prev) => [
        ...prev,
        {
          id: "ai-" + Date.now(),
          sender: "ai",
          text: data.response,
          timestamp: Date.now()
        }
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: "ai-err-" + Date.now(),
          sender: "ai",
          text: `Error connecting to Qubit Master AI: ${err.message}. Please verify Gemini Secrets.`,
          timestamp: Date.now()
        }
      ]);
      showToast("Chat query failed.", "error");
    } finally {
      setIsChatLoading(false);
    }
  };

  // Quadrant Item Operations (Create / Edit / Toggle Selection / Bulk actions)
  const toggleSelection = (id: string, e: React.MouseEvent) => {
    // Checkbox ONLY rule: Clicking checkbox MUST ONLY toggle selection. It MUST NOT trigger the edit modal.
    e.stopPropagation();
    const next = new Set(selectedItemIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedItemIds(next);
  };

  const handleOpenEditModal = (item: QuadrantItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop click propagation to prevent checkbox triggers
    setModalMode("edit");
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleOpenCreateModal = (quadrant: QuadrantType) => {
    setModalMode("create");
    setEditingItem({
      quadrant,
      title: "",
      description: "",
      tags: [],
      status: "Active",
      priority: "high"
    });
    setIsEditModalOpen(true);
  };

  const handleSaveQuadrantItem = async () => {
    if (!editingItem?.title?.trim()) {
      showToast("Title is required", "error");
      return;
    }

    const tagArray = Array.isArray(editingItem.tags) 
      ? editingItem.tags 
      : typeof editingItem.tags === "string" 
        ? (editingItem.tags as string).split(",").map(t => t.trim()).filter(Boolean)
        : [];

    const updatedItem: QuadrantItem = {
      id: editingItem.id || "qi-" + Math.random().toString(36).substring(2, 9),
      quadrant: editingItem.quadrant as QuadrantType,
      title: editingItem.title.trim(),
      description: editingItem.description || "",
      tags: tagArray,
      status: editingItem.status || "Active",
      priority: editingItem.priority || "high",
      createdAt: editingItem.createdAt || Date.now(),
      updatedAt: Date.now(),
      links: editingItem.links || ""
    };

    try {
      if (isFirebaseSynced) {
        await setDoc(doc(db, `users/${userId}/quadrant_items`, updatedItem.id), updatedItem);
      } else {
        const nextList = modalMode === "create" 
          ? [updatedItem, ...quadrantItems]
          : quadrantItems.map(item => item.id === updatedItem.id ? updatedItem : item);
        syncLocalStorageAndState(nextList);
      }
      showToast(`Item successfully ${modalMode === "create" ? "created" : "updated"}`);
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (e: any) {
      showToast("Error saving: " + e.message, "error");
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      if (isFirebaseSynced) {
        await deleteDoc(doc(db, `users/${userId}/quadrant_items`, id));
      } else {
        const nextList = quadrantItems.filter(item => item.id !== id);
        syncLocalStorageAndState(nextList);
      }
      showToast("Item deleted successfully.");
      const nextSel = new Set(selectedItemIds);
      nextSel.delete(id);
      setSelectedItemIds(nextSel);
    } catch (e: any) {
      showToast("Error deleting item: " + e.message, "error");
    }
  };

  // Bulk actions positioned elegantly above the quadrants
  const handleBulkDelete = async () => {
    if (selectedItemIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedItemIds.size} selected items?`)) return;

    try {
      if (isFirebaseSynced) {
        for (const id of selectedItemIds) {
          await deleteDoc(doc(db, `users/${userId}/quadrant_items`, id));
        }
      } else {
        const nextList = quadrantItems.filter(item => !selectedItemIds.has(item.id));
        syncLocalStorageAndState(nextList);
      }
      showToast(`Deleted ${selectedItemIds.size} items.`);
      setSelectedItemIds(new Set());
    } catch (e: any) {
      showToast("Bulk deletion failed: " + e.message, "error");
    }
  };

  const handleBulkComplete = async () => {
    if (selectedItemIds.size === 0) return;
    try {
      if (isFirebaseSynced) {
        for (const id of selectedItemIds) {
          await updateDoc(doc(db, `users/${userId}/quadrant_items`, id), {
            status: "Completed",
            updatedAt: Date.now()
          });
        }
      } else {
        const nextList = quadrantItems.map(item => 
          selectedItemIds.has(item.id) 
            ? { ...item, status: "Completed" as const, updatedAt: Date.now() } 
            : item
        );
        syncLocalStorageAndState(nextList);
      }
      showToast(`Marked ${selectedItemIds.size} items as Completed.`);
      setSelectedItemIds(new Set());
    } catch (e: any) {
      showToast("Bulk status update failed: " + e.message, "error");
    }
  };

  const handleBulkMove = async (targetQuadrant: QuadrantType) => {
    if (selectedItemIds.size === 0) return;
    try {
      if (isFirebaseSynced) {
        for (const id of selectedItemIds) {
          await updateDoc(doc(db, `users/${userId}/quadrant_items`, id), {
            quadrant: targetQuadrant,
            updatedAt: Date.now()
          });
        }
      } else {
        const nextList = quadrantItems.map(item => 
          selectedItemIds.has(item.id) 
            ? { ...item, quadrant: targetQuadrant, updatedAt: Date.now() } 
            : item
        );
        syncLocalStorageAndState(nextList);
      }
      showToast(`Moved ${selectedItemIds.size} items to ${targetQuadrant}.`);
      setSelectedItemIds(new Set());
    } catch (e: any) {
      showToast("Bulk move failed: " + e.message, "error");
    }
  };

  // Platform Operations
  const handleOpenPlatformModal = (plat: PlatformItem | null) => {
    if (plat) {
      setEditingPlatform(plat);
    } else {
      setEditingPlatform({
        name: "",
        url: "",
        status: "active",
        category: "Workflow",
        notes: ""
      });
    }
    setIsPlatformModalOpen(true);
  };

  const handleSavePlatform = async () => {
    if (!editingPlatform?.name?.trim()) {
      showToast("Platform Name is required", "error");
      return;
    }

    const updatedPlat: PlatformItem = {
      id: editingPlatform.id || "pf-" + Math.random().toString(36).substring(2, 9),
      name: editingPlatform.name.trim(),
      url: editingPlatform.url || "",
      status: editingPlatform.status || "active",
      category: editingPlatform.category || "Workflow",
      notes: editingPlatform.notes || "",
      createdAt: editingPlatform.createdAt || Date.now()
    };

    try {
      if (isFirebaseSynced) {
        await setDoc(doc(db, `users/${userId}/platform_items`, updatedPlat.id), updatedPlat);
      } else {
        const nextList = editingPlatform.id
          ? platformItems.map(p => p.id === updatedPlat.id ? updatedPlat : p)
          : [updatedPlat, ...platformItems];
        syncLocalStorageAndState(undefined, nextList);
      }
      showToast("Platform configurations saved.");
      setIsPlatformModalOpen(false);
      setEditingPlatform(null);
    } catch (e: any) {
      showToast("Failed to save platform: " + e.message, "error");
    }
  };

  const handleDeletePlatform = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remove platform configuration?")) return;
    try {
      if (isFirebaseSynced) {
        await deleteDoc(doc(db, `users/${userId}/platform_items`, id));
      } else {
        const nextList = platformItems.filter(p => p.id !== id);
        syncLocalStorageAndState(undefined, nextList);
      }
      showToast("Platform configuration removed.");
    } catch (e: any) {
      showToast("Error deleting platform: " + e.message, "error");
    }
  };

  // Grouped items by Quadrants
  const groupedQuadrants = useMemo(() => {
    const groups: Record<QuadrantType, QuadrantItem[]> = {
      projects: [],
      ideas: [],
      study: [],
      mindset: []
    };
    quadrantItems.forEach((item) => {
      if (groups[item.quadrant]) {
        groups[item.quadrant].push(item);
      }
    });
    return groups;
  }, [quadrantItems]);

  // Clean, high density layout details
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#050508] text-[#94a3b8] antialiased overflow-x-hidden selection:bg-sky-500/30 selection:text-white">
      
      {/* HEADER - FIXED / PINNED */}
      <header className="sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between px-6 py-3 border-b border-[#1e293b] bg-[#0a0a0f]/90 backdrop-blur-md transition-all shadow-[0_2px_15px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3 w-full md:w-auto mb-4 md:mb-0">
          <div className="w-8 h-8 bg-[#3b82f6] rounded-md flex items-center justify-center font-bold text-white text-lg">
            Q
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#f8fafc] tracking-[0.5px]">QUBIT ERP</h1>
              <span className="text-[9px] px-1.5 py-0.5 border border-[#3b82f6]/40 text-[#3b82f6] rounded uppercase font-semibold">One-Man Unicorn</span>
            </div>
            <p className="text-[10px] text-[#94a3b8] uppercase tracking-[2px] font-mono mt-0.5">Agentic Workflow</p>
          </div>
        </div>

        {/* Navigation - Styled as modern technical buttons container */}
        <div className="flex bg-[#11111a] p-1 rounded-lg border border-[#1e293b] shadow-inner">
          <button 
            onClick={() => setActiveTab("canvas")} 
            id="btn-canvas" 
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "canvas" ? "bg-[#3b82f6] text-white shadow-md shadow-[#3b82f6]/20" : "text-[#94a3b8] hover:text-[#f8fafc]"}`}
          >
            <Network className="w-3.5 h-3.5" /> Node Canvas
          </button>
          <button 
            onClick={() => setActiveTab("dashboard")} 
            id="btn-dashboard" 
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "dashboard" ? "bg-[#3b82f6] text-white shadow-md shadow-[#3b82f6]/20" : "text-[#94a3b8] hover:text-[#f8fafc]"}`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Executive Cockpit
          </button>
        </div>

        {/* Real-time Status / Credentials Notification */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-[11px] text-[#f8fafc]">Firebase Instance</div>
            <div className="text-[9px] font-bold tracking-wider flex items-center justify-end gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseSynced ? "bg-[#10b981]" : "bg-[#f59e0b] animate-pulse"}`}></span>
              <span className={isFirebaseSynced ? "text-[#10b981]" : "text-[#f59e0b]"}>
                {isFirebaseSynced ? "CONNECTED" : "LOCAL CACHE"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-73px)] relative">
        
        {/* Left Side Navigation Rail (Hidden on Mobile) */}
        <aside className="hidden md:flex w-16 border-r border-[#1e293b] bg-[#050508] flex-col items-center py-6 gap-6 shrink-0">
          <button 
            onClick={() => setActiveTab("canvas")}
            title="Node Canvas"
            className={`w-9 h-9 border rounded-lg flex items-center justify-center cursor-pointer transition-all ${
              activeTab === "canvas" 
                ? "text-[#3b82f6] border-[#3b82f6] bg-[#3b82f6]/10 shadow-[0_0_10px_rgba(59,130,246,0.15)]" 
                : "text-[#94a3b8] border-[#1e293b] hover:text-white hover:border-[#94a3b8]"
            }`}
          >
            <Network className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setActiveTab("dashboard")}
            title="Executive Cockpit"
            className={`w-9 h-9 border rounded-lg flex items-center justify-center cursor-pointer transition-all ${
              activeTab === "dashboard" 
                ? "text-[#3b82f6] border-[#3b82f6] bg-[#3b82f6]/10 shadow-[0_0_10px_rgba(59,130,246,0.15)]" 
                : "text-[#94a3b8] border-[#1e293b] hover:text-white hover:border-[#94a3b8]"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>

          <button 
            onClick={() => {
              setActiveTab("dashboard");
              setTimeout(() => {
                document.getElementById("cosmo-seed-section")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
              showToast("Navigated to Cosmo Seed™ Workspaces", "info");
            }}
            title="Cosmo Seed Quadrants"
            className="w-9 h-9 border border-[#1e293b] rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-white hover:border-[#94a3b8] cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#0ea5e9]" />
          </button>

          <button 
            onClick={() => {
              setActiveTab("dashboard");
              setTimeout(() => {
                document.getElementById("my-platforms-section")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
              showToast("Navigated to System Integrations / Platforms", "info");
            }}
            title="My Platforms"
            className="w-9 h-9 border border-[#1e293b] rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-white hover:border-[#94a3b8] cursor-pointer transition-all"
          >
            <Database className="w-4 h-4 text-[#f97316]" />
          </button>

          <button 
            onClick={() => showToast("Qubit ERP Orchestrator is operational.", "success")}
            title="System Status"
            className="w-9 h-9 border border-[#1e293b] rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-white hover:border-[#94a3b8] cursor-pointer transition-all mt-auto"
          >
            <Info className="w-4 h-4" />
          </button>
        </aside>

        {/* Content Container wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* VIEW 1: AGENTIC NODE CANVAS */}
        {activeTab === "canvas" && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Interactive Canvas Area */}
            <div className="flex-1 min-h-[450px] relative bg-[#050508] bg-grid overflow-y-auto p-4 md:p-8 flex items-center justify-center">
              
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 max-w-4xl w-full py-8 relative z-10">
                
                {/* Node 1: HR */}
                <div 
                  onClick={() => setSelectedNodeId("n1")}
                  className={`relative w-full md:w-60 bg-[#0f172a] border rounded-xl p-4 cursor-pointer transition-all hover:border-[#f8fafc] hover:-translate-y-0.5 ${
                    selectedNodeId === "n1" ? "border-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "border-[#1e293b]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-950 border border-[#1e293b]">
                      <Users className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#f8fafc] text-sm">HR Node</h4>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">Resume Extraction</p>
                    </div>
                  </div>
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-700 rounded-full border border-slate-900 hidden md:block"></div>
                </div>
                
                <ChevronRight className="w-6 h-6 text-slate-600 animate-pulse hidden md:block shrink-0" />
                <ChevronDown className="w-6 h-6 text-slate-600 animate-pulse md:hidden shrink-0" />
                
                {/* Node 2: Qubit Master (Central Optimization) */}
                <div className="relative w-full md:w-64">
                  <div className="absolute -inset-1.5 bg-[#3b82f6]/10 blur-md rounded-full animate-pulse"></div>
                  <div 
                    onClick={() => setSelectedNodeId("n2")}
                    className={`relative w-full bg-[#0f172a] border rounded-xl p-4 cursor-pointer transition-all hover:border-[#f8fafc] hover:-translate-y-0.5 z-10 ${
                      selectedNodeId === "n2" ? "border-[#3b82f6] shadow-[0_0_25px_rgba(59,130,246,0.3)]" : "border-[#1e293b]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-950 border border-[#3b82f6]/40 shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                        <BrainCircuit className="w-5 h-5 text-[#3b82f6] animate-spin-slow" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#f8fafc] text-sm">Qubit Algorithm</h4>
                        <p className="text-[11px] text-sky-400 mt-0.5">Multivariate Optimizer</p>
                      </div>
                    </div>
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-700 rounded-full border border-slate-900 hidden md:block"></div>
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-700 rounded-full border border-slate-900 hidden md:block"></div>
                  </div>
                </div>
 
                <ChevronRight className="w-6 h-6 text-slate-600 animate-pulse hidden md:block shrink-0" />
                <ChevronDown className="w-6 h-6 text-slate-600 animate-pulse md:hidden shrink-0" />
                
                {/* Branch out to downstream Nodes */}
                <div className="flex flex-col gap-6 w-full md:w-auto relative z-10">
                  
                  {/* Node 3: Inventory */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 border-b border-[#1e293b] hidden md:block"></div>
                    <div 
                      onClick={() => setSelectedNodeId("n3")}
                      className={`relative w-full md:w-60 bg-[#0f172a] border rounded-xl p-4 cursor-pointer transition-all hover:border-[#f8fafc] hover:-translate-y-0.5 ${
                        selectedNodeId === "n3" ? "border-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "border-[#1e293b]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-slate-950 border border-[#1e293b]">
                          <Package className="w-5 h-5 text-[#f59e0b]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#f8fafc] text-sm">Inventory Node</h4>
                          <p className="text-[11px] text-[#94a3b8] mt-0.5">Auto Order if Stock &lt; 10%</p>
                        </div>
                      </div>
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-700 rounded-full border border-slate-900 hidden md:block"></div>
                    </div>
                  </div>
                  
                  {/* Node 4: Finance */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 border-b border-[#1e293b] hidden md:block"></div>
                    <div 
                      onClick={() => setSelectedNodeId("n4")}
                      className={`relative w-full md:w-60 bg-[#0f172a] border rounded-xl p-4 cursor-pointer transition-all hover:border-[#f8fafc] hover:-translate-y-0.5 ${
                        selectedNodeId === "n4" ? "border-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "border-[#1e293b]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-slate-950 border border-[#1e293b]">
                          <CircleDollarSign className="w-5 h-5 text-[#f43f5e]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#f8fafc] text-sm">Finance Node</h4>
                          <p className="text-[11px] text-[#94a3b8] mt-0.5">Cash Flow Limit Control</p>
                        </div>
                      </div>
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-700 rounded-full border border-slate-900 hidden md:block"></div>
                    </div>
                  </div>
 
                </div>
 
              </div>
            </div>
 
            {/* Node Configuration Sidebar */}
            <div className="w-full md:w-96 bg-[#0a0a0f] border-t md:border-t-0 md:border-l border-[#1e293b] flex flex-col shrink-0">
              <div className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-slate-950/40">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-400" /> Active Configuration
                </h2>
                <button 
                  onClick={saveWorkflowToDb}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> {saveStatus || "Save Configuration"}
                </button>
              </div>
              
              <div className="p-5 flex-1 overflow-y-auto space-y-5">
                <div>
                  <div className="inline-flex p-3 rounded-xl bg-slate-950 border border-slate-800 mb-3">
                    {activeNode.id === "n1" && <Users className="w-7 h-7 text-emerald-400" />}
                    {activeNode.id === "n2" && <BrainCircuit className="w-7 h-7 text-[#0ea5e9]" />}
                    {activeNode.id === "n3" && <Package className="w-7 h-7 text-amber-400" />}
                    {activeNode.id === "n4" && <CircleDollarSign className="w-7 h-7 text-rose-400" />}
                  </div>
                  <h3 className="text-base font-extrabold text-white">{activeNode.title}</h3>
                  <p className="text-[10px] text-sky-400 font-mono tracking-widest uppercase mt-0.5">Node Class: {activeNode.type}</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Node-Level AI System Instruction</label>
                    <textarea 
                      value={activeNode.aiConfig}
                      onChange={(e) => handleUpdateNodeConfig(e.target.value)}
                      className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 outline-none focus:border-sky-500 font-mono resize-none leading-relaxed"
                      placeholder="Prompt instructions for the node agent..."
                    />
                  </div>
                  
                  {activeNode.type === "qubit" && (
                    <div className="p-3 bg-sky-900/10 border border-sky-500/20 rounded-lg">
                      <h4 className="text-xs font-bold text-sky-400 mb-1.5 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Optimization Target
                      </h4>
                      <select 
                        value={activeNode.target || "Maximize Operating Profit (Minimize Costs)"}
                        onChange={(e) => handleUpdateNodeTarget(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-sky-500"
                      >
                        <option>Maximize Operating Profit (Minimize Costs)</option>
                        <option>Converge Inventory Risk to 0%</option>
                        <option>Auto-reallocate Idle Resources</option>
                      </select>
                    </div>
                  )}

                  {/* Interactive Node Execution Playground */}
                  <div className="border-t border-slate-800/80 pt-4">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Test Node Agent with Input</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="text"
                        value={nodeAIInput}
                        onChange={(e) => setNodeAIInput(e.target.value)}
                        placeholder={
                          selectedNodeId === "n1" ? "John Doe, 5yrs senior react dev" :
                          selectedNodeId === "n3" ? "Item: steel bolts, qty 50" :
                          selectedNodeId === "n4" ? "Approve $5000 marketing expenses" : "General test query"
                        }
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-sky-500"
                      />
                      <button
                        onClick={handleRunNodeAI}
                        disabled={isNodeAILoading}
                        className="px-3 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                      >
                        Run
                      </button>
                    </div>
                  </div>

                  {nodeAIResponse && (
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] leading-relaxed">
                      <div className="flex items-center justify-between text-[9px] text-slate-500 border-b border-slate-900 pb-1 mb-1.5">
                        <span>OPTIMIZATION TERMINAL</span>
                        <span>gemini-3.7-flash</span>
                      </div>
                      <div className="whitespace-pre-line text-slate-300">{nodeAIResponse}</div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Downstream Routing Logic</label>
                    <p className="text-[10px] text-slate-500 mb-2">Automated trigger to next connected node upon optimization collapse.</p>
                    <button className="w-full flex items-center justify-center gap-1.5 p-2 bg-slate-950 border border-slate-800/80 rounded-lg text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />
                      Add connection logic branch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: C-LEVEL MANAGEMENT COCKPIT */}
        {activeTab === "dashboard" && (
          <div className="flex-1 w-full bg-[#050508] bg-grid overflow-y-auto pb-12">
            <div className="max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6 relative z-10">
              
              {/* TOP STATUS DASHBOARD BAR */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-[#0a0a0f] border border-[#1e293b] rounded-lg">
                <div>
                  <h2 className="text-base font-bold text-[#f8fafc]">SISTAR Business Cockpit</h2>
                  <p className="text-xs text-[#94a3b8]">Prescriptive Strategy & Cosmo Seed™ Quadrant Manager</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-[#10b981]">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                    <span>Qubit Engine: ACTIVE</span>
                  </div>
                  <div className="text-[#94a3b8] border-l border-[#1e293b] pl-4">
                    <span>Local Time: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              </div>
 
              {/* KPI CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#11111a] border border-[#1e293b] p-4 rounded-lg relative overflow-hidden group">
                  <CircleDollarSign className="w-20 h-20 absolute -right-3 -top-3 text-slate-800/10" />
                  <div className="relative z-10">
                    <h4 className="text-[#94a3b8] text-xs font-semibold uppercase mb-1">Est. Operating Profit</h4>
                    <div className="text-2xl font-bold font-mono text-[#f8fafc]">$1.24M</div>
                    <p className="text-[10px] text-[#10b981] font-medium mt-1">↑ +8.4% Optimization</p>
                  </div>
                </div>
                
                <div className="bg-[#11111a] border border-[#1e293b] p-4 rounded-lg relative overflow-hidden group">
                  <Package className="w-20 h-20 absolute -right-3 -top-3 text-slate-800/10" />
                  <div className="relative z-10">
                    <h4 className="text-[#94a3b8] text-xs font-semibold uppercase mb-1">Inventory Turnover</h4>
                    <div className="text-2xl font-bold font-mono text-[#f8fafc]">14.2 Days</div>
                    <p className="text-[10px] text-[#10b981] font-medium mt-1">↑ Risk converged to 0%</p>
                  </div>
                </div>
 
                <div className="bg-[#11111a] border border-[#1e293b] p-4 rounded-lg relative overflow-hidden group">
                  <BrainCircuit className="w-20 h-20 absolute -right-3 -top-3 text-slate-800/10" />
                  <div className="relative z-10">
                    <h4 className="text-[#94a3b8] text-xs font-semibold uppercase mb-1">Qubit Error Rate</h4>
                    <div className="text-2xl font-bold font-mono text-[#f8fafc]">-12%</div>
                    <p className="text-[10px] text-[#10b981] font-medium mt-1">↑ Volatility Shielded</p>
                  </div>
                </div>
 
                <div className="bg-[#11111a] border border-[#1e293b] p-4 rounded-lg relative overflow-hidden group">
                  <Clock className="w-20 h-20 absolute -right-3 -top-3 text-slate-800/10" />
                  <div className="relative z-10">
                    <h4 className="text-[#94a3b8] text-xs font-semibold uppercase mb-1">Active Tasks</h4>
                    <div className="text-2xl font-bold font-mono text-[#f8fafc]">{quadrantItems.filter(q => q.status === "Active").length} Units</div>
                    <p className="text-[10px] text-[#94a3b8] font-medium mt-1">Across 4 Quadrants</p>
                  </div>
                </div>
              </div>
 
              {/* SIMULATOR & BOT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* WHAT-IF SIMULATOR */}
                <div className="bg-[#11111a] border border-[#1e293b] rounded-lg p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="section-title mb-4 flex items-center gap-1.5">
                      <Play className="w-4 h-4 text-[#3b82f6]" /> What-If Strategy Simulator
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-[#94a3b8] font-medium">Est. Raw Material Cost Increase</span>
                          <span className="text-[#3b82f6] font-bold text-xs">+{materialCostIncrease}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="30" value={materialCostIncrease} 
                          onChange={(e) => setMaterialCostIncrease(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                        />
                      </div>
 
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-[#94a3b8] font-medium">Exchange Rate/Supply Chain Volatility</span>
                          <span className="text-slate-200 font-bold">{supplyChainVolatility}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {["Low", "Medium", "High"].map((level) => (
                            <button 
                              key={level}
                              onClick={() => setSupplyChainVolatility(level)}
                              className={`py-1.5 rounded text-xs transition-all border ${supplyChainVolatility === level ? "bg-[#3b82f6] border-[#3b82f6] text-white font-bold" : "bg-slate-950 border-[#1e293b] text-[#94a3b8] hover:text-white"}`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
 
                  <div className="mt-5 space-y-3">
                    <button 
                      onClick={handleRunSimulation}
                      disabled={isSimulating}
                      className="w-full py-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#1d4ed8] text-white font-bold rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSimulating ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Collapsing wave...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Run Qubit AI Simulation
                        </>
                      )}
                    </button>
 
                    {simulationResult && (
                      <div className="p-3 bg-emerald-950/10 border border-[#10b981]/30 rounded-lg text-xs leading-relaxed">
                        <div className="font-extrabold text-[#10b981] mb-1 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Simulation Result
                        </div>
                        <div className="text-emerald-300 font-mono whitespace-pre-line text-[11px] leading-relaxed">{simulationResult}</div>
                      </div>
                    )}
                  </div>
                </div>
 
                {/* NLQ EXECUTIVE BOT */}
                <div className="bg-[#11111a] border border-[#1e293b] rounded-lg flex flex-col h-[320px]">
                  <div className="p-3 border-b border-[#1e293b] bg-slate-950/40 flex items-center justify-between">
                    <h3 className="section-title flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#3b82f6]" /> NLQ Executive Chatbot
                    </h3>
                    <span className="text-[9px] font-mono bg-[#3b82f6]/20 border border-[#3b82f6]/40 text-[#3b82f6] px-1.5 py-0.5 rounded uppercase">AI Assistant</span>
                  </div>
                  
                  {/* Chat Message Area */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 scroll-smooth bg-[#0a0a0f]/50">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] p-2.5 rounded-lg text-xs leading-relaxed ${
                          msg.sender === "user" 
                            ? "bg-[#3b82f6]/15 border border-[#3b82f6]/30 text-[#3b82f6] rounded-br-none" 
                            : "bg-[#1e293b] text-[#f8fafc] rounded-bl-none font-mono"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] p-2.5 rounded-lg text-xs bg-[#1e293b] text-slate-400 rounded-bl-none flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                          Qubit calculating...
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
 
                  <form onSubmit={handleSendChat} className="p-3 border-t border-[#1e293b] bg-slate-950/30">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask in natural language... (e.g. Optimize operating costs)"
                        className="w-full bg-[#050508] border border-[#1e293b] rounded-lg pl-3 pr-10 py-2 text-xs text-white outline-none focus:border-[#3b82f6]"
                      />
                      <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-md transition-colors cursor-pointer">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>

              </div>

                          {/* MULTI-SELECT ACTION BAR: Positioned explicitly at the TOP of content area (above 4 quadrants) */}
              {selectedItemIds.size > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#11111a] border border-[#3b82f6] rounded-lg shadow-[0_4px_20px_rgba(59,130,246,0.1)] animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse"></span>
                    <span className="text-xs font-bold text-white font-mono">{selectedItemIds.size} Items Selected</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button 
                      onClick={handleBulkComplete}
                      className="px-3 py-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold rounded text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Complete Selected
                    </button>
                    
                    <div className="flex items-center bg-slate-950 border border-[#1e293b] rounded text-[11px]">
                      <span className="px-2 text-slate-500 uppercase tracking-widest text-[9px] font-bold">Move to:</span>
                      {(["projects", "ideas", "study", "mindset"] as QuadrantType[]).map((quad) => (
                        <button 
                          key={quad}
                          onClick={() => handleBulkMove(quad)}
                          className="px-2 py-1 text-slate-300 hover:text-white capitalize hover:bg-slate-900 border-l border-[#1e293b] cursor-pointer"
                        >
                          {quad}
                        </button>
                      ))}
                    </div>
 
                    <button 
                      onClick={handleBulkDelete}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                    </button>
                  </div>
                </div>
              )}
 
              {/* THE 4 COSMO SEED QUADRANTS: MAIN GRID (2x2 on Desktop, 1-Column stack on Mobile) */}
              <div id="cosmo-seed-section" className="grid grid-cols-1 md:grid-cols-2 gap-6 scroll-mt-20">
                
                {/* QUADRANT 1: PROJECTS */}
                <div className="bg-[#11111a] border border-[#1e293b] rounded-lg p-4 flex flex-col">
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></span>
                      <h3 className="section-title text-sm flex items-center gap-1.5 font-serif italic text-xs uppercase tracking-wider text-[#0ea5e9] capitalize">Projects</h3>
                    </div>
                    <button 
                      onClick={() => handleOpenCreateModal("projects")}
                      className="p-1 bg-[#050508] hover:bg-[#1e293b] text-[#0ea5e9] rounded border border-[#1e293b] cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
 
                  <div className="space-y-2.5 min-h-[140px] max-h-[250px] overflow-y-auto pr-1">
                    {groupedQuadrants.projects.length === 0 ? (
                      <p className="text-xs text-[#94a3b8] italic mt-4 text-center">No active projects logged.</p>
                    ) : (
                      groupedQuadrants.projects.map((item) => (
                        <div 
                          key={item.id}
                          onClick={(e) => handleOpenEditModal(item, e)}
                          className={`p-2.5 bg-[#0a0a0f] border rounded-lg hover:border-[#0ea5e9]/50 transition-all cursor-pointer ${selectedItemIds.has(item.id) ? "border-[#0ea5e9]" : "border-[#1e293b]"}`}
                        >
                          <div className="flex items-start gap-2">
                            <input 
                              type="checkbox"
                              checked={selectedItemIds.has(item.id)}
                              onChange={() => {}} // Controlled by onClick to avoid React console warning
                              onClick={(e) => toggleSelection(item.id, e)}
                              className="mt-1 accent-[#0ea5e9]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                                <span className={`text-[9px] font-mono px-1 border rounded uppercase shrink-0 ${item.status === "Active" ? "text-emerald-400 border-emerald-500/20" : item.status === "Completed" ? "text-slate-400 border-[#1e293b]" : "text-amber-400 border-amber-500/20"}`}>{item.status}</span>
                              </div>
                              <p className="text-[11px] text-[#94a3b8] line-clamp-2 mt-0.5 leading-relaxed">{item.description}</p>
                              
                              {/* Tags - styled as simple text without background blocks */}
                              {item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-2">
                                  {item.tags.map((tag, idx) => (
                                    <span key={idx} className="text-[10px] text-[#0ea5e9] font-mono">#{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
 
                {/* QUADRANT 2: IDEAS */}
                <div className="bg-[#11111a] border border-[#1e293b] rounded-lg p-4 flex flex-col">
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></span>
                      <h3 className="section-title text-sm flex items-center gap-1.5 font-serif italic text-xs uppercase tracking-wider text-[#0ea5e9] capitalize">Ideas</h3>
                    </div>
                    <button 
                      onClick={() => handleOpenCreateModal("ideas")}
                      className="p-1 bg-[#050508] hover:bg-[#1e293b] text-[#0ea5e9] rounded border border-[#1e293b] cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
 
                  <div className="space-y-2.5 min-h-[140px] max-h-[250px] overflow-y-auto pr-1">
                    {groupedQuadrants.ideas.length === 0 ? (
                      <p className="text-xs text-[#94a3b8] italic mt-4 text-center">No ideas currently queued.</p>
                    ) : (
                      groupedQuadrants.ideas.map((item) => (
                        <div 
                          key={item.id}
                          onClick={(e) => handleOpenEditModal(item, e)}
                          className={`p-2.5 bg-[#0a0a0f] border rounded-lg hover:border-[#0ea5e9]/50 transition-all cursor-pointer ${selectedItemIds.has(item.id) ? "border-[#0ea5e9]" : "border-[#1e293b]"}`}
                        >
                          <div className="flex items-start gap-2">
                            <input 
                              type="checkbox"
                              checked={selectedItemIds.has(item.id)}
                              onChange={() => {}}
                              onClick={(e) => toggleSelection(item.id, e)}
                              className="mt-1 accent-[#0ea5e9]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                                <span className={`text-[9px] font-mono px-1 border rounded uppercase shrink-0 ${item.status === "Active" ? "text-emerald-400 border-emerald-500/20" : item.status === "Completed" ? "text-slate-400 border-[#1e293b]" : "text-amber-400 border-amber-500/20"}`}>{item.status}</span>
                              </div>
                              <p className="text-[11px] text-[#94a3b8] line-clamp-2 mt-0.5 leading-relaxed">{item.description}</p>
                              
                              {item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-2">
                                  {item.tags.map((tag, idx) => (
                                    <span key={idx} className="text-[10px] text-[#0ea5e9] font-mono">#{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
 
                {/* QUADRANT 3: STUDY */}
                <div className="bg-[#11111a] border border-[#1e293b] rounded-lg p-4 flex flex-col">
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></span>
                      <h3 className="section-title text-sm flex items-center gap-1.5 font-serif italic text-xs uppercase tracking-wider text-[#0ea5e9] capitalize">Study</h3>
                    </div>
                    <button 
                      onClick={() => handleOpenCreateModal("study")}
                      className="p-1 bg-[#050508] hover:bg-[#1e293b] text-[#0ea5e9] rounded border border-[#1e293b] cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
 
                  <div className="space-y-2.5 min-h-[140px] max-h-[250px] overflow-y-auto pr-1">
                    {groupedQuadrants.study.length === 0 ? (
                      <p className="text-xs text-[#94a3b8] italic mt-4 text-center">No research modules defined.</p>
                    ) : (
                      groupedQuadrants.study.map((item) => (
                        <div 
                          key={item.id}
                          onClick={(e) => handleOpenEditModal(item, e)}
                          className={`p-2.5 bg-[#0a0a0f] border rounded-lg hover:border-[#0ea5e9]/50 transition-all cursor-pointer ${selectedItemIds.has(item.id) ? "border-[#0ea5e9]" : "border-[#1e293b]"}`}
                        >
                          <div className="flex items-start gap-2">
                            <input 
                              type="checkbox"
                              checked={selectedItemIds.has(item.id)}
                              onChange={() => {}}
                              onClick={(e) => toggleSelection(item.id, e)}
                              className="mt-1 accent-[#0ea5e9]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                                <span className={`text-[9px] font-mono px-1 border rounded uppercase shrink-0 ${item.status === "Active" ? "text-emerald-400 border-emerald-500/20" : item.status === "Completed" ? "text-slate-400 border-[#1e293b]" : "text-amber-400 border-amber-500/20"}`}>{item.status}</span>
                              </div>
                              <p className="text-[11px] text-[#94a3b8] line-clamp-2 mt-0.5 leading-relaxed">{item.description}</p>
                              
                              {item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-2">
                                  {item.tags.map((tag, idx) => (
                                    <span key={idx} className="text-[10px] text-[#0ea5e9] font-mono">#{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
 
                {/* QUADRANT 4: MINDSET */}
                <div className="bg-[#11111a] border border-[#1e293b] rounded-lg p-4 flex flex-col">
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></span>
                      <h3 className="section-title text-sm flex items-center gap-1.5 font-serif italic text-xs uppercase tracking-wider text-[#0ea5e9] capitalize">Mindset</h3>
                    </div>
                    <button 
                      onClick={() => handleOpenCreateModal("mindset")}
                      className="p-1 bg-[#050508] hover:bg-[#1e293b] text-[#0ea5e9] rounded border border-[#1e293b] cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
 
                  <div className="space-y-2.5 min-h-[140px] max-h-[250px] overflow-y-auto pr-1">
                    {groupedQuadrants.mindset.length === 0 ? (
                      <p className="text-xs text-[#94a3b8] italic mt-4 text-center">No high-IQ mental models saved.</p>
                    ) : (
                      groupedQuadrants.mindset.map((item) => (
                        <div 
                          key={item.id}
                          onClick={(e) => handleOpenEditModal(item, e)}
                          className={`p-2.5 bg-[#0a0a0f] border rounded-lg hover:border-[#0ea5e9]/50 transition-all cursor-pointer ${selectedItemIds.has(item.id) ? "border-[#0ea5e9]" : "border-[#1e293b]"}`}
                        >
                          <div className="flex items-start gap-2">
                            <input 
                              type="checkbox"
                              checked={selectedItemIds.has(item.id)}
                              onChange={() => {}}
                              onClick={(e) => toggleSelection(item.id, e)}
                              className="mt-1 accent-[#0ea5e9]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                                <span className={`text-[9px] font-mono px-1 border rounded uppercase shrink-0 ${item.status === "Active" ? "text-emerald-400 border-emerald-500/20" : item.status === "Completed" ? "text-slate-400 border-[#1e293b]" : "text-amber-400 border-amber-500/20"}`}>{item.status}</span>
                              </div>
                              <p className="text-[11px] text-[#94a3b8] line-clamp-2 mt-0.5 leading-relaxed">{item.description}</p>
                              
                              {item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-2">
                                  {item.tags.map((tag, idx) => (
                                    <span key={idx} className="text-[10px] text-[#0ea5e9] font-mono">#{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
 
              </div>
 
              {/* MY PLATFORMS SECTION: STYLED WITH LIGHT ORANGE ACCENTS */}
              <div id="my-platforms-section" className="bg-[#11111a] border border-[#1e293b] rounded-lg p-5 scroll-mt-20">
                <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>
                    <h3 className="section-title text-sm flex items-center gap-1.5 font-serif italic text-xs uppercase tracking-wider text-[#f97316] uppercase tracking-wide">My Platforms</h3>
                    <span className="text-[10px] px-1.5 py-0.5 border border-orange-500/40 text-[#f97316] rounded font-mono uppercase">System Integrations</span>
                  </div>
                  <button 
                    onClick={() => handleOpenPlatformModal(null)}
                    className="px-3 py-1 bg-[#050508] hover:bg-[#1e293b] text-[#f97316] text-xs font-bold rounded border border-[#1e293b] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Platform
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {platformItems.map((plat) => (
                    <div 
                      key={plat.id}
                      className="p-3.5 bg-[#0a0a0f] border border-[#1e293b] hover:border-[#f97316]/50 rounded-lg flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-200 truncate">{plat.name}</h4>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${plat.status === "active" ? "text-emerald-400 border border-emerald-500/20" : "text-amber-400 border border-amber-500/20"}`}>{plat.status}</span>
                        </div>
                        <span className="text-[9px] text-[#f97316] font-mono uppercase tracking-widest mt-1 block">{plat.category}</span>
                        <p className="text-[11px] text-[#94a3b8] mt-1.5 leading-relaxed">{plat.notes || "No extra platform details."}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#1e293b] pt-2.5 mt-3">
                        {plat.url ? (
                          <a 
                            href={plat.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] text-[#f97316] hover:underline flex items-center gap-1 font-mono"
                          >
                            <ExternalLink className="w-3 h-3" /> Connect Node
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-600 font-mono">No endpoint URL</span>
                        )}
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => handleOpenPlatformModal(plat)}
                            className="p-1 bg-[#050508] hover:bg-[#1e293b] text-slate-400 hover:text-white rounded border border-[#1e293b] cursor-pointer transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={(e) => handleDeletePlatform(plat.id, e)}
                            className="p-1 bg-[#050508] hover:bg-rose-950 text-[#94a3b8] hover:text-rose-400 rounded border border-[#1e293b] cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-4 border-t border-slate-900 bg-slate-950 text-center text-[10px] text-slate-500 font-mono">
        <p>© 2026 SISTAR Company Universe • Qubit Algorithm Prescriptive Core v1.2</p>
      </footer>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg border text-xs font-bold shadow-xl animate-bounce bg-slate-900 text-white border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${toastMessage.type === "success" ? "bg-emerald-400" : toastMessage.type === "error" ? "bg-rose-500" : "bg-sky-500"}`}></span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* QUADRANT EDIT / ADD MODAL (Styled as elegant white/high-contrast light theme) */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl overflow-hidden shadow-2xl animate-scale-up text-slate-900">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                {modalMode === "create" ? `Add to ${editingItem.quadrant}` : "Modify Element"}
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Title</label>
                <input 
                  type="text"
                  value={editingItem.title || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="Enter strategic title..."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 outline-none focus:border-sky-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Description</label>
                <textarea 
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Enter operational details..."
                  className="w-full h-20 bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 outline-none focus:border-sky-500 font-medium resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Tags (Comma Separated)</label>
                <input 
                  type="text"
                  value={Array.isArray(editingItem.tags) ? editingItem.tags.join(", ") : editingItem.tags || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value.split(",").map(t => t.trim()) })}
                  placeholder="e.g. Automation, Sharon-TTS, Core"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 outline-none focus:border-sky-500 font-medium"
                />
                <p className="text-[10px] text-slate-500 mt-1">Tags will render clean without heavy color boxes.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Status</label>
                  <select 
                    value={editingItem.status || "Active"}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 outline-none"
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Completed</option>
                    <option>Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Priority</label>
                  <select 
                    value={editingItem.priority || "high"}
                    onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">URL Reference Links</label>
                <input 
                  type="text"
                  value={editingItem.links || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, links: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 outline-none focus:border-sky-500 font-medium"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              {modalMode === "edit" && (
                <button 
                  onClick={(e) => { handleDeleteItem(editingItem.id!, e); setIsEditModalOpen(false); }}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition-all cursor-pointer"
                >
                  Delete Item
                </button>
              )}
              <button 
                onClick={handleSaveQuadrantItem}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM EDIT / ADD MODAL */}
      {isPlatformModalOpen && editingPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl overflow-hidden shadow-2xl animate-scale-up text-slate-900">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Platform Configuration
              </h3>
              <button 
                onClick={() => setIsPlatformModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Platform Name</label>
                <input 
                  type="text"
                  value={editingPlatform.name || ""}
                  onChange={(e) => setEditingPlatform({ ...editingPlatform, name: e.target.value })}
                  placeholder="e.g. n8n Cloud Server"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Endpoint URL</label>
                <input 
                  type="text"
                  value={editingPlatform.url || ""}
                  onChange={(e) => setEditingPlatform({ ...editingPlatform, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Status</label>
                <select 
                  value={editingPlatform.status || "active"}
                  onChange={(e) => setEditingPlatform({ ...editingPlatform, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 outline-none font-medium"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="disconnected">Disconnected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Category</label>
                <select 
                  value={editingPlatform.category || "Workflow"}
                  onChange={(e) => setEditingPlatform({ ...editingPlatform, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 outline-none font-medium"
                >
                  <option>Workflow</option>
                  <option>Database</option>
                  <option>AI Engine</option>
                  <option>Hosting</option>
                  <option>Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Platform Notes</label>
                <textarea 
                  value={editingPlatform.notes || ""}
                  onChange={(e) => setEditingPlatform({ ...editingPlatform, notes: e.target.value })}
                  placeholder="Enter credential storage details, security policies, etc..."
                  className="w-full h-16 bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 outline-none focus:border-orange-500 font-medium resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button 
                onClick={() => setIsPlatformModalOpen(false)}
                className="px-4 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-600 rounded text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePlatform}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Save Platform
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
