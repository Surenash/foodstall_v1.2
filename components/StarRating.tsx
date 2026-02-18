
import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
}

const Star: React.FC<{ filled: number }> = ({ filled }) => {
  const points = "10,1 4,19.8 19,7.8 1,7.8 16,19.8";
  const uniqueId = `grad-${Math.random()}`;
  
  return (
    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20">
      <defs>
        <linearGradient id={uniqueId}>
          <stop offset={`${filled * 100}%`} stopColor="currentColor" />
          <stop offset={`${filled * 100}%`} stopColor="#d1d5db" /> {/* gray-300 */}
        </linearGradient>
      </defs>
      <polygon points={points} fill={`url(#${uniqueId})`} />
    </svg>
  );
};

const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5 }) => {
  const fullStars = Math.floor(rating);
  const partialStar = rating % 1;
  const emptyStars = maxRating - fullStars - (partialStar > 0 ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} filled={1} />
      ))}
      {partialStar > 0 && <Star key="partial" filled={partialStar} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} filled={0} />
      ))}
    </div>
  );
};

export default StarRating;
