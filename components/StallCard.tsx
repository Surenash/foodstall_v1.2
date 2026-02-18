import React from 'react';
import { Stall, StallStatus } from '../types';
import StarRating from './StarRating';

interface StallCardProps {
  stall: Stall;
  onSelect: (stall: Stall) => void;
  isFavorite: boolean;
  onToggleFavorite: (stallName: string) => void;
}

const StallCard: React.FC<StallCardProps> = ({ stall, onSelect, isFavorite, onToggleFavorite }) => {
  const fallbackImageUrl = `https://placehold.co/400x300/f97316/white?text=${encodeURIComponent(stall.name)}`;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(stall.name);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out cursor-pointer group flex flex-col"
      onClick={() => onSelect(stall)}
      aria-label={`View details for ${stall.name}`}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onSelect(stall)}
    >
      <div className="relative">
        <img 
            src={stall.imageUrl || fallbackImageUrl} 
            alt={stall.name} 
            className="w-full h-48 object-cover" 
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImageUrl; }}
        />
        
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-3 left-3 bg-black bg-opacity-40 rounded-full p-2 text-white transition-colors hover:bg-opacity-60 hover:text-red-500"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
        </button>
        
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs font-bold px-2 py-1 rounded-full">{stall.cuisine}</div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black to-transparent"></div>
        <h3 className="absolute bottom-2 left-3 text-white text-xl font-bold">{stall.name}</h3>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        {stall.specialOfTheDay && (
            <div className="mb-2">
                <p className="text-xs font-bold text-yellow-800 bg-yellow-200 rounded-full px-3 py-1 inline-block truncate" title={stall.specialOfTheDay}>
                    ✨ Today's Special: {stall.specialOfTheDay}
                </p>
            </div>
        )}
        <p className="text-gray-600 text-sm h-10 overflow-hidden flex-grow">{stall.description}</p>
        <div className="flex justify-between items-center mt-4">
          <StarRating rating={stall.rating} />
          {stall.distance !== undefined && (
             <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">{stall.distance.toFixed(1)} km</span>
          )}
        </div>
         <div className="flex justify-end items-center mt-2">
            <div className="flex items-center space-x-2">
              <span className={`h-3 w-3 rounded-full ${stall.status === StallStatus.Open ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm font-semibold">{stall.status}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StallCard;