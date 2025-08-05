"use client";
import Pagination from "@/lib/paginations";
import { useState } from "react";
import ArticleCard from "./BlogContentItem";

const BlogContent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of articles to show per page

  const articles = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "THE FUTURE OF ARTIFICIAL INTELLIGENCE IN MODERN SOCIETY",
      description:
        "Exploring how AI is reshaping industries and transforming the way we work, communicate, and solve complex problems in our rapidly evolving digital landscape.",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "SUSTAINABLE LIVING: SMALL CHANGES WITH BIG IMPACT",
      description:
        "Discover practical ways to reduce your environmental footprint through everyday choices that benefit both your wallet and the planet we call home.",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "REMOTE WORK REVOLUTION: PRODUCTIVITY IN THE DIGITAL AGE",
      description:
        "Learn essential strategies for maintaining work-life balance and maximizing productivity while working from home in today's distributed workforce.",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "MINDFULNESS AND MENTAL HEALTH IN BUSY TIMES",
      description:
        "Practical techniques for incorporating mindfulness into your daily routine to reduce stress and improve overall mental well-being in our fast-paced world.",
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "THE ART OF DIGITAL PHOTOGRAPHY: CAPTURING MOMENTS",
      description:
        "Master the fundamentals of digital photography with expert tips on composition, lighting, and post-processing to create stunning visual stories.",
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "BLOCKCHAIN TECHNOLOGY: BEYOND CRYPTOCURRENCY",
      description:
        "Understanding the revolutionary potential of blockchain technology in supply chain management, healthcare, and digital identity verification systems.",
    },
    {
      id: 7,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "HEALTHY EATING HABITS FOR A BALANCED LIFESTYLE",
      description:
        "Evidence-based nutrition advice for building sustainable eating habits that support long-term health and energy throughout your busy day.",
    },
    {
      id: 8,
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "DATA SCIENCE: TURNING INFORMATION INTO INSIGHTS",
      description:
        "Explore how data science is revolutionizing decision-making across industries through predictive analytics and machine learning algorithms.",
    },
    {
      id: 9,
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "EFFECTIVE LEADERSHIP IN THE MODERN WORKPLACE",
      description:
        "Essential leadership skills for navigating change, inspiring teams, and fostering innovation in today's dynamic business environment.",
    },
    {
      id: 10,
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "TRAVEL PHOTOGRAPHY: DOCUMENTING YOUR ADVENTURES",
      description:
        "Professional techniques for capturing the essence of your travels, from landscape photography to cultural portraits that tell compelling stories.",
    },
    {
      id: 11,
      image:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "CYBERSECURITY ESSENTIALS FOR DIGITAL NATIVES",
      description:
        "Protect your digital life with comprehensive security practices covering password management, secure browsing, and privacy protection strategies.",
    },
    {
      id: 12,
      image:
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "THE SCIENCE OF SLEEP: OPTIMIZING REST FOR PERFORMANCE",
      description:
        "Discover the latest research on sleep science and practical strategies for improving sleep quality to enhance cognitive function and health.",
    },
    {
      id: 13,
      image:
        "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "FINANCIAL LITERACY: BUILDING WEALTH IN YOUR TWENTIES",
      description:
        "Essential financial planning strategies for young adults, covering budgeting, investing, and building a foundation for long-term financial success.",
    },
    {
      id: 14,
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "CREATIVE WRITING: FINDING YOUR UNIQUE VOICE",
      description:
        "Develop your storytelling skills with practical exercises and techniques for overcoming writer's block and crafting compelling narratives.",
    },
    {
      id: 15,
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "CLOUD COMPUTING: THE INFRASTRUCTURE OF TOMORROW",
      description:
        "Understanding cloud technologies and their impact on business scalability, data management, and the future of enterprise computing solutions.",
    },
    {
      id: 16,
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "URBAN GARDENING: GROWING GREEN IN SMALL SPACES",
      description:
        "Transform your living space with practical urban gardening techniques for growing fresh herbs, vegetables, and plants in apartments and small yards.",
    },
    {
      id: 17,
      image:
        "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "MACHINE LEARNING: ALGORITHMS THAT LEARN AND ADAPT",
      description:
        "Explore the fundamentals of machine learning and its applications in recommendation systems, image recognition, and predictive modeling.",
    },
    {
      id: 18,
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "WEB DEVELOPMENT TRENDS: BUILDING THE MODERN INTERNET",
      description:
        "Stay current with the latest web development frameworks, design patterns, and best practices for creating responsive and accessible websites.",
    },
    {
      id: 19,
      image:
        "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "ADVENTURE SPORTS: PUSHING YOUR LIMITS SAFELY",
      description:
        "Discover thrilling outdoor activities while learning essential safety protocols and preparation techniques for rock climbing, hiking, and extreme sports.",
    },
    {
      id: 20,
      image:
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "SOCIAL MEDIA MARKETING: AUTHENTIC ENGAGEMENT STRATEGIES",
      description:
        "Build genuine connections with your audience through strategic content creation, community building, and data-driven social media marketing approaches.",
    },
  ];

  // Calculate pagination values
  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = articles.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // You can add additional logic here like scrolling to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 sm:p-6 mt-6 sm:mt-10">
      <div className="max-w-7xl mx-auto">
        {/* Grid Container */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {currentArticles.map((article) => (
            <ArticleCard
              key={article.id}
              image={article.image}
              title={article.title}
              description={article.description}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <Pagination
              totalPages={totalPages}
              initialPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogContent;
