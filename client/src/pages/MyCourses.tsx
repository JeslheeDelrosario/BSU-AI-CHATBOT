// client/src/pages/MyCourses.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useTranslation } from "../lib/translations";
import { useToast } from "../components/Toast";
import api from "../lib/api";
import {
  BookOpen,
  TrendingUp,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock, 
} from "lucide-react";

type Tab = "active" | "dropped";

export default function MyCourses() {
  const { settings: accessibilitySettings } = useAccessibility();
  const { showToast } = useToast();
  const t = useTranslation(accessibilitySettings.language);

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("active");

  // Drop / re-enroll confirmation states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<"drop" | "reenroll" | null>(
    null,
  );
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, [activeTab]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/my-enrollments?tab=${activeTab}`);
      setEnrollments(res.data.enrollments || []);
    } catch (err) {
      console.error("Failed to load enrollments", err);
      showToast({
        type: "error",
        title: "Error",
        message: "Could not load courses. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActionRequest = (enrollment: any, type: "drop" | "reenroll") => {
    setSelectedEnrollment(enrollment);
    setActionType(type);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedEnrollment || !actionType) return;
    setProcessing(true);

    try {
      if (actionType === "drop") {
        await api.delete(`/courses/unenroll/${selectedEnrollment.courseId}`);
        showToast({
          type: "success",
          title:
            accessibilitySettings.language === "fil" ? "Na-drop" : "Dropped",
          message:
            accessibilitySettings.language === "fil"
              ? "Matagumpay na na-drop ang kurso."
              : "Course dropped successfully.",
        });
      } else if (actionType === "reenroll") {
        await api.post("/courses/enroll", {
          courseId: selectedEnrollment.courseId,
        });
        showToast({
          type: "success",
          title:
            accessibilitySettings.language === "fil"
              ? "Na-re-enroll"
              : "Re-enrolled",
          message:
            accessibilitySettings.language === "fil"
              ? "Matagumpay na na-re-enroll ang kurso."
              : "Successfully re-enrolled in the course.",
        });
        // Switch to active tab after re-enroll
        setActiveTab("active");
      }

      // Refresh list
      fetchEnrollments();
    } catch (err: any) {
      showToast({
        type: "error",
        title: actionType === "drop" ? "Drop Failed" : "Re-enroll Failed",
        message: err.response?.data?.error || "Something went wrong.",
      });
    } finally {
      setProcessing(false);
      setShowConfirmModal(false);
      setSelectedEnrollment(null);
      setActionType(null);
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
      {/* Page Title */}
      <div className="text-center mb-10 px-6">
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent pb-3">
          {t.courses.myCourses}
        </h1>
      </div>

      {/* Segmented Control */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center rounded-full bg-gray-800/60 backdrop-blur-md border border-gray-700/60 p-1.5 shadow-lg">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-7 py-3 text-base font-medium rounded-full transition-all duration-300 ${
              activeTab === "active"
                ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/40"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {accessibilitySettings.language === "fil" ? "Aktibo" : "Active"}
          </button>
          <button
            onClick={() => setActiveTab("dropped")}
            className={`px-7 py-3 text-base font-medium rounded-full transition-all duration-300 ${
              activeTab === "dropped"
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/40"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {accessibilitySettings.language === "fil" ? "Itinigil" : "Dropped"}
          </button>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="mx-auto w-20 h-20 text-gray-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-300 mb-3">
            {activeTab === "active"
              ? accessibilitySettings.language === "fil"
                ? "Walang aktibong kurso"
                : "No active courses"
              : accessibilitySettings.language === "fil"
                ? "Walang na-drop na kurso"
                : "No dropped courses"}
          </h2>
          {activeTab === "active" && (
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl mt-4"
            >
              Browse Courses
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
          {enrollments.map((enrollment) => {
            const isDropped = activeTab === "dropped";
            const total =
              enrollment.totalLessonsCount ??
              enrollment.Course?._count?.Lesson ??
              0;
            const completed = enrollment.completedLessonsCount ?? 0;
            const progress = enrollment.progress ?? 0;

            // NEW: Check if course is fully completed
            const isCompleted = completed === total && total > 0;

            return (
              <div
                key={enrollment.id}
                className={`group relative h-full rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
                  isDropped
                    ? "bg-gray-900/40 border-red-800/40 opacity-85 hover:opacity-100"
                    : isCompleted
                      ? "bg-green-900/20 border-green-800/40" // subtle green tint when completed
                      : "bg-white/5 border-white/10 hover:border-cyan-500/50 hover:shadow-cyan-500/30"
                }`}
              >
                {/* Dropped badge - always visible on dropped cards */}
                {isDropped && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-red-600/80 text-white text-xs font-bold rounded-full">
                    Dropped
                  </div>
                )}

                {/* NEW: Completed badge - top-right, only on Active tab when finished */}
                {!isDropped && isCompleted && (
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-green-600/80 text-white text-xs font-bold rounded-full shadow-md">
                    Completed
                  </div>
                )}

                {/* Card content – clickable area */}
                <Link
                  to={`/courses/${enrollment.Course?.id}`}
                  className="block flex-1"
                >
                  {/* Header */}
                  <div className="h-48 relative flex items-center justify-center bg-gradient-to-br from-cyan-600/20 via-purple-600/15 to-indigo-700/20">
                    <BookOpen className="w-20 h-20 text-cyan-400/80 drop-shadow-xl" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                      {enrollment.Course?.title}
                    </h3>

                    {/* Short description */}
                    <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                      {enrollment.Course?.description ||
                        "No description available."}
                    </p>

                    {/* Level + Duration + Lessons */}
                    <div className="flex flex-wrap items-center gap-3 mb-5 text-sm">
                      {/* Level badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-sm ${
                          enrollment.Course?.level === "BEGINNER"
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60"
                            : enrollment.Course?.level === "INTERMEDIATE"
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/60"
                              : enrollment.Course?.level === "ADVANCED"
                                ? "bg-orange-500/20 text-orange-300 border-orange-500/60"
                                : "bg-pink-500/20 text-pink-300 border-pink-500/60"
                        }`}
                      >
                        {enrollment.Course?.level?.charAt(0) +
                          enrollment.Course?.level?.slice(1).toLowerCase() ||
                          "Unknown"}
                      </span>

                      {/* Duration */}
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="w-4 h-4" />
                        {enrollment.Course?.duration
                          ? `${Math.floor(enrollment.Course.duration / 60)}h`
                          : "Self-paced"}
                      </span>

                      {/* Lessons count */}
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <BookOpen className="w-4 h-4" />
                        {total} lessons
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span
                          className={
                            isDropped ? "text-gray-300" : "text-cyan-400"
                          }
                        >
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isDropped
                              ? "bg-gray-500"
                              : "bg-gradient-to-r from-cyan-500 to-purple-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Completed count */}
                    <div className="mt-auto flex items-center gap-2 text-gray-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>
                        {completed} / {total} completed
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Action Button – hidden until hover, BUT completely hidden when completed */}
                {!isCompleted && (
                  <div
                    className={`
              p-6 pt-0 transition-all duration-300 ease-in-out
              opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
            `}
                  >
                    {isDropped ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleActionRequest(enrollment, "reenroll");
                        }}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Re-enroll
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleActionRequest(enrollment, "drop");
                        }}
                        className="w-full py-3 bg-red-600/80 hover:bg-red-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <XCircle className="w-5 h-5" />
                        Drop Course
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 p-8 rounded-2xl max-w-md w-full border border-gray-700/50">
            <div className="flex items-center gap-4 mb-6">
              {actionType === "drop" ? (
                <AlertTriangle className="w-10 h-10 text-red-500" />
              ) : (
                <RefreshCw className="w-10 h-10 text-green-500" />
              )}
              <h3 className="text-2xl font-bold">
                {actionType === "drop"
                  ? accessibilitySettings.language === "fil"
                    ? "I-drop ang Kurso?"
                    : "Drop Course?"
                  : accessibilitySettings.language === "fil"
                    ? "I-re-enroll ang Kurso?"
                    : "Re-enroll Course?"}
              </h3>
            </div>

            <p className="text-gray-300 mb-8">
              {actionType === "drop"
                ? accessibilitySettings.language === "fil"
                  ? "Mawawala ang progreso mo sa kursong ito."
                  : "Your progress in this course will be lost."
                : accessibilitySettings.language === "fil"
                  ? "Magsisimula ulit mula sa simula ang kurso."
                  : "The course will start from the beginning."}
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleConfirmAction}
                disabled={processing}
                className={`flex-1 py-3 rounded-xl font-medium transition ${
                  processing
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : actionType === "drop"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {processing
                  ? "Processing..."
                  : actionType === "drop"
                    ? accessibilitySettings.language === "fil"
                      ? "Oo, I-drop"
                      : "Yes, Drop"
                    : accessibilitySettings.language === "fil"
                      ? "Oo, Re-enroll"
                      : "Yes, Re-enroll"}
              </button>

              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedEnrollment(null);
                  setActionType(null);
                }}
                disabled={processing}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition"
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
