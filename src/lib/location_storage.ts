const STORAGE_KEYS = {
  USER_LOCATION: 'user_location',
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
  const stored = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
  return stored ? JSON.parse(stored) : null;
}; 