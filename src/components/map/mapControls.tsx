import { FaFilter, FaMapMarkerAlt, FaPlus, FaUsers } from "react-icons/fa";
import Button from '@/components/ui/Button';
import FiltersMenu from '@/components/map/FiltersMenu';
import Link from 'next/link';
import { useUser } from "@/lib/user_context";

interface MapControlsProps {
  onCreateNewsClick: (e: React.MouseEvent) => void;
  showSearchPointMenu: boolean;
  setShowSearchPointMenu: (show: boolean) => void;
  showFiltersMenu: boolean;
  setShowFiltersMenu: (show: boolean) => void;
  onTimeFilterChange: (hours: number) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  onCreateNewsClick,
  showSearchPointMenu,
  setShowSearchPointMenu,
  showFiltersMenu,
  setShowFiltersMenu,
  onTimeFilterChange,
  selectedTags,
  onTagsChange
}) => {
  const { user, logout } = useUser();
  
  return (
    <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 rounded-lg p-2 items-end">
      {/* Кнопка создать новость */}
      {/* 1 - Администратор, 2 - Редактор */}
      {user && (user.group_id === 1 || user.group_id === 2) && (
        <Link 
          className="w-fit px-3 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex flex-row items-center justify-center gap-2"
          href={`/news/create`}
          onClick={onCreateNewsClick}
        >
          <FaPlus />
          <span className="text-xs hidden md:block">Создать новость</span>
        </Link>
      )}

      {/* Кнопка управление пользователями */}
      {/* 1 - Администратор*/}
      {user && (user.group_id === 1) && (
        <Link 
          className="w-fit px-3 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex flex-row items-center justify-center gap-2"
          href={`/admin/users`}
        >
          <FaUsers />
          <span className="text-xs hidden md:block">Управление пользователями</span>
        </Link>
      )}

      {/* Кнопка точка поиска */}
      <Button 
        className="w-fit px-3 py-2 rounded-full"
        onClick={() => {
          setShowSearchPointMenu(!showSearchPointMenu);
          setShowFiltersMenu(false);
        }}
        title="Радиус поиска"
      >
        <FaMapMarkerAlt />
        <span className="text-xs hidden md:block">Точка поиска</span>
      </Button>

      {/* Кнопка фильтры */}
      <div className="flex items-center gap-1">
        <Button 
          className="w-fit px-3 py-2 rounded-full"
          onClick={() => {
            setShowFiltersMenu(!showFiltersMenu);
            setShowSearchPointMenu(false);
          }}
          title="Фильтры"
        >
          <FaFilter />
          <span className="text-xs hidden md:block">
            Фильтры {selectedTags.length > 0 && `(${selectedTags.length})`}
          </span>
        </Button>
        <FiltersMenu
          isOpened={showFiltersMenu}
          setIsOpened={setShowFiltersMenu}
          onTimeFilterChange={onTimeFilterChange}
          selectedTags={selectedTags}
          onTagsChange={onTagsChange}
        />
      </div>
    </div>
  );
};

export default MapControls;