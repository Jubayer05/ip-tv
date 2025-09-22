import Settings from "@/models/Settings";
import { connectToDatabase } from "./db";

// Server-side function to get API keys from database
export const getServerApiKeys = async () => {
  try {
    await connectToDatabase();
    const settings = await Settings.getSettings();
    return settings;
  } catch (error) {
    console.error("Failed to fetch server API keys:", error);
    return null;
  }
};

// Server-side function to get SMTP user
export const getServerSmtpUser = async () => {
  try {
    const settings = await getServerApiKeys();
    return settings?.smtp?.user || "";
  } catch (error) {
    console.error("Failed to fetch SMTP user:", error);
    return "";
  }
};

// Server-side function to get IPTV API key
export const getServerIptvApiKey = async () => {
  try {
    const settings = await getServerApiKeys();
    return settings?.otherApiKeys?.iptv?.apiKey || null;
  } catch (error) {
    console.error("Failed to fetch IPTV API key:", error);
    return null;
  }
};
