// src/models/Settings.js
import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // Singleton document
    key: { type: String, unique: true, default: "global" },
    affiliateCommissionPct: { type: Number, default: 10, min: 0, max: 100 },

    // Add this to the settingsSchema object, around line 8 after affiliateCommissionPct
    languageSettings: {
      availableLanguages: [
        {
          code: { type: String, required: true },
          name: { type: String, required: true },
          flag: { type: String, required: true },
          isActive: { type: Boolean, default: true },
        },
      ],
      defaultLanguage: { type: String, default: "en" },
      lastUpdated: { type: Date, default: Date.now },
    },

    // Add this to the settingsSchema object, around line 8 after affiliateCommissionPct
    siteStatus: {
      isActive: { type: Boolean, default: true },
      maintenanceMessage: {
        type: String,
        default:
          "We're currently performing maintenance. Please check back later.",
      },
      lastUpdated: { type: Date, default: Date.now },
    },

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
      businessHours: { type: String, default: "Mon–Fri (09:00 AM – 5:00 PM)" },
      message: {
        type: String,
        default:
          "If you have any questions about your order, please describe it and include your Order ID in the message (example: zxxxx.xxxx.xxx).",
      },
      supportTicketButtonText: { type: String, default: "Submit Request" },
      supportTicketSuccessMessage: {
        type: String,
        default:
          "Your contact request has been submitted successfully. We'll get back to you soon!",
      },
    },

    // Logo Management
    logos: {
      mainLogo: { type: String, default: "/logos/logo.png" },
      cheapStreamLogo: {
        type: String,
        default: "/logos/cheap_stream_logo.png",
      },
      favicon: { type: String, default: "/favicon.ico" },
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

    // Legal content management
    legalContent: {
      termsAndConditions: {
        title: { type: String, default: "Terms and Conditions" },
        content: { type: String, default: "" },
        lastUpdated: { type: Date, default: Date.now },
      },
      userGuide: {
        title: { type: String, default: "User Guide" },
        content: { type: String, default: "" },
        lastUpdated: { type: Date, default: Date.now },
      },
      privacyPolicy: {
        title: { type: String, default: "Privacy Policy" },
        content: { type: String, default: "" },
        lastUpdated: { type: Date, default: Date.now },
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

    // Add API keys section after addons
    apiKeys: {
      recaptcha: {
        siteKey: { type: String, default: "" },
        secretKey: { type: String, default: "" },
      },
      trustPilot: {
        businessId: { type: String, default: "" },
        apiKey: { type: String, default: "" },
      },
      googleAnalytics: {
        measurementId: { type: String, default: "" },
      },
      microsoftClarity: {
        projectId: { type: String, default: "" },
      },
      cloudflare: {
        token: { type: String, default: "" },
      },
      getButton: {
        widgetId: { type: String, default: "" },
      },
      tawkTo: {
        propertyId: { type: String, default: "" },
        widgetId: { type: String, default: "" },
      },
    },

    // Login options management
    loginOptions: {
      google: { type: Boolean, default: false },
      facebook: { type: Boolean, default: false },
      twitter: { type: Boolean, default: false },
    },

    // Social API keys
    socialApiKeys: {
      google: {
        clientId: { type: String, default: "" },
        clientSecret: { type: String, default: "" },
      },
      facebook: {
        appId: { type: String, default: "" },
        appSecret: { type: String, default: "" },
      },
      twitter: {
        apiKey: { type: String, default: "" },
        apiSecret: { type: String, default: "" },
      },
    },

    // Free trial content management
    freeTrialContent: {
      title: { type: String, default: "Start Your Free Trial" },
      description: {
        type: String,
        default:
          "Experience premium IPTV content for 24 hours - completely free!",
      },
      features: [
        {
          id: { type: Number, required: true },
          title: { type: String, required: true },
          description: { type: String, required: true },
          icon: { type: String, required: true },
        },
      ],
      includedTitle: {
        type: String,
        default: "What's Included in Your Free Trial?",
      },
      includedItems: [{ type: String }],
    },

    // SMTP Configuration
    smtp: {
      host: { type: String, default: "" },
      port: { type: Number, default: 587 },
      user: { type: String, default: "" },
      pass: { type: String, default: "" },
      secure: { type: Boolean, default: false },
    },

    // Other API Keys - Updated to include DeepL and Google Translate
    otherApiKeys: {
      iptv: {
        apiKey: { type: String, default: "" },
        baseUrl: { type: String, default: "" },
      },
      jwt: {
        secret: { type: String, default: "" },
        expiresIn: { type: String, default: "7d" },
      },
      deepl: {
        apiKey: { type: String, default: "" },
        baseUrl: { type: String, default: "https://api-free.deepl.com" },
      },
      googleTranslate: {
        apiKey: { type: String, default: "" },
        baseUrl: {
          type: String,
          default: "https://translation.googleapis.com",
        },
      },
    },

    // Card Payment Settings
    cardPayment: {
      isEnabled: { type: Boolean, default: false },
      minAmount: { type: Number, default: 1, min: 0.01 },
      maxAmount: { type: Number, default: 1000, min: 1 },
      supportedCards: {
        visa: { type: Boolean, default: true },
        mastercard: { type: Boolean, default: true },
        amex: { type: Boolean, default: false },
        discover: { type: Boolean, default: false },
      },
      processingFee: {
        isActive: { type: Boolean, default: false },
        feePercentage: { type: Number, default: 0, min: 0, max: 100 },
        fixedAmount: { type: Number, default: 0, min: 0 },
      },
      description: {
        type: String,
        default: "Pay securely with your credit or debit card",
      },
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

    // Email Content Management
    emailContent: {
      content: {
        type: String,
        default: "",
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
        businessHours: "Mon–Fri (09:00 AM – 5:00 PM)",
        message:
          "If you have any questions about your order, please describe it and include your Order ID in the message (example: zxxxx.xxxx.xxx).",
        supportTicketButtonText: "Submit Request",
        supportTicketSuccessMessage:
          "Your contact request has been submitted successfully. We'll get back to you soon!",
      },
      logos: {
        mainLogo: "/logos/logo.png",
        cheapStreamLogo: "/logos/cheap_stream_logo.png",
        favicon: "/favicon.ico",
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
      legalContent: {
        termsAndConditions: {
          title: "Terms and Conditions",
          content: "",
          lastUpdated: Date.now(),
        },
        userGuide: {
          title: "User Guide",
          content: "",
          lastUpdated: Date.now(),
        },
        privacyPolicy: {
          title: "Privacy Policy",
          content: "",
          lastUpdated: Date.now(),
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
      apiKeys: {
        recaptcha: {
          siteKey: "",
          secretKey: "",
        },
        trustPilot: {
          businessId: "",
          apiKey: "",
        },
        googleAnalytics: {
          measurementId: "",
        },
        microsoftClarity: {
          projectId: "",
        },
        cloudflare: {
          token: "",
        },
        getButton: {
          widgetId: "",
        },
        tawkTo: {
          propertyId: "",
          widgetId: "",
        },
      },
      loginOptions: {
        google: false,
        facebook: false,
        twitter: false,
      },
      socialApiKeys: {
        google: {
          clientId: "",
          clientSecret: "",
        },
        facebook: {
          appId: "",
          appSecret: "",
        },
        twitter: {
          apiKey: "",
          apiSecret: "",
        },
      },
      freeTrialContent: {
        title: "Start Your Free Trial",
        description:
          "Experience premium IPTV content for 24 hours - completely free!",
        features: [
          {
            id: 1,
            title: "24 Hours Free",
            description: "Full access to all channels and features",
            icon: "clock",
          },
          {
            id: 2,
            title: "Premium Quality",
            description: "HD and 4K content with no buffering",
            icon: "star",
          },
          {
            id: 3,
            title: "No Commitment",
            description: "Cancel anytime, no hidden fees",
            icon: "shield",
          },
        ],
        includedTitle: "What's Included in Your Free Trial?",
        includedItems: [
          "Access to all channels in your selected template",
          "HD and 4K quality streaming",
          "24/7 customer support",
          "No credit card required",
        ],
      },
      smtp: {
        host: "",
        port: 587,
        user: "",
        pass: "",
        secure: false,
      },
      otherApiKeys: {
        iptv: {
          apiKey: "",
          baseUrl: "",
        },
        jwt: {
          secret: "",
          expiresIn: "7d",
        },
        deepl: {
          apiKey: "",
          baseUrl: "https://api-free.deepl.com",
        },
        googleTranslate: {
          apiKey: "",
          baseUrl: "https://translation.googleapis.com",
        },
      },
      cardPayment: {
        isEnabled: false,
        minAmount: 1,
        maxAmount: 1000,
        supportedCards: {
          visa: true,
          mastercard: true,
          amex: false,
          discover: false,
        },
        processingFee: {
          isActive: false,
          feePercentage: 0,
          fixedAmount: 0,
        },
        description: "Pay securely with your credit or debit card",
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
      emailContent: {
        content: "",
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
      businessHours: "Mon–Fri (09:00 AM – 5:00 PM)",
      message:
        "If you have any questions about your order, please describe it and include your Order ID in the message (example: zxxxx.xxxx.xxx).",
      supportTicketButtonText: "Submit Request",
      supportTicketSuccessMessage:
        "Your contact request has been submitted successfully. We'll get back to you soon!",
    };
    modified = true;
  }

  // Add logos backfill
  if (!doc.logos) {
    doc.logos = {
      mainLogo: "/logos/logo.png",
      cheapStreamLogo: "/logos/cheap_stream_logo.png",
      favicon: "/favicon.ico",
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

  if (!doc.legalContent) {
    doc.legalContent = {
      termsAndConditions: {
        title: "Terms and Conditions",
        content: "",
        lastUpdated: Date.now(),
      },
      userGuide: {
        title: "User Guide",
        content: "",
        lastUpdated: Date.now(),
      },
      privacyPolicy: {
        title: "Privacy Policy",
        content: "",
        lastUpdated: Date.now(),
      },
    };
    modified = true;
  } else {
    if (!doc.legalContent.termsAndConditions) {
      doc.legalContent.termsAndConditions = {
        title: "Terms and Conditions",
        content: "",
        lastUpdated: Date.now(),
      };
      modified = true;
    }
    if (!doc.legalContent.userGuide) {
      doc.legalContent.userGuide = {
        title: "User Guide",
        content: "",
        lastUpdated: Date.now(),
      };
      modified = true;
    }
    if (!doc.legalContent.privacyPolicy) {
      doc.legalContent.privacyPolicy = {
        title: "Privacy Policy",
        content: "",
        lastUpdated: Date.now(),
      };
      modified = true;
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

  // Add free trial content defaults
  if (!doc.freeTrialContent) {
    doc.freeTrialContent = {
      title: "Start Your Free Trial",
      description:
        "Experience premium IPTV content for 24 hours - completely free!",
      features: [
        {
          id: 1,
          title: "24 Hours Free",
          description: "Full access to all channels and features",
          icon: "clock",
        },
        {
          id: 2,
          title: "Premium Quality",
          description: "HD and 4K content with no buffering",
          icon: "star",
        },
        {
          id: 3,
          title: "No Commitment",
          description: "Cancel anytime, no hidden fees",
          icon: "shield",
        },
      ],
      includedTitle: "What's Included in Your Free Trial?",
      includedItems: [
        "Access to all channels in your selected template",
        "HD and 4K quality streaming",
        "24/7 customer support",
        "No credit card required",
      ],
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

  // Add email content defaults
  if (!doc.emailContent) {
    doc.emailContent = {
      content: "",
    };
    modified = true;
  }

  // Add otherApiKeys defaults including new translation services
  if (!doc.otherApiKeys) {
    doc.otherApiKeys = {
      iptv: {
        apiKey: "",
        baseUrl: "",
      },
      jwt: {
        secret: "",
        expiresIn: "7d",
      },
      deepl: {
        apiKey: "",
        baseUrl: "https://api-free.deepl.com",
      },
      googleTranslate: {
        apiKey: "",
        baseUrl: "https://translation.googleapis.com",
      },
    };
    modified = true;
  } else {
    // Backfill missing translation API keys
    if (!doc.otherApiKeys.deepl) {
      doc.otherApiKeys.deepl = {
        apiKey: "",
        baseUrl: "https://api-free.deepl.com",
      };
      modified = true;
    }
    if (!doc.otherApiKeys.googleTranslate) {
      doc.otherApiKeys.googleTranslate = {
        apiKey: "",
        baseUrl: "https://translation.googleapis.com",
      };
      modified = true;
    }
  }

  // Add card payment defaults
  if (!doc.cardPayment) {
    doc.cardPayment = {
      isEnabled: false,
      minAmount: 1,
      maxAmount: 1000,
      supportedCards: {
        visa: true,
        mastercard: true,
        amex: false,
        discover: false,
      },
      processingFee: {
        isActive: false,
        feePercentage: 0,
        fixedAmount: 0,
      },
      description: "Pay securely with your credit or debit card",
    };
    modified = true;
  }

  // Add language settings defaults
  if (!doc.languageSettings) {
    doc.languageSettings = {
      availableLanguages: [
        { code: "en", name: "English", flag: "🇬🇧", isActive: true },
        { code: "sv", name: "Swedish", flag: "🇸🇪", isActive: true },
        { code: "no", name: "Norwegian", flag: "🇳🇴", isActive: true },
        { code: "da", name: "Danish", flag: "🇩🇰", isActive: true },
        { code: "fi", name: "Finnish", flag: "🇫🇮", isActive: true },
        { code: "fr", name: "French", flag: "🇫🇷", isActive: true },
        { code: "de", name: "German", flag: "🇩🇪", isActive: true },
        { code: "es", name: "Spanish", flag: "🇪🇸", isActive: true },
        { code: "it", name: "Italian", flag: "🇮🇹", isActive: true },
        { code: "ru", name: "Russian", flag: "🇷🇺", isActive: true },
        { code: "tr", name: "Turkish", flag: "🇹🇷", isActive: true },
        { code: "ar", name: "Arabic", flag: "🇸🇦", isActive: true },
        { code: "hi", name: "Hindi", flag: "🇮🇳", isActive: true },
        { code: "zh", name: "Chinese", flag: "🇨🇳", isActive: true },
      ],
      defaultLanguage: "en",
      lastUpdated: new Date(),
    };
    modified = true;
  } else {
    // Check if availableLanguages is empty or missing
    if (
      !doc.languageSettings.availableLanguages ||
      doc.languageSettings.availableLanguages.length === 0
    ) {
      doc.languageSettings.availableLanguages = [
        { code: "en", name: "English", flag: "🇬🇧", isActive: true },
        { code: "sv", name: "Swedish", flag: "🇸🇪", isActive: true },
        { code: "no", name: "Norwegian", flag: "🇳🇴", isActive: true },
        { code: "da", name: "Danish", flag: "🇩🇰", isActive: true },
        { code: "fi", name: "Finnish", flag: "🇫🇮", isActive: true },
        { code: "fr", name: "French", flag: "🇫🇷", isActive: true },
        { code: "de", name: "German", flag: "🇩🇪", isActive: true },
        { code: "es", name: "Spanish", flag: "🇪🇸", isActive: true },
        { code: "it", name: "Italian", flag: "🇮🇹", isActive: true },
        { code: "ru", name: "Russian", flag: "🇷🇺", isActive: true },
        { code: "tr", name: "Turkish", flag: "🇹🇷", isActive: true },
        { code: "ar", name: "Arabic", flag: "🇸🇦", isActive: true },
        { code: "hi", name: "Hindi", flag: "🇮🇳", isActive: true },
        { code: "zh", name: "Chinese", flag: "🇨🇳", isActive: true },
      ];
      modified = true;
    }

    // Ensure defaultLanguage is set
    if (!doc.languageSettings.defaultLanguage) {
      doc.languageSettings.defaultLanguage = "en";
      modified = true;
    }
  }

  if (modified) await doc.save();
  return doc;
};

const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default Settings;
