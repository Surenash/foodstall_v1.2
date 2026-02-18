import React from 'react';
import { FeaturedCollection, Stall } from '../types';

interface FeaturedCollectionsProps {
  collections: FeaturedCollection[];
  stalls: Stall[];
  onSelectStall: (stall: Stall) => void;
}

const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({ collections, stalls, onSelectStall }) => {
  if (collections.length === 0) {
    return null;
  }

  const stallsByName = new Map(stalls.map(s => [s.name, s]));

  return (
    <div className="mb-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 px-1">Featured Collections</h2>
      <div className="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
        {collections.map((collection) => (
          <div key={collection.title} className="flex-shrink-0 w-80 md:w-96 bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl shadow-lg p-5" style={{ scrollSnapAlign: 'start' }}>
            <h3 className="text-xl font-bold text-orange-800">{collection.title}</h3>
            <p className="text-sm text-orange-700 mt-1 mb-4 h-10">{collection.description}</p>
            <div className="space-y-3">
              {collection.stallNames
                .map(name => stallsByName.get(name))
                .filter((stall): stall is Stall => !!stall)
                .slice(0, 4) // Show max 4 stalls
                .map((stall) => {
                  const fallbackImageUrl = `https://placehold.co/50x50/f97316/white?text=${encodeURIComponent(stall.name.substring(0,2))}`;
                  return (
                    <div 
                      key={stall.name}
                      onClick={() => onSelectStall(stall)}
                      className="flex items-center space-x-3 bg-white/60 p-2 rounded-lg cursor-pointer hover:bg-white/90 hover:shadow-md transition-all"
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && onSelectStall(stall)}
                      aria-label={`View details for ${stall.name}`}
                    >
                      <img 
                        src={stall.imageUrl || fallbackImageUrl} 
                        alt={stall.name}
                        className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = fallbackImageUrl; }}
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{stall.name}</p>
                        <p className="text-xs text-gray-500">{stall.cuisine}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default FeaturedCollections;