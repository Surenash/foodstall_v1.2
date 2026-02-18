import React, { useState } from 'react';
import { Stall, StallStatus, Review } from '../types';
import StarRating from './StarRating';
import StarInput from './StarInput';

interface StallDetailModalProps {
  stall: Stall;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (stallName: string) => void;
  onAddReview: (stallName: string, review: Review) => void;
}

const ReviewForm: React.FC<{ stallName: string; onAddReview: (stallName: string, review: Review) => void; }> = ({ stallName, onAddReview }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [author, setAuthor] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(rating > 0 && comment.trim() !== '' && author.trim() !== '') {
            onAddReview(stallName, { author, rating, comment });
            setRating(0);
            setComment('');
            setAuthor('');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h5 className="text-lg font-bold text-gray-800 mb-3">Leave a Review</h5>
            <div className="space-y-4">
                <input 
                    type="text"
                    placeholder="Your Name"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                />
                <div>
                    <label className="font-medium text-gray-700 block mb-1">Your Rating</label>
                    <StarInput rating={rating} setRating={setRating} />
                </div>
                <textarea
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    required
                ></textarea>
                <button 
                    type="submit"
                    className="w-full px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors disabled:bg-gray-400"
                    disabled={!author || !comment || rating === 0}
                >
                    Submit Review
                </button>
            </div>
        </form>
    );
};


const StallDetailModal: React.FC<StallDetailModalProps> = ({ stall, onClose, isFavorite, onToggleFavorite, onAddReview }) => {
  const fallbackImageUrl = `https://placehold.co/800x600/f97316/white?text=${encodeURIComponent(stall.name)}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${stall.location.latitude},${stall.location.longitude}`;


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stall-details-heading"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-300 ease-in-out animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="relative">
            <img 
                src={stall.imageUrl || fallbackImageUrl} 
                alt={stall.name} 
                className="w-full h-64 object-cover rounded-t-xl" 
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackImageUrl; }}
            />
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-700 hover:bg-gray-200 transition-colors"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-start mb-4">
                <div className="flex items-center mb-2 md:mb-0">
                  <h2 id="stall-details-heading" className="text-3xl font-extrabold text-gray-900 mr-3">{stall.name}</h2>
                  <button 
                    onClick={() => onToggleFavorite(stall.name)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full flex-shrink-0">
                    <span className={`h-3 w-3 rounded-full ${stall.status === StallStatus.Open ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-md font-bold">{stall.status}</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b">
                <span className="text-orange-500 font-bold py-1 px-3 bg-orange-100 rounded-full text-sm">{stall.cuisine}</span>
                <div className="text-gray-600 flex items-center">
                    <StarRating rating={stall.rating} />
                    <span className="ml-2 font-semibold">{stall.rating.toFixed(1)}</span>
                </div>
                {stall.distance !== undefined && (
                  <span className="font-semibold text-orange-600">({stall.distance.toFixed(1)} km away)</span>
                )}
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">{stall.description}</p>
            
            {stall.specialOfTheDay && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <h4 className="text-lg font-bold text-yellow-900 mb-1">🔥 Today's Special</h4>
                    <p className="text-yellow-800">{stall.specialOfTheDay}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">Menu Highlights</h4>
                    <ul className="space-y-2">
                        {stall.menuHighlights.map((item, index) => (
                        <li key={index} className="flex items-center">
                            <svg className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-600">{item}</span>
                        </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">Location</h4>
                    <a 
                      href={googleMapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 3.051a.5.5 0 01.89 0l1.96 4.582a.5.5 0 01-.217.55l-4.14 2.29a.5.5 0 01-.638-.55L9.555 3.05z" clipRule="evenodd" />
                      </svg>
                      Get Directions
                    </a>
                </div>

                <div className="md:col-span-2">
                    <h4 className="text-xl font-bold text-gray-800 mb-3 pt-4 border-t">Reviews ({stall.reviews.length})</h4>
                    <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                        {stall.reviews.length > 0 ? stall.reviews.map((review, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-bold text-gray-800">{review.author}</p>
                                    <StarRating rating={review.rating} />
                                </div>
                                <p className="text-gray-600">{review.comment}</p>
                            </div>
                        )) : (
                            <p className="text-gray-500">No reviews yet. Be the first!</p>
                        )}
                    </div>
                    <ReviewForm stallName={stall.name} onAddReview={onAddReview} />
                </div>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StallDetailModal;