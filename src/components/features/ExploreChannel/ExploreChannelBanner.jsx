"use client";

import PolygonUpperLine from "@/components/ui/polygonUpperLine";
import { useLanguage } from "@/contexts/LanguageContext";
import { Circle, Play, Plus, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const ExploreChannelBanner = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const [heading1, setHeading1] = useState("Explore Our");
  const [heading2, setHeading2] = useState("Channel Collection");
  const [paragraph, setParagraph] = useState(
    "Discover thousands of channels, movies, and TV shows from around the world. From live sports to blockbuster movies, we have something for everyone."
  );
  const [watchNow, setWatchNow] = useState("Watch Now");
  const [myWishlist, setMyWishlist] = useState("My Wishlist");

  useEffect(() => {
    // Fetch banner content from settings
    const fetchBannerContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.banners?.explore) {
          const exploreBanner = data.data.banners.explore;
          setHeading1(exploreBanner.heading1 || heading1);
          setHeading2(exploreBanner.heading2 || heading2);
          setParagraph(exploreBanner.paragraph || paragraph);
          setWatchNow(exploreBanner.watchNow || watchNow);
          setMyWishlist(exploreBanner.myWishlist || myWishlist);
        }
      } catch (error) {
        console.error("Failed to fetch banner content:", error);
      }
    };

    fetchBannerContent();
  }, []);

  // Original text constants
  const ORIGINAL_SLIDES = [
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

  const ORIGINAL_BUTTON_TEXTS = {
    watchNow: "Watch Now",
    myWishlist: "My Wishlist",
  };

  // State for translated content
  const [slides, setSlides] = useState(ORIGINAL_SLIDES);
  const [buttonTexts, setButtonTexts] = useState(ORIGINAL_BUTTON_TEXTS);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        // Translate slide titles and descriptions
        const slideTexts = ORIGINAL_SLIDES.flatMap((slide) => [
          slide.title,
          slide.description,
        ]);

        // Translate button texts
        const buttonTextsArray = [
          ORIGINAL_BUTTON_TEXTS.watchNow,
          ORIGINAL_BUTTON_TEXTS.myWishlist,
        ];

        const allTexts = [...slideTexts, ...buttonTextsArray];
        const translated = await translate(allTexts);

        if (!isMounted) return;

        // Update slides with translated content
        const updatedSlides = ORIGINAL_SLIDES.map((slide, index) => ({
          ...slide,
          title: translated[index * 2],
          description: translated[index * 2 + 1],
        }));

        // Update button texts
        const [tWatchNow, tMyWishlist] = translated.slice(-2);
        setButtonTexts({
          watchNow: tWatchNow,
          myWishlist: tMyWishlist,
        });

        setSlides(updatedSlides);
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

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
                    <Circle
                      className="text-white/30 text-xs sm:text-sm"
                      fill="currentColor"
                    />

                    <span className="px-2 sm:px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                      {slide.status}
                    </span>
                    <Circle
                      className="text-white/30 text-xs sm:text-sm"
                      fill="currentColor"
                    />
                    <span className="text-xs sm:text-sm font-medium text-white/60">
                      {slide.year}
                    </span>
                    <Circle
                      className="text-white/30 text-xs sm:text-sm"
                      fill="currentColor"
                    />
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
                      <Play
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="currentColor"
                      />
                      {buttonTexts.watchNow}
                    </button>

                    <button className="cursor-pointer flex items-center gap-1 sm:gap-2 border border-white/30 text-white px-3 sm:px-6 py-2 rounded-full font-medium hover:border-white bg-white/15 hover:bg-white/25 transition-all duration-200 text-xs sm:text-sm">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      {buttonTexts.myWishlist}
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
    </div>
  );
};

export default ExploreChannelBanner;
