"use client";

import PolygonUpperLine from "@/components/ui/polygonUpperLine";
import { Play, Plus, Share2 } from "lucide-react";
import { useState } from "react";
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
            <div key={slide.id} className="relative h-[550px]">
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
              <div className="relative z-10 h-full flex items-center px-6 md:px-12 lg:px-20">
                <div className="max-w-2xl text-white">
                  {/* Title */}
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                    {slide.title}
                  </h1>

                  {/* Meta Information */}
                  <div className="flex items-center gap-4 mb-6 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-medium">
                        {slide.rating}
                      </span>
                    </div>

                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                      {slide.status}
                    </span>

                    <span className="text-sm font-medium">{slide.year}</span>

                    <div className="flex items-center gap-2">
                      {slide.genres.map((genre, index) => (
                        <span key={index} className="text-sm text-gray-300">
                          {genre}
                          {index < slide.genres.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 max-w-xl">
                    {slide.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors duration-200">
                      <Play className="w-5 h-5" fill="currentColor" />
                      Watch Now
                    </button>

                    <button className="flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-full font-medium hover:border-white hover:bg-white/10 transition-all duration-200">
                      <Plus className="w-5 h-5" />
                      My Wishlist
                    </button>

                    <button className="p-3 border border-white/30 text-white rounded-full hover:border-white hover:bg-white/10 transition-all duration-200">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </PolygonUpperLine>
        ))}
      </Slider>

      {/* Custom Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-3">
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
                <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
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
