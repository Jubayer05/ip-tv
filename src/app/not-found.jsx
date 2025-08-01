import Button from "@/components/ui/button";
import Image from "next/image";

const Error404Page = () => {
  return (
    <div className="min-h-screen translate-y-20 -mt-12 relative overflow-hidden flex items-center justify-center">
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
        {/* <Image
          src="/lines/upper_line.png"
          alt="404"
          width={1200}
          height={2000}
          className="w-full mx-auto object-cover z-100 absolute -top-18"
        /> */}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/85 bg-opacity-70"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <Image
          src="/background/404.png"
          alt="404"
          width={350}
          height={350}
          className="w-[350px] mx-auto object-cover"
        />
        {/* Main Heading */}
        <h1 className="text-white text-3xl md:text-4xl font-bold mb-4 tracking-wide mt-10">
          OOPS... LOOKS LIKE YOU'RE LOST IN THE STREAM.
        </h1>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-8 leading-relaxed font-secondary">
          The page you're looking for doesn't exist or has been moved. <br />{" "}
          But don't worry—you're just one click away from thousands of movies,
          channels, and good vibes. 📺✨
        </p>

        {/* Go Back Button */}
        <Button>Go Back to Home</Button>
      </div>
    </div>
  );
};

export default Error404Page;
