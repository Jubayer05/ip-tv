"use client";

import Button from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const AboutOurMission = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const ORIGINAL_MISSION_HEADING = "OUR MISSION";
  const ORIGINAL_MISSION_PARAGRAPH_1 =
    "To make streaming easy, affordable, and accessible for everyone—everywhere.";
  const ORIGINAL_MISSION_PARAGRAPH_2 =
    "Whether you're watching the latest blockbuster, catching the game live, or relaxing with a TV marathon, Cheap Stream brings the content you love straight to your screen.";
  const ORIGINAL_SIGN_IN_BUTTON = "Sign In";
  const ORIGINAL_GLOBAL_HEADING = "GLOBAL ENTERTAINMENT, LOCAL FEEL";
  const ORIGINAL_GLOBAL_PARAGRAPH =
    "From Hollywood hits to international channels, we've curated a global experience that still feels personal. Cheap Stream works on any device—TV, tablet, phone, or PC —so you can stream wherever you are.";

  const [missionHeading, setMissionHeading] = useState(
    ORIGINAL_MISSION_HEADING
  );
  const [missionParagraph1, setMissionParagraph1] = useState(
    ORIGINAL_MISSION_PARAGRAPH_1
  );
  const [missionParagraph2, setMissionParagraph2] = useState(
    ORIGINAL_MISSION_PARAGRAPH_2
  );
  const [signInButton, setSignInButton] = useState(ORIGINAL_SIGN_IN_BUTTON);
  const [globalHeading, setGlobalHeading] = useState(ORIGINAL_GLOBAL_HEADING);
  const [globalParagraph, setGlobalParagraph] = useState(
    ORIGINAL_GLOBAL_PARAGRAPH
  );

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_MISSION_HEADING,
        ORIGINAL_MISSION_PARAGRAPH_1,
        ORIGINAL_MISSION_PARAGRAPH_2,
        ORIGINAL_SIGN_IN_BUTTON,
        ORIGINAL_GLOBAL_HEADING,
        ORIGINAL_GLOBAL_PARAGRAPH,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tMissionHeading,
        tMissionParagraph1,
        tMissionParagraph2,
        tSignInButton,
        tGlobalHeading,
        tGlobalParagraph,
      ] = translated;

      setMissionHeading(tMissionHeading);
      setMissionParagraph1(tMissionParagraph1);
      setMissionParagraph2(tMissionParagraph2);
      setSignInButton(tSignInButton);
      setGlobalHeading(tGlobalHeading);
      setGlobalParagraph(tGlobalParagraph);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  return (
    <div className="bg-black text-white p-4 sm:p-6 md:p-8 relative overflow-hidden font-secondary">
      <div className="absolute w-full h-full flex items-center justify-center z-10 top-0 left-10">
        <Image
          src="/logos/cheap_stream_logo.png"
          alt="The Reverend Movie Poster"
          className="w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] md:w-[250px] md:h-[250px] rounded-full -translate-y-10 -translate-x-10"
          width={1920}
          height={1080}
        />
      </div>
      <div className="container">
        {/* Movies Grid */}
        <div className="flex gap-5 items-center flex-col sm:flex-row ">
          {/* Our Mission Section */}
          <div className="mb-0 md:mb-16 w-full sm:w-[50%] z-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {missionHeading}
            </h2>
            <p className="text-gray-300 text-sm mb-4 ">{missionParagraph1}</p>
            <p className="text-gray-300 text-sm mb-8 ">{missionParagraph2}</p>
            <Link href="/sign-in">
              <Button size="md" className="cursor-pointer">
                {signInButton}
              </Button>
            </Link>
          </div>
          {/* The Reverend Movie */}
          <div className="relative rounded-4xl ml-auto w-[50%] -mt-10 sm:mt-0">
            <div className="rounded-4xl overflow-hidden w-full h-full">
              <Image
                src="/movies/movie_1917.jpg"
                alt="The Reverend Movie Poster"
                className="w-[300px] h-[180px] sm:w-[400px] sm:h-[266px] md:w-[500px] md:h-[333px] lg:w-[760px] lg:h-[500px] object-cover"
                width={660}
                height={460}
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-black/40  rounded-4xl" />
          </div>
        </div>

        <div className="flex gap-5 items-center -mt-16 flex-col sm:flex-row">
          <div className="relative rounded-4xl w-[50%] mr-auto">
            <div className="rounded-4xl overflow-hidden w-full h-full">
              <Image
                src="/movies/movie_reverend.jpg"
                alt="The Reverend Movie Poster"
                className="w-[300px] h-[180px] sm:w-[400px] sm:h-[266px] md:w-[500px] md:h-[333px] lg:w-[760px] lg:h-[500px] object-cover"
                width={660}
                height={460}
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-black/40  rounded-4xl" />
          </div>

          <div className="space-y-8 w-full sm:w-[50%] mt-10 md:mt-32 z-20">
            {/* Global Entertainment Section */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {globalHeading}
              </h3>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                {globalParagraph}
              </p>
              <Link href="/sign-in">
                <Button>{signInButton}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutOurMission;
