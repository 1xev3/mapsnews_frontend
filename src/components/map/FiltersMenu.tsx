import React, { useState, useEffect } from 'react';
import { Dropdown } from '@/components/ui/Dropdown';
import { TimeFilter, saveTimeFilter, getTimeFilter } from '@/lib/news_data_storage';
import api from '@/lib/api';

const TIME_FILTERS: TimeFilter[] = [
  { label: 'За час', hours: 1 },
  { label: 'За 12 часов', hours: 12 },
  { label: 'За день', hours: 24 },
  { label: 'За 3 дня', hours: 72 },
  { label: 'За неделю', hours: 168 },
  { label: 'За месяц', hours: 720 },
];

interface FiltersMenuProps {
  onTimeFilterChange: (hours: number) => void;
  isOpened: boolean;
  setIsOpened: (isOpened: boolean) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const FiltersMenu: React.FC<FiltersMenuProps> = ({
  onTimeFilterChange,
  isOpened,
  setIsOpened,
  selectedTags,
  onTagsChange
}) => {
  const [selectedTime, setSelectedTime] = useState<TimeFilter>(TIME_FILTERS[2]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Load saved filter and tags on component mount
  useEffect(() => {
    const savedFilter = getTimeFilter();
    if (savedFilter) {
      setSelectedTime(savedFilter);
      onTimeFilterChange(savedFilter.hours);
    }
    
    // Load available tags
    api.getNewsTags().then(res => setAllTags(res.data));
  }, []);

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setSelectedTime(filter);
    saveTimeFilter(filter);
    onTimeFilterChange(filter.hours);
    setIsTimeDropdownOpen(false);
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  if (!isOpened) return null;

  return (
    <div className="absolute right-full mr-2 top-0 w-64 bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">По времени</h4>
          <Dropdown
            isOpened={isTimeDropdownOpen}
            setIsOpened={setIsTimeDropdownOpen}
            selfContent={
              <span className="text-sm">{selectedTime.label}</span>
            }
            className="w-full border border-gray-200 hover:border-gray-300"
          >
            <div className="py-1">
              {TIME_FILTERS.map((filter) => (
                <button
                  key={filter.hours}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100
                    ${selectedTime.hours === filter.hours ? 'bg-gray-50 text-teal-600' : 'text-gray-700'}`}
                  onClick={() => handleTimeFilterChange(filter)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </Dropdown>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">По тегам</h4>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-2 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag)
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersMenu; 