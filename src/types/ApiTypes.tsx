export interface NewsResponse {
    title: string;
    content: string;
    id: number;
    creator_id: string;
    created_at: string;
    geodata_id: number;
}

export interface GeoPointResponse {
    id: string;
    latitude: number;
    longitude: number;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
} 