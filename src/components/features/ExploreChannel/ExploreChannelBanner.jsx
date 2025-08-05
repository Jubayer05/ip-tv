"use client";

import PolygonUpperLine from "@/components/ui/polygonUpperLine";
import { Plus, Share2 } from "lucide-react";
import { useState } from "react";
import { GoDotFill } from "react-icons/go";
import { IoPlaySharp } from "react-icons/io5";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const ExploreChannelBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sample movie/show data
  const slides = [
    {
      id: 1,
      title: "Loki | Season 2",
      rating: "8.2/10",
      status: "Ongoing",
      year: "2023",
      genres: ["Action", "TV Show", "United States"],
      description:
        "Loki navigates an ever-expanding and increasingly dangerous Multiverse in search of Sylvie, Judge Renslayer, Miss Minutes, and the truth of what it means to possess free will and glorious purpose.",
      backgroundImage: "/background/bg_slider_1.jpg",
    },
    {
      id: 2,
      title: "The Mandalorian | Season 3",
      rating: "8.7/10",
      status: "Completed",
      year: "2023",
      genres: ["Action", "Sci-Fi", "United States"],
      description:
        "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic, continue in this thrilling series.",
      backgroundImage: "/background/about_us_bg.webp",
    },
    {
      id: 3,
      title: "House of the Dragon",
      rating: "8.5/10",
      status: "Ongoing",
      year: "2024",
      genres: ["Drama", "Fantasy", "United States"],
      description:
        "The Targaryen civil war is at its peak. Dragons soar through burning skies as the realm tears itself apart in the most devastating conflict Westeros has ever seen.",
      backgroundImage: "/background/affiliate_bg.webp",
    },
  ];

  const settings = {
    dots: false, // We'll create custom dots
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: false,
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  return (
    <div className="relative overflow-hidden">
      <Slider {...settings} ref={(slider) => (window.sliderRef = slider)}>
        {slides.map((slide) => (
          <PolygonUpperLine fullWidth={true} showOnlyUpperLine={true}>
            <div
              key={slide.id}
              className="relative h-[300px] sm:h-[400px] md:h-[450px] lg:h-[550px]"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.backgroundImage})`,
                }}
              >
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-black/75"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex items-center px-4 sm:px-6 md:px-12 lg:px-20">
                <div className="max-w-3xl text-white">
                  {/* Title */}
                  <h1 className="polygon_heading text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                    {slide.title}
                  </h1>

                  {/* Meta Information */}
                  <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-xs sm:text-sm">
                        ★
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-white/60">
                        {slide.rating}
                      </span>
                    </div>
                    <GoDotFill className="text-white/30 text-xs sm:text-sm" />

                    <span className="px-2 sm:px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                      {slide.status}
                    </span>
                    <GoDotFill className="text-white/30 text-xs sm:text-sm" />
                    <span className="text-xs sm:text-sm font-medium text-white/60">
                      {slide.year}
                    </span>
                    <GoDotFill className="text-white/30 text-xs sm:text-sm" />
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      {slide.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="text-xs sm:text-sm text-white/60 font-bold"
                        >
                          {genre}
                          {index < slide.genres.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/75 font-medium text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 max-w-xl">
                    {slide.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <button className="cursor-pointer flex items-center gap-1 sm:gap-2 bg-white text-black px-3 sm:px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors duration-200 text-xs sm:text-sm">
                      <IoPlaySharp
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="currentColor"
                      />
                      Watch Now
                    </button>

                    <button className="cursor-pointer flex items-center gap-1 sm:gap-2 border border-white/30 text-white px-3 sm:px-6 py-2 rounded-full font-medium hover:border-white bg-white/15 hover:bg-white/25 transition-all duration-200 text-xs sm:text-sm">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      My Wishlist
                    </button>

                    <button className="cursor-pointer p-2 border border-white/30 text-white rounded-full hover:border-white transition-all duration-200 bg-white/15 hover:bg-white/25 text-xs sm:text-sm">
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </PolygonUpperLine>
        ))}
      </Slider>

      {/* Custom Indicators */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                goToSlide(index);
                window.sliderRef?.slickGoTo(index);
              }}
              className="group relative"
            >
              {/* Progress Container */}
              <div className="relative">
                {/* Background Line */}
                <div className="w-12 sm:w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                  {/* Progress Fill */}
                  <div
                    className={`h-full bg-white rounded-full transition-all duration-300 ${
                      currentSlide === index ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreChannelBanner;
