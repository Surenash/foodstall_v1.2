export enum Cuisine {
    SouthIndian = 'South Indian',
    NorthIndian = 'North Indian',
    Chaat = 'Chaat',
    Biryani = 'Biryani',
    Rolls = 'Rolls',
    IndoChinese = 'Indo-Chinese',
    Kebabs = 'Kebabs & Tikkas',
    Momos = 'Momos',
    Sweets = 'Sweets & Desserts',
    Beverages = 'Beverages',
    PavBhaji = 'Vada Pav & Pav Bhaji',
}

export enum StallStatus {
    Open = 'Open',
    Closed = 'Closed'
}

export interface Review {
    author: string;
    rating: number;
    comment: string;
}

export interface Stall {
    name: string;
    description: string;
    cuisine: Cuisine;
    rating: number;
    status: StallStatus;
    location: {
        latitude: number;
        longitude: number;
    };
    menuHighlights: string[];
    reviews: Review[];
    distance?: number;
    specialOfTheDay?: string;
    imageUrl?: string;
}

export type SortOption = 'default' | 'rating' | 'name-asc' | 'name-desc' | 'distance';

export interface FilterState {
    cuisine: 'All' | Cuisine;
    status: 'All' | StallStatus;
    rating: number;
    showFavoritesOnly: boolean;
    sort: SortOption;
}

export interface FeaturedCollection {
    title: string;
    description: string;
    stallNames: string[];
}