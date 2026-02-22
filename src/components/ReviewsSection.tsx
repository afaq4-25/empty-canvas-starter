import { useState, useRef, useEffect, useCallback } from 'react';
import { Star, CheckCircle2, Sparkles } from 'lucide-react';
import type { Artist, Review } from '@/types/salon';

interface ReviewsSectionProps {
  artists: Artist[];
  reviews: Review[];
  selectedArtist: string | null;
  onSelectArtist: (id: string | null) => void;
}

const ReviewsSection = ({ artists, reviews, selectedArtist, onSelectArtist }: ReviewsSectionProps) => {
  const [isJiggling, setIsJiggling] = useState(false);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);

  const tabRowRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const filteredReviews = reviews.filter((r) => {
    if (selectedArtist && r.artistId !== selectedArtist) return false;
    return true;
  });

  const currentArtist = artists.find((a) => a.id === selectedArtist);
  const avgRating = filteredReviews.length > 0
    ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1)
    : '0.0';

  const reviewPhotos = [
    'https://images.unsplash.com/photo-1585747860019-8e8e13c2e4f2?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=300&h=300&fit=crop',
  ];

  // Measure and position the sliding pill
  const updatePillPosition = useCallback(() => {
    const key = selectedArtist ?? '_all';
    const btn = buttonRefs.current.get(key);
    const row = tabRowRef.current;
    if (!btn || !row) return;

    const rowRect = row.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    setPillStyle({
      left: btnRect.left - rowRect.left - 6,
      width: btnRect.width + 12,
    });
  }, [selectedArtist]);

  useEffect(() => {
    updatePillPosition();
    window.addEventListener('resize', updatePillPosition);
    return () => window.removeEventListener('resize', updatePillPosition);
  }, [updatePillPosition]);

  // Trigger jiggle on artist change
  useEffect(() => {
    setIsJiggling(true);
    const timer = setTimeout(() => setIsJiggling(false), 600);
    return () => clearTimeout(timer);
  }, [selectedArtist]);

  const setRef = (key: string) => (el: HTMLDivElement | null) => {
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
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-xl text-truffle italic tracking-wide">Our Stylists</h2>
          <span className="text-[10px] font-sans font-semibold text-bronze uppercase tracking-[0.15em]">
            {filteredReviews.length} Review{filteredReviews.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ─── Jelly Tab Artist Selector ─── */}
        <div className="relative" ref={tabRowRef}>
          {/* Sliding pill background */}
          {pillStyle && (
            <div
              className="absolute top-0 rounded-[22px] pointer-events-none"
              style={{
                left: pillStyle.left,
                width: pillStyle.width,
                height: '100%',
                background: 'hsl(var(--champagne))',
                border: '2px solid hsl(var(--bronze) / 0.3)',
                boxShadow: '0 4px 20px -4px hsl(var(--bronze) / 0.2), inset 0 1px 0 hsl(30 60% 98% / 0.6)',
                transition: 'left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: isJiggling ? 'jelly 0.55s ease' : 'none',
                transformOrigin: 'bottom center',
                zIndex: 0,
              }}
            />
          )}

          <div className="flex gap-1 overflow-x-auto scrollbar-hide relative z-10">
            {/* "All" tab */}
            <div
              ref={setRef('_all')}
              onClick={() => handleSelect(null)}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer flex-shrink-0 select-none"
            >
              <div
                className={`rounded-full flex items-center justify-center font-sans font-bold text-[10px] tracking-wider transition-all duration-300 ${
                  !selectedArtist
                    ? 'w-12 h-12 bg-truffle text-champagne shadow-md'
                    : 'w-10 h-10 bg-muted text-muted-foreground'
                }`}
                style={
                  !selectedArtist && isJiggling
                    ? { animation: 'jelly 0.55s ease', transformOrigin: 'bottom center' }
                    : undefined
                }
              >
                ALL
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-[11px] font-sans font-semibold transition-colors duration-200 ${
                    !selectedArtist ? 'text-truffle' : 'text-muted-foreground'
                  }`}
                >
                  Everyone
                </span>
                <span className="text-[9px] font-sans text-bronze/60">All Artists</span>
              </div>
            </div>

            {/* Artist tabs */}
            {artists.map((artist) => {
              const isActive = selectedArtist === artist.id;
              return (
                <div
                  key={artist.id}
                  ref={setRef(artist.id)}
                  onClick={() => handleSelect(artist.id)}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-pointer flex-shrink-0 select-none"
                >
                  <div
                    className={`rounded-full overflow-hidden transition-all duration-300 ${
                      isActive
                        ? 'w-12 h-12 ring-2 ring-bronze shadow-md'
                        : 'w-10 h-10 opacity-50 grayscale-[30%]'
                    }`}
                    style={
                      isActive && isJiggling
                        ? { animation: 'jelly 0.55s ease', transformOrigin: 'bottom center' }
                        : undefined
                    }
                  >
                    <img
                      src={artist.avatar}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-[11px] font-sans font-semibold transition-colors duration-200 whitespace-nowrap ${
                        isActive ? 'text-truffle' : 'text-muted-foreground'
                      }`}
                    >
                      {artist.name}
                    </span>
                    <span className="text-[9px] font-sans text-bronze/60 whitespace-nowrap">
                      {artist.specialty}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Reviews Header ─── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="font-serif text-lg text-truffle">
          {currentArtist ? (
            <>
              {currentArtist.name.split('.')[0]}.{' '}
              <span className="text-bronze italic">Reviews</span>
            </>
          ) : (
            <>
              All <span className="text-bronze italic">Reviews</span>
            </>
          )}
        </h3>
        <div className="flex items-center gap-1.5 bg-champagne rounded-full px-3 py-1 border border-border">
          <Star size={12} className="text-bronze fill-bronze" />
          <span className="text-sm font-sans font-bold text-truffle">{avgRating}</span>
        </div>
      </div>

      {/* ─── Review Cards (Raw Feed) ─── */}
      <div className="space-y-3 px-4">
        {filteredReviews.map((review, index) => (
          <div
            key={review.id}
            className="bg-card rounded-[32px] p-5 border"
            style={{
              borderColor: 'hsl(var(--champagne))',
              animation: `fade-in-up 0.4s ease-out ${index * 100}ms both`,
            }}
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Letter Avatar */}
                <div className="w-11 h-11 rounded-full bg-champagne flex items-center justify-center flex-shrink-0 border border-border">
                  <span className="font-serif text-base font-semibold text-truffle">
                    {review.userName.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans font-semibold text-sm text-truffle">
                      {review.userName}
                    </span>
                    <CheckCircle2 size={14} className="text-bronze fill-bronze/20" />
                  </div>
                  {/* Star rating */}
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < review.rating
                            ? 'text-bronze fill-bronze'
                            : 'text-border fill-transparent'
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
              {/* Date */}
              <span className="text-[10px] font-sans text-bronze/60 uppercase tracking-wider whitespace-nowrap mt-1">
                {review.date}
              </span>
            </div>

            {/* Service tag */}
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-truffle uppercase tracking-wider bg-champagne border border-border px-3 py-1 rounded-full">
                <Sparkles size={10} className="text-bronze" />
                {review.service}
              </span>
            </div>

            {/* Review text */}
            <p className="text-[13px] font-sans text-truffle/75 leading-relaxed italic">
              &ldquo;{review.text}&rdquo;
            </p>

            {/* Customer photos */}
            {review.hasPhoto && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto scrollbar-hide -mx-1 px-1">
                {reviewPhotos.map((photo, i) => (
                  <div
                    key={i}
                    className="w-36 h-36 flex-shrink-0 rounded-3xl overflow-hidden shadow-sm"
                  >
                    <img
                      src={photo}
                      alt={`Review photo ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Helpful count */}
            {review.helpful > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <span className="text-[10px] font-sans text-bronze/50">
                  {review.helpful} found this helpful
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Empty state */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-16 px-8">
            <div className="w-16 h-16 rounded-full bg-champagne flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-bronze/40" />
            </div>
            <p className="font-serif text-base text-bronze/60 italic">
              No reviews yet for this stylist&hellip;
            </p>
            <p className="text-[11px] font-sans text-bronze/35 mt-2 max-w-[200px] mx-auto">
              Be the first to share your experience
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
