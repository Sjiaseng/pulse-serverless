"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  LogOut,
  User,
  BarChart3,
  Users,
  MessageCircle,
  Trophy,
  FileText,
  Heart,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./authContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/chat", label: "Live Chat", icon: MessageCircle },
  { href: "/admin/quests", label: "Quests", icon: Trophy },
  { href: "/admin/reports", label: "Reports", icon: FileText },
];

const mobileShelfItems = [
  ...navItems,
  { href: "/admin/forum", label: "Forum", icon: MessageCircle },
];
const bottomNavItems = navItems;

interface UserBasic {
  username: string;
  profile_picture_url: string | null;
}

function getInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<UserBasic | null>(null);
  const { user: sessionUser } = useAuth();

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const currentUserId = sessionUser?.id || "";

  useEffect(() => {
    const fetchUser = async () => {
      if (!currentUserId) return;

      try {
        const res = await fetch(`/api/admin/users/${currentUserId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }

        const data: UserBasic = await res.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, [currentUserId]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/sign-in");
  };

  return (
    <>
      {/* desktop header */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F5BE66] rounded-3xl flex items-center justify-center shadow-lg">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-montserrat font-bold text-xl text-gray-900">
              Pulse
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {mobileShelfItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-montserrat font-medium transition-all duration-200 ${
                  isActive
                    ? "text-[#F5BE66] bg-gray-50"
                    : "text-gray-600 hover:text-[#F5BE66] hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* desktop profile dropdown */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 p-3 rounded-2xl w-50 h-12"
              >
                <Avatar className="w-9 h-9">
                  <AvatarImage
                    src={userData?.profile_picture_url || "/images/default.jpg"}
                  />
                  <AvatarFallback className="bg-[#F5BE66] text-white font-semibold">
                    {getInitials(userData?.username || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-montserrat font-semibold text-sm truncate w-27">
                    {userData?.username}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl border-gray-100"
            >
              <DropdownMenuItem
                className="rounded-xl"
                onClick={() => router.push("/admin/profile")}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 rounded-xl"
                onClick={() => setLogoutDialogOpen(true)}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Header */}
      <header
        className={`md:hidden bg-[#F5BE66] sticky top-0 z-50 py-2 rounded-b-[2rem] shadow-lg 
          transition-all duration-500 ease-in-out overflow-hidden
          ${isMobileMenuOpen ? "h-227" : "h-22"}`}
      >
        <div className="flex items-center justify-between px-6 py-4 pb-6">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-white/30">
              <AvatarImage
                src={userData?.profile_picture_url || "/images/default.jpg"}
              />
              <AvatarFallback className="bg-white/20 text-white font-dela text-lg">
                {getInitials(userData?.username || "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white/80 text-sm font-montserrat">
                {userData?.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-2xl text-white p-0"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Open/Close Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="mobileMenu"
              initial={{ opacity: 0, y: "-100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="bg-white/95 backdrop-blur-sm mx-4 mb-4 rounded-3xl shadow-lg"
            >
              <nav className="px-6 py-6 space-y-2">
                {mobileShelfItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-montserrat font-medium transition-all duration-200 ${
                        isActive
                          ? "text-[#F5BE66] bg-[#F5BE66]/10"
                          : "text-gray-700 hover:text-[#F5BE66] hover:bg-[#F5BE66]/10"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          isActive ? "bg-[#F5BE66]/20" : "bg-[#F5BE66]/10"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {item.label}
                    </Link>
                  );
                })}

                <div className="border-t border-gray-100 my-4"></div>

                <div className="flex items-center gap-4 px-4 py-4 bg-[#F5BE66]/5 rounded-2xl">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={
                        userData?.profile_picture_url || "/images/default.jpg"
                      }
                    />
                    <AvatarFallback className="bg-[#F5BE66] text-white font-semibold">
                      {getInitials(userData?.username || "Loading User...")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-montserrat font-semibold">
                      {userData?.username}
                    </p>
                  </div>
                </div>

                <Link
                  href="/admin/profile"
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-montserrat font-medium transition-all duration-200 ${
                    pathname === "/admin/profile"
                      ? "text-[#F5BE66] bg-[#F5BE66]/10"
                      : "text-gray-700 hover:text-[#F5BE66] hover:bg-[#F5BE66]/10"
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  Profile
                </Link>

                <button
                  onClick={() => setLogoutDialogOpen(true)}
                  className="w-full flex items-center gap-4 px-4 py-4 text-red-600 hover:bg-red-50 rounded-2xl font-montserrat font-medium transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  Logout
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Bottom Nav */}
      <AnimatePresence>
        {!isMobileMenuOpen && (
          <motion.nav
            key="mobileBottomNav"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 rounded-t-3xl shadow-lg"
          >
            <div className="flex items-center justify-around py-2 px-4">
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center gap-2 px-3 py-2 transition-colors"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-[#F5BE66] shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${isActive ? "text-white" : "text-gray-600"}`}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="rounded-xl">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="w-full sm:w-25 rounded-xl"
                variant="default"
                onClick={() => {
                  handleLogout();
                }}
              >
                Logout
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
