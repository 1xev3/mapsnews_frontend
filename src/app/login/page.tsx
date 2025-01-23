"use client"

import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Вход в систему</h1>
        <LoginForm />
      </Card>
    </div>
  );
} 