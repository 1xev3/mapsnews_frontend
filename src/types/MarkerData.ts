export default interface MarkerData {
    id: string,
    longitude: number;
    latitude: number;
}

export interface MarkerDataWithTitle extends MarkerData {
    title: string;
}

export interface SearchPoint extends Omit<MarkerData, 'id'> {
    radius: number;
}