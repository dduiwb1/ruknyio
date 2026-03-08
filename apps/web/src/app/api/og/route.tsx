import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)",
            fontFamily: "sans-serif",
          }}
        >
          {/* Background pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              opacity: 0.1,
              backgroundImage:
                "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 80px",
              borderRadius: "32px",
              background: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
            }}
          >
            {/* Logo / Brand name */}
            <div
              style={{
                fontSize: 88,
                fontWeight: 800,
                color: "white",
                letterSpacing: "-2px",
                display: "flex",
                marginBottom: "12px",
              }}
            >
              ركني
            </div>

            <div
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.9)",
                letterSpacing: "4px",
                display: "flex",
                marginBottom: "32px",
                textTransform: "uppercase",
              }}
            >
              RUKNY
            </div>

            {/* Divider */}
            <div
              style={{
                width: "80px",
                height: "4px",
                background: "rgba(255, 255, 255, 0.5)",
                borderRadius: "4px",
                display: "flex",
                marginBottom: "32px",
              }}
            />

            {/* Tagline */}
            <div
              style={{
                fontSize: 32,
                color: "rgba(255, 255, 255, 0.85)",
                display: "flex",
                textAlign: "center",
                direction: "rtl",
              }}
            >
              صفحتك، متجرك، رابطك
            </div>
          </div>

          {/* URL */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              fontSize: 24,
              color: "rgba(255, 255, 255, 0.6)",
              display: "flex",
              letterSpacing: "2px",
            }}
          >
            rukny.io
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error("OG Image generation error:", e);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
