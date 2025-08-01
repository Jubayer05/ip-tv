"use client";

const FaqTimeline = () => {
  const steps = [
    {
      number: "1",
      title: "Choose Your Plan",
      description:
        "Pick a monthly plan that fits your needs. Whether you want basic access or the full premium experience, we've got you covered.",
    },
    {
      number: "2",
      title: "Get Instant Access",
      description:
        "After signup, you'll receive your login credentials via email within minutes. You'll also get step-by-step setup instructions for your device.",
    },
    {
      number: "3",
      title: "Start Streaming",
      description:
        "Login and start watching! Enjoy 1,000s of movies, TV shows, and live channels from around the world in HD or 4K—on any device.",
    },
  ];

  return (
    <div className="text-white py-16 px-8 font-secondary">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-wide text-center">
            STREAMING MADE SIMPLE WITH CHEAP STREAM
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed text-center">
            We've made watching your favorite movies and live channels easier
            than ever. No cables, no contracts—just non-stop entertainment at a
            price you'll love.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connection Lines - Hidden on mobile */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5">
            <div className="flex h-full">
              <div className="flex-[0.74] h-0.5 dotted-line"></div>
            </div>
          </div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Number Circle */}
              <div className="w-16 h-16 bg-cyan-400 rounded-full flex items-center justify-center mb-6 relative z-10">
                <span className="text-black text-xl font-bold">
                  {step.number}
                </span>
              </div>

              {/* Step Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dotted-line {
          border: 2px dashed #ffffff33;
        }
      `}</style>
    </div>
  );
};

export default FaqTimeline;
