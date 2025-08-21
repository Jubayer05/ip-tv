"use client";
import TrendingCommon from "@/components/ui/TrendingCommon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const TrendingContentSlider = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original text constants
  const ORIGINAL_CONTENT_ITEMS = [
    {
      id: 1,
      title: "Loki | Season 2",
      poster: "/movies/1.jpg",
      rating: "8.2/10",
      year: "2023",
      genres: ["Action", "TV Show", "United States"],
    },
    {
      id: 2,
      title: "The Mandalorian",
      poster: "/movies/2.jpg",
      rating: "8.7/10",
      year: "2019",
      genres: ["Action", "Sci-Fi", "United States"],
    },
    {
      id: 3,
      title: "Stranger Things",
      poster: "/movies/3.jpg",
      rating: "8.8/10",
      year: "2016",
      genres: ["Supernatural", "Thriller", "United States"],
    },
    {
      id: 4,
      title: "House of the Dragon",
      poster: "/movies/4.jpg",
      rating: "8.4/10",
      year: "2022",
      genres: ["Fantasy", "Drama", "United States"],
    },
    {
      id: 5,
      title: "Wednesday",
      poster: "/movies/5.jpg",
      rating: "8.1/10",
      year: "2022",
      genres: ["Dark Comedy", "Mystery", "United States"],
    },
    {
      id: 6,
      title: "The Witcher",
      poster: "/movies/6.jpg",
      rating: "8.2/10",
      year: "2019",
      genres: ["Fantasy", "Adventure", "United States"],
    },
  ];

  const ORIGINAL_TV_SHOWS = [
    {
      id: 1,
      title: "The Morning Show",
      poster: "/movies/tv-1.jpg",
      rating: "8.2/10",
      year: "2023",
      genres: ["Action", "TV Show", "United States"],
    },
    {
      id: 2,
      title: "TV Show name",
      poster: "/movies/tv-2.jpg",
      rating: "8.2/10",
      year: "2023",
      genres: ["Action", "TV Show", "United States"],
    },
    {
      id: 3,
      title: "TV Show name",
      poster: "/movies/tv-3.jpg",
      rating: "8.2/10",
      year: "2023",
      genres: ["Action", "TV Show", "United States"],
    },
    {
      id: 4,
      title: "TV Show name",
      poster: "/movies/tv-4.webp",
      rating: "8.2/10",
      year: "2023",
      genres: ["Action", "TV Show", "United States"],
    },
    {
      id: 5,
      title: "TV Show name",
      poster: "/movies/tv-5.webp",
      rating: "8.2/10",
      year: "2023",
      genres: ["Action", "TV Show", "United States"],
    },
  ];

  const ORIGINAL_CHANNELS = [
    {
      id: 1,
      title: "CNN",
      poster: "/movies/channel-1.png",
      category: "News Channel",
    },
    {
      id: 2,
      title: "Fox Entertainment",
      poster: "/movies/channel-2.jpg",
      category: "Entertainment Channel",
    },
    {
      id: 3,
      title: "Global News",
      poster: "/movies/channel-3.png",
      category: "News Channel",
    },
    {
      id: 4,
      title: "Golf",
      poster: "/movies/channel-4.jpg",
      category: "News Channel",
    },
    {
      id: 5,
      title: "Fuse TV",
      poster: "/movies/channel-5.jpg",
      category: "News Channel",
    },
  ];

  const ORIGINAL_SPORTS = [
    {
      id: 1,
      title: "NBA",
      poster: "/movies/sport-1.jpg",
    },
    {
      id: 2,
      title: "NBA",
      poster: "/movies/sport-2.jpg",
    },
    {
      id: 3,
      title: "NBA",
      poster: "/movies/sport-3.jpg",
    },
    {
      id: 4,
      title: "NBA",
      poster: "/movies/sport-4.jpg",
    },
    {
      id: 5,
      title: "NBA",
      poster: "/movies/sport-5.jpg",
    },
  ];

  const ORIGINAL_SECTION_TITLES = {
    movies: "Movies",
    tvShows: "TV SHOWS",
    liveChannels: "LIVE CHANNELS",
    latestSportEvents: "Latest Sport Events",
  };

  const ORIGINAL_BUTTON_TEXTS = {
    exploreMoreMovies: "Explore More Movies",
    exploreMoreTVShows: "Explore More TV Shows",
    exploreMoreLiveChannels: "Explore More Live Channels",
    exploreMore: "Explore More",
  };

  // State for translated content
  const [contentItems, setContentItems] = useState(ORIGINAL_CONTENT_ITEMS);
  const [tvShows, setTvShows] = useState(ORIGINAL_TV_SHOWS);
  const [channels, setChannels] = useState(ORIGINAL_CHANNELS);
  const [sports, setSports] = useState(ORIGINAL_SPORTS);
  const [sectionTitles, setSectionTitles] = useState(ORIGINAL_SECTION_TITLES);
  const [buttonTexts, setButtonTexts] = useState(ORIGINAL_BUTTON_TEXTS);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        // Translate all titles from different sections
        const allTitles = [
          ...ORIGINAL_CONTENT_ITEMS.map((item) => item.title),
          ...ORIGINAL_TV_SHOWS.map((item) => item.title),
          ...ORIGINAL_CHANNELS.map((item) => item.title),
          ...ORIGINAL_SPORTS.map((item) => item.title),
        ];

        // Translate section titles and button texts
        const sectionAndButtonTexts = [
          ...Object.values(ORIGINAL_SECTION_TITLES),
          ...Object.values(ORIGINAL_BUTTON_TEXTS),
        ];

        const allTexts = [...allTitles, ...sectionAndButtonTexts];
        const translated = await translate(allTexts);

        if (!isMounted) return;

        const titlesCount = allTitles.length;
        const sectionButtonCount = sectionAndButtonTexts.length;

        // Update content items with translated titles
        const updatedContentItems = ORIGINAL_CONTENT_ITEMS.map(
          (item, index) => ({
            ...item,
            title: translated[index],
          })
        );

        // Update TV shows with translated titles
        const updatedTvShows = ORIGINAL_TV_SHOWS.map((item, index) => ({
          ...item,
          title: translated[index + ORIGINAL_CONTENT_ITEMS.length],
        }));

        // Update channels with translated titles
        const updatedChannels = ORIGINAL_CHANNELS.map((item, index) => ({
          ...item,
          title:
            translated[
              index + ORIGINAL_CONTENT_ITEMS.length + ORIGINAL_TV_SHOWS.length
            ],
        }));

        // Update sports with translated titles
        const updatedSports = ORIGINAL_SPORTS.map((item, index) => ({
          ...item,
          title:
            translated[
              index +
                ORIGINAL_CONTENT_ITEMS.length +
                ORIGINAL_TV_SHOWS.length +
                ORIGINAL_CHANNELS.length
            ],
        }));

        // Update section titles and button texts
        const translatedSectionAndButton = translated.slice(titlesCount);
        const [
          tMovies,
          tTvShows,
          tLiveChannels,
          tLatestSportEvents,
          tExploreMoreMovies,
          tExploreMoreTVShows,
          tExploreMoreLiveChannels,
          tExploreMore,
        ] = translatedSectionAndButton;

        setSectionTitles({
          movies: tMovies,
          tvShows: tTvShows,
          liveChannels: tLiveChannels,
          latestSportEvents: tLatestSportEvents,
        });

        setButtonTexts({
          exploreMoreMovies: tExploreMoreMovies,
          exploreMoreTVShows: tExploreMoreTVShows,
          exploreMoreLiveChannels: tExploreMoreLiveChannels,
          exploreMore: tExploreMore,
        });

        setContentItems(updatedContentItems);
        setTvShows(updatedTvShows);
        setChannels(updatedChannels);
        setSports(updatedSports);
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const handleItemClick = (item) => {
    console.log("Content clicked:", item);
    // Add your navigation or modal logic here
    // Example: router.push(`/watch/${item.id}`);
  };

  const handleButtonClick = () => {
    console.log("View all content clicked");
    // Add your navigation logic here
    // Example: router.push('/browse');
  };

  return (
    <>
      <TrendingCommon
        title={sectionTitles.movies}
        buttonText={buttonTexts.exploreMoreMovies}
        icon="/icons/movies.png"
        items={contentItems}
        cardType="detailed"
        slidesToShow={5}
        autoplay={true}
        autoPlayDuration={3000}
        showButton={true}
        onItemClick={handleItemClick}
        onButtonClick={handleButtonClick}
        containerClassName="mt-10"
        className=""
      />
      <TrendingCommon
        title={sectionTitles.tvShows}
        buttonText={buttonTexts.exploreMoreTVShows}
        icon="/icons/tv_show.png"
        items={tvShows}
        cardType="detailed"
        slidesToShow={5}
        autoplay={true}
        autoPlayDuration={3200}
        showButton={true}
        onItemClick={handleItemClick}
        onButtonClick={handleButtonClick}
        containerClassName="mt-10"
        className=""
      />

      <TrendingCommon
        title={sectionTitles.liveChannels}
        buttonText={buttonTexts.exploreMoreLiveChannels}
        icon="/icons/live.png"
        items={channels}
        cardType="channel"
        slidesToShow={5}
        autoplay={true}
        autoPlayDuration={3200}
        showButton={true}
        onItemClick={handleItemClick}
        onButtonClick={handleButtonClick}
        containerClassName="mt-10"
        className=""
      />

      <TrendingCommon
        title={sectionTitles.latestSportEvents}
        buttonText={buttonTexts.exploreMore}
        icon="/icons/sports.png"
        items={sports}
        cardType="sports"
        slidesToShow={5}
        autoplay={true}
        autoPlayDuration={3200}
        showButton={true}
        onItemClick={handleItemClick}
        onButtonClick={handleButtonClick}
        containerClassName="bg-[#0F1C23] pb-[160px] pt-16 translate-y-[100px] -mt-10"
        className=""
      />
    </>
  );
};

export default TrendingContentSlider;
