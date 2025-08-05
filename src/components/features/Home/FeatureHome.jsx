import { Film, Monitor, Zap } from "lucide-react";
import Image from "next/image";

const FeatureHome = ({ featureAbout = false }) => {
  return (
    <div
      className={`min-h-screen  ${
        featureAbout ? "mt-14 md:mt-0" : "bg-black pt-12 -mt-2"
      } text-white overflow-hidden `}
    >
      <div className="relative flex items-center justify-center min-h-screen px-4 md:px-8 lg:px-16">
        {/* Main content container */}
        <div className="relative z-10 max-w-7xl w-full grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Image with decorative elements */}
          <div className="relative flex justify-center lg:justify-start bg-primary rounded-4xl order-2 md:order-1">
            <Image
              src="/background/feature.png"
              width={400}
              height={500}
              alt="hero-image"
              className="rounded-3xl w-full h-[300px] sm:h-[400px] md:h-[530px] object-cover"
            />
          </div>

          {/* Right side - Content */}
          <div className="space-y-8 text-left lg:text-left order-1 md:order-2">
            {/* Main heading */}
            <div className="space-y-4">
              <h1
                className={`text-2xl md:text-4xl text-left md:text-center text-white font-bold leading-tight ${
                  featureAbout ? "" : "md:text-5xl"
                }`}
              >
                WATCH WHAT YOU LOVE, ANYTIME, ANYWHERE
              </h1>

              <p className="text-gray-300 font-secondary text-xs md:text-xl text-left md:text-center leading-relaxed max-w-2xl">
                Our multiple 99% uptime servers are strategically located across
                the globe, ensuring seamless streaming no matter where you are.
                From the Americas to Europe, Asia, and beyond — we've got you
                covered for the ultimate viewing experience.
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-6">
              {/* Massive Movie Library */}
              <div className="flex items-center space-x-4 justify-start lg:justify-start">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                  <Film className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Massive Movie Library
                  </h3>
                  <p className="text-gray-400 text-xs md:text-base  font-secondary">
                    From classics to the latest releases
                  </p>
                </div>
              </div>

              {/* HD & 4K Streaming */}
              <div className="flex items-center space-x-4 justify-start lg:justify-start">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30">
                  <div className="text-yellow-400 font-bold text-sm">4K</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    HD & 4K Streaming
                  </h3>
                  <p className="text-gray-400 text-xs md:text-base  font-secondary">
                    Crystal-clear quality, every time
                  </p>
                </div>
              </div>

              {/* No Contracts, No Hidden Fees */}
              <div className="flex items-center space-x-4 justify-start lg:justify-start">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    No Contracts, No Hidden Fees
                  </h3>
                  <p className="text-gray-400 text-xs md:text-base  font-secondary">
                    Cancel anytime
                  </p>
                </div>
              </div>

              {/* Works on Any Device */}
              <div className="flex items-center space-x-4 justify-start lg:justify-start">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                  <Monitor className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Works on Any Device
                  </h3>
                  <p className="text-gray-400 text-xs md:text-base  font-secondary">
                    Watch on your TV, laptop, phone, or tablet
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureHome;
