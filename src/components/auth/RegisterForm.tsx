"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { RegisterCredentials } from '@/types/ApiTypes';

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState<RegisterCredentials & { confirmPassword: string }>({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (credentials.password !== credentials.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = credentials;
      await api.register(registerData);
      router.push('/login');
    } catch {
      setError('Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden"
          required
        />
      </div>

      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
          Никнейм
        </label>
        <input
          type="text"
          id="nickname"
          value={credentials.nickname}
          onChange={(e) => setCredentials({ ...credentials, nickname: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Пароль
        </label>
        <input
          type="password"
          id="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden"
          required
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Подтвердите пароль
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={credentials.confirmPassword}
          onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-blue-500 focus:outline-hidden"
          required
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
};

export default RegisterForm; 