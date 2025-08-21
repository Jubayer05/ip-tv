export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Main Spinner */}
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-gray-600 rounded-full animate-spin border-t-cyan-400 border-r-cyan-400"></div>

        {/* Inner ring */}
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-gray-700 rounded-full animate-spin border-t-blue-400 border-r-blue-400 animate-reverse"></div>

        {/* Center dot */}
        <div className="absolute top-6 left-6 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
      </div>

      {/* Loading text */}
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2 font-rajdhani">
          Loading...
        </h2>
        <p className="text-gray-400 text-sm font-manrope">
          Please wait while we prepare your experience
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex space-x-1 mt-4">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-gray-700 rounded-full mt-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
