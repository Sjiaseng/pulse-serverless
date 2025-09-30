"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PenLine, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import ProfilePictureModal from "@/components/custom/ProfilePictureModal";

interface AdminData {
  user: {
    id: string;
    username: string;
    email: string;
    profilePictureURL: string;
    role: string;
  };
}

interface ProfilePicture {
  id: string;
  name: string;
  url: string;
}

export default function AdminProfilePage() {
  const { user, loading } = useAuth();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [availablePictures, setAvailablePictures] = useState<ProfilePicture[]>(
    [],
  );
  const [pictureLoading, setPictureLoading] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user?.id) return;

      try {
        setProfileLoading(true);
        const response = await fetch(`/api/getProfileData?userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          setAdminData({
            user: {
              id: data.success.user.id,
              username:
                data.success.user.username ||
                user.email?.split("@")[0] ||
                "Admin",
              email: user.email || "",
              profilePictureURL: data.success.user.profilePictureURL || "",
              role: user.role || "admin",
            },
          });
          setEditUsername(
            data.success.user.username || user.email?.split("@")[0] || "Admin",
          );
        } else {
          // Fallback to auth context data
          setAdminData({
            user: {
              id: user.id,
              username: user.email?.split("@")[0] || "Admin",
              email: user.email || "",
              profilePictureURL: "",
              role: user.role || "admin",
            },
          });
          setEditUsername(user.email?.split("@")[0] || "Admin");
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        // Fallback to auth context data
        setAdminData({
          user: {
            id: user.id,
            username: user.email?.split("@")[0] || "Admin",
            email: user.email || "",
            profilePictureURL: "",
            role: user.role || "admin",
          },
        });
        setEditUsername(user.email?.split("@")[0] || "Admin");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

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
        setAdminData((prev) =>
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
    setEditUsername(adminData?.user?.username || "");
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
        setAdminData((prev) =>
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

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
            {/* Header with Title and Logout */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Profile
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your administrative account
                </p>
              </div>
            </div>

            {/* Profile Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Picture Column */}
              <div className="lg:col-span-1 flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar
                    className="w-40 h-40 border-4 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity shadow-lg"
                    onClick={openPictureModal}
                  >
                    <AvatarImage
                      src={
                        adminData?.user?.profilePictureURL ||
                        "https://avatars.githubusercontent.com/u/107231772?v=4"
                      }
                    />
                    <AvatarFallback className="text-2xl font-bold">
                      {adminData?.user?.username?.charAt(0).toUpperCase() ||
                        "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="absolute bottom-2 right-2 bg-[#F5BE66] text-white p-3 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg"
                    onClick={openPictureModal}
                  >
                    <PenLine size={16} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Click to change profile picture
                </p>
              </div>

              {/* Profile Information Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Username Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Username
                  </h3>
                  <div className="flex items-center gap-4">
                    {isEditing ? (
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="flex-1 text-xl font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                          className="p-3 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg disabled:text-gray-400 transition"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={updateLoading}
                          className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg disabled:text-gray-400 transition"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {adminData?.user?.username || "Admin"}
                        </h2>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                          <PenLine size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role and Email Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Role
                    </h3>
                    <div className="bg-[#F5BE66] text-white px-4 py-2 rounded-lg inline-block">
                      <p className="font-medium text-lg">Admin</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Email
                    </h3>
                    <p className="text-gray-700 text-lg">
                      {adminData?.user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Privileges Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Administrative Privileges
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-gray-900">
                      User Management
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage user accounts and permissions
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-gray-900">
                      Content Control
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Moderate forums and content
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-gray-900">
                      System Settings
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure application settings
                    </p>
                  </div>
                </div>
              </div>
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
    </div>
  );
}
