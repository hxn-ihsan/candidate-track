import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (newRating: number) => void;
  idPrefix?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  interactive = false,
  size = 'md',
  onChange,
  idPrefix = 'star',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const currentDisplay = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role={interactive ? 'radiogroup' : 'group'}
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= currentDisplay;
        return (
          <button
            key={starValue}
            id={`${idPrefix}-${starValue}`}
            type="button"
            disabled={!interactive}
            onClick={() => {
              if (interactive && onChange) {
                onChange(starValue);
              }
            }}
            onMouseEnter={() => {
              if (interactive) {
                setHoverRating(starValue);
              }
            }}
            onMouseLeave={() => {
              if (interactive) {
                setHoverRating(null);
              }
            }}
            className={`transition-colors rounded p-0.5 ${
              interactive
                ? 'cursor-pointer hover:scale-110 active:scale-95 focus:outline-none focus:ring-1 focus:ring-amber-400'
                : 'cursor-default'
            }`}
            title={`${starValue} Star${starValue > 1 ? 's' : ''}`}
            aria-label={`${starValue} Star${starValue > 1 ? 's' : ''}`}
          >
            <Star
              className={`${starSizes[size]} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-slate-300 hover:text-amber-300'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};
