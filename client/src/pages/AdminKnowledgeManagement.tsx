// client\src\pages\AdminKnowledgeManagement.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import {
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Calendar,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Upload,
  Download,
  Save,
  X,
  Check,
  AlertCircle,
  Loader2,
  Database,
  Eye,
  EyeOff,
  RefreshCw,
  Tag,
  Clock,
  UserCheck,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Building,
} from "lucide-react";

// Knowledge Base Types

type KnowledgeCategory =
  | "curriculum"
  | "faculty"
  | "programs"
  | "procedures"
  | "faculty-schedules"
  | "room-schedules"
  | "institutional";

interface KnowledgeCategoryConfig {
  key: KnowledgeCategory;
  label: string;
  icon: React.ReactNode;
  description: string;
  apiEndpoint: string;
}

const knowledgeCategories: KnowledgeCategoryConfig[] = [
  {
    key: "curriculum",
    label: "Curriculum Data",
    icon: <BookOpen className="w-5 h-5" />,
    description:
      "Course lists, subject descriptions, prerequisites, and program flowcharts",
    apiEndpoint: "/knowledge/curriculum",
  },
  {
    key: "faculty",
    label: "Faculty Information",
    icon: <Users className="w-5 h-5" />,
    description: "Names, departments, specializations, and contact details",
    apiEndpoint: "/knowledge/faculty",
  },
  {
    key: "programs",
    label: "Academic Programs",
    icon: <GraduationCap className="w-5 h-5" />,
    description: "Program descriptions, requirements, and career opportunities",
    apiEndpoint: "/knowledge/programs",
  },
  {
    key: "procedures",
    label: "Processes & Procedures",
    icon: <FileText className="w-5 h-5" />,
    description:
      "Enrollment steps, thesis guidelines, clearance procedures, etc.",
    apiEndpoint: "/knowledge/procedures",
  },
  {
    key: "faculty-schedules",
    label: "Faculty Schedules",
    icon: <Calendar className="w-5 h-5" />,
    description: "Teaching schedules, availability, and assigned subjects",
    apiEndpoint: "/knowledge/faculty-schedules",
  },
  {
    key: "room-schedules",
    label: "Room Schedules",
    icon: <MapPin className="w-5 h-5" />,
    description: "Classroom assignments, time slots, and room availability",
    apiEndpoint: "/knowledge/room-schedules",
  },
  {
    key: "institutional",
    label: "Institutional Knowledge",
    icon: <Database className="w-5 h-5" />,
    description: "FAQs, policies, announcements, and general information",
    apiEndpoint: "/knowledge/institutional",
  },
];

// ── Helper functions (no component state needed) ──────────────────────────────

function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  return [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (Array.isArray(value)) return `"${value.join(", ")}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");
}

function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminKnowledgeManagement() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] =
    useState<KnowledgeCategory>("curriculum");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>(
    {},
  );
  const [showFilters, setShowFilters] = useState(false);
  const [bulkSelection, setBulkSelection] = useState<Set<string>>(new Set());

  // Form data based on active category
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const category = knowledgeCategories.find(
        (cat) => cat.key === activeCategory,
      );
      const response = await api.get(category!.apiEndpoint);
      setData(response.data || []);
    } catch (error) {
      console.error(`Failed to fetch ${activeCategory} data:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ── AI metadata helpers ────────────────────────────────────────────────────

  const generateTags = (
    itemData: any,
    category: KnowledgeCategory,
  ): string[] => {
    const tags: string[] = [category];

    switch (category) {
      case "curriculum":
        tags.push(
          itemData.program?.toLowerCase(),
          itemData.category?.toLowerCase(),
          itemData.semester?.toLowerCase(),
        );
        break;
      case "faculty":
        tags.push(
          itemData.department?.toLowerCase(),
          itemData.position?.toLowerCase(),
        );
        if (itemData.specialization) {
          tags.push(
            ...itemData.specialization.map((s: string) => s.toLowerCase()),
          );
        }
        break;
      case "programs":
        tags.push(
          itemData.degreeType?.toLowerCase(),
          itemData.department?.toLowerCase(),
        );
        break;
      case "procedures":
        tags.push(itemData.category?.toLowerCase(), "process", "procedure");
        break;
      case "faculty-schedules":
        tags.push(
          itemData.semester?.toLowerCase(),
          itemData.day?.toLowerCase(),
          "schedule",
        );
        break;
      case "room-schedules":
        tags.push(itemData.building?.toLowerCase(), "room", "schedule");
        break;
      case "institutional":
        tags.push(
          itemData.category?.toLowerCase(),
          itemData.priority?.toLowerCase(),
        );
        if (itemData.targetAudience) {
          tags.push(
            ...itemData.targetAudience.map((a: string) => a.toLowerCase()),
          );
        }
        break;
    }

    return tags.filter(Boolean).map((tag: string) => tag.replace(/\s+/g, "-"));
  };

  const generateSearchKeywords = (
    itemData: any,
    category: KnowledgeCategory,
  ): string[] => {
    const keywords: string[] = [];

    const searchableFields: Record<KnowledgeCategory, string[]> = {
      curriculum: ["courseName", "description", "courseCode"],
      faculty: ["firstName", "lastName", "specialization", "department"],
      programs: ["programName", "description"],
      procedures: ["title", "description"],
      "faculty-schedules": ["courseName", "facultyName", "room"],
      "room-schedules": ["roomName", "building"],
      institutional: ["title", "content", "tags"],
    };

    const fields = searchableFields[category] || [];
    fields.forEach((field: string) => {
      if (itemData[field]) {
        const value = Array.isArray(itemData[field])
          ? itemData[field].join(" ")
          : String(itemData[field]);
        const words = value
          .toLowerCase()
          .split(/\s+/)
          .filter((word: string) => word.length > 2);
        keywords.push(...words);
      }
    });

    return [...new Set(keywords)];
  };

  const prepareDataForAPI = (
    itemData: any,
    category: KnowledgeCategory,
  ): any => {
    const prepared = { ...itemData };

    const arrayFields: Record<KnowledgeCategory, string[]> = {
      curriculum: ["prerequisites"],
      faculty: ["specialization"],
      programs: ["requirements", "careerOpportunities"],
      procedures: ["requirements"],
      "faculty-schedules": [],
      "room-schedules": ["facilities", "availability"],
      institutional: ["tags", "targetAudience"],
    };

    const fieldsToConvert = arrayFields[category] || [];
    fieldsToConvert.forEach((field: string) => {
      if (prepared[field] && typeof prepared[field] === "string") {
        prepared[field] = prepared[field]
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);
      }
    });

    prepared.aiMetadata = {
      category,
      lastUpdated: new Date().toISOString(),
      version: 1,
      tags: generateTags(prepared, category),
      searchKeywords: generateSearchKeywords(prepared, category),
    };

    return prepared;
  };

  // ── Notification ───────────────────────────────────────────────────────────

  const showNotification = (
    type: "success" | "error" | "warning",
    message: string,
  ) => {
    // Replace with your actual toast/notification system
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validateFormData = (): boolean => {
    const errors: Record<string, string> = {};
    const fields = getFormFields();

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = `${field.label} is required`;
      }

      switch (field.name) {
        case "email":
          if (
            formData[field.name] &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.name])
          ) {
            errors[field.name] = "Please enter a valid email address";
          }
          break;
        case "contactNumber":
          if (
            formData[field.name] &&
            !/^\+?[\d\s\-()]{10,}$/.test(formData[field.name])
          ) {
            errors[field.name] = "Please enter a valid contact number";
          }
          break;
        case "credits":
          if (
            formData[field.name] &&
            (formData[field.name] < 1 || formData[field.name] > 10)
          ) {
            errors[field.name] = "Credits must be between 1 and 10";
          }
          break;
        case "capacity":
          if (formData[field.name] && formData[field.name] < 1) {
            errors[field.name] = "Capacity must be at least 1";
          }
          break;
        case "timeStart":
        case "timeEnd":
          if (
            formData.timeStart &&
            formData.timeEnd &&
            formData.timeStart >= formData.timeEnd
          ) {
            errors.timeEnd = "End time must be after start time";
          }
          break;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFormData()) return;

    try {
      const category = knowledgeCategories.find(
        (cat) => cat.key === activeCategory,
      );
      const preparedData = prepareDataForAPI(formData, activeCategory);

      if (editingItem) {
        await api.put(
          `${category!.apiEndpoint}/${editingItem.id}`,
          preparedData,
        );
      } else {
        await api.post(category!.apiEndpoint, preparedData);
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData({});
      setValidationErrors({});
      fetchData();
      showNotification(
        "success",
        `Data ${editingItem ? "updated" : "created"} successfully!`,
      );
    } catch (error) {
      console.error(`Failed to save ${activeCategory} data:`, error);
      showNotification("error", "Failed to save data. Please try again.");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const category = knowledgeCategories.find(
        (cat) => cat.key === activeCategory,
      );
      await api.delete(`${category!.apiEndpoint}/${id}`);
      fetchData();
    } catch (error) {
      console.error(`Failed to delete ${activeCategory} data:`, error);
      alert("Failed to delete item.");
    }
  };

  const handleToggleActive = async (item: any) => {
    try {
      const category = knowledgeCategories.find(
        (cat) => cat.key === activeCategory,
      );
      await api.put(`${category!.apiEndpoint}/${item.id}`, {
        ...item,
        isActive: !item.isActive,
      });
      fetchData();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleSyncWithAI = async () => {
    setSyncStatus("syncing");
    try {
      await api.post("/knowledge/sync");
      setSyncStatus("success");
      setLastSyncTime(new Date().toLocaleTimeString());
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to sync with AI:", error);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("category", activeCategory);

    try {
      const category = knowledgeCategories.find(
        (cat) => cat.key === activeCategory,
      );
      await api.post(`${category!.apiEndpoint}/bulk-upload`, uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadModal(false);
      fetchData();
      alert("Data uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload file:", error);
      alert("Failed to upload file. Please try again.");
    }
  };

  // ── Bulk operations ────────────────────────────────────────────────────────

  const handleBulkDelete = async () => {
    if (bulkSelection.size === 0) return;
    if (
      !confirm(`Are you sure you want to delete ${bulkSelection.size} items?`)
    )
      return;

    try {
      const category = knowledgeCategories.find(
        (cat) => cat.key === activeCategory,
      );
      const promises = Array.from(bulkSelection).map((id) =>
        api.delete(`${category!.apiEndpoint}/${id}`),
      );
      await Promise.all(promises);
      setBulkSelection(new Set());
      fetchData();
      showNotification(
        "success",
        `Successfully deleted ${bulkSelection.size} items`,
      );
    } catch (error) {
      console.error("Bulk delete failed:", error);
      showNotification("error", "Failed to delete some items");
    }
  };

  const handleBulkToggleActive = async (activate: boolean) => {
    if (bulkSelection.size === 0) return;

    try {
      const category = knowledgeCategories.find(
        (cat) => cat.key === activeCategory,
      );
      const items = data.filter((item: any) => bulkSelection.has(item.id));
      const promises = items.map((item: any) =>
        api.put(`${category!.apiEndpoint}/${item.id}`, {
          ...item,
          isActive: activate,
        }),
      );
      await Promise.all(promises);
      setBulkSelection(new Set());
      fetchData();
      showNotification(
        "success",
        `Successfully ${activate ? "activated" : "deactivated"} ${bulkSelection.size} items`,
      );
    } catch (error) {
      console.error("Bulk toggle failed:", error);
      showNotification("error", "Failed to update some items");
    }
  };

  // ── Form fields config ─────────────────────────────────────────────────────

  const getFormFields = () => {
    switch (activeCategory) {
      case "curriculum":
        return [
          {
            name: "courseCode",
            label: "Course Code",
            type: "text",
            required: true,
          },
          {
            name: "courseName",
            label: "Course Name",
            type: "text",
            required: true,
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            required: true,
          },
          {
            name: "prerequisites",
            label: "Prerequisites (comma-separated)",
            type: "text",
          },
          { name: "credits", label: "Credits", type: "number", required: true },
          { name: "semester", label: "Semester", type: "text", required: true },
          { name: "program", label: "Program", type: "text", required: true },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: ["Core", "Elective", "Major", "Minor"],
            required: true,
          },
          { name: "isActive", label: "Active", type: "checkbox" },
        ];
      case "faculty":
        return [
          {
            name: "employeeId",
            label: "Employee ID",
            type: "text",
            required: true,
          },
          {
            name: "firstName",
            label: "First Name",
            type: "text",
            required: true,
          },
          {
            name: "lastName",
            label: "Last Name",
            type: "text",
            required: true,
          },
          { name: "email", label: "Email", type: "email", required: true },
          {
            name: "department",
            label: "Department",
            type: "text",
            required: true,
          },
          {
            name: "specialization",
            label: "Specializations (comma-separated)",
            type: "text",
          },
          { name: "position", label: "Position", type: "text", required: true },
          { name: "office", label: "Office", type: "text" },
          { name: "contactNumber", label: "Contact Number", type: "tel" },
          { name: "isActive", label: "Active", type: "checkbox" },
        ];
      case "programs":
        return [
          {
            name: "programCode",
            label: "Program Code",
            type: "text",
            required: true,
          },
          {
            name: "programName",
            label: "Program Name",
            type: "text",
            required: true,
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            required: true,
          },
          {
            name: "degreeType",
            label: "Degree Type",
            type: "select",
            options: ["Bachelor", "Master", "Doctorate", "Certificate"],
            required: true,
          },
          { name: "duration", label: "Duration", type: "text", required: true },
          {
            name: "requirements",
            label: "Requirements (comma-separated)",
            type: "text",
          },
          {
            name: "careerOpportunities",
            label: "Career Opportunities (comma-separated)",
            type: "text",
          },
          {
            name: "department",
            label: "Department",
            type: "text",
            required: true,
          },
          { name: "isActive", label: "Active", type: "checkbox" },
        ];
      case "procedures":
        return [
          { name: "title", label: "Title", type: "text", required: true },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            required: true,
          },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: [
              "Enrollment",
              "Thesis",
              "Clearance",
              "Admission",
              "Graduation",
              "Others",
            ],
            required: true,
          },
          {
            name: "requirements",
            label: "Requirements (comma-separated)",
            type: "text",
          },
          {
            name: "contactPerson",
            label: "Contact Person",
            type: "text",
            required: true,
          },
          { name: "office", label: "Office", type: "text", required: true },
          { name: "isActive", label: "Active", type: "checkbox" },
        ];
      case "faculty-schedules":
        return [
          {
            name: "facultyId",
            label: "Faculty ID",
            type: "text",
            required: true,
          },
          {
            name: "facultyName",
            label: "Faculty Name",
            type: "text",
            required: true,
          },
          {
            name: "courseCode",
            label: "Course Code",
            type: "text",
            required: true,
          },
          {
            name: "courseName",
            label: "Course Name",
            type: "text",
            required: true,
          },
          { name: "section", label: "Section", type: "text", required: true },
          { name: "day", label: "Day", type: "text", required: true },
          {
            name: "timeStart",
            label: "Start Time",
            type: "time",
            required: true,
          },
          { name: "timeEnd", label: "End Time", type: "time", required: true },
          { name: "room", label: "Room", type: "text", required: true },
          { name: "semester", label: "Semester", type: "text", required: true },
          {
            name: "academicYear",
            label: "Academic Year",
            type: "text",
            required: true,
          },
          { name: "isActive", label: "Active", type: "checkbox" },
        ];
      case "room-schedules":
        return [
          {
            name: "roomCode",
            label: "Room Code",
            type: "text",
            required: true,
          },
          {
            name: "roomName",
            label: "Room Name",
            type: "text",
            required: true,
          },
          { name: "building", label: "Building", type: "text", required: true },
          {
            name: "capacity",
            label: "Capacity",
            type: "number",
            required: true,
          },
          {
            name: "facilities",
            label: "Facilities (comma-separated)",
            type: "text",
          },
          {
            name: "availability",
            label: "Availability (comma-separated)",
            type: "text",
          },
          { name: "isActive", label: "Active", type: "checkbox" },
        ];
      case "institutional":
        return [
          { name: "title", label: "Title", type: "text", required: true },
          {
            name: "content",
            label: "Content",
            type: "textarea",
            required: true,
          },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: [
              "Policy",
              "Announcement",
              "General Info",
              "Event",
              "News",
            ],
            required: true,
          },
          { name: "tags", label: "Tags (comma-separated)", type: "text" },
          {
            name: "effectiveDate",
            label: "Effective Date",
            type: "date",
            required: true,
          },
          { name: "expiryDate", label: "Expiry Date", type: "date" },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            options: ["Low", "Medium", "High", "Urgent"],
            required: true,
          },
          {
            name: "targetAudience",
            label: "Target Audience (comma-separated)",
            type: "text",
          },
          { name: "isActive", label: "Active", type: "checkbox" },
        ];
      default:
        return [];
    }
  };

  const getCategoryOptions = (category: KnowledgeCategory): string[] => {
    switch (category) {
      case "curriculum":
        return ["Core", "Elective", "Major", "Minor"];
      case "faculty":
        return [
          "Computer Science",
          "Information Technology",
          "Software Engineering",
          "Data Science",
        ];
      case "programs":
        return ["Bachelor", "Master", "Doctorate", "Certificate"];
      case "procedures":
        return [
          "Enrollment",
          "Thesis",
          "Clearance",
          "Admission",
          "Graduation",
          "Others",
        ];
      case "faculty-schedules":
        return [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
      case "room-schedules":
        return [
          "Main Building",
          "Engineering Building",
          "Science Building",
          "Library",
        ];
      case "institutional":
        return ["Policy", "Announcement", "General Info", "Event", "News"];
      default:
        return [];
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(query),
    );
  });

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-6">
            Restricted Access
          </h1>
          <p className="text-xl sm:text-2xl text-foreground font-bold">
            Admin Access Required
          </p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl">
              <Database className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Knowledge Management
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Manage AI knowledge base data for accurate responses
          </p>
          <div className="flex justify-center items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <RefreshCw
                className={`w-4 h-4 ${syncStatus === "syncing" ? "animate-spin" : ""}`}
              />
              <span>Last sync: {lastSyncTime || "Never"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <span>
                AI Optimized: {data.filter((item) => item.aiMetadata).length}{" "}
                records
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Auto-sync: Every 5 minutes
            </div>
          </div>
        </div>

        {/* Sync Status and Stats */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSyncWithAI}
              disabled={syncStatus === "syncing"}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                syncStatus === "syncing"
                  ? "bg-yellow-500/20 text-yellow-400 cursor-not-allowed"
                  : syncStatus === "success"
                    ? "bg-green-500/20 text-green-400"
                    : syncStatus === "error"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
              }`}
            >
              {syncStatus === "syncing" && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              {syncStatus === "success" && <Check className="w-5 h-5" />}
              {syncStatus === "error" && <AlertCircle className="w-5 h-5" />}
              {syncStatus === "idle" && <RefreshCw className="w-5 h-5" />}
              {syncStatus === "syncing"
                ? "Syncing..."
                : syncStatus === "success"
                  ? "Synced!"
                  : syncStatus === "error"
                    ? "Sync Failed"
                    : "Sync with AI"}
            </button>

            {lastSyncTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Last sync: {lastSyncTime}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-sm text-muted-foreground">
                Total Records:{" "}
              </span>
              <span className="font-bold text-foreground">{data.length}</span>
            </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-sm text-muted-foreground">Filtered: </span>
              <span className="font-bold text-foreground">
                {filteredData.length}
              </span>
            </div>
            <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
              <span className="text-sm text-green-400">Active: </span>
              <span className="font-bold text-green-400">
                {data.filter((item) => item.isActive).length}
              </span>
            </div>
            <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <span className="text-sm text-purple-400">AI Optimized: </span>
              <span className="font-bold text-purple-400">
                {data.filter((item) => item.aiMetadata).length}
              </span>
            </div>
          </div>
        </div>

        {/* Knowledge Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {knowledgeCategories.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                activeCategory === category.key
                  ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    activeCategory === category.key
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {category.icon}
                </div>
                <h3 className="font-bold text-foreground">{category.label}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </button>
          ))}
        </div>

        {/* Active Category Section */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {
                  knowledgeCategories.find((cat) => cat.key === activeCategory)
                    ?.label
                }
              </h2>
              <p className="text-muted-foreground">
                {
                  knowledgeCategories.find((cat) => cat.key === activeCategory)
                    ?.description
                }
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
              <button
                onClick={() => setUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 font-bold rounded-xl hover:bg-purple-500/30 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
              </button>
              <button
                onClick={() => {
                  const csvContent = convertToCSV(filteredData);
                  downloadCSV(csvContent, `${activeCategory}-data.csv`);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-bold rounded-xl hover:bg-green-500/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${knowledgeCategories.find((cat) => cat.key === activeCategory)?.label.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 border font-bold rounded-xl transition-colors ${
                    showFilters
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                      : "bg-white/5 border-white/10 text-foreground hover:bg-white/10"
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50"
                >
                  <Plus className="w-5 h-5" />
                  Add New
                </button>
                <button
                  onClick={() => setUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-purple-500/20 border border-purple-500/50 text-purple-400 font-bold rounded-xl hover:bg-purple-500/30 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Bulk Upload
                </button>
                <button
                  onClick={() => {
                    const csvContent = convertToCSV(filteredData);
                    downloadCSV(
                      csvContent,
                      `${activeCategory}-data-${new Date().toISOString().split("T")[0]}.csv`,
                    );
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/50 text-green-400 font-bold rounded-xl hover:bg-green-500/30 transition-colors"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Export
                </button>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {bulkSelection.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bulkSelection.size === filteredData.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBulkSelection(
                          new Set(filteredData.map((item) => item.id)),
                        );
                      } else {
                        setBulkSelection(new Set());
                      }
                    }}
                    className="w-5 h-5 rounded border-yellow-500/30 bg-yellow-500/10 text-yellow-500 focus:ring-2 focus:ring-yellow-500/50"
                  />
                  <span className="text-yellow-400 font-medium">
                    {bulkSelection.size} items selected
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleBulkToggleActive(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkToggleActive(false)}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-sm"
                  >
                    <EyeOff className="w-4 h-4" />
                    Deactivate
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Advanced Filters */}
            {showFilters && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <select
                      value={advancedFilters.isActive ?? ""}
                      onChange={(e) =>
                        setAdvancedFilters({
                          ...advancedFilters,
                          isActive: e.target.value
                            ? e.target.value === "true"
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                      <option value="">All</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Category
                    </label>
                    <select
                      value={advancedFilters.category ?? ""}
                      onChange={(e) =>
                        setAdvancedFilters({
                          ...advancedFilters,
                          category: e.target.value || undefined,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                      <option value="">All</option>
                      {getCategoryOptions(activeCategory).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date From
                    </label>
                    <input
                      type="date"
                      value={advancedFilters.startDate ?? ""}
                      onChange={(e) =>
                        setAdvancedFilters({
                          ...advancedFilters,
                          startDate: e.target.value || undefined,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date To
                    </label>
                    <input
                      type="date"
                      value={advancedFilters.endDate ?? ""}
                      onChange={(e) =>
                        setAdvancedFilters({
                          ...advancedFilters,
                          endDate: e.target.value || undefined,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4 gap-3">
                  <button
                    onClick={() => setAdvancedFilters({})}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-foreground rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Data Table/List */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">No data found</p>
              <p className="text-gray-400 mt-2">
                Add new data or adjust your search
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((item) => (
                <div
                  key={item.id}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={bulkSelection.has(item.id)}
                          onChange={(e) => {
                            const newSelection = new Set(bulkSelection);
                            if (e.target.checked) {
                              newSelection.add(item.id);
                            } else {
                              newSelection.delete(item.id);
                            }
                            setBulkSelection(newSelection);
                          }}
                          className="w-5 h-5 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                        />
                        {item.isActive !== undefined && (
                          <button
                            onClick={() => handleToggleActive(item)}
                            className={`p-1 rounded-lg transition-colors ${
                              item.isActive
                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                            }`}
                            title={item.isActive ? "Active" : "Inactive"}
                          >
                            {item.isActive ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm font-medium rounded-lg">
                          {item.id || "ID"}
                        </span>
                      </div>

                      {/* Dynamic content based on category */}
                      {activeCategory === "curriculum" && (
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                            {item.courseCode} - {item.courseName}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.category === "Core"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : item.category === "Elective"
                                    ? "bg-green-500/20 text-green-400"
                                    : item.category === "Major"
                                      ? "bg-purple-500/20 text-purple-400"
                                      : "bg-orange-500/20 text-orange-400"
                              }`}
                            >
                              {item.category}
                            </span>
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              Credits: {item.credits}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {item.semester}
                            </span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-4 h-4" />
                              {item.program}
                            </span>
                          </div>
                        </div>
                      )}

                      {activeCategory === "faculty" && (
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                            {item.firstName} {item.lastName}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.isActive
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </span>
                          </h3>
                          <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {item.position} - {item.department}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-4 h-4" />
                              {item.employeeId}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {item.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {item.office}
                            </span>
                          </div>
                        </div>
                      )}

                      {activeCategory === "programs" && (
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                            {item.programCode} - {item.programName}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.degreeType === "Bachelor"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : item.degreeType === "Master"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : item.degreeType === "Doctorate"
                                      ? "bg-orange-500/20 text-orange-400"
                                      : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {item.degreeType}
                            </span>
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {item.department}
                            </span>
                          </div>
                        </div>
                      )}

                      {activeCategory === "procedures" && (
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                            {item.title}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.category === "Enrollment"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : item.category === "Thesis"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : item.category === "Clearance"
                                      ? "bg-green-500/20 text-green-400"
                                      : item.category === "Admission"
                                        ? "bg-orange-500/20 text-orange-400"
                                        : item.category === "Graduation"
                                          ? "bg-pink-500/20 text-pink-400"
                                          : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {item.category}
                            </span>
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {item.steps?.length || 0} steps
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {item.contactPerson}
                            </span>
                          </div>
                        </div>
                      )}

                      {activeCategory === "faculty-schedules" && (
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-1">
                            {item.courseCode} - {item.courseName}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {item.facultyName} | Section: {item.section}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {item.day}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.timeStart} - {item.timeEnd}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {item.room}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {item.semester} {item.academicYear}
                            </span>
                          </div>
                        </div>
                      )}

                      {activeCategory === "room-schedules" && (
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-1">
                            {item.roomCode} - {item.roomName}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Building: {item.building} | Capacity:{" "}
                            {item.capacity}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Schedules: {item.schedule?.length || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              Facilities: {item.facilities?.length || 0}
                            </span>
                          </div>
                        </div>
                      )}

                      {activeCategory === "institutional" && (
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                            {item.title}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.priority === "Urgent"
                                  ? "bg-red-500/20 text-red-400"
                                  : item.priority === "High"
                                    ? "bg-orange-500/20 text-orange-400"
                                    : item.priority === "Medium"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {item.priority}
                            </span>
                          </h3>
                          <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                            {item.content}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            <span
                              className={`px-2 py-1 rounded-full font-medium ${
                                item.category === "Policy"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : item.category === "Announcement"
                                    ? "bg-green-500/20 text-green-400"
                                    : item.category === "General Info"
                                      ? "bg-purple-500/20 text-purple-400"
                                      : item.category === "Event"
                                        ? "bg-pink-500/20 text-pink-400"
                                        : "bg-orange-500/20 text-orange-400"
                              }`}
                            >
                              {item.category}
                            </span>
                            {item.tags?.map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-white/10 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Metadata Display */}
                      {item.aiMetadata && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex flex-wrap gap-2 text-xs">
                            {item.aiMetadata.tags
                              ?.slice(0, 3)
                              .map((tag: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.isActive
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        }`}
                        title={item.isActive ? "Deactivate" : "Activate"}
                      >
                        {item.isActive ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-foreground">
                  {editingItem ? "Edit" : "Add New"}{" "}
                  {
                    knowledgeCategories.find(
                      (cat) => cat.key === activeCategory,
                    )?.label
                  }
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setFormData({});
                  }}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-foreground hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {getFormFields().map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-400">*</span>
                      )}
                    </label>
                    {field.type === "checkbox" ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={field.name}
                          checked={formData[field.name] || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [field.name]: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                        />
                        <label
                          htmlFor={field.name}
                          className="text-sm text-muted-foreground"
                        >
                          Active
                        </label>
                      </div>
                    ) : field.type === "textarea" ? (
                      <>
                        <textarea
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [field.name]: e.target.value,
                            })
                          }
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          rows={4}
                          className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 resize-none ${
                            validationErrors[field.name]
                              ? "border-red-500/50 focus:ring-red-500/50"
                              : "border-white/10 focus:ring-cyan-500/50"
                          }`}
                          required={field.required}
                        />
                        {field.name === "description" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData[field.name]?.length || 0} characters
                          </p>
                        )}
                      </>
                    ) : field.type === "select" ? (
                      <select
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.name]: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-foreground focus:outline-none focus:ring-2 ${
                          validationErrors[field.name]
                            ? "border-red-500/50 focus:ring-red-500/50"
                            : "border-white/10 focus:ring-cyan-500/50"
                        }`}
                        required={field.required}
                      >
                        <option value="">
                          Select {field.label.toLowerCase()}
                        </option>
                        {field.options?.map((option: string) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.name]: e.target.value,
                          })
                        }
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          validationErrors[field.name]
                            ? "border-red-500/50 focus:ring-red-500/50"
                            : "border-white/10 focus:ring-cyan-500/50"
                        }`}
                        required={field.required}
                      />
                    )}
                    {validationErrors[field.name] && (
                      <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {validationErrors[field.name]}
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50"
                  >
                    <Save className="w-5 h-5" />
                    {editingItem ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                      setFormData({});
                    }}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-foreground font-bold rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {uploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">
                  Bulk Upload{" "}
                  {
                    knowledgeCategories.find(
                      (cat) => cat.key === activeCategory,
                    )?.label
                  }
                </h3>
                <button
                  onClick={() => setUploadModal(false)}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-foreground hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-foreground mb-2">
                    Upload CSV or Excel file
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Make sure your file follows the required format
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </label>
                </div>

                <div className="text-sm text-gray-400">
                  <p className="mb-2">Required columns:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {getFormFields().map((field) => (
                      <li key={field.name}>
                        {field.label} {field.required && "(required)"}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
