// src/models/Settings.js
import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // Singleton document
    key: { type: String, unique: true, default: "global" },
    affiliateCommissionPct: { type: Number, default: 10, min: 0, max: 100 },

    // Social media links
    socialMedia: {
      x: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },

    // Contact information
    contactInfo: {
      phoneNumber: { type: String, default: "+123 456 7890" },
      emailAddress: { type: String, default: "help@cheapstream.com" },
    },

    // Banner content management
    banners: {
      home: {
        heading1: { type: String, default: "YOUR TICKET TO ENDLESS" },
        heading2: { type: String, default: "ENTERTAINMENT" },
        paragraph: {
          type: String,
          default:
            "Why pay more when you can stream smarter? Cheap Stream brings you thousands of movies at the best price. Whether you love action, drama, comedy, or horror, we have something for everyone—all in HD & 4K quality with zero buffering.",
        },
        placeholder: { type: String, default: "Email Address" },
        buttonText: { type: String, default: "Get Started" },
      },
      about: {
        heading1: {
          type: String,
          default: "Streaming Shouldn't Break the Bank.",
        },
        heading2: { type: String, default: "We Make Sure It Doesn't." },
        paragraph: {
          type: String,
          default:
            "At Cheap Stream, we believe everyone deserves access to top-quality entertainment—without expensive cable bills, long-term contracts, or complicated setups. We're a passionate team of streamers, techies, and movie lovers who were tired of overpriced services and limited content. So, we created a better way.",
        },
      },
      affiliate: {
        heading1: { type: String, default: "Invite. Earn. Upgrade Your Rank." },
        heading2: { type: String, default: "" },
        paragraph: {
          type: String,
          default:
            "Become a part of our Affiliate & Referral Program and earn rewards every time someone joins through your link—or when you spend more yourself. Whether you're a casual user or a loyal pro, there's something here for you.",
        },
      },
      blog: {
        heading1: { type: String, default: "LATEST" },
        heading2: { type: String, default: "NEWS & UPDATES" },
        paragraph: {
          type: String,
          default:
            "Stay informed about the latest movies, TV shows, and platform updates.",
        },
      },
      contact: {
        heading1: { type: String, default: "We're Here to Help —" },
        heading2: { type: String, default: "Anytime, Anywhere" },
        paragraph: {
          type: String,
          default:
            "Have questions, need help with your account, or want to report an issue? The Cheap Stream Support Team is available 24/7 to assist you.",
        },
      },
      faq: {
        heading1: { type: String, default: "LEARN HOW CHEAP STREAM" },
        heading2: { type: String, default: "WORKS" },
        paragraph: {
          type: String,
          default:
            "We've made watching your favorite movies and live channels easier than ever. No cables, no contracts—just non-stop entertainment at a price you'll love.",
        },
        buttonText: { type: String, default: "View Pricing Plans" },
      },
      pricing: {
        heading1: { type: String, default: "Watch More, Pay Less –" },
        heading2: { type: String, default: "Choose Your Streaming Plans" },
        paragraph: {
          type: String,
          default:
            "At Cheap Stream, we believe in affordable entertainment without sacrificing quality. Whether you're a casual viewer or a full-on movie marathoner, we've got a plan that fits your lifestyle—and your budget.",
        },
        buttonText: { type: String, default: "Start with a Free Trial!" },
        trialNote: {
          type: String,
          default:
            "*Try Cheap Stream free for 24 hours—no credit card required!",
        },
      },
      privacy: {
        heading1: { type: String, default: "Privacy Policy" },
        heading2: { type: String, default: "" },
        paragraph: {
          type: String,
          default:
            "Your privacy matters to us. This Privacy Policy explains how we collect, use, protect, and disclose your information when you visit or use our IPTV website and services.",
        },
      },
      terms: {
        heading1: { type: String, default: "Terms of Use" },
        heading2: { type: String, default: "" },
        paragraph: {
          type: String,
          default:
            "Welcome to our IPTV platform. By accessing, purchasing from, or using our website and services, you agree to comply with and be bound by the following Terms of Use. Please read them carefully before proceeding.",
        },
      },
      knowledge: {
        heading1: { type: String, default: "Everything You Need to Know—" },
        heading2: { type: String, default: "All in One Place" },
        paragraph: {
          type: String,
          default:
            "Welcome to the Knowledge Base, your go-to resource hub for all things IPTV. Whether you're a first-time user, reseller, or long-time subscriber, this section is packed with helpful guides, FAQs, tutorials, and troubleshooting tips to make your experience smooth and seamless.",
        },
      },
      explore: {
        heading1: { type: String, default: "Explore Our" },
        heading2: { type: String, default: "Channel Collection" },
        paragraph: {
          type: String,
          default:
            "Discover thousands of channels, movies, and TV shows from around the world. From live sports to blockbuster movies, we have something for everyone.",
        },
        watchNow: { type: String, default: "Watch Now" },
        myWishlist: { type: String, default: "My Wishlist" },
      },
    },

    // Addons management
    addons: {
      recaptcha: { type: Boolean, default: false },
      trustPilot: { type: Boolean, default: false },
      googleAnalytics: { type: Boolean, default: false },
      microsoftClarity: { type: Boolean, default: false },
      cloudflare: { type: Boolean, default: false },
      getButton: { type: Boolean, default: false },
      tawkTo: { type: Boolean, default: false },
    },

    // Meta management for SEO
    metaManagement: {
      home: {
        title: {
          type: String,
          default: "Cheap Stream - Premium IPTV Service Provider",
        },
        description: {
          type: String,
          default:
            "Stream thousands of movies, TV shows, and live channels with Cheap Stream. Best IPTV service with HD quality and zero buffering.",
        },
        keywords: {
          type: String,
          default:
            "IPTV service, streaming, movies, TV shows, live channels, Cheap Stream",
        },
        openGraph: {
          title: {
            type: String,
            default: "Cheap Stream - Premium IPTV Service Provider",
          },
          description: {
            type: String,
            default:
              "Stream thousands of movies, TV shows, and live channels with Cheap Stream. Best IPTV service with HD quality and zero buffering.",
          },
        },
      },
      about: {
        title: {
          type: String,
          default: "About Us - Cheap Stream | Premium IPTV Service Provider",
        },
        description: {
          type: String,
          default:
            "Discover Cheap Stream's mission to provide premium IPTV services worldwide. Learn about our commitment to quality, customer satisfaction, and innovative streaming solutions.",
        },
        keywords: {
          type: String,
          default:
            "IPTV service provider, streaming service, live TV streaming, movie streaming, Cheap Stream about us, IPTV company, streaming technology, entertainment service",
        },
        openGraph: {
          title: {
            type: String,
            default: "About Us - Cheap Stream | Premium IPTV Service Provider",
          },
          description: {
            type: String,
            default:
              "Discover Cheap Stream's mission to provide premium IPTV services worldwide. Learn about our commitment to quality, customer satisfaction, and innovative streaming solutions.",
          },
        },
      },
      affiliate: {
        title: {
          type: String,
          default:
            "Affiliate Program - Cheap Stream | Earn Money Promoting IPTV",
        },
        description: {
          type: String,
          default:
            "Join Cheap Stream's affiliate program and earn money by promoting our premium IPTV services. Refer friends and earn commissions.",
        },
        keywords: {
          type: String,
          default:
            "affiliate program, IPTV affiliate, earn money, referral program, Cheap Stream affiliate",
        },
        openGraph: {
          title: {
            type: String,
            default:
              "Affiliate Program - Cheap Stream | Earn Money Promoting IPTV",
          },
          description: {
            type: String,
            default:
              "Join Cheap Stream's affiliate program and earn money by promoting our premium IPTV services. Refer friends and earn commissions.",
          },
        },
      },
      blogs: {
        title: {
          type: String,
          default: "Blog - Cheap Stream | Latest News & Updates",
        },
        description: {
          type: String,
          default:
            "Stay informed about the latest movies, TV shows, and platform updates from Cheap Stream. Read our blog for entertainment news and tips.",
        },
        keywords: {
          type: String,
          default:
            "IPTV blog, streaming news, entertainment blog, Cheap Stream blog, movie updates",
        },
        openGraph: {
          title: {
            type: String,
            default: "Blog - Cheap Stream | Latest News & Updates",
          },
          description: {
            type: String,
            default:
              "Stay informed about the latest movies, TV shows, and platform updates from Cheap Stream. Read our blog for entertainment news and tips.",
          },
        },
      },
      explore: {
        title: {
          type: String,
          default: "Explore Channels - Cheap Stream | Discover Content",
        },
        description: {
          type: String,
          default:
            "Explore thousands of channels, movies, and TV shows from around the world with Cheap Stream. Find your favorite content.",
        },
        keywords: {
          type: String,
          default:
            "explore channels, IPTV channels, movie library, TV shows, Cheap Stream content",
        },
        openGraph: {
          title: {
            type: String,
            default: "Explore Channels - Cheap Stream | Discover Content",
          },
          description: {
            type: String,
            default:
              "Explore thousands of channels, movies, and TV shows from around the world with Cheap Stream. Find your favorite content.",
          },
        },
      },
      knowledge: {
        title: {
          type: String,
          default: "Knowledge Base - Cheap Stream | Help & Support",
        },
        description: {
          type: String,
          default:
            "Find answers to common questions, tutorials, and troubleshooting tips in Cheap Stream's comprehensive knowledge base.",
        },
        keywords: {
          type: String,
          default:
            "knowledge base, IPTV help, streaming support, tutorials, FAQ, Cheap Stream support",
        },
        openGraph: {
          title: {
            type: String,
            default: "Knowledge Base - Cheap Stream | Help & Support",
          },
          description: {
            type: String,
            default:
              "Find answers to common questions, tutorials, and troubleshooting tips in Cheap Stream's comprehensive knowledge base.",
          },
        },
      },
      packages: {
        title: {
          type: String,
          default: "Pricing Plans - Cheap Stream | Affordable IPTV Packages",
        },
        description: {
          type: String,
          default:
            "Choose from Cheap Stream's affordable IPTV packages. Watch more, pay less with our flexible streaming plans.",
        },
        keywords: {
          type: String,
          default:
            "IPTV pricing, streaming plans, affordable packages, Cheap Stream plans, subscription options",
        },
        openGraph: {
          title: {
            type: String,
            default: "Pricing Plans - Cheap Stream | Affordable IPTV Packages",
          },
          description: {
            type: String,
            default:
              "Choose from Cheap Stream's affordable IPTV packages. Watch more, pay less with our flexible streaming plans.",
          },
        },
      },
      privacy: {
        title: {
          type: String,
          default: "Privacy Policy - Cheap Stream | Data Protection",
        },
        description: {
          type: String,
          default:
            "Learn about Cheap Stream's privacy policy and how we protect your personal information when using our IPTV services.",
        },
        keywords: {
          type: String,
          default:
            "privacy policy, data protection, Cheap Stream privacy, IPTV privacy",
        },
        openGraph: {
          title: {
            type: String,
            default: "Privacy Policy - Cheap Stream | Data Protection",
          },
          description: {
            type: String,
            default:
              "Learn about Cheap Stream's privacy policy and how we protect your personal information when using our IPTV services.",
          },
        },
      },
      terms: {
        title: {
          type: String,
          default: "Terms of Use - Cheap Stream | Service Agreement",
        },
        description: {
          type: String,
          default:
            "Read Cheap Stream's terms of use and service agreement. Understand the rules and conditions for using our IPTV platform.",
        },
        keywords: {
          type: String,
          default:
            "terms of use, service agreement, Cheap Stream terms, IPTV terms",
        },
        openGraph: {
          title: {
            type: String,
            default: "Terms of Use - Cheap Stream | Service Agreement",
          },
          description: {
            type: String,
            default:
              "Read Cheap Stream's terms of use and service agreement. Understand the rules and conditions for using our IPTV platform.",
          },
        },
      },
      contact: {
        title: {
          type: String,
          default: "Contact Us - Cheap Stream | Get Support",
        },
        description: {
          type: String,
          default:
            "Contact Cheap Stream's support team for help with your account, technical issues, or general inquiries. We're here 24/7.",
        },
        keywords: {
          type: String,
          default:
            "contact support, IPTV help, Cheap Stream contact, customer service",
        },
        openGraph: {
          title: {
            type: String,
            default: "Contact Us - Cheap Stream | Get Support",
          },
          description: {
            type: String,
            default:
              "Contact Cheap Stream's support team for help with your account, technical issues, or general inquiries. We're here 24/7.",
          },
        },
      },
      faq: {
        title: {
          type: String,
          default: "FAQ - Cheap Stream | Frequently Asked Questions",
        },
        description: {
          type: String,
          default:
            "Find answers to frequently asked questions about Cheap Stream's IPTV services, features, and troubleshooting.",
        },
        keywords: {
          type: String,
          default:
            "FAQ, frequently asked questions, IPTV help, Cheap Stream FAQ",
        },
        openGraph: {
          title: {
            type: String,
            default: "FAQ - Cheap Stream | Frequently Asked Questions",
          },
          description: {
            type: String,
            default:
              "Find answers to frequently asked questions about Cheap Stream's IPTV services, features, and troubleshooting.",
          },
        },
      },
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSettings = async function () {
  let doc = await this.findOne({ key: "global" });
  if (!doc) {
    doc = await this.create({
      key: "global",
      affiliateCommissionPct: 10,
      socialMedia: {
        x: "",
        linkedin: "",
        instagram: "",
        youtube: "",
      },
      contactInfo: {
        phoneNumber: "+123 456 7890",
        emailAddress: "help@cheapstream.com",
      },
      banners: {
        home: {
          heading1: "YOUR TICKET TO ENDLESS",
          heading2: "ENTERTAINMENT",
          paragraph:
            "Why pay more when you can stream smarter? Cheap Stream brings you thousands of movies at the best price. Whether you love action, drama, comedy, or horror, we have something for everyone—all in HD & 4K quality with zero buffering.",
          placeholder: "Email Address",
          buttonText: "Get Started",
        },
        about: {
          heading1: "ABOUT",
          heading2: "CHEAP STREAM",
          paragraph:
            "Learn more about our mission to provide affordable entertainment to everyone.",
        },
        affiliate: {
          heading1: "JOIN OUR",
          heading2: "AFFILIATE PROGRAM",
          paragraph:
            "Earn money by promoting our services and helping others discover affordable entertainment.",
        },
        blog: {
          heading1: "LATEST",
          heading2: "NEWS & UPDATES",
          paragraph:
            "Stay informed about the latest movies, TV shows, and platform updates.",
        },
        contact: {
          heading1: "GET IN",
          heading2: "TOUCH",
          paragraph: "Have questions or need support? We're here to help you.",
        },
        faq: {
          heading1: "FREQUENTLY ASKED",
          heading2: "QUESTIONS",
          paragraph:
            "Find answers to common questions about our services and platform.",
        },
      },
      addons: {
        recaptcha: false,
        trustPilot: false,
        googleAnalytics: false,
        microsoftClarity: false,
        cloudflare: false,
        getButton: false,
        tawkTo: false,
      },
      metaManagement: {
        home: {
          title: "Cheap Stream - Premium IPTV Service Provider",
          description:
            "Stream thousands of movies, TV shows, and live channels with Cheap Stream. Best IPTV service with HD quality and zero buffering.",
          keywords:
            "IPTV service, streaming, movies, TV shows, live channels, Cheap Stream",
          openGraph: {
            title: "Cheap Stream - Premium IPTV Service Provider",
            description:
              "Stream thousands of movies, TV shows, and live channels with Cheap Stream. Best IPTV service with HD quality and zero buffering.",
          },
        },
        about: {
          title: "About Us - Cheap Stream | Premium IPTV Service Provider",
          description:
            "Discover Cheap Stream's mission to provide premium IPTV services worldwide. Learn about our commitment to quality, customer satisfaction, and innovative streaming solutions.",
          keywords:
            "IPTV service provider, streaming service, live TV streaming, movie streaming, Cheap Stream about us, IPTV company, streaming technology, entertainment service",
          openGraph: {
            title: "About Us - Cheap Stream | Premium IPTV Service Provider",
            description:
              "Discover Cheap Stream's mission to provide premium IPTV services worldwide. Learn about our commitment to quality, customer satisfaction, and innovative streaming solutions.",
          },
        },
        affiliate: {
          title: "Affiliate Program - Cheap Stream | Earn Money Promoting IPTV",
          description:
            "Join Cheap Stream's affiliate program and earn money by promoting our premium IPTV services. Refer friends and earn commissions.",
          keywords:
            "affiliate program, IPTV affiliate, earn money, referral program, Cheap Stream affiliate",
          openGraph: {
            title:
              "Affiliate Program - Cheap Stream | Earn Money Promoting IPTV",
            description:
              "Join Cheap Stream's affiliate program and earn money by promoting our premium IPTV services. Refer friends and earn commissions.",
          },
        },
        blogs: {
          title: "Blog - Cheap Stream | Latest News & Updates",
          description:
            "Stay informed about the latest movies, TV shows, and platform updates from Cheap Stream. Read our blog for entertainment news and tips.",
          keywords:
            "IPTV blog, streaming news, entertainment blog, Cheap Stream blog, movie updates",
          openGraph: {
            title: "Blog - Cheap Stream | Latest News & Updates",
            description:
              "Stay informed about the latest movies, TV shows, and platform updates from Cheap Stream. Read our blog for entertainment news and tips.",
          },
        },
        explore: {
          title: "Explore Channels - Cheap Stream | Discover Content",
          description:
            "Explore thousands of channels, movies, and TV shows from around the world with Cheap Stream. Find your favorite content.",
          keywords:
            "explore channels, IPTV channels, movie library, TV shows, Cheap Stream content",
          openGraph: {
            title: "Explore Channels - Cheap Stream | Discover Content",
            description:
              "Explore thousands of channels, movies, and TV shows from around the world with Cheap Stream. Find your favorite content.",
          },
        },
        knowledge: {
          title: "Knowledge Base - Cheap Stream | Help & Support",
          description:
            "Find answers to common questions, tutorials, and troubleshooting tips in Cheap Stream's comprehensive knowledge base.",
          keywords:
            "knowledge base, IPTV help, streaming support, tutorials, FAQ, Cheap Stream support",
          openGraph: {
            title: "Knowledge Base - Cheap Stream | Help & Support",
            description:
              "Find answers to common questions, tutorials, and troubleshooting tips in Cheap Stream's comprehensive knowledge base.",
          },
        },
        packages: {
          title: "Pricing Plans - Cheap Stream | Affordable IPTV Packages",
          description:
            "Choose from Cheap Stream's affordable IPTV packages. Watch more, pay less with our flexible streaming plans.",
          keywords:
            "IPTV pricing, streaming plans, affordable packages, Cheap Stream plans, subscription options",
          openGraph: {
            title: "Pricing Plans - Cheap Stream | Affordable IPTV Packages",
            description:
              "Choose from Cheap Stream's affordable IPTV packages. Watch more, pay less with our flexible streaming plans.",
          },
        },
        privacy: {
          title: "Privacy Policy - Cheap Stream | Data Protection",
          description:
            "Learn about Cheap Stream's privacy policy and how we protect your personal information when using our IPTV services.",
          keywords:
            "privacy policy, data protection, Cheap Stream privacy, IPTV privacy",
          openGraph: {
            title: "Privacy Policy - Cheap Stream | Data Protection",
            description:
              "Learn about Cheap Stream's privacy policy and how we protect your personal information when using our IPTV services.",
          },
        },
        terms: {
          title: "Terms of Use - Cheap Stream | Service Agreement",
          description:
            "Read Cheap Stream's terms of use and service agreement. Understand the rules and conditions for using our IPTV platform.",
          keywords:
            "terms of use, service agreement, Cheap Stream terms, IPTV terms",
          openGraph: {
            title: "Terms of Use - Cheap Stream | Service Agreement",
            description:
              "Read Cheap Stream's terms of use and service agreement. Understand the rules and conditions for using our IPTV platform.",
          },
        },
        contact: {
          title: "Contact Us - Cheap Stream | Get Support",
          description:
            "Contact Cheap Stream's support team for help with your account, technical issues, or general inquiries. We're here 24/7.",
          keywords:
            "contact support, IPTV help, Cheap Stream contact, customer service",
          openGraph: {
            title: "Contact Us - Cheap Stream | Get Support",
            description:
              "Contact Cheap Stream's support team for help with your account, technical issues, or general inquiries. We're here 24/7.",
          },
        },
        faq: {
          title: "FAQ - Cheap Stream | Frequently Asked Questions",
          description:
            "Find answers to frequently asked questions about Cheap Stream's IPTV services, features, and troubleshooting.",
          keywords:
            "FAQ, frequently asked questions, IPTV help, Cheap Stream FAQ",
          openGraph: {
            title: "FAQ - Cheap Stream | Frequently Asked Questions",
            description:
              "Find answers to frequently asked questions about Cheap Stream's IPTV services, features, and troubleshooting.",
          },
        },
      },
    });
    return doc;
  }

  // Backfill missing structures on existing docs
  let modified = false;

  if (!doc.socialMedia) {
    doc.socialMedia = { x: "", linkedin: "", instagram: "", youtube: "" };
    modified = true;
  }
  if (!doc.contactInfo) {
    doc.contactInfo = {
      phoneNumber: "+123 456 7890",
      emailAddress: "help@cheapstream.com",
    };
    modified = true;
  }

  const defaultBanners = {
    home: {
      heading1: "YOUR TICKET TO ENDLESS",
      heading2: "ENTERTAINMENT",
      paragraph:
        "Why pay more when you can stream smarter? Cheap Stream brings you thousands of movies at the best price. Whether you love action, drama, comedy, or horror, we have something for everyone—all in HD & 4K quality with zero buffering.",
      placeholder: "Email Address",
      buttonText: "Get Started",
    },
    about: {
      heading1: "ABOUT",
      heading2: "CHEAP STREAM",
      paragraph:
        "Learn more about our mission to provide affordable entertainment to everyone.",
    },
    affiliate: {
      heading1: "JOIN OUR",
      heading2: "AFFILIATE PROGRAM",
      paragraph:
        "Earn money by promoting our services and helping others discover affordable entertainment.",
    },
    blog: {
      heading1: "LATEST",
      heading2: "NEWS & UPDATES",
      paragraph:
        "Stay informed about the latest movies, TV shows, and platform updates.",
    },
    contact: {
      heading1: "GET IN",
      heading2: "TOUCH",
      paragraph: "Have questions or need support? We're here to help you.",
    },
    faq: {
      heading1: "FREQUENTLY ASKED",
      heading2: "QUESTIONS",
      paragraph:
        "Find answers to common questions about our services and platform.",
    },
  };

  if (!doc.banners) {
    doc.banners = defaultBanners;
    modified = true;
  } else {
    for (const page of Object.keys(defaultBanners)) {
      if (!doc.banners[page]) {
        doc.banners[page] = defaultBanners[page];
        modified = true;
      } else {
        for (const field of Object.keys(defaultBanners[page])) {
          if (doc.banners[page][field] === undefined) {
            doc.banners[page][field] = defaultBanners[page][field];
            modified = true;
          }
        }
      }
    }
  }

  if (!doc.addons) {
    doc.addons = {
      recaptcha: false,
      trustPilot: false,
      googleAnalytics: false,
      microsoftClarity: false,
      cloudflare: false,
      getButton: false,
      tawkTo: false,
    };
    modified = true;
  }

  // Add meta management defaults
  if (!doc.metaManagement) {
    doc.metaManagement = {
      home: {
        title: "Cheap Stream - Premium IPTV Service Provider",
        description:
          "Stream thousands of movies, TV shows, and live channels with Cheap Stream. Best IPTV service with HD quality and zero buffering.",
        keywords:
          "IPTV service, streaming, movies, TV shows, live channels, Cheap Stream",
        openGraph: {
          title: "Cheap Stream - Premium IPTV Service Provider",
          description:
            "Stream thousands of movies, TV shows, and live channels with Cheap Stream. Best IPTV service with HD quality and zero buffering.",
        },
      },
      about: {
        title: "About Us - Cheap Stream | Premium IPTV Service Provider",
        description:
          "Discover Cheap Stream's mission to provide premium IPTV services worldwide. Learn about our commitment to quality, customer satisfaction, and innovative streaming solutions.",
        keywords:
          "IPTV service provider, streaming service, live TV streaming, movie streaming, Cheap Stream about us, IPTV company, streaming technology, entertainment service",
        openGraph: {
          title: "About Us - Cheap Stream | Premium IPTV Service Provider",
          description:
            "Discover Cheap Stream's mission to provide premium IPTV services worldwide. Learn about our commitment to quality, customer satisfaction, and innovative streaming solutions.",
        },
      },
      affiliate: {
        title: "Affiliate Program - Cheap Stream | Earn Money Promoting IPTV",
        description:
          "Join Cheap Stream's affiliate program and earn money by promoting our premium IPTV services. Refer friends and earn commissions.",
        keywords:
          "affiliate program, IPTV affiliate, earn money, referral program, Cheap Stream affiliate",
        openGraph: {
          title: "Affiliate Program - Cheap Stream | Earn Money Promoting IPTV",
          description:
            "Join Cheap Stream's affiliate program and earn money by promoting our premium IPTV services. Refer friends and earn commissions.",
        },
      },
      blogs: {
        title: "Blog - Cheap Stream | Latest News & Updates",
        description:
          "Stay informed about the latest movies, TV shows, and platform updates from Cheap Stream. Read our blog for entertainment news and tips.",
        keywords:
          "IPTV blog, streaming news, entertainment blog, Cheap Stream blog, movie updates",
        openGraph: {
          title: "Blog - Cheap Stream | Latest News & Updates",
          description:
            "Stay informed about the latest movies, TV shows, and platform updates from Cheap Stream. Read our blog for entertainment news and tips.",
        },
      },
      explore: {
        title: "Explore Channels - Cheap Stream | Discover Content",
        description:
          "Explore thousands of channels, movies, and TV shows from around the world with Cheap Stream. Find your favorite content.",
        keywords:
          "explore channels, IPTV channels, movie library, TV shows, Cheap Stream content",
        openGraph: {
          title: "Explore Channels - Cheap Stream | Discover Content",
          description:
            "Explore thousands of channels, movies, and TV shows from around the world with Cheap Stream. Find your favorite content.",
        },
      },
      knowledge: {
        title: "Knowledge Base - Cheap Stream | Help & Support",
        description:
          "Find answers to common questions, tutorials, and troubleshooting tips in Cheap Stream's comprehensive knowledge base.",
        keywords:
          "knowledge base, IPTV help, streaming support, tutorials, FAQ, Cheap Stream support",
        openGraph: {
          title: "Knowledge Base - Cheap Stream | Help & Support",
          description:
            "Find answers to common questions, tutorials, and troubleshooting tips in Cheap Stream's comprehensive knowledge base.",
        },
      },
      packages: {
        title: "Pricing Plans - Cheap Stream | Affordable IPTV Packages",
        description:
          "Choose from Cheap Stream's affordable IPTV packages. Watch more, pay less with our flexible streaming plans.",
        keywords:
          "IPTV pricing, streaming plans, affordable packages, Cheap Stream plans, subscription options",
        openGraph: {
          title: "Pricing Plans - Cheap Stream | Affordable IPTV Packages",
          description:
            "Choose from Cheap Stream's affordable IPTV packages. Watch more, pay less with our flexible streaming plans.",
        },
      },
      privacy: {
        title: "Privacy Policy - Cheap Stream | Data Protection",
        description:
          "Learn about Cheap Stream's privacy policy and how we protect your personal information when using our IPTV services.",
        keywords:
          "privacy policy, data protection, Cheap Stream privacy, IPTV privacy",
        openGraph: {
          title: "Privacy Policy - Cheap Stream | Data Protection",
          description:
            "Learn about Cheap Stream's privacy policy and how we protect your personal information when using our IPTV services.",
        },
      },
      terms: {
        title: "Terms of Use - Cheap Stream | Service Agreement",
        description:
          "Read Cheap Stream's terms of use and service agreement. Understand the rules and conditions for using our IPTV platform.",
        keywords:
          "terms of use, service agreement, Cheap Stream terms, IPTV terms",
        openGraph: {
          title: "Terms of Use - Cheap Stream | Service Agreement",
          description:
            "Read Cheap Stream's terms of use and service agreement. Understand the rules and conditions for using our IPTV platform.",
        },
      },
      contact: {
        title: "Contact Us - Cheap Stream | Get Support",
        description:
          "Contact Cheap Stream's support team for help with your account, technical issues, or general inquiries. We're here 24/7.",
        keywords:
          "contact support, IPTV help, Cheap Stream contact, customer service",
        openGraph: {
          title: "Contact Us - Cheap Stream | Get Support",
          description:
            "Contact Cheap Stream's support team for help with your account, technical issues, or general inquiries. We're here 24/7.",
        },
      },
      faq: {
        title: "FAQ - Cheap Stream | Frequently Asked Questions",
        description:
          "Find answers to frequently asked questions about Cheap Stream's IPTV services, features, and troubleshooting.",
        keywords:
          "FAQ, frequently asked questions, IPTV help, Cheap Stream FAQ",
        openGraph: {
          title: "FAQ - Cheap Stream | Frequently Asked Questions",
          description:
            "Find answers to frequently asked questions about Cheap Stream's IPTV services, features, and troubleshooting.",
        },
      },
    };
    modified = true;
  }

  if (modified) await doc.save();
  return doc;
};

const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default Settings;
