import Polygon from "@/components/ui/polygon";

const KnowledgeBaseBanner = () => {
  return (
    <Polygon
      imageBg="/background/blog_bg.webp"
      fullWidth={true}
      className="h-[450px] md:h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="polygon_heading">
            Everything You Need to Know—All in One Place
          </h1>

          <p className="polygon_paragraph">
            Welcome to the Knowledge Base, your go-to resource hub for all
            things IPTV. Whether you're a first-time user, reseller, or
            long-time subscriber, this section is packed with helpful guides,
            FAQs, tutorials, and troubleshooting tips to make your experience
            smooth and seamless.
          </p>
        </div>
      </div>
    </Polygon>
  );
};

export default KnowledgeBaseBanner;
