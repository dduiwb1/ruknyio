import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

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
              opacity: 0.08,
              backgroundImage:
                "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />

          {/* Avatar placeholder */}
          <div
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              border: "4px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "30px",
              fontSize: 60,
              color: "white",
              fontWeight: 700,
            }}
          >
            {username.charAt(0).toUpperCase()}
          </div>

          {/* Username */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "white",
              display: "flex",
              marginBottom: "16px",
            }}
          >
            @{username}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              color: "rgba(255, 255, 255, 0.75)",
              display: "flex",
              direction: "rtl",
            }}
          >
            على ركني
          </div>

          {/* Bottom branding */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: 22,
                color: "rgba(255, 255, 255, 0.5)",
                display: "flex",
                letterSpacing: "2px",
              }}
            >
              rukny.io
            </div>
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
