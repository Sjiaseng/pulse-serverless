import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Use the same URLs from registration route
    const profilePictureUrls = [
      "https://pulse-app-files.s3.us-east-1.amazonaws.com/profile-pictures/bob.png",
      "https://pulse-app-files.s3.us-east-1.amazonaws.com/profile-pictures/frederick.png",
      "https://pulse-app-files.s3.us-east-1.amazonaws.com/profile-pictures/han.png",
      "https://pulse-app-files.s3.us-east-1.amazonaws.com/profile-pictures/jessica.png",
      "https://pulse-app-files.s3.us-east-1.amazonaws.com/profile-pictures/june.png",
      "https://pulse-app-files.s3.us-east-1.amazonaws.com/profile-pictures/sebastian.png",
    ];

    const availablePictures = profilePictureUrls.map((url) => {
      const filename = url.split("/").pop()?.split(".")[0] || "";
      const name = filename.charAt(0).toUpperCase() + filename.slice(1);

      return {
        id: filename,
        name: name,
        url: url,
      };
    });

    return NextResponse.json({
      success: true,
      pictures: availablePictures,
    });
  } catch (error) {
    console.error("Error getting profile pictures:", error);
    return NextResponse.json(
      { error: "Failed to get profile pictures" },
      { status: 500 },
    );
  }
}

