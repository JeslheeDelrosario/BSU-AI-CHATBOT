// client/src/pages/Courses.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useToast } from "../components/Toast";
import api from "../lib/api";
import {
  BookOpen,
  Clock,
  Users,
  Search,
  Plus,
  Filter,
  X,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react"; // ADDED: Edit icon

export default function Courses() {
  const { user } = useAuth();
  const { settings: accessibilitySettings } = useAccessibility();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  // Create modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    level: "BEGINNER",
    duration: 60,
    tags: "",
    status: "DRAFT", // NEW: default status
  });

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    level: "BEGINNER",
    duration: 60,
    tags: "",
    status: "DRAFT",
    teacherId: "",
  });
  const [saving, setSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchCourses();
    fetchEnrolledIds();
  }, []);

  useEffect(() => {
    let filtered = courses;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query) ||
          c.tags?.some((t: string) => t.toLowerCase().includes(query)),
      );
    }
    if (levelFilter) {
      filtered = filtered.filter((c) => c.level === levelFilter);
    }
    setFilteredCourses(filtered);
  }, [courses, searchQuery, levelFilter]);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      setCourses(response.data.courses || []);
      setFilteredCourses(response.data.courses || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledIds = async () => {
    if (!user) return;

    try {
      const res = await api.get("/courses/my-enrollments");
      const ids = res.data.enrollments.map((e: any) => e.courseId);
      setEnrolledCourseIds(new Set(ids));
    } catch (err) {
      console.error("Failed to fetch enrolled IDs:", err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title.trim() || !newCourse.description.trim()) {
      showToast({
        type: "warning",
        title:
          accessibilitySettings.language === "fil"
            ? "Kulang ang Impormasyon"
            : "Missing Fields",
        message:
          accessibilitySettings.language === "fil"
            ? "Kailangan ang titulo at paglalarawan"
            : "Title and description are required",
      });
      return;
    }
    setCreating(true);
    try {
      await api.post("/courses", {
        ...newCourse,
        tags: newCourse.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      });
      setShowCreateModal(false);
      setNewCourse({
        title: "",
        description: "",
        level: "BEGINNER",
        duration: 60,
        tags: "",
        status: "DRAFT",
      });
      showToast({
        type: "success",
        title:
          accessibilitySettings.language === "fil"
            ? "Kurso ay Nalikha"
            : "Course Created",
        message:
          accessibilitySettings.language === "fil"
            ? "Matagumpay na nalikha ang iyong bagong kurso!"
            : "Your new course has been created successfully!",
      });
      fetchCourses();
    } catch (error: any) {
      console.error("Failed to create course:", error);
      showToast({
        type: "error",
        title:
          accessibilitySettings.language === "fil"
            ? "Nabigo ang Paglikha"
            : "Creation Failed",
        message:
          error.response?.data?.error ||
          "Failed to create course. Please try again.",
      });
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title,
      description: course.description || "",
      level: course.level,
      duration: course.duration || 60,
      tags: course.tags?.join(", ") || "",
      status: course.status || "DRAFT",
      teacherId: course.teacherId || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    if (!editForm.title.trim() || !editForm.description.trim()) {
      showToast({
        type: "warning",
        title: "Missing Fields",
        message: "Title and description are required",
      });
      return;
    }

    setSaving(true);
    try {
      await api.put(`/courses/${editingCourse.id}`, {
        ...editForm,
        tags: editForm.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      });
      showToast({
        type: "success",
        title: "Course Updated",
        message: "Course details saved successfully!",
      });
      setShowEditModal(false);
      fetchCourses(); // Refresh list to show changes
    } catch (error: any) {
      console.error("Failed to update course:", error);
      showToast({
        type: "error",
        title: "Update Failed",
        message: error.response?.data?.error || "Failed to update course",
      });
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (course: any) => {
    if (course.status !== "DRAFT") {
      showToast({
        type: "error",
        title: "Cannot Delete",
        message:
          "Only draft courses can be deleted. Set status to Draft first.",
      });
      return;
    }
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/courses/${courseToDelete.id}`);
      showToast({
        type: "success",
        title: "Course Deleted",
        message: "The course has been successfully removed.",
      });
      setShowDeleteModal(false);
      setCourseToDelete(null);
      navigate("/courses"); // Redirect to list page
      fetchCourses(); // Refresh list
    } catch (error: any) {
      console.error("Failed to delete course:", error);
      showToast({
        type: "error",
        title: "Delete Failed",
        message: error.response?.data?.error || "Failed to delete course",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-8 lg:py-10">
      {/* Hero Header */}
      <div className="text-center mb-8 lg:mb-10 px-6">
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 pb-1 md:pb-2 leading-tight md:leading-snug inline-block">
          {accessibilitySettings.language === "fil"
            ? "Tuklasin ang mga Kurso"
            : "Explore Courses"}
        </h1>
        <p className="text-xl md:text-2xl text-slate-700 dark:text-gray-300 font-light tracking-wide max-w-4xl mx-auto">
          {accessibilitySettings.language === "fil"
            ? "Buksan ang kinabukasan ng pag-aaral — AI-powered, personalized, at ginawa para sa iyo."
            : "Shape your learning journey — intelligent, adaptive, and tailored to your goals."}
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-white/5 border border-gray-300/70 dark:border-white/10 rounded-2xl p-4 shadow-sm dark:shadow-none flex flex-col md:flex-row gap-4">
          {/* Search input wrapper */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder={
                accessibilitySettings.language === "fil"
                  ? "Maghanap ng kurso sa pamamagitan ng titulo, paglalarawan, o tags..."
                  : "Search courses by title, description, or tags..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-white/5 border border-gray-300 dark:border-white/10rounded-xltext-gray-900 dark:text-whiteplaceholder-gray-500 dark:placeholder-gray-400focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 shadow-sm"
            />
          </div>

          {/* Filter + Create button */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="
                px-4 py-3
                bg-white dark:bg-gray-800
                border border-gray-300 dark:border-gray-600
                rounded-xl
                text-gray-900 dark:text-white
                focus:outline-none
                focus:ring-2 focus:ring-cyan-500/50
                focus:border-cyan-500
                shadow-sm
                transition-colors
              "
            >
              <option value="">
                {accessibilitySettings.language === "fil"
                  ? "Lahat ng Antas"
                  : "All Levels"}
              </option>
              <option value="BEGINNER">
                {accessibilitySettings.language === "fil"
                  ? "Nagsisimula"
                  : "Beginner"}
              </option>
              <option value="INTERMEDIATE">
                {accessibilitySettings.language === "fil"
                  ? "Intermediate"
                  : "Intermediate"}
              </option>
              <option value="ADVANCED">
                {accessibilitySettings.language === "fil"
                  ? "Advanced"
                  : "Advanced"}
              </option>
              <option value="EXPERT">
                {accessibilitySettings.language === "fil"
                  ? "Eksperto"
                  : "Expert"}
              </option>
            </select>

            {/* Create button - only for admin */}
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2px-6 py-3bg-gradient-to-r from-cyan-600 to-blue-600hover:from-cyan-500 hover:to-blue-500text-white font-boldrounded-xlshadow-lg shadow-cyan-500/30hover:shadow-cyan-500/50hover:scale-105transition-all duration-200min-w-[160px]"
              >
                <Plus className="w-5 h-5" />
                {accessibilitySettings.language === "fil"
                  ? "Magdagdag ng Kurso"
                  : "Add Course"}
              </button>
            )}
          </div>
        </div>

        {/* Active filters info */}
        {(searchQuery || levelFilter) && (
          <div
            className="
              mt-4
              flex items-center gap-3
              px-4 py-3
              rounded-xl
              border border-gray-100 dark:border-gray-700
              bg-gray-100 dark:bg-gray-800
              text-gray-800 dark:text-gray-100
              shadow-sm
            "
          >
            <Filter className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />

            <span className="font-medium">
              {accessibilitySettings.language === "fil"
                ? `Ipinapakita ang ${filteredCourses.length} sa ${courses.length} kurso`
                : `Showing ${filteredCourses.length} of ${courses.length} courses`}
            </span>

            <button
              onClick={() => {
                setSearchQuery("");
                setLevelFilter("");
              }}
              className="
                ml-auto
                flex items-center gap-1
                px-3 py-1.5
                rounded-lg
                bg-cyan-600 text-white
                hover:bg-cyan-700
                dark:bg-cyan-500 dark:hover:bg-cyan-400
                transition-colors
                text-sm font-medium
              "
            >
              <X className="w-4 h-4" />
              {accessibilitySettings.language === "fil"
                ? "I-clear ang mga filter"
                : "Clear filters"}
            </button>
          </div>
        )}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
        {filteredCourses.map((course) => {
          const isEnrolled = enrolledCourseIds.has(course.id);

          return (
            <div
              key={course.id}
              className={`relative group block rounded-3xl overflow-hidden transition-all duration-300
                ${
                  isEnrolled
                    ? "border-2 border-cyan-500/70 shadow-2xl shadow-cyan-500/40 scale-[1.02] hover:scale-[1.05] hover:shadow-cyan-600/50"
                    : "border border-gray-200/80 dark:border-white/10 shadow-lg hover:shadow-xl hover:shadow-cyan-500/30 hover:border-cyan-500/50"
                }
                bg-white dark:bg-white/5 backdrop-blur-xl
              `}
            >
              <Link to={`/courses/${course.id}`} className="block h-full">
                {/* Course Header */}
                <div className="h-56 relative flex items-center justify-center bg-gradient-to-br from-cyan-600/30 via-purple-600/20 to-indigo-700/30">
                  <div className="absolute inset-0 bg-black/25" />
                  <div className="relative z-10 p-8 bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500 ">
                    <BookOpen className="w-20 h-20 text-cyan-400 drop-shadow-2xl" />
                  </div>
                  <div className="absolute inset-0 g-gradient-to-t from-black/40 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 " />
                </div>

                {/* Card Content */}
                <div className="p-7 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6">
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm mb-5">
                    <span className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                      <Clock className="w-5 h-5" />
                      <span className="text-gray-800 dark:text-gray-300">
                        {course.duration
                          ? `${Math.floor(course.duration / 60)}h`
                          : "Self-paced"}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Users className="w-5 h-5" />
                      <span className="text-gray-800 dark:text-gray-300">
                        {course._count?.Enrollment || 0}{" "}
                        {accessibilitySettings.language === "fil"
                          ? "nag-aaral"
                          : "learners"}
                      </span>
                    </span>
                  </div>

                  {/* Level Badge */}
                  <div className="flex justify-end">
                    <span
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-sm
                      ${
                        course.level === "Beginner"
                          ? "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/60"
                          : course.level === "Intermediate"
                            ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/60"
                            : "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/60"
                      }
                    `}
                    >
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Enrolled Badge */}
                {isEnrolled && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/95 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm border border-green-400/60">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Enrolled
                    </span>
                  </div>
                )}

                {/* Hover Shine */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/20 to-transparentopacity-0 group-hover:opacity-100 translate-x-full group-hover:translate-x-0 transition-transform duration-1000 pointer-events-none" />

                {/* Admin Status Badge */}
                {isAdmin && (
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-sm
                        ${
                          course.status === "DRAFT"
                            ? "bg-gray-200 text-gray-800 border-gray-400 dark:bg-gray-700/80 dark:text-gray-200 dark:border-gray-500"
                            : "bg-green-200 text-green-800 border-green-400 dark:bg-green-600/80 dark:text-white dark:border-green-400"
                        }
                      `}
                    >
                      {course.status === "DRAFT" ? "Draft" : "Published"}
                    </span>
                  </div>
                )}
              </Link>

              {/* Admin Buttons */}
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-3opacity-0 group-hover:opacity-100 transition-opacity z-30">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openEditModal(course);
                    }}
                    className="p-3 bg-blue-600/90 hover:bg-blue-700 text-whiterounded-full shadow-lg hover:scale-110 transition-transform"
                    title={
                      accessibilitySettings.language === "fil"
                        ? "I-edit ang Kurso"
                        : "Edit Course"
                    }
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDeleteModal(course);
                    }}
                    className="p-3 bg-red-600/90 hover:bg-red-700 text-whiterounded-full shadow-lg hover:scale-110 transition-transform"
                    title={
                      accessibilitySettings.language === "fil"
                        ? "Tanggalin ang Kurso"
                        : "Delete Course"
                    }
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-32">
          <BookOpen className="w-24 h-24 mx-auto text-slate-400 dark:text-gray-600 mb-8" />
          <p className="text-2xl text-slate-700 dark:text-gray-500">
            {searchQuery || levelFilter
              ? accessibilitySettings.language === "fil"
                ? "Walang kurso na tumutugma sa iyong filter."
                : "No courses match your filters."
              : accessibilitySettings.language === "fil"
                ? "Wala pang available na kurso."
                : "No courses available yet."}
          </p>
          <p className="text-slate-600 dark:text-gray-600 mt-4">
            {searchQuery || levelFilter
              ? accessibilitySettings.language === "fil"
                ? "Subukang ayusin ang iyong paghahanap."
                : "Try adjusting your search criteria."
              : accessibilitySettings.language === "fil"
                ? "Mga bagong kurso ay inihahanda!"
                : "New courses are being prepared!"}
          </p>
        </div>
      )}

      {/* Create Course Modal - visible only to ADMIN */}
      {showCreateModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-gray-900/95 border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {accessibilitySettings.language === "fil"
                ? "Lumikha ng Bagong Kurso"
                : "Create New Course"}
            </h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {accessibilitySettings.language === "fil"
                    ? "Titulo ng Kurso *"
                    : "Course Title *"}
                </label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder={
                    accessibilitySettings.language === "fil"
                      ? "hal., Panimula sa Programming"
                      : "e.g., Introduction to Programming"
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {accessibilitySettings.language === "fil"
                    ? "Paglalarawan *"
                    : "Description *"}
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder={
                    accessibilitySettings.language === "fil"
                      ? "Ilarawan kung ano ang matututunan ng mga estudyante..."
                      : "Describe what students will learn..."
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {accessibilitySettings.language === "fil"
                      ? "Antas"
                      : "Level"}
                  </label>
                  <select
                    value={newCourse.level}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, level: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="BEGINNER">
                      {accessibilitySettings.language === "fil"
                        ? "Nagsisimula"
                        : "Beginner"}
                    </option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">
                      {accessibilitySettings.language === "fil"
                        ? "Eksperto"
                        : "Expert"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {accessibilitySettings.language === "fil"
                      ? "Tagal (minuto)"
                      : "Duration (minutes)"}
                  </label>
                  <input
                    type="number"
                    value={newCourse.duration}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        duration: parseInt(e.target.value) || 60,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {accessibilitySettings.language === "fil"
                    ? "Mga Tag (pinaghihiwalay ng kuwit)"
                    : "Tags (comma-separated)"}
                </label>
                <input
                  type="text"
                  value={newCourse.tags}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, tags: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder={
                    accessibilitySettings.language === "fil"
                      ? "hal., programming, python, nagsisimula"
                      : "e.g., programming, python, beginner"
                  }
                />
              </div>

              {/* NEW: Status select */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {accessibilitySettings.language === "fil"
                    ? "Status"
                    : "Status"}
                </label>
                <select
                  value={newCourse.status}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, status: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="DRAFT">
                    {accessibilitySettings.language === "fil"
                      ? "Draft (Hindi pa nakikita ng estudyante)"
                      : "Draft (Not visible to students)"}
                  </option>
                  <option value="PUBLISHED">
                    {accessibilitySettings.language === "fil"
                      ? "Published (Makikita ng estudyante)"
                      : "Published (Visible to students)"}
                  </option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {creating
                    ? accessibilitySettings.language === "fil"
                      ? "Lumilikha..."
                      : "Creating..."
                    : accessibilitySettings.language === "fil"
                      ? "Lumikha ng Kurso"
                      : "Create Course"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-foreground font-bold rounded-xl hover:bg-white/10 transition-colors"
                >
                  {accessibilitySettings.language === "fil"
                    ? "Kanselahin"
                    : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW: Edit Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-gray-900/95 border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl my-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {accessibilitySettings.language === "fil"
                ? "I-edit ang Kurso"
                : "Edit Course"}
            </h2>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Level
                  </label>
                  <select
                    value={editForm.level}
                    onChange={(e) =>
                      setEditForm({ ...editForm, level: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={editForm.duration}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        duration: parseInt(e.target.value) || 60,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) =>
                    setEditForm({ ...editForm, tags: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="e.g., programming, python, beginner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="DRAFT">Draft (hidden from students)</option>
                  <option value="PUBLISHED">
                    Published (visible to students)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Teacher ID (optional)
                </label>
                <input
                  type="text"
                  value={editForm.teacherId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, teacherId: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="Enter teacher user ID"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-foreground font-bold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && courseToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-gray-900/95 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-red-400 mb-6">
              Confirm Delete
            </h2>
            <p className="text-lg text-foreground mb-8">
              {accessibilitySettings.language === "fil"
                ? "Sigurado ka bang gusto mong tanggalin ang kurso na ito? Hindi na ito mababalik."
                : "Are you sure you want to delete this course? This action cannot be undone."}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-transform hover:scale-105 disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : accessibilitySettings.language === "fil"
                    ? "Tanggalin"
                    : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-foreground font-bold rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {accessibilitySettings.language === "fil"
                  ? "Kanselahin"
                  : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
