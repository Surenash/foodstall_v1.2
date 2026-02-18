
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Stall, FilterState, Review, SortOption, FeaturedCollection } from './types';
import { fetchFoodStalls, fetchFeaturedCollections } from './services/geminiService';
import { CUISINES } from './constants';
import { getFavoritesFromStorage, saveFavoritesToStorage, getReviewsFromStorage, saveReviewsToStorage, calculateDistance } from './utils';
import Header from './components/Header';
import SearchAndFilter from './components/SearchAndFilter';
import StallCard from './components/StallCard';
import StallDetailModal from './components/StallDetailModal';
import Spinner from './components/Spinner';
import FeaturedCollections from './components/FeaturedCollections';

const App: React.FC = () => {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [collections, setCollections] = useState<FeaturedCollection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    cuisine: 'All',
    status: 'All',
    rating: 0,
    showFavoritesOnly: false,
    sort: 'default',
  });

  useEffect(() => {
    setFavorites(getFavoritesFromStorage());
    const allReviews = getReviewsFromStorage();

    const loadStalls = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setCollections([]);
        let fetchedStalls = await fetchFoodStalls();
        
        // Hydrate stalls with reviews and recalculate ratings
        fetchedStalls = fetchedStalls.map(stall => {
            const stallReviews = allReviews[stall.name] || [];
            const totalRating = stallReviews.reduce((acc, review) => acc + review.rating, stall.rating);
            const averageRating = (stallReviews.length + 1) > 0 ? totalRating / (stallReviews.length + 1) : stall.rating;
            return {
                ...stall,
                reviews: stallReviews,
                rating: averageRating,
            };
        });

        setStalls(fetchedStalls);
        
        // After fetching stalls, fetch collections based on them
        const fetchedCollections = await fetchFeaturedCollections(fetchedStalls);
        setCollections(fetchedCollections);

      } catch (err) {
        setError('Failed to fetch food stalls. The AI might be busy, please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStalls();
  }, []);

  const handleToggleFavorite = useCallback((stallName: string) => {
    const newFavorites = new Set<string>(favorites);
    if (newFavorites.has(stallName)) {
      newFavorites.delete(stallName);
    } else {
      newFavorites.add(stallName);
    }
    setFavorites(newFavorites);
    saveFavoritesToStorage(newFavorites);
  }, [favorites]);

  const handleAddReview = useCallback((stallName: string, review: Review) => {
    const allReviews = getReviewsFromStorage();
    const stallReviews = allReviews[stallName] || [];
    const updatedReviews = [...stallReviews, review];
    allReviews[stallName] = updatedReviews;
    saveReviewsToStorage(allReviews);
    
    setStalls(prevStalls => prevStalls.map(stall => {
        if (stall.name === stallName) {
            const originalRating = (stall.rating * (stall.reviews.length + 1) - stall.reviews.reduce((acc, r) => acc + r.rating, 0));
            const newTotalRating = originalRating + updatedReviews.reduce((acc, r) => acc + r.rating, 0);
            const newAverageRating = newTotalRating / (updatedReviews.length + 1);
            
            const updatedStall = { ...stall, reviews: updatedReviews, rating: newAverageRating };
            if(selectedStall?.name === stallName) {
                setSelectedStall(updatedStall);
            }
            return updatedStall;
        }
        return stall;
    }));
  }, [selectedStall]);

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lon: longitude });
            setStalls(stalls.map(stall => ({
                ...stall,
                distance: calculateDistance(latitude, longitude, stall.location.latitude, stall.location.longitude)
            })));
            setFilters(prev => ({ ...prev, sort: 'distance' }));
        },
        () => {
            setError("Unable to retrieve your location. Please enable location services.");
        }
    );
  };

  const filteredStalls = useMemo(() => {
    let sortedStalls = [...stalls];

    // Sorting
    switch (filters.sort) {
        case 'rating':
            sortedStalls.sort((a, b) => b.rating - a.rating);
            break;
        case 'name-asc':
            sortedStalls.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sortedStalls.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'distance':
             sortedStalls.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
            break;
        default:
            break;
    }

    return sortedStalls.filter(stall => {
      const matchesSearch = stall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            stall.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCuisine = filters.cuisine === 'All' || stall.cuisine === filters.cuisine;
      const matchesStatus = filters.status === 'All' || stall.status === filters.status;
      const matchesRating = stall.rating >= filters.rating;
      const matchesFavorites = !filters.showFavoritesOnly || favorites.has(stall.name);
      return matchesSearch && matchesCuisine && matchesStatus && matchesRating && matchesFavorites;
    });
  }, [stalls, searchTerm, filters, favorites]);

  const handleSelectStall = (stall: Stall) => {
    setSelectedStall(stall);
  };

  const handleCloseModal = () => {
    setSelectedStall(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          cuisines={CUISINES}
          onFindNearby={handleFindNearby}
          isLocationEnabled={!!userLocation}
        />

        {isLoading && (
          <div className="flex justify-center items-center mt-16">
            <Spinner />
          </div>
        )}
        
        {error && (
           <div className="mt-16 text-center text-red-600 bg-red-100 p-6 rounded-lg shadow-md">
             <h2 className="text-xl font-bold mb-2">An Error Occurred</h2>
             <p>{error}</p>
           </div>
        )}

        {!isLoading && !error && (
          <>
            <FeaturedCollections collections={collections} stalls={stalls} onSelectStall={handleSelectStall} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mt-8">
              {filteredStalls.length > 0 ? (
                filteredStalls.map((stall) => (
                  <StallCard 
                    key={stall.name} 
                    stall={stall} 
                    onSelect={handleSelectStall}
                    isFavorite={favorites.has(stall.name)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16 text-gray-500">
                  <p className="text-xl">No food stalls match your criteria.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {selectedStall && (
        <StallDetailModal 
          stall={selectedStall} 
          onClose={handleCloseModal} 
          isFavorite={favorites.has(selectedStall.name)}
          onToggleFavorite={handleToggleFavorite}
          onAddReview={handleAddReview}
        />
      )}
    </div>
  );
};

export default App;
