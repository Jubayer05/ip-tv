import fs from "fs";
import maxmind from "mmdb-lib";
import path from "path";

let reader = null;

// Initialize MaxMind GeoLite2 database reader
function getReader() {
  if (!reader) {
    try {
      // Path to GeoLite2-Country.mmdb file
      // You'll need to download this from MaxMind and place it in the project
      const dbPath = path.join(process.cwd(), "data", "GeoLite2-Country.mmdb");

      if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        reader = new maxmind.Reader(buffer);
      } else {
        console.warn("GeoLite2 database not found at:", dbPath);
      }
    } catch (error) {
      console.error("Error initializing MaxMind GeoLite2:", error);
    }
  }
  return reader;
}

// Get country from IP using MaxMind GeoLite2
export function getCountryFromIP(ip) {
  try {
    // Handle localhost/private IPs
    if (
      !ip ||
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip === "localhost" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.16.")
    ) {
      return {
        country: "Unknown",
        countryCode: "XX",
      };
    }

    const reader = getReader();
    if (!reader) {
      return {
        country: "Unknown",
        countryCode: "XX",
      };
    }

    const result = reader.get(ip);

    if (result && result.country) {
      return {
        country: result.country.names?.en || "Unknown",
        countryCode: result.country.iso_code || "XX",
      };
    }

    return {
      country: "Unknown",
      countryCode: "XX",
    };
  } catch (error) {
    console.error("Error getting country from IP:", error);
    return {
      country: "Unknown",
      countryCode: "XX",
    };
  }
}
