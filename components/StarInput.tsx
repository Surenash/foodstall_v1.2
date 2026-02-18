
import React, { useState } from 'react';

interface StarInputProps {
  rating: number;
  setRating: (rating: number) => void;
  maxRating?: number;
}

const StarInput: React.FC<StarInputProps> = ({ rating, setRating, maxRating = 5 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    setRating(index);
  };

  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, i) => {
        const ratingValue = i + 1;
        const isFilled = ratingValue <= (hoverRating || rating);

        return (
          <button
            key={ratingValue}
            type="button"
            className={`text-3xl transition-colors ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
            onMouseEnter={() => handleMouseEnter(ratingValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(ratingValue)}
            aria-label={`Rate ${ratingValue} out of ${maxRating}`}
          >
            &#9733;
          </button>
        );
      })}
    </div>
  );
};

export default StarInput;
