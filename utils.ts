import { Review } from './types';

/**
 * Retrieves the set of favorite stall names from localStorage.
 * @returns A Set of strings containing the names of favorite stalls.
 */
export const getFavoritesFromStorage = (): Set<string> => {
    try {
        const favorites = localStorage.getItem('streetEatsFavorites');
        return favorites ? new Set(JSON.parse(favorites)) : new Set();
    } catch (error) {
        console.error("Could not retrieve favorites from localStorage", error);
        return new Set();
    }
};

/**
 * Saves the current set of favorite stall names to localStorage.
 * @param favorites - A Set of strings representing the favorite stalls.
 */
export const saveFavoritesToStorage = (favorites: Set<string>): void => {
    try {
        localStorage.setItem('streetEatsFavorites', JSON.stringify(Array.from(favorites)));
    } catch (error) {
        console.error("Could not save favorites to localStorage", error);
    }
};

/**
 * Retrieves all stall reviews from localStorage.
 * @returns An object where keys are stall names and values are arrays of Review objects.
 */
export const getReviewsFromStorage = (): Record<string, Review[]> => {
    try {
        const reviews = localStorage.getItem('streetEatsReviews');
        return reviews ? JSON.parse(reviews) : {};
    } catch (error) {
        console.error("Could not retrieve reviews from localStorage", error);
        return {};
    }
};

/**
 * Saves all stall reviews to localStorage.
 * @param reviews - An object containing all reviews, keyed by stall name.
 */
export const saveReviewsToStorage = (reviews: Record<string, Review[]>): void => {
    try {
        localStorage.setItem('streetEatsReviews', JSON.stringify(reviews));
    } catch (error) {
        console.error("Could not save reviews to localStorage", error);
    }
};

/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @returns The distance in kilometers.
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};