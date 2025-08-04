"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Sample movie data
const movies = [
  {
    id: 1,
    title: "Interstellar",
    image: "/movies/trailer-1.jpg",
    tagline: "Mankind's next step will be our greatest",
    duration: "2h 49m",
    rating: "PG-13",
  },
  {
    id: 2,
    title: "Inception",
    image: "/movies/trailer-2.jpg",
    tagline: "Your mind is the scene of the crime",
    duration: "2h 28m",
    rating: "PG-13",
  },
  {
    id: 3,
    title: "The Matrix",
    image: "/movies/trailer-3.jpg",
    tagline: "Welcome to the real world",
    duration: "2h 16m",
    rating: "R",
  },
  {
    id: 4,
    title: "Blade Runner",
    image: "/movies/trailer-1.jpg",
    tagline: "More human than human",
    duration: "1h 57m",
    rating: "R",
  },
];

const LatestTrailers = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, movies.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Get the three slides to display (previous, current, next)
  const getVisibleSlides = () => {
    const prevIndex = (currentIndex - 1 + movies.length) % movies.length;
    const nextIndex = (currentIndex + 1) % movies.length;

    return [
      { ...movies[prevIndex], position: "prev" },
      { ...movies[currentIndex], position: "current" },
      { ...movies[nextIndex], position: "next" },
    ];
  };

  const visibleSlides = getVisibleSlides();

  return (
    <section
      className="bg-black text-white overflow-hidden w-full pb-8 pt-12 sm:py-16 lg:py-20"
      aria-labelledby="latest-trailers-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <header className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2
            id="latest-trailers-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-wide"
          >
            WATCH LATEST{" "}
            <span className="text-cyan-400 bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text">
              TRAILERS
            </span>
          </h2>
        </header>

        {/* Custom Carousel */}
        <div className="relative w-full max-w-7xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous trailer"
            className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 md:-left-12 lg:-left-16 
            xl:-left-20 z-30 w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 
            xl:h-16 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center
             justify-center transition-all duration-300 transform hover:scale-110 border
              border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 
              focus:ring-offset-2 focus:ring-offset-black "
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next trailer"
            className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 md:-right-12 lg:-right-16 
            xl:-right-20 z-30 w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 
            xl:h-16 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center
             justify-center transition-all duration-300 transform hover:scale-110 border
              border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 
              focus:ring-offset-2 focus:ring-offset-black "
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" />
          </button>

          {/* Carousel Container */}
          <div className="relative h-[200px] sm:h-[300px] md:h-[600px] overflow-hidden -mt-14">
            <div className="flex items-center justify-center h-full">
              {visibleSlides.map((movie, index) => (
                <div
                  key={`${movie.id}-${movie.position}`}
                  className={`absolute transition-all duration-700 ease-out ${
                    movie.position === "current"
                      ? "z-20 scale-110 opacity-100"
                      : movie.position === "prev"
                      ? "z-10 scale-80 opacity-60 -translate-x-20 sm:-translate-x-24 md:-translate-x-80 lg:-translate-x-96 xl:-translate-x-[28rem]"
                      : "z-10 scale-80 opacity-60 translate-x-20 sm:translate-x-24 md:translate-x-80 lg:translate-x-96 xl:translate-x-[28rem]"
                  }`}
                >
                  <article
                    className={`group relative bg-gray-900 rounded-xl overflow-hidden cursor-pointer
                       transition-all duration-500 aspect-[16/10] sm:aspect-[4/3] md:aspect-[3/2]
                        w-[200px] sm:w-[300px] md:w-[500px] lg:w-[600px] xl:w-[700px]
                         ${
                           movie.position === "current"
                             ? "ring-2 ring-cyan-400 shadow-2xl shadow-cyan-400/30"
                             : "ring-1 ring-gray-700 hover:ring-cyan-400/50"
                         }`}
                    onClick={() =>
                      goToSlide(movies.findIndex((m) => m.id === movie.id))
                    }
                  >
                    <div className="relative h-full">
                      <Image
                        src={movie.image}
                        alt={`${movie.title} movie poster`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      {/* Movie Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-8 lg:p-10 xl:p-12">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 mb-1 sm:mb-2 md:mb-4 lg:mb-6">
                          <span className="px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 lg:px-5 lg:py-2 xl:px-6 xl:py-3 bg-cyan-400/20 text-cyan-400 text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl font-medium rounded-full border border-cyan-400/30">
                            {movie.rating}
                          </span>
                          <span className="text-gray-300 text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl">
                            {movie.duration}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 sm:mb-2 md:mb-3 lg:mb-4 tracking-wide line-clamp-1">
                          {movie.title}
                        </h4>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-300 opacity-80 line-clamp-2">
                          {movie.tagline}
                        </p>
                      </div>

                      {/* Play Button Overlay */}
                      <div
                        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                          movie.position === "current"
                            ? "opacity-100 scale-110"
                            : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
                        }`}
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center shadow-lg border border-white/20">
                          <svg
                            className="w-2 h-2 sm:w-3 sm:h-3 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path d="M8 5v10l8-5-8-5z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestTrailers;
