"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

// Sample movie data
const movies = [
  {
    id: 1,
    title: "Interstellar",
    image: "/movies/trailer-1.jpg",
    tagline: "Mankind's next step will be our greatest",
  },
  {
    id: 3,
    title: "Inception",
    image: "/movies/trailer-2.jpg",
    tagline: "Your mind is the scene of the crime",
  },
  {
    id: 4,
    title: "The Matrix",
    image: "/movies/trailer-3.jpg",
    tagline: "Welcome to the real world",
  },
  {
    id: 5,
    title: "Blade Runner",
    image: "/movies/trailer-1.jpg",
    tagline: "More human than human",
  },
];

const LatestTrailers = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentMovie, setCurrentMovie] = useState(movies[0]);

  const CustomArrow = ({ className, style, onClick, direction }) => (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/50 hover:bg-black/70 text-white 
        rounded-full flex items-center justify-center transition-all duration-300
         transform hover:scale-110 border border-[rgba(255,255,255,0.49)] ${
           direction === "next"
             ? "-right-6 lg:-right-16"
             : "-left-6 lg:-left-16"
         }`}
      style={{ ...style, display: "flex" }}
    >
      {direction === "next" ? (
        <ChevronRight className="w-6 h-6" />
      ) : (
        <ChevronLeft className="w-6 h-6" />
      )}
    </button>
  );

  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    // centerPadding: "60px",
    slidesToShow: 3,
    speed: 500,
    focusOnSelect: true,
    arrows: true,
    dots: false,
    nextArrow: <CustomArrow direction="next" />,
    prevArrow: <CustomArrow direction="prev" />,
    beforeChange: (current, next) => {
      setCurrentSlide(next);
      setCurrentMovie(movies[next]);
    },
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: "40px",
        },
      },
    ],
  };

  return (
    <div className="bg-black px-10 py-8">
      <div className="container mx-auto">
        {/* Heading */}
        <h1 className="text-center text-white text-3xl md:text-4xl font-bold mb-8 leading-tight">
          WATCH LATEST <span className="text-cyan-400">TRAILERS</span>
        </h1>

        <style jsx>{`
          .slick-slider {
            position: relative;
            overflow: visible !important;
          }

          .slick-list {
            overflow: visible !important;
          }

          .slick-track {
            display: flex !important;
            align-items: center;
          }

          .slick-slide {
            padding: 0 15px;
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform: scale(0.7);
            opacity: 0.3;
            z-index: 1;
          }

          .slick-slide.slick-center {
            transform: scale(1.2);
            opacity: 1;
            z-index: 10;
          }

          .slick-prev,
          .slick-next {
            display: none !important;
          }

          /* Hide non-center slides content */
          .slick-slide:not(.slick-center) .movie-info,
          .slick-slide:not(.slick-center) .play-button {
            opacity: 0;
            pointer-events: none;
          }

          .slick-slide.slick-center .movie-info,
          .slick-slide.slick-center .play-button {
            opacity: 1;
            pointer-events: auto;
          }

          /* Movie slider container */
          .movie-slider {
            position: relative;
            margin: 0 4rem;
            height: 320px;
            overflow: visible;
          }

          @media (max-width: 1024px) {
            .movie-slider {
              margin: 0 2rem;
              height: 280px;
            }
          }

          @media (max-width: 768px) {
            .slick-slide {
              transform: scale(0.8);
            }

            .slick-slide.slick-center {
              transform: scale(1.1);
            }

            .movie-slider {
              margin: 0 1rem;
              height: 240px;
            }
          }
        `}</style>

        <div className="movie-slider mt-8 relative">
          {/* Dynamic Current Movie Overlay */}
          <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[46%] w-[600px] bg-gradient-to-t from-black/80 z-20 border-3 border-cyan-400 rounded-2xl overflow-hidden transition-all duration-500">
            <div className="relative">
              <Image
                src={currentMovie.image}
                alt={currentMovie.title}
                width={600}
                height={400}
                className="object-cover w-[600px] h-[400px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Current Movie Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-3xl font-bold mb-3 tracking-wider drop-shadow-lg">
                  {currentMovie.title}
                </h3>
                <p className="text-lg text-gray-200 opacity-90 drop-shadow-md">
                  {currentMovie.tagline}
                </p>
              </div>

              {/* Enhanced Play Button for Current Movie */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 rounded-full flex items-center justify-center shadow-xl shadow-cyan-500/60 hover:shadow-cyan-400/80 hover:scale-110 transition-all duration-300 cursor-pointer">
                  <svg
                    className="w-8 h-8 text-white ml-1 drop-shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 5v10l8-5-8-5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <Slider {...settings}>
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                className={`px-2 transition-all duration-500 ${
                  index === currentSlide ? "z-20" : "z-1"
                }`}
              >
                <div
                  className={`movie-card relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-all duration-500 h-80 ${
                    index === currentSlide
                      ? "border-3 border-cyan-400 shadow-2xl shadow-cyan-400/30 hover:shadow-cyan-400/50"
                      : "border-transparent"
                  }`}
                >
                  <div className="relative h-full">
                    <Image
                      src={movie.image}
                      alt={movie.title}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Movie Info Overlay */}
                    <div className="movie-info absolute bottom-0 left-0 right-0 p-4 text-white transition-all duration-300">
                      <h3 className="text-xl font-bold mb-2 tracking-wider">
                        {movie.title}
                      </h3>
                      <p className="text-sm text-gray-300 opacity-80">
                        {movie.tagline}
                      </p>
                    </div>

                    {/* Play Button - Only visible on center slide */}
                    <div
                      className={`play-button absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                        index === currentSlide
                          ? "opacity-100 scale-110"
                          : "opacity-0 scale-90"
                      }`}
                    >
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                          index === currentSlide
                            ? "bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/50"
                            : "bg-cyan-500"
                        }`}
                      >
                        <svg
                          className="w-6 h-6 text-white ml-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M8 5v10l8-5-8-5z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default LatestTrailers;
