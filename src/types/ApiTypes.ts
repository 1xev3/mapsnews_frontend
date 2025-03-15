export interface NewsResponse {
    title: string;
    content: string;
    id: number;
    creator_id: number;
    created_at: string;
    geodata_id: number;
    tags: string[];
}

export interface NewsResponseWithGeoPoint extends NewsResponse {
    latitude: number;
    longitude: number;
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

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface NewsCreate {
    title: string;
    content: string;
    latitude: number;
    longitude: number;
    tags: string[];
}

export interface NewsUpdate {
    title?: string;
    content?: string;
    tags?: string[];
}

export interface GeoPoint {
    latitude: number;
    longitude: number;
}

export interface User {
    email: string;
    nickname: string;
    id: number;
    is_active: boolean;
    group_id: number;
}