import { ArrowRight, Calendar } from "lucide-react";

const ArticleCard = ({
  image = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  title = "LOREM IPSUM DOLOR SIT AMET CONSECTETUR SEM NEC...",
  description = "Lorem ipsum dolor sit amet consectetur. Dignissim consequat gravida turpis sed duis tellus ut quis id. Placerat in magna elit aliquet mauris. Donec aliquam porta varius sit. Tempor sit urna fringilla facilisi eget.",
  date = "20 September, 2025",
}) => {
  return (
    <div className="max-w-sm card_bg_border overflow-hidden shadow-lg font-secondary">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-800">
        <img
          src={image}
          alt="Article thumbnail"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Date */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 text-sm font-medium">{date}</span>
        </div>

        {/* Title */}
        <h3 className="text-white text-lg font-bold mb-3 leading-snug">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          {description}
        </p>

        {/* Read More Link */}
        <button className="flex items-center gap-2 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors duration-200 group">
          <span>Read more</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;
