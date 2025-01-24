export default interface MarkerData {
    id: string,
    longitude: number;
    latitude: number;
}

export interface SearchPoint extends Omit<MarkerData, 'id'> {
    radius: number;
}