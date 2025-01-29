const STORAGE_KEYS = {
  USER_LOCATION: 'user_location',
  TIME_FILTER: 'time_filter',
} as const;

interface UserLocation {
  latitude: number;
  longitude: number;
  radius: number;
}

export const saveUserLocation = (location: UserLocation): void => {
  localStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(location));
};

export const getUserLocation = (): UserLocation | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
  return stored ? JSON.parse(stored) : null;
};

export interface TimeFilter {
  label: string;
  hours: number;
}

export const saveTimeFilter = (filter: TimeFilter): void => {
  localStorage.setItem(STORAGE_KEYS.TIME_FILTER, JSON.stringify(filter));
};

export const getTimeFilter = (): TimeFilter | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(STORAGE_KEYS.TIME_FILTER);
  return stored ? JSON.parse(stored) : null;
}; 