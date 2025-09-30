/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Ban,
  Mail,
  UserCheck,
  Stethoscope,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  X,
  UserCheckIcon,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../authContext";
import Link from "next/link";
import toast from "react-hot-toast";
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
import { PractitionerWithUser } from "@/app/api/admin/users/practitioner/fetch/route";
import { PractitionerReviewDialog } from "./practitionerPreviewDialog";
import UserProfileDialog from "./userProfileDialog";

export type UserStatus = "active" | "inactive" | "suspended";

export interface Application {
  id: number;
  userId: string;
  username: string;
  gender: string;
  email: string;
  joined_date: string;
  submission_date: string;
  license_url: string;
  status: string;
  updated_at: string;
  profile_url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  joinDate: string;
  lastActive: string;
  avatar: string | null;
  role: string;
}

export interface Practitioner {
  id: number;
  name: string;
  email: string;
  status: string;
  avatar: string | null;
  submissionDate: string;
  joinDate: string;
  user_id: string;
}

interface Stats {
  total: number;
  online: number;
  offline: number;
  suspended: number;
}

interface PractitionerStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifyStatusFilter, setVerifyStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("users");
  const [countData, setCountData] = useState<Stats | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [practitionerStats, setPractitionerStats] =
    useState<PractitionerStats | null>(null);
  const [openPractitionerDialog, setOpenPractitionerDialog] = useState(false);
  const [selectedPractitioner, setSelectedPractitioner] =
    useState<Practitioner | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );

  const [userList, setUserList] = useState<User[] | null>(null);

  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const { user: sessionUser } = useAuth();

  const [openAdminDialog, setOpenAdminDialog] = useState(false);

  const [selectedUserAdmin, setSelectedUserAdmin] = useState<User | null>(null);

  const [adminAction, setAdminAction] = useState<"upgrade" | "degrade" | null>(
    null,
  );

  const handleUpgrade = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/upgrade`, {
        method: "POST",
      });

      setUserList(
        (prev) =>
          prev?.map((user) =>
            user.id === userId ? { ...user, role: "admin" } : user,
          ) ?? null,
      );
      toast.success("User upgraded to admin!");
    } catch (error) {
      toast.error("Failed to upgrade user.");
      console.error(error);
    }
  };

  const handleDegrade = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/degrade`, {
        method: "POST",
      });
      setUserList(
        (prev) =>
          prev?.map((user) =>
            user.id === userId ? { ...user, role: "user" } : user,
          ) ?? null,
      );
      toast.success("User downgraded to user!");
    } catch (error) {
      toast.error("Failed to degrade user.");
      console.error(error);
    }
  };

  const handlePractitionerStatus = async (
    practitionerId: number,
    userId: string,
    action: "approve" | "reject",
  ) => {
    try {
      const res = await fetch(`/api/admin/users/practitioner/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practitionerId,
          userId,
          status: action === "approve" ? "verified" : "rejected",
        }),
      });

      if (!res.ok) throw new Error("Failed to update practitioner status");

      toast.success("Practitioner status updated successfully");
      setPractitioners((prev) =>
        prev.map((p) =>
          p.id === practitionerId
            ? { ...p, status: action === "approve" ? "verified" : "rejected" }
            : p,
        ),
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update practitioner status");
    } finally {
      setOpenPractitionerDialog(false);
    }
  };

  useEffect(() => {
    const fetchPractitionerStats = async () => {
      try {
        const response = await fetch("/api/admin/users/practitioner/fetch");
        if (!response.ok) throw new Error("Failed to fetch practitioner stats");

        const rawData: PractitionerWithUser[] = await response.json();

        const transformed: Practitioner[] = rawData.map((row) => ({
          id: row.practitioner.id,
          name: row.user.username || "",
          email: row.user.email || "",
          status: row.practitioner.status || "pending",
          avatar: row.user.profile_picture_url || null,
          submissionDate: formatDateTime(row.practitioner.submitted_at),
          joinDate: formatDateTime(row.user.created_at),
          user_id: row.user.id,
        }));

        setPractitioners(transformed);
      } catch (error) {
        console.error("Error fetching practitioner stats:", error);
      }
    };

    fetchPractitionerStats();
  }, []);

  // fetch practitioner stats
  useEffect(() => {
    const fetchPractitionerStats = async () => {
      try {
        const response = await fetch("/api/admin/users/practitioner/stats");
        if (!response.ok) throw new Error("Failed to fetch practitioner stats");

        const data = await response.json();
        setPractitionerStats(data);
      } catch (error) {
        console.error("Error fetching practitioner stats:", error);
      }
    };

    fetchPractitionerStats();
  }, []);

  // fetch all user from the db
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users/user-list");
        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();

        const normalized: User[] = data.map((u: any) => ({
          id: u.id,
          name: u.username ?? "",
          email: u.email ?? "",
          avatar: u.profile_picture_url ?? null,
          joinDate: u.created_at ?? "-",
          lastActive: u.updated_at ?? "-",
          role: u.role ?? "",
          status:
            u.suspension_status === true
              ? "suspended"
              : u.online_status === true
                ? "active"
                : "inactive",
        }));

        setUserList(normalized);

        console.log(normalized);
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    };

    fetchUsers();
  }, []);

  // fetch card status on user tab
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/users/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        setCountData(data);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchStats();
  }, []);

  async function handleStatusChange(userId: string, currentStatus: UserStatus) {
    try {
      const suspend = currentStatus !== "suspended";

      const res = await fetch("/api/admin/users/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, suspend }),
      });

      if (!res.ok) throw new Error("Failed to update user");

      const updatedUser: {
        suspension_status: boolean;
        online_status: boolean;
      } = await res.json();

      toast.success("User suspension status updated.");

      setUserList(
        (prev) =>
          prev?.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  suspension_status: updatedUser.suspension_status,
                  status: updatedUser.suspension_status
                    ? "suspended"
                    : updatedUser.online_status
                      ? "active"
                      : "inactive",
                }
              : u,
          ) || [],
      );
    } catch (err) {
      console.error(err);
      toast.error?.("Failed to update user suspension status.");
    }
  }

  const filteredUsers = userList?.filter((user) => {
    if (!user) return false;
    const name = user.name ?? "";
    const email = user.email ?? "";

    if (statusFilter !== "all" && user.status !== statusFilter) return false;
    if (
      !name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !email.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const filteredPractitioners = practitioners.filter((practitioner) => {
    if (
      verifyStatusFilter !== "all" &&
      practitioner.status !== verifyStatusFilter
    )
      return false;
    if (
      !practitioner.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !practitioner.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "verified":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status === "active" ? "Active" : "Verified"}
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            Inactive
          </Badge>
        );
      case "suspended":
        return (
          <Badge
            variant="destructive"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            Suspended
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="destructive"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const UserCard = ({
    user,
    handleStatusChange,
  }: {
    user: User;
    handleStatusChange: (id: string, status: UserStatus) => void;
  }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/10">
              <AvatarImage
                src={user.avatar || "/images/default.jpg"}
                alt={user.name || "User"}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {(user.name ?? "NA")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-main font-semibold text-foreground">
                {user.name ?? "Unknown User"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {user.email ?? "No email"}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <UserProfileDialog userId={user.id} userEmail={user.email}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Eye className="w-4 h-4 mr-2" /> View Profile
                </DropdownMenuItem>
              </UserProfileDialog>
              {user.id !== sessionUser?.id && (
                <DropdownMenuItem asChild>
                  <Link
                    href={`/admin/chat?to=${user.name}`}
                    className="flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-2" /> Send Message
                  </Link>
                </DropdownMenuItem>
              )}
              {user.id !== sessionUser?.id && (
                <DropdownMenuItem
                  className={`flex items-center ${
                    user.status === "suspended"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                  onClick={() => {
                    setSelectedUser(user);
                    setOpen(true);
                  }}
                >
                  <Ban
                    className={`w-4 h-4 mr-2 ${
                      user.status === "suspended"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  />
                  {user.status === "suspended"
                    ? "Unsuspend User"
                    : "Suspend User"}
                </DropdownMenuItem>
              )}
              {user.status !== "suspended" && user.id !== sessionUser?.id && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUserAdmin(user);
                    setAdminAction(
                      user.role === "admin" ? "degrade" : "upgrade",
                    );
                    setOpenAdminDialog(true);
                  }}
                  className="flex items-center"
                >
                  {user.role === "admin" ? (
                    <UserMinus className="w-4 h-4 mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {user.role === "admin"
                    ? "Degrade to User"
                    : "Upgrade to Admin"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mb-4">
          {getStatusBadge(user.status)}
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Joined: {formatDateTime(user.joinDate)}</span>
          <span>Last Active: {formatDateTime(user.lastActive)}</span>
        </div>
      </CardContent>
    </Card>
  );

  const PractitionerCard = ({
    practitioner,
  }: {
    practitioner: (typeof practitioners)[0];
  }) => (
    <Card className="group mb-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/10">
              <AvatarImage src={practitioner.avatar || "/images/default.jpg"} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {practitioner.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-main font-semibold text-foreground">
                {practitioner.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {practitioner.email}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `/api/admin/users/practitioner/review-dialog/${practitioner.id}`,
                    );
                    if (!res.ok) throw new Error("Failed to fetch application");

                    const app: Application = await res.json();
                    setSelectedApplication(app);
                    setReviewDialogOpen(true);
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to fetch application");
                  }
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Review Application
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-green-500"
                onClick={() => {
                  setSelectedPractitioner(practitioner);
                  setActionType("approve");
                  setOpenPractitionerDialog(true);
                }}
              >
                <UserCheckIcon className="w-4 h-4 mr-2 text-green-500" />
                Approve Application
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-500"
                onClick={() => {
                  setSelectedPractitioner(practitioner);
                  setActionType("reject");
                  setOpenPractitionerDialog(true);
                }}
              >
                <X className="w-4 h-4 mr-2 text-red-500" />
                Reject Application
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Link
                  href={`/admin/chat?to=${practitioner.name}`}
                  className="flex items-center"
                >
                  <Mail className="w-4 h-4 mr-4" /> Send Message
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mb-4">
          {getStatusBadge(practitioner.status)}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>1 doc</span>
          </div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Submitted: {practitioner.submissionDate}</span>
          <span>Joined: {practitioner.joinDate}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto pb-25 md:pb-0 mb-0 md:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-montserrat font-bold  text-3xl sm:text-4xl text-foreground mb-2">
              User Management
            </h1>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="flex w-full max-w-md  bg-muted/50 rounded-xl shadow-md border border-muted-foreground/10">
            <TabsTrigger
              value="users"
              className="flex overflow-hidden items-center gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_3px_0_0_#000] transition-all"
            >
              <UserCheck className="w-4 h-4" />
              App Users
            </TabsTrigger>
            <TabsTrigger
              value="practitioners"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_3px_0_0_#000] transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              Practitioners
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {countData?.total}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Active Users
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {countData?.online}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Inactive</p>
                      <p className="text-2xl font-bold text-foreground">
                        {countData?.offline}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                      <Ban className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Suspended</p>
                      <p className="text-2xl font-bold text-foreground">
                        {countData?.suspended}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 bg-background border-border/50 focus:border-primary/50"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-11 px-4 rounded-xl border-border/50 hover:border-primary/50 bg-transparent"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Status: {statusFilter === "all" ? "All" : statusFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                        All Users
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setStatusFilter("active")}
                      >
                        Active
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setStatusFilter("inactive")}
                      >
                        Inactive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setStatusFilter("suspended")}
                      >
                        Suspended
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUsers?.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  handleStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="practitioners" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Requests
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {practitionerStats?.total}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verified</p>
                      <p className="text-2xl font-bold text-foreground">
                        {practitionerStats?.verified}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pending Review
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {practitionerStats?.pending}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold text-foreground">
                        {practitionerStats?.rejected}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search practitioners by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 bg-background border-border/50 focus:border-primary/50"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-11 px-4 rounded-xl border-border/50 hover:border-primary/50 bg-transparent"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Status:{" "}
                        {verifyStatusFilter === "all"
                          ? "All"
                          : verifyStatusFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => setVerifyStatusFilter("all")}
                      >
                        All Practitioners
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setVerifyStatusFilter("verified")}
                      >
                        Verified
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setVerifyStatusFilter("pending")}
                      >
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setVerifyStatusFilter("rejected")}
                      >
                        Rejected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPractitioners.map((practitioner) => (
                <PractitionerCard
                  key={practitioner.id}
                  practitioner={practitioner}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog
        open={openPractitionerDialog}
        onOpenChange={setOpenPractitionerDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve"
                ? "Approve Practitioner Application?"
                : "Reject Practitioner Application?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? "Approve Practitioner's Application?"
                : "Reject Pracittioner's Application?"}
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
                variant={actionType === "reject" ? "destructive" : "default"}
                onClick={() => {
                  if (actionType && selectedApplication) {
                    handlePractitionerStatus(
                      selectedApplication.id,
                      selectedApplication.userId,
                      actionType,
                    );
                  } else if (actionType && selectedPractitioner) {
                    handlePractitionerStatus(
                      selectedPractitioner.id,
                      selectedPractitioner.user_id,
                      actionType,
                    );
                  }
                }}
              >
                {actionType === "approve" ? "Approve" : "Reject"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openAdminDialog} onOpenChange={setOpenAdminDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {adminAction === "upgrade"
                ? `Upgrade ${selectedUserAdmin?.name} to Admin?`
                : `Degrade ${selectedUserAdmin?.name} to User?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {adminAction === "upgrade"
                ? "This user will gain admin privileges."
                : "This user will lose admin privileges."}
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
                  if (!selectedUserAdmin) return;

                  if (adminAction === "upgrade")
                    handleUpgrade(selectedUserAdmin.id);
                  else if (adminAction === "degrade")
                    handleDegrade(selectedUserAdmin.id);

                  setOpenAdminDialog(false);
                  setAdminAction(null);
                }}
              >
                {adminAction === "upgrade" ? "Upgrade" : "Degrade"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.status === "suspended"
                ? "Unsuspend this user?"
                : "Suspend this user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.status === "suspended"
                ? "The user will regain access to their account."
                : "This will immediately prevent the user from logging in."}
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
                variant={
                  selectedUser?.status === "suspended"
                    ? "default"
                    : "destructive"
                }
                onClick={() => {
                  if (selectedUser) {
                    handleStatusChange(selectedUser.id, selectedUser.status);
                  }
                  setOpen(false);
                }}
              >
                {selectedUser?.status === "suspended" ? "Unsuspend" : "Suspend"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PractitionerReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        application={selectedApplication}
        onApprove={() => {
          if (!selectedApplication) return;
          setActionType("approve");
          setOpenPractitionerDialog(true);
        }}
        onReject={() => {
          if (!selectedApplication) return;
          setActionType("reject");
          setOpenPractitionerDialog(true);
        }}
      />
    </div>
  );
}
