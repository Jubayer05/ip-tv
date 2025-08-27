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

  if (modified) await doc.save();
  return doc;
};

const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default Settings;
