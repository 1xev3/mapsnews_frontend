'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center relative">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          NewsMap
        </h2>
      </div>
      <div className="container mx-auto px-4 py-16 md:py-0 mt-24 md:mt-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-gray-200 via-white to-gray-100 bg-clip-text text-transparent drop-shadow-lg">
            Интерактивная карта новостей
          </h1>
          
          <p className="text-lg md:text-xl mb-8 md:mb-12 text-gray-400 px-2">
            Это веб-приложение для визуализации новостных событий на интерактивной карте. 
            Платформа позволяет просматривать новости учитывая географическое расположение, время и категорию новостей.
          </p>

          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              <Card className="p-4 md:p-6 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-300">Геолокация</h3>
                <p className="text-sm md:text-base text-gray-400">Отслеживайте новости по конкретным локациям на карте</p>
              </Card>
              <Card className="p-4 md:p-6 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-300">Актуальность</h3>
                <p className="text-sm md:text-base text-gray-400">Отслеживайте новости по конкретным временным рамкам</p>
              </Card>
              <Card className="p-4 md:p-6 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-300">Интерактивность</h3>
                <p className="text-sm md:text-base text-gray-400">Взаимодействуйте с картой как никогда раньше</p>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => router.push('/map')}
                className="px-8 md:px-12 py-4 md:py-5 text-lg md:text-xl font-semibold bg-gradient-to-r from-white to-gray-300 text-black hover:from-gray-300 hover:to-white transition-all duration-300 rounded-2xl shadow-2xl hover:shadow-white/20 hover:scale-105 border-2 border-white/20"
              >
                Открыть карту →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 