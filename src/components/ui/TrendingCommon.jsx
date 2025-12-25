"use client";
import Button from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, Circle } from "lucide-react";
import Image from "next/image";
import Slider from "react-slick";
import "@/styles/slick-minimal.css";

const TrendingCommon = ({
  title = "Trending Content",
  buttonText = "Get More",
  items = [],
  slidesToShow = 5,
  autoplay = true,
  showButton = true,
  onButtonClick,
  onItemClick,
  className = "",
  containerClassName = "",
  autoPlayDuration = 3000,
  icon = "",
  cardType = "default", // "default", "movie", "show", "channel", "detailed"
}) => {
  const defaultSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: autoplay,
    arrows: true,
    autoplaySpeed: autoPlayDuration,
    // Performance optimizations for Slick
    lazyLoad: 'progressive',
    waitForAnimate: false,
    useCSS: true,
    useTransform: true,
    cssEase: 'ease-out',
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: Math.min(4, slidesToShow),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, slidesToShow),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, slidesToShow),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const CustomArrow = ({ className, style, onClick, direction }) => (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/50 hover:bg-black/70 text-white
        rounded-full flex items-center justify-center transition-all duration-300
         transform hover:scale-110 border border-[rgba(255,255,255,0.49)] ${
           direction === "next" ? "right-2 sm:right-4" : "left-2 sm:left-4"
         }`}
      style={{ ...style, display: "flex" }}
      aria-label={direction === "next" ? "Next slide" : "Previous slide"}
    >
      {direction === "next" ? (
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      ) : (
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      )}
    </button>
  );

  const updatedSettings = {
    ...defaultSettings,
    nextArrow: <CustomArrow direction="next" />,
    prevArrow: <CustomArrow direction="prev" />,
  };

  const renderCard = (item) => {
    switch (cardType) {
      case "detailed":
        return (
          <div
            className="relative group cursor-pointer"
            onClick={() => onItemClick?.(item)}
          >
            {/* Poster */}
            <div className="relative overflow-hidden rounded-xl bg-gray-800 aspect-[2/3] shadow-lg">
              <Image
                width={300}
                height={450}
                src={item.poster || item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Content Info */}
            <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
              {/* Title */}
              <h3 className="text-white font-semibold font-secondary text-sm sm:text-lg md:text-xl leading-tight">
                {item.title}
              </h3>

              <div className="flex justify-start items-center gap-2 sm:gap-3 text-xs">
                {/* Rating */}
                {item.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-xs sm:text-sm">
                      ★
                    </span>
                    <span className="text-white/60 text-xs font-bold">
                      {item.rating}
                    </span>
                  </div>
                )}

                <Circle className="text-white/30 text-xs" fill="currentColor" />
                {/* Year */}
                {item.year && (
                  <div className="text-white/60 text-xs font-bold">
                    {item.year}
                  </div>
                )}
              </div>

              {/* Genres */}
              {item.genres && item.genres.length > 0 && (
                <div className="text-white/60 text-xs font-bold">
                  {item.genres.join(", ")}
                </div>
              )}
            </div>
          </div>
        );

      case "channel":
        return (
          <div
            className="relative group cursor-pointer"
            onClick={() => onItemClick?.(item)}
          >
            {/* Poster */}
            <div className="relative overflow-hidden rounded-lg bg-gray-800 shadow-lg">
              <Image
                width={300}
                height={450}
                src={item.poster || item.image}
                alt={item.title}
                className="w-full h-[150px] sm:h-[200px] md:h-[250px] object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Title */}
            <div className="mt-2 sm:mt-3 transition-opacity duration-300">
              <h3 className="text-sm sm:text-lg md:text-xl font-secondary font-bold text-white truncate">
                {item.title}
              </h3>
              <p className="text-xs font-secondary font-bold text-white/60 truncate">
                {item.title}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div
            className="relative group cursor-pointer"
            onClick={() => onItemClick?.(item)}
          >
            {/* Default Card */}
            <div className="relative overflow-hidden rounded-lg bg-gray-800 shadow-lg aspect-[2/3]">
              <Image
                width={300}
                height={200}
                src={item.image || item.poster}
                alt={item.title || item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`text-white py-4 sm:py-6 md:py-8 px-2 sm:px-4 ${containerClassName}`}
    >
      <div className={`container ${className}`}>
        {/* Header */}
        <div className="flex sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              src={icon}
              alt={title}
              width={30}
              height={30}
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
            />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-wider uppercase">
              {title}
            </h2>
          </div>
          {showButton && (
            <Button
              className="bg-white text-black px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full font-medium hover:bg-gray-200 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              onClick={onButtonClick}
            >
              {buttonText} <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          )}
        </div>

        {/* Content Carousel */}
        <div className="relative">
          {items.length > 0 ? (
            <Slider {...updatedSettings}>
              {items.map((item, index) => (
                <div key={item.id || index} className="px-1 sm:px-2">
                  {renderCard(item)}
                </div>
              ))}
            </Slider>
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-400">
              <p className="text-sm sm:text-base">No content available</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Slick Carousel Styles */}
      <style jsx global>{`
        .slick-prev,
        .slick-next {
          display: none !important;
        }

        .slick-track {
          display: flex;
          align-items: center;
        }

        .slick-slide {
          height: auto;
        }

        .slick-slide > div {
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default TrendingCommon;
