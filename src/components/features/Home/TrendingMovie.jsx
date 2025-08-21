"use client";
import Button from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const TrendingMovies = () => {
  const { language, translate } = useLanguage();

  const ORIGINAL_HEADING = "Trending Movies";
  const ORIGINAL_BUTTON = "Get More Movies";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [buttonText, setButtonText] = useState(ORIGINAL_BUTTON);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const items = [ORIGINAL_HEADING, ORIGINAL_BUTTON];
      const translated = await translate(items);
      if (!isMounted) return;

      const [tHeading, tButtonText] = translated;
      setHeading(tHeading);
      setButtonText(tButtonText);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const movies = [
    {
      id: 1,
      title: "Black Panther",
      poster: "/movies/1.jpg",
      isHot: false,
    },
    {
      id: 2,
      title: "Star Wars: The Force Awakens",
      poster: "/movies/2.jpg",
      isHot: true,
    },
    {
      id: 3,
      title: "Agent",
      poster: "/movies/3.jpg",
      isHot: false,
    },
    {
      id: 4,
      title: "Shadow and Bone",
      poster: "/movies/4.jpg",
      isHot: true,
    },
    {
      id: 5,
      title: "The Legend",
      poster: "/movies/5.jpg",
      isHot: false,
    },
    {
      id: 6,
      title: "Another Movie",
      poster: "/movies/6.jpg",
      isHot: false,
    },
  ];

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
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
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 text-white 
        rounded-full flex items-center justify-center transition-all duration-300
         transform hover:scale-110 border border-[rgba(255,255,255,0.49)] ${
           direction === "next" ? "right-4" : "left-4"
         }`}
      style={{ ...style, display: "flex" }}
    >
      {direction === "next" ? (
        <ChevronRight className="w-6 h-6 " />
      ) : (
        <ChevronLeft className="w-6 h-6" />
      )}
    </button>
  );

  const updatedSettings = {
    ...settings,
    nextArrow: <CustomArrow direction="next" />,
    prevArrow: <CustomArrow direction="prev" />,
  };

  return (
    <div className="container text-white py-8 px-4 md:px-8 lg:px-12 mt-10">
      <div className="">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 sm:gap-0">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wider uppercase text-center sm:text-left">
            {heading}
          </h2>
          <Button className="bg-white text-black px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-medium hover:bg-gray-200 transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
            {buttonText} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Movie Carousel */}
        <div className="relative">
          <Slider {...updatedSettings}>
            {movies.map((movie) => (
              <div key={movie.id} className="px-2">
                <div className="relative group cursor-pointer">
                  {/* Movie Poster */}
                  <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-[2/3] shadow-lg">
                    <Image
                      width={100}
                      height={200}
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Hot Badge */}
                    {movie.isHot && (
                      <div className="absolute top-3 right-3 bg-cyan-400 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        Hot
                      </div>
                    )}
                  </div>

                  {/* Movie Title */}
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-sm font-medium text-white truncate">
                      {movie.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
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

export default TrendingMovies;
