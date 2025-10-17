import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip maintenance check for:
  // - API routes
  // - Admin dashboard pages
  // - Next.js internal routes
  // - Static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/(dashboard)") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/maintenance-status.json")
  ) {
    return NextResponse.next();
  }

  // Check if the request is for any page in the (general) folder
  const generalRoutes = [
    "/about-us",
    "/affiliate",
    "/blogs",
    "/explore",
    "/guest-login",
    "/knowledge-base",
    "/notifications",
    "/packages",
    "/privacy-policy",
    "/reviews",
    "/terms-of-use",
  ];

  const isGeneralRoute = generalRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Only check maintenance mode for general routes and root page
  if (isGeneralRoute || pathname === "/") {
    try {
      // Fetch maintenance status from a static file
      const maintenanceStatusUrl = new URL(
        "/maintenance-status.json",
        request.url
      );
      const response = await fetch(maintenanceStatusUrl, {
        cache: "no-store", // Always fetch fresh data
      });

      if (response.ok) {
        const data = await response.json();

        if (data.isMaintenanceMode) {
          // Site is under maintenance - show maintenance page
          return new NextResponse(
            `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Site Under Maintenance - Cheap Stream</title>
              <meta name="description" content="We're currently performing maintenance. Please check back later.">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%);
                  color: white;
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  overflow: hidden;
                  position: relative;
                }

                /* Animated background */
                body::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: 
                    radial-gradient(circle at 20% 80%, rgba(0, 184, 119, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(0, 184, 119, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(0, 184, 119, 0.05) 0%, transparent 50%);
                  animation: backgroundShift 20s ease-in-out infinite;
                }

                @keyframes backgroundShift {
                  0%, 100% { transform: translateX(0) translateY(0); }
                  25% { transform: translateX(-10px) translateY(-10px); }
                  50% { transform: translateX(10px) translateY(10px); }
                  75% { transform: translateX(-5px) translateY(5px); }
                }

                .container {
                  text-align: center;
                  max-width: 600px;
                  padding: 2rem;
                  position: relative;
                  z-index: 1;
                  animation: fadeInUp 1s ease-out;
                }

                @keyframes fadeInUp {
                  from {
                    opacity: 0;
                    transform: translateY(30px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }

                .logo {
                  width: 80px;
                  height: 80px;
                  margin: 0 auto 2rem;
                  background: linear-gradient(135deg, #00b877, #00d4aa);
                  border-radius: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 2rem;
                  font-weight: bold;
                  box-shadow: 0 10px 30px rgba(0, 184, 119, 0.3);
                  animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.05); }
                }

                .icon {
                  font-size: 4rem;
                  margin-bottom: 1.5rem;
                  animation: bounce 2s ease-in-out infinite;
                }

                @keyframes bounce {
                  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                  40% { transform: translateY(-10px); }
                  60% { transform: translateY(-5px); }
                }

                h1 {
                  font-size: 2.5rem;
                  margin-bottom: 1rem;
                  background: linear-gradient(135deg, #00b877, #00d4aa);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  font-weight: 700;
                  letter-spacing: -0.02em;
                }

                .subtitle {
                  font-size: 1.2rem;
                  margin-bottom: 2rem;
                  color: #a0a0a0;
                  font-weight: 300;
                }

                .message {
                  font-size: 1.1rem;
                  line-height: 1.6;
                  color: #e0e0e0;
                  margin-bottom: 2rem;
                  padding: 1.5rem;
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 12px;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                }

                .status-indicator {
                  display: inline-flex;
                  align-items: center;
                  gap: 0.5rem;
                  padding: 0.5rem 1rem;
                  background: rgba(255, 193, 7, 0.1);
                  border: 1px solid rgba(255, 193, 7, 0.3);
                  border-radius: 25px;
                  color: #ffc107;
                  font-size: 0.9rem;
                  font-weight: 500;
                  margin-bottom: 2rem;
                }

                .status-dot {
                  width: 8px;
                  height: 8px;
                  background: #ffc107;
                  border-radius: 50%;
                  animation: blink 1.5s ease-in-out infinite;
                }

                @keyframes blink {
                  0%, 50% { opacity: 1; }
                  51%, 100% { opacity: 0.3; }
                }

                .contact-info {
                  margin-top: 2rem;
                  padding: 1rem;
                  background: rgba(0, 184, 119, 0.1);
                  border-radius: 8px;
                  border: 1px solid rgba(0, 184, 119, 0.2);
                }

                .contact-info p {
                  color: #a0a0a0;
                  font-size: 0.9rem;
                  margin-bottom: 0.5rem;
                }

                .contact-info a {
                  color: #00b877;
                  text-decoration: none;
                  font-weight: 500;
                }

                .contact-info a:hover {
                  text-decoration: underline;
                }

                .footer {
                  position: absolute;
                  bottom: 1rem;
                  left: 50%;
                  transform: translateX(-50%);
                  color: #666;
                  font-size: 0.8rem;
                }

                /* Mobile responsiveness */
                @media (max-width: 640px) {
                  .container {
                    padding: 1rem;
                    max-width: 90%;
                  }
                  
                  h1 {
                    font-size: 2rem;
                  }
                  
                  .subtitle {
                    font-size: 1rem;
                  }
                  
                  .message {
                    font-size: 1rem;
                    padding: 1rem;
                  }
                  
                  .logo {
                    width: 60px;
                    height: 60px;
                    font-size: 1.5rem;
                  }
                  
                  .icon {
                    font-size: 3rem;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">CS</div>
                <div class="icon">🔧</div>
                <h1>Under Maintenance</h1>
                <p class="subtitle">We're working hard to improve your experience</p>
                
                <div class="status-indicator">
                  <div class="status-dot"></div>
                  <span>Maintenance in Progress</span>
                </div>
                
                <div class="message">
                  ${
                    data.maintenanceMessage ||
                    "We're currently performing maintenance. Please check back later."
                  }
                </div>
                
                <div class="contact-info">
                  <p>Need immediate assistance?</p>
                  <p>Contact us at <a href="mailto:support@cheapstream.com">support@cheapstream.com</a></p>
                </div>
              </div>
              
              <div class="footer">
                © 2024 Cheap Stream. All rights reserved.
              </div>
            </body>
            </html>
            `,
            {
              status: 503,
              headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Retry-After": "3600", // Suggest retry after 1 hour
              },
            }
          );
        }
      }
    } catch (error) {
      console.error("Error checking maintenance mode:", error);
      // Continue if there's an error checking maintenance mode
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except API, admin dashboard, and static files
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
