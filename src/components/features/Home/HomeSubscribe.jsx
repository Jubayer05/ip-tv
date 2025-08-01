import Button from "@/components/ui/button";
import Polygon from "@/components/ui/polygon";
import Image from "next/image";

const HomeSubscribe = () => {
  return (
    <div className="mt-20">
      <Polygon>
        <div className="container mx-auto flex items-center justify-between h-[560px] relative">
          {/* Left Content */}
          <div className="flex-1 max-w-2xl pl-14">
            {/* Main heading */}
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-6 leading-tight text-left">
              Start Streaming for Less –
              <br />
              <span className="text-primary">Sign Up Today!</span>
            </h1>

            <p className="text-left text-white text-[16px] font-medium mb-8 leading-relaxed font-secondary max-w-xl">
              Why pay more when you can stream smarter? Cheap Stream brings you
              thousands of movies at the best price. Whether you love action,
              drama, comedy, or horror, we have something for everyone—all in HD
              & 4K quality with zero buffering.
            </p>

            {/* Email input and button */}
            <div className="flex flex-col font-secondary sm:flex-row items-start gap-4 max-w-md relative">
              <div className="relative w-full sm:flex-1">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-6 pr-32 py-4 bg-[rgba(128,128,128,0.7)] border border-gray-600 rounded-full text-white placeholder-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <Button size="lg">Get Started</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image with Custom Gradient Overlay */}
          <div className="relative flex-shrink-0">
            <Image
              src="/background/subscribe.jpg"
              alt="subscribe"
              width={400}
              height={560}
              className="w-[400px] h-[560px] object-cover rounded-lg"
            />

            {/* Custom Gradient Overlay */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background:
                  "linear-gradient(270deg, rgba(0, 0, 0, 0) 60.85%, #000000 88.64%)",
              }}
            ></div>
          </div>
        </div>
      </Polygon>
    </div>
  );
};

export default HomeSubscribe;
