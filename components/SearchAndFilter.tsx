
import React from 'react';
import { FilterState, Cuisine, StallStatus, SortOption } from '../types';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  cuisines: Cuisine[];
  onFindNearby: () => void;
  isLocationEnabled: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  cuisines,
  onFindNearby,
  isLocationEnabled
}) => {
  const handleFilterChange = <K extends keyof FilterState,>(key: K, value: FilterState[K]) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm sticky top-0 z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
        <div className="relative col-span-1 md:col-span-3 lg:col-span-2">
          <input
            type="text"
            placeholder="Search by name or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <select
          value={filters.cuisine}
          onChange={(e) => handleFilterChange('cuisine', e.target.value as Cuisine | 'All')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        >
          <option value="All">All Cuisines</option>
          {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value as StallStatus | 'All')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        >
          <option value="All">All Statuses</option>
          <option value={StallStatus.Open}>Open Now</option>
          <option value={StallStatus.Closed}>Closed</option>
        </select>
        
        <div className="flex items-center space-x-2 col-span-1 md:col-span-2 lg:col-span-1">
            <label htmlFor="rating" className="text-sm font-medium text-gray-700">Rating:</label>
            <input
                id="rating"
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <span className="font-semibold text-orange-600 w-10 text-right">{filters.rating.toFixed(1)}+</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onFindNearby}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Find Nearby
          </button>
           <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            >
                <option value="default">Sort by: Default</option>
                <option value="rating">Sort by: Best Rating</option>
                <option value="name-asc">Sort by: Name (A-Z)</option>
                <option value="name-desc">Sort by: Name (Z-A)</option>
                <option value="distance" disabled={!isLocationEnabled}>Sort by: Distance</option>
            </select>
        </div>
        <label htmlFor="favorites-toggle" className="flex items-center cursor-pointer">
          <span className="mr-3 font-medium text-gray-700">Show Favorites Only</span>
          <div className="relative">
            <input 
              type="checkbox" 
              id="favorites-toggle" 
              className="sr-only" 
              checked={filters.showFavoritesOnly}
              onChange={(e) => handleFilterChange('showFavoritesOnly', e.target.checked)}
            />
            <div className="block bg-gray-200 w-14 h-8 rounded-full transition"></div>
            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform"></div>
          </div>
        </label>
        <style>{`
          #favorites-toggle:checked ~ .dot {
            transform: translateX(100%);
            background-color: white;
          }
          #favorites-toggle:checked ~ .block {
            background-color: #f97316; /* orange-500 */
          }
        `}</style>
      </div>
    </div>
  );
};

export default SearchAndFilter;
