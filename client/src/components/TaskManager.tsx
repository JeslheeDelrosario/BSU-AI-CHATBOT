import { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Edit2, Calendar as CalendarIcon, Tag, Filter, X } from 'lucide-react';
import api from '../lib/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  category: string;
  tags: string[];
  completedAt?: string;
  Classroom?: {
    id: string;
    name: string;
    section?: string;
  };
}

const PRIORITY_COLORS = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

const STATUS_COLUMNS = [
  { id: 'TODO', label: 'To Do', color: 'from-gray-500 to-gray-600' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'from-blue-500 to-blue-600' },
  { id: 'COMPLETED', label: 'Completed', color: 'from-green-500 to-green-600' },
];

interface TaskManagerProps {
  classroomId?: string;
}

export default function TaskManager({ classroomId }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [classroomId, filterPriority, filterCategory]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params: any = { sortBy: 'dueDate', order: 'asc' };
      
      if (classroomId) {
        params.classroomId = classroomId;
      }
      if (filterPriority !== 'ALL') {
        params.priority = filterPriority;
      }
      if (filterCategory !== 'ALL') {
        params.category = filterCategory;
      }

      const response = await api.get('/tasks', { params });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    try {
      await api.post('/tasks', taskData);
      fetchTasks();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await api.put(`/tasks/${taskId}`, updates);
      fetchTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      await api.post(`/tasks/${taskId}/complete`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-2xl">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Task Manager</h2>
            <p className="text-sm text-gray-400">{tasks.length} total tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
          >
            <Filter className="w-4 h-4" />
            <span className="font-semibold">Filters</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="ALL">All Categories</option>
                <option value="PERSONAL">Personal</option>
                <option value="ACADEMIC">Academic</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="PROJECT">Project</option>
                <option value="EXAM_PREP">Exam Prep</option>
                <option value="MEETING_PREP">Meeting Prep</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {STATUS_COLUMNS.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`bg-gradient-to-r ${column.color} p-4 rounded-t-2xl`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">{column.label}</h3>
                  <span className="px-2 py-1 bg-white/20 rounded-lg text-sm font-semibold text-white">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 border-t-0 rounded-b-2xl p-4 space-y-3 min-h-[500px]">
                {columnTasks.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    No tasks
                  </div>
                ) : (
                  columnTasks.map(task => (
                    <div
                      key={task.id}
                      className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all group"
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white flex-1">{task.title}</h4>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`text-xs px-2 py-1 rounded ${PRIORITY_COLORS[task.priority]} text-white`}>
                          {task.priority}
                        </span>
                        <span className="text-xs px-2 py-1 bg-white/10 text-gray-300 rounded">
                          {task.category}
                        </span>
                        {task.Classroom && (
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                            {task.Classroom.name}
                          </span>
                        )}
                      </div>

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className={`flex items-center gap-2 text-xs ${
                          isOverdue(task.dueDate) ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          <CalendarIcon className="w-3 h-3" />
                          <span>{formatDate(task.dueDate)}</span>
                          {isOverdue(task.dueDate) && <span className="font-semibold">OVERDUE</span>}
                        </div>
                      )}

                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {task.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 text-gray-400 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      {task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="mt-3 w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-semibold transition-all"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTask) && (
        <TaskFormModal
          task={editingTask}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTask(null);
          }}
          onSave={(taskData) => {
            if (editingTask) {
              updateTask(editingTask.id, taskData);
            } else {
              createTask(taskData);
            }
          }}
          classroomId={classroomId}
        />
      )}
    </div>
  );
}

interface TaskFormModalProps {
  task?: Task | null;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  classroomId?: string;
}

function TaskFormModal({ task, onClose, onSave, classroomId }: TaskFormModalProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    status: task?.status || 'TODO',
    dueDate: task?.dueDate?.split('T')[0] || '',
    category: task?.category || 'PERSONAL',
    tags: task?.tags?.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Partial<Task> = {
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority as any,
      status: formData.status as any,
      dueDate: formData.dueDate || undefined,
      category: formData.category,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    if (classroomId) {
      (taskData as any).classroomId = classroomId;
    }

    onSave(taskData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">
              {task ? 'Edit Task' : 'Create New Task'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-24"
                placeholder="Enter task description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="PERSONAL">Personal</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="PROJECT">Project</option>
                  <option value="EXAM_PREP">Exam Prep</option>
                  <option value="MEETING_PREP">Meeting Prep</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., urgent, homework, math"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
