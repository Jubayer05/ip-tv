import Button from "@/components/ui/button";
import PolygonUpperLine from "@/components/ui/polygonUpperLine";
import Image from "next/image";

const Error404Page = () => {
  return (
    <PolygonUpperLine fullWidth>
      <div className="min-h-screen translate-y-20 -mt-12 relative overflow-hidden flex items-center justify-center px-4 sm:px-6 md:px-8">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full"
          style={{
            backgroundImage: "url('/background/banner_bg.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/85 bg-opacity-70"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
          <Image
            src="/background/404.png"
            alt="404"
            width={350}
            height={350}
            className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] lg:w-[350px] lg:h-[350px] mx-auto object-cover"
          />
          {/* Main Heading */}
          <h1 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 tracking-wide mt-6 sm:mt-8 md:mt-10 px-2">
            OOPS... LOOKS LIKE YOU'RE LOST IN THE STREAM.
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-xs sm:text-sm md:text-base mb-6 sm:mb-8 leading-relaxed font-secondary px-2 sm:px-4">
            The page you're looking for doesn't exist or has been moved.{" "}
            <br className="hidden sm:block" />
            But don't worry—you're just one click away from thousands of movies,
            channels, and good vibes. 📺✨
          </p>

          {/* Go Back Button */}
          <Button className="text-xs sm:text-sm md:text-base px-4 sm:px-6 py-2 sm:py-3">
            Go Back to Home
          </Button>
        </div>
      </div>
    </PolygonUpperLine>
  );
};

export default Error404Page;
