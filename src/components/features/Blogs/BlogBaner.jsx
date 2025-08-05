import Polygon from "@/components/ui/polygon";

const BlogBanner = () => {
  return (
    <Polygon
      imageBg="/background/blog_bg.webp"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-white text-4xl md:text-[40px] font-bold mb-3 leading-tight">
            IPTV Insights, Tips & Streaming News
          </h1>

          <p className="text-white text-[14px] font-medium mb-6 leading-tight font-secondary">
            Stay updated with the latest in IPTV technology, streaming trends,
            and expert guides. Explore tips, tutorials, and industry news to
            make the most of your IPTV experience.
          </p>
        </div>
      </div>
    </Polygon>
  );
};

export default BlogBanner;
