"use client";

import Button from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const AboutOurMission = () => {
  return (
    <div className="bg-black text-white p-8 relative overflow-hidden font-secondary">
      <div className="absolute w-full h-full flex items-center justify-around z-10">
        <Image
          src="/logos/cheap_stream_logo.png"
          alt="The Reverend Movie Poster"
          className="w-[250px] h-[250px] rounded-full -translate-y-10 -translate-x-10"
          width={1920}
          height={1080}
        />
      </div>
      <div className="container">
        {/* Movies Grid */}
        <div className="flex gap-5 items-center ">
          {/* Our Mission Section */}
          <div className="mb-16 w-[50%] z-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">OUR MISSION</h2>
            <p className="text-gray-300 text-sm mb-4 ">
              To make streaming easy, affordable, and accessible for
              everyone—everywhere.
            </p>
            <p className="text-gray-300 text-sm mb-8 ">
              Whether you're watching the latest blockbuster, catching the game
              live, or relaxing with a TV marathon, Cheap Stream brings the
              content you love straight to your screen.
            </p>
            <Link href="/sign-in">
              <Button size="md" className="cursor-pointer">
                Sign In
              </Button>
            </Link>
          </div>
          {/* The Reverend Movie */}
          <div className="relative rounded-4xl ml-auto">
            <div className="rounded-4xl overflow-hidden w-full h-full">
              <Image
                src="/movies/movie_1917.jpg"
                alt="The Reverend Movie Poster"
                className="w-[760px] h-[500px] object-cover"
                width={660}
                height={460}
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-black/40  rounded-4xl" />
          </div>
        </div>

        <div className="flex gap-5 items-center -mt-16">
          <div className="relative rounded-4xl ">
            <div className="rounded-4xl overflow-hidden w-full h-full">
              <Image
                src="/movies/movie_reverend.jpg"
                alt="The Reverend Movie Poster"
                className="w-[760px] h-[500px] object-cover"
                width={660}
                height={460}
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-black/40  rounded-4xl" />
          </div>

          <div className="space-y-8 w-[50%] mt-32 z-20">
            {/* Global Entertainment Section */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                GLOBAL ENTERTAINMENT, LOCAL FEEL
              </h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                From Hollywood hits to international channels, we've curated a
                global experience that still feels personal. Cheap Stream works
                on any device—TV, tablet, phone, or PC —so you can stream
                wherever you are.
              </p>
              <Link href="/sign-in">
                <Button>Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutOurMission;
