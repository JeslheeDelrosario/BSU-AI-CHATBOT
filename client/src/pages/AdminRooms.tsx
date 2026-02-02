import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Users, Wifi, Monitor, Building2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

interface Room {
  id: string;
  name: string;
  building: string;
  floor?: number;
  capacity: number;
  type: string;
  facilities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    Meetings: number;
  };
}

interface Statistics {
  totalRooms: number;
  activeRooms: number;
  inactiveRooms: number;
  roomsByType: Array<{ type: string; _count: number }>;
  roomsByBuilding: Array<{ building: string; _count: number }>;
  upcomingMeetings: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ROOM_TYPES = [
  'CLASSROOM',
  'LABORATORY',
  'CONFERENCE',
  'LECTURE_HALL',
  'COMPUTER_LAB',
  'LIBRARY',
  'STUDY_ROOM',
  'AUDITORIUM',
];

const COMMON_FACILITIES = [
  'Whiteboard',
  'Projector',
  'Smart Board',
  'Air Conditioning',
  'WiFi',
  'Sound System',
  'Video Conferencing',
  'Microphones',
  'Desktop Computers',
  'Lab Equipment',
  'Storage Cabinets',
];

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    floor: '',
    capacity: '',
    type: 'CLASSROOM',
    facilities: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    fetchRooms();
    fetchStatistics();
    fetchBuildings();
  }, [filterType, filterBuilding, filterActive, searchTerm]);

  const fetchRooms = async () => {
    try {
      const params: any = {};
      if (filterType) params.type = filterType;
      if (filterBuilding) params.building = filterBuilding;
      if (filterActive) params.isActive = filterActive;
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get(`${API_URL}/admin/rooms`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/rooms/statistics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/rooms/buildings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setBuildings(response.data);
    } catch (error) {
      console.error('Failed to fetch buildings:', error);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/admin/rooms`,
        {
          ...formData,
          floor: formData.floor ? parseInt(formData.floor) : null,
          capacity: parseInt(formData.capacity),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setShowCreateModal(false);
      resetForm();
      fetchRooms();
      fetchStatistics();
      fetchBuildings();
    } catch (error: any) {
      console.error('Failed to create room:', error);
      alert(error.response?.data?.error || 'Failed to create room');
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    try {
      await axios.put(
        `${API_URL}/admin/rooms/${selectedRoom.id}`,
        {
          ...formData,
          floor: formData.floor ? parseInt(formData.floor) : null,
          capacity: parseInt(formData.capacity),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setShowEditModal(false);
      setSelectedRoom(null);
      resetForm();
      fetchRooms();
      fetchStatistics();
    } catch (error: any) {
      console.error('Failed to update room:', error);
      alert(error.response?.data?.error || 'Failed to update room');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      await axios.delete(`${API_URL}/admin/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchRooms();
      fetchStatistics();
    } catch (error: any) {
      console.error('Failed to delete room:', error);
      alert(error.response?.data?.error || 'Failed to delete room');
    }
  };

  const openEditModal = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      building: room.building,
      floor: room.floor?.toString() || '',
      capacity: room.capacity.toString(),
      type: room.type,
      facilities: room.facilities,
      isActive: room.isActive,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      building: '',
      floor: '',
      capacity: '',
      type: 'CLASSROOM',
      facilities: [],
      isActive: true,
    });
  };

  const toggleFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const getRoomTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CLASSROOM: 'bg-blue-100 text-blue-800',
      LABORATORY: 'bg-purple-100 text-purple-800',
      CONFERENCE: 'bg-green-100 text-green-800',
      LECTURE_HALL: 'bg-orange-100 text-orange-800',
      COMPUTER_LAB: 'bg-cyan-100 text-cyan-800',
      LIBRARY: 'bg-pink-100 text-pink-800',
      STUDY_ROOM: 'bg-yellow-100 text-yellow-800',
      AUDITORIUM: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.totalRooms}</p>
            </div>
            <Building2 className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Rooms</p>
              <p className="text-3xl font-bold text-green-600">{statistics.activeRooms}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Rooms</p>
              <p className="text-3xl font-bold text-red-600">{statistics.inactiveRooms}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Meetings</p>
              <p className="text-3xl font-bold text-purple-600">{statistics.upcomingMeetings}</p>
            </div>
            <Users className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>
    );
  };

  const renderRoomForm = (isEdit: boolean) => {
    const handleSubmit = isEdit ? handleUpdateRoom : handleCreateRoom;

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Room 101"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Building *
            </label>
            <input
              type="text"
              required
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              placeholder="e.g., Science Building A"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor
            </label>
            <input
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              placeholder="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity *
            </label>
            <input
              type="number"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facilities
          </label>
          <div className="grid grid-cols-3 gap-2">
            {COMMON_FACILITIES.map((facility) => (
              <label
                key={facility}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.facilities.includes(facility)}
                  onChange={() => toggleFacility(facility)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{facility}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <label className="text-sm font-medium text-gray-700">
            Room Status
          </label>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              formData.isActive
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {formData.isActive ? (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-sm font-semibold">Active</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="text-sm font-semibold">Inactive</span>
              </>
            )}
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isEdit ? 'Update Room' : 'Create Room'}
          </button>
          <button
            type="button"
            onClick={() => {
              isEdit ? setShowEditModal(false) : setShowCreateModal(false);
              resetForm();
              setSelectedRoom(null);
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          Room Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage all classrooms, laboratories, and meeting spaces
        </p>
      </div>

      {renderStatistics()}

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>

            <select
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Buildings</option>
              {buildings.map((building) => (
                <option key={building} value={building}>
                  {building}
                </option>
              ))}
            </select>

            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Room
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Building
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facilities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{room.name}</div>
                        {room.floor && (
                          <div className="text-sm text-gray-500">Floor {room.floor}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{room.building}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoomTypeColor(room.type)}`}>
                      {room.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {room.capacity}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {room.facilities.slice(0, 3).map((facility, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {facility}
                        </span>
                      ))}
                      {room.facilities.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{room.facilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {room.isActive ? (
                      <span className="flex items-center text-sm text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center text-sm text-red-600">
                        <XCircle className="w-4 h-4 mr-1" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(room)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rooms.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No rooms found</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Create New Room</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              {renderRoomForm(false)}
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Edit Room</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRoom(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              {renderRoomForm(true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
