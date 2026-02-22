import { useState, useRef, useEffect, useCallback } from 'react';
import { Star, CheckCircle2, Sparkles } from 'lucide-react';
import type { Artist, Review } from '@/types/salon';

interface ReviewsSectionProps {
  artists: Artist[];
  reviews: Review[];
  selectedArtist: string | null;
  onSelectArtist: (id: string | null) => void;
}

const mockPhotos = [
  'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1585747860019-8e8e13c2e4f2?w=400&h=400&fit=crop',
];

const ReviewsSection = ({ artists, reviews, selectedArtist, onSelectArtist }: ReviewsSectionProps) => {
  const [isJiggling, setIsJiggling] = useState(false);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);

  const tabRowRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const filteredReviews = reviews.filter((r) => {
    if (selectedArtist && r.artistId !== selectedArtist) return false;
    return true;
  });

  const currentArtist = artists.find((a) => a.id === selectedArtist);
  const avgRating = filteredReviews.length > 0
    ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1)
    : '0.0';

  const updatePillPosition = useCallback(() => {
    const key = selectedArtist ?? '_all';
    const btn = buttonRefs.current.get(key);
    const row = tabRowRef.current;
    if (!btn || !row) return;

    const rowRect = row.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    setPillStyle({
      left: btnRect.left - rowRect.left - 8,
      width: btnRect.width + 16,
    });
  }, [selectedArtist]);

  useEffect(() => {
    updatePillPosition();
    window.addEventListener('resize', updatePillPosition);
    return () => window.removeEventListener('resize', updatePillPosition);
  }, [updatePillPosition]);

  useEffect(() => {
    setIsJiggling(true);
    const timer = setTimeout(() => setIsJiggling(false), 600);
    return () => clearTimeout(timer);
  }, [selectedArtist]);

  const setRef = (key: string) => (el: HTMLButtonElement | null) => {
    if (el) buttonRefs.current.set(key, el);
    else buttonRefs.current.delete(key);
  };

  const handleSelect = (id: string | null) => {
    if (id === selectedArtist) return;
    onSelectArtist(id);
  };

  return (
    <div className="pb-8">
      {/* Section Header */}
      <div className="px-5 pt-6 pb-1">
        <div className="flex items-baseline justify-between mb-4">
          <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl italic tracking-wide" >
            <span style={{ color: '#2C1E1A' }}>Our </span>
            <span style={{ color: '#9A7B6D' }}>Stylists</span>
          </h2>
          <button className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#9A7B6D' }}>
            View All
          </button>
        </div>

        {/* Jelly Tab Artist Selector */}
        <div className="relative" ref={tabRowRef}>
          {pillStyle && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: pillStyle.left,
                width: pillStyle.width,
                top: -4,
                bottom: -16,
                background: 'rgba(248, 241, 233, 0.6)',
                border: '1.5px solid rgba(154, 123, 109, 0.15)',
                borderBottom: 'none',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                transition: 'left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: isJiggling ? 'jelly 0.55s ease' : 'none',
                transformOrigin: 'bottom center',
                zIndex: 0,
              }}
            />
          )}

          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-3 items-end justify-center relative z-10">
            <button
              ref={setRef('_all')}
              onClick={() => handleSelect(null)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div
                className={`rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all duration-300 ease-out ${
                  !selectedArtist
                    ? 'w-[68px] h-[68px] shadow-lg'
                    : 'w-14 h-14 opacity-50'
                }`}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: '#F8F1E9',
                  color: '#2C1E1A',
                  borderColor: !selectedArtist ? '#9A7B6D' : 'transparent',
                  ...((!selectedArtist && isJiggling) ? { animation: 'jelly 0.55s ease', transformOrigin: 'bottom center' } : {}),
                }}
              >
                ALL
              </div>
              <span
                className="text-[10px] font-medium uppercase tracking-wider transition-colors duration-200"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: !selectedArtist ? '#2C1E1A' : 'rgba(154,123,109,0.4)',
                }}
              >
                All Artists
              </span>
            </button>

            {artists.map((artist) => {
              const isActive = selectedArtist === artist.id;
              return (
                <button
                  key={artist.id}
                  ref={setRef(artist.id)}
                  onClick={() => handleSelect(artist.id)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0"
                >
                  <div
                    className={`rounded-full overflow-hidden border-2 transition-all duration-300 ease-out ${
                      isActive ? 'w-[68px] h-[68px] shadow-lg' : 'w-14 h-14 opacity-50'
                    }`}
                    style={{
                      borderColor: isActive ? '#9A7B6D' : 'transparent',
                      ...((isActive && isJiggling) ? { animation: 'jelly 0.55s ease', transformOrigin: 'bottom center' } : {}),
                    }}
                  >
                    <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                  </div>
                  <span
                    className="text-[10px] font-medium uppercase tracking-wider whitespace-nowrap transition-colors duration-200"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: isActive ? '#2C1E1A' : 'rgba(154,123,109,0.4)',
                    }}
                  >
                    {artist.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews Container */}
      <div
        className="mx-3 p-1"
        style={{
          background: 'rgba(248, 241, 233, 0.5)',
          border: '1px solid rgba(154, 123, 109, 0.1)',
          borderRadius: '0 0 24px 24px',
          borderTop: 'none',
          backdropFilter: 'blur(8px)',
          animation: isJiggling ? 'jelly-container 0.5s ease' : 'none',
          transformOrigin: 'top center',
        }}
      >
        {/* Reviews header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#2C1E1A' }} className="text-lg">
            {currentArtist ? (
              <>
                {currentArtist.name.split('.')[0]}.{' '}
                <span style={{ color: '#9A7B6D' }} className="italic">Reviews</span>
              </>
            ) : (
              <>
                All <span style={{ color: '#9A7B6D' }} className="italic">Reviews</span>
              </>
            )}
          </h3>
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              background: '#FFFFFF',
              border: '1px solid #EEE6E2',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <Star size={12} style={{ color: '#9A7B6D' }} fill="#9A7B6D" />
            <span className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#2C1E1A' }}>{avgRating}</span>
          </div>
        </div>

        {/* Review Cards */}
        <div className="space-y-3 px-3 pb-4">
          {filteredReviews.map((review, index) => (
            <div
              key={review.id}
              className="rounded-[32px] p-6 shadow-sm"
              style={{
                background: '#FFFFFF',
                border: '1px solid #EEE6E2',
                animation: `fade-in-up 0.4s ease-out ${index * 100}ms both`,
              }}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-3">
                  {/* Letter Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#F8F1E9', border: '1px solid #EEE6E2' }}
                  >
                    <span style={{ fontFamily: "'Playfair Display', serif", color: '#9A7B6D' }} className="text-base font-semibold">
                      {review.userName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#2C1E1A' }}>
                        {review.userName}
                      </span>
                      <CheckCircle2 size={14} style={{ color: '#9A7B6D' }} fill="rgba(154,123,109,0.2)" />
                    </div>
                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          fill={i < review.rating ? '#9A7B6D' : '#F4EDE9'}
                          style={{ color: i < review.rating ? '#9A7B6D' : '#F4EDE9' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Date */}
                <span
                  className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#D1C2BA' }}
                >
                  {review.date}
                </span>
              </div>

              {/* Service Tag */}
              <div className="mb-2.5">
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider rounded-xl px-3 py-1.5"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: 'rgba(248, 241, 233, 0.8)',
                    color: '#9A7B6D',
                  }}
                >
                  <Sparkles size={10} style={{ color: '#9A7B6D' }} />
                  {review.service}
                </span>
              </div>

              {/* Comment */}
              <p
                className="text-xs font-medium leading-relaxed"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5C5450' }}
              >
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Customer Photos */}
              {review.hasPhoto && (
                <div className="flex gap-2 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {mockPhotos.map((photo, i) => (
                    <div
                      key={i}
                      className="w-48 h-48 flex-shrink-0 rounded-3xl overflow-hidden shadow-sm"
                      style={{ border: '2px solid #FFFFFF' }}
                    >
                      <img src={photo} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Empty State */}
          {filteredReviews.length === 0 && (
            <div className="text-center py-14 px-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: '#FFFFFF', border: '1px solid #EEE6E2' }}
              >
                <Star size={20} style={{ color: 'rgba(154,123,109,0.3)' }} />
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(154,123,109,0.6)' }} className="text-base italic">
                No reviews yet for this stylist&hellip;
              </p>
              <p className="text-[11px] mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(154,123,109,0.35)' }}>
                Be the first to share your experience
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
