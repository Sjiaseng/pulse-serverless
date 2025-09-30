"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { PenLine, Check, X, LogOut, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import ProfilePictureModal from "@/components/custom/ProfilePictureModal";
import toast from "react-hot-toast";

interface UserData {
  user: {
    id: string;
    username: string;
    email: string;
    profilePictureURL: string;
  };
  leaderboard: {
    highest_level: number;
    highest_score_cumulative: number;
    highest_most_achievement: number;
  };
  achievements: Array<{
    id: number;
    title: string;
    description: string;
    icon: string;
    completedAt: string;
  }>;
}

interface ProfilePicture {
  id: string;
  name: string;
  url: string;
}

export default function UserProfilePage() {
  const { user, loading, logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [availablePictures, setAvailablePictures] = useState<ProfilePicture[]>(
    [],
  );
  const [pictureLoading, setPictureLoading] = useState(false);
  const [showPractitionerModal, setShowPractitionerModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;

      try {
        setProfileLoading(true);
        const response = await fetch(`/api/getProfileData?userId=${user.id}`);
        const data = await response.json();
        console.log("Fetched profile data:", data);
        setUserData(data.success);
        setEditUsername(data.success?.user?.username || "");
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  const handleUpdateUsername = async () => {
    if (!user?.id || !editUsername.trim()) return;

    try {
      setUpdateLoading(true);
      const response = await fetch("/api/updateProfile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: editUsername.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserData((prev) =>
          prev
            ? {
                ...prev,
                user: { ...prev.user, username: data.user.username },
              }
            : null,
        );
        setIsEditing(false);
      } else {
        alert(data.error || "Failed to update username");
      }
    } catch (error) {
      console.error("Error updating username:", error);
      alert("Failed to update username");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditUsername(userData?.user?.username || "");
    setIsEditing(false);
  };

  const fetchAvailablePictures = async () => {
    try {
      console.log("Fetching available pictures...");
      const response = await fetch("/api/getProfilePictures");
      const data = await response.json();
      console.log("Profile pictures response:", data);

      if (data.success) {
        console.log("Available pictures:", data.pictures);
        setAvailablePictures(data.pictures);
      } else {
        console.error("Failed to get pictures:", data);
      }
    } catch (error) {
      console.error("Error fetching pictures:", error);
    }
  };

  const handlePictureSelect = async (pictureUrl: string) => {
    if (!user?.id) return;

    try {
      setPictureLoading(true);
      const response = await fetch("/api/uploadProfilePicture", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          profilePictureUrl: pictureUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserData((prev) =>
          prev
            ? {
                ...prev,
                user: {
                  ...prev.user,
                  profilePictureURL: data.user.profile_picture_url,
                },
              }
            : null,
        );
        setShowPictureModal(false);
      } else {
        alert(data.error || "Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error updating picture:", error);
      alert("Failed to update profile picture");
    } finally {
      setPictureLoading(false);
    }
  };

  const openPictureModal = () => {
    fetchAvailablePictures();
    setShowPictureModal(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handlePractitionerSubmit = async () => {
    if (!selectedFile || !user?.id) return;

    setSubmitting(true);
    console.log("Request initiating");
    console.log("User ID:", user.id);
    console.log("File:", selectedFile.name);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", user.id);

      const response = await fetch("/api/user/applyForPractitioner", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Application submitted successfully!");
        setSelectedFile(null);
        setShowPractitionerModal(false);
      } else {
        toast.error(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const closePractitionerModal = () => {
    setShowPractitionerModal(false);
    setSelectedFile(null);
  };
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className="
        flex flex-col
        h-screen
        max-w-md
        mx-auto
        px-8
      py-8
        md:justify-center md:items-center
        lg:py-8
        overflow-hidden
      "
    >
      <div className="flex-1 flex flex-col items-center justify-between w-full">
        <div className="space-y-20 w-full">
          {/* Profile */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex justify-between w-full">
              <button
                onClick={() => setShowPractitionerModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <FileText size={16} />
                Request
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
            <div className="relative">
              <Avatar
                className="w-32 h-32 border-[2px] border-black cursor-pointer hover:opacity-80 transition-opacity"
                onClick={openPictureModal}
              >
                <AvatarImage
                  src={
                    userData?.user?.profilePictureURL ||
                    "https://avatars.githubusercontent.com/u/107231772?v=4"
                  }
                />
                <AvatarFallback>
                  {userData?.user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                onClick={openPictureModal}
              >
                <PenLine size={14} />
              </div>
            </div>
            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="font-headline text-center bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                      disabled={updateLoading}
                      minLength={3}
                      maxLength={256}
                    />
                    <button
                      onClick={handleUpdateUsername}
                      disabled={
                        updateLoading ||
                        !editUsername.trim() ||
                        editUsername.length < 3
                      }
                      className="p-1 text-green-600 hover:text-green-800 disabled:text-gray-400 transition"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={updateLoading}
                      className="p-1 text-red-600 hover:text-red-800 disabled:text-gray-400 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="font-headline">
                      {userData?.user?.username ||
                        user?.email?.split("@")[0] ||
                        "User"}
                    </p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-muted-foreground hover:text-foreground transition"
                    >
                      <PenLine size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="flex flex-col space-y-8">
            <div className="flex items-center gap-3">
              <Separator className="flex-1 bg-foreground" />
              <h2 className="font-headline text-center">Stats</h2>
              <Separator className="flex-1 bg-foreground" />
            </div>
            <div className="flex gap-10 items-center justify-center text-center">
              <div className="flex flex-col space-y-1">
                <h3 className="font-main font-bold text-md">Level</h3>
                <p>{userData?.leaderboard?.highest_level || 0}</p>
              </div>
              <div className="flex flex-col space-y-1">
                <h3 className="font-main font-bold text-md">Points</h3>
                <p>
                  {userData?.leaderboard?.highest_score_cumulative?.toLocaleString() ||
                    0}
                </p>
              </div>
              <div className="flex flex-col space-y-1">
                <h3 className="font-main font-bold text-md">Achievements</h3>
                <p>{userData?.achievements?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="flex flex-col space-y-8">
            <div className="flex items-center gap-3">
              <Separator className="flex-1 bg-foreground" />
              <h2 className="font-headline text-center">Achievements</h2>
              <Separator className="flex-1 bg-foreground" />
            </div>

            {/* Badges wall */}
            <div className="grid grid-cols-3 gap-6 place-items-center">
              {userData!.achievements?.length > 0 ? (
                userData?.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex flex-col items-center text-center space-y-2"
                  >
                    <Image
                      src={
                        achievement.icon ||
                        "https://github.githubassets.com/assets/yolo-default-be0bbff04951.png"
                      }
                      alt={achievement.title}
                      width={80}
                      height={80}
                      className="rounded-full border border-gray-300 hover:border-black shadow-sm"
                    />
                    <p className="text-sm font-main">{achievement.title}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-gray-500 py-8">
                  <p>No achievements earned yet</p>
                  <p className="text-sm">
                    Complete quests to earn achievements!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProfilePictureModal
        isOpen={showPictureModal}
        onClose={() => setShowPictureModal(false)}
        pictures={availablePictures}
        onSelectPicture={handlePictureSelect}
        isLoading={pictureLoading}
        userId={user?.id}
      />

      {/* Practitioner Application Modal */}
      {showPractitionerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-headline">
                Apply to be our partner practitioner
              </h2>
              <button
                onClick={closePractitionerModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload your credentials (PDF only)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={closePractitionerModal}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePractitionerSubmit}
                  disabled={!selectedFile || submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
