"use client";
import TrendingCommon from "@/components/ui/TrendingCommon";

const TrendingContentSlider = () => {
  // Sample content data for the slider
  const contentItems = [
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

  const tvShows = [
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

  const channels = [
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

  const sports = [
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
        title="Movies"
        buttonText="Explore More Movies"
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
        title="TV SHOWS"
        buttonText="Explore More TV Shows"
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
        title="LIVE CHANNELS"
        buttonText="Explore More Live Channels"
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
        title="Latest Sport Events"
        buttonText="Explore More"
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
