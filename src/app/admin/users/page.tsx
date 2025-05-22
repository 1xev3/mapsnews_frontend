"use client"

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { User } from '@/types/ApiTypes';
import { NavBar } from '@/components/map/NavBar';

const ITEMS_PER_PAGE = 10;

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [formData, setFormData] = useState<{ nickname: string; password: string; group_id: string }>({
    nickname: '',
    password: '',
    group_id: '0'
  });

  useEffect(() => {
    loadUsers();
    loadGroups();
  }, [currentPage, searchEmail]);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        nickname: selectedUser.nickname,
        password: '',
        group_id: selectedUser.group_id.toString()
      });
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const skip = Math.max(0, (currentPage - 1) * ITEMS_PER_PAGE);
      const response = await api.getAllUsers(skip, ITEMS_PER_PAGE, searchEmail || undefined);
      setUsers(response.data);
      const total = response.headers['x-total-count'] 
        ? parseInt(response.headers['x-total-count'])
        : response.data.length;
      setTotalUsers(total);
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
    }
  };

  const loadGroups = async () => {
    try {
      const response = await api.getUserGroups();
      setGroups(response.data);
    } catch (err) {
      setError('Ошибка при загрузке групп');
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const data: { nickname?: string; password?: string; group_id?: number } = {};

      if (formData.nickname && formData.nickname !== selectedUser.nickname) {
        data.nickname = formData.nickname;
      }

      if (formData.password) {
        data.password = formData.password;
      }

      const newGroupId = parseInt(formData.group_id);
      if (newGroupId > 0 && newGroupId !== selectedUser.group_id) {
        data.group_id = newGroupId;
      }

      if (Object.keys(data).length > 0) {
        const updateData = {
          nickname: data.nickname || selectedUser.nickname,
          password: data.password,
          group_id: data.group_id || selectedUser.group_id,
          email: selectedUser.email,
          is_active: selectedUser.is_active
        };
        await api.updateUser(selectedUser.id, updateData);
        await loadUsers();
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Ошибка при обновлении пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-22">

      <h1 className="text-2xl font-bold mb-6">Управление пользователями</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="email"
          placeholder="Поиск по email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium mb-4">Список пользователей</h2>
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className={`p-3 rounded cursor-pointer hover:bg-gray-50 ${
                      selectedUser?.id === user.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium">{user.nickname}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Назад
                </button>
                <span>
                  Страница {currentPage} из {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Вперед
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedUser && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium mb-4">Редактирование пользователя</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                    Никнейм
                  </label>
                  <input
                    type="text"
                    id="nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Новый пароль
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="group_id" className="block text-sm font-medium text-gray-700">
                    Группа
                  </label>
                  <select
                    id="group_id"
                    name="group_id"
                    value={formData.group_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage; 