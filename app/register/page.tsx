"use client";

import { useMemo, useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Lock,
  Users,
} from "lucide-react";

function RegistrationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const email = useMemo(
    () => (searchParams.get("email") || "").toLowerCase().trim(),
    [searchParams],
  );

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirm) {
      newErrors.confirm = "Please confirm your password";
    } else if (confirm !== password) {
      newErrors.confirm = "Passwords do not match";
    }

    if (!gender) {
      newErrors.gender = "Please select your gender";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [username, password, confirm, gender]);

  // Password strength calculator
  const pwStrength = useMemo(() => {
    const v = password || "";
    let score = 0;
    const requirements: string[] = [];

    if (v.length >= 6) {
      score++;
      requirements.push("✓ At least 6 characters");
    } else {
      requirements.push("✗ At least 6 characters");
    }

    if (v.length >= 10) {
      score++;
      requirements.push("✓ At least 10 characters");
    } else if (v.length >= 6) {
      requirements.push("✗ At least 10 characters");
    }

    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) {
      score++;
      requirements.push("✓ Upper and lowercase letters");
    } else {
      requirements.push("✗ Upper and lowercase letters");
    }

    if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) {
      score++;
      requirements.push("✓ Numbers and symbols");
    } else {
      requirements.push("✗ Numbers and symbols");
    }

    const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];

    return {
      score: Math.min(score, 4),
      label: labels[Math.min(score, 4)],
      color: colors[Math.min(score, 4)],
      pct: `${(Math.min(score, 4) / 4) * 100}%`,
      requirements,
    };
  }, [password]);

  // Real-time validation
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [touched, validateForm]);

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isFormValid = useMemo(() => {
    return (
      username.trim() &&
      password.length >= 6 &&
      confirm === password &&
      gender &&
      Object.keys(errors).length === 0
    );
  }, [username, password, confirm, gender, errors]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const body = { email, username, password, gender };

      const result = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (result.status !== 201) {
        const data = await result.json();
        if (result.status === 400) {
          console.error("Sign Up Error: ", data.error);
          toast.error(
            <div className="min-w-full flex flex-col space-y-1">
              <p className="font-bold font-main">Something went wrong</p>
              <p className="font-main">{data.error}</p>
            </div>,
          );
          return;
        } else if (result.status === 500) {
          console.error("Internal Server Error");
          toast.error(
            <div className="min-w-full flex flex-col space-y-1">
              <p className="font-bold font-main">Internal Server Error</p>
              <p className="">Please contact the developers</p>
            </div>,
          );
          return;
        }
      }

      router.push("/sign-in?message=success");
      return;
    } catch (error) {
      console.error("Something went wrong", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Create your account
            </CardTitle>
            <CardDescription className="text-center text-base">
              Join our community and start your journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="pl-10 bg-muted/50"
                />
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <User className="h-4 w-4" />
                Username
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => handleFieldBlur("username")}
                  onKeyDown={onKeyDown}
                  autoFocus
                  className={`pl-10 ${errors.username && touched.username ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {errors.username && touched.username && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleFieldBlur("password")}
                  onKeyDown={onKeyDown}
                  className={`pl-10 pr-12 ${errors.password && touched.password ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <button
                  type="button"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  onMouseDown={() => setShowPwd(true)}
                  onMouseUp={() => setShowPwd(false)}
                  onMouseLeave={() => setShowPwd(false)}
                  onTouchStart={() => setShowPwd(true)}
                  onTouchEnd={() => setShowPwd(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Password strength
                    </span>
                    <Badge
                      variant={
                        pwStrength.score >= 3
                          ? "default"
                          : pwStrength.score >= 2
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs font-medium"
                    >
                      {pwStrength.label}
                    </Badge>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pwStrength.color} transition-all duration-300`}
                      style={{ width: pwStrength.pct }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {pwStrength.requirements.slice(0, 4).map((req, idx) => (
                      <span
                        key={idx}
                        className={
                          req.startsWith("✓")
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {errors.password && touched.password && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="confirm"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Lock className="h-4 w-4" />
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onBlur={() => handleFieldBlur("confirm")}
                  onKeyDown={onKeyDown}
                  className={`pl-10 pr-12 ${errors.confirm && touched.confirm ? "border-red-500 focus:ring-red-500" : confirm && confirm === password ? "border-green-500 focus:ring-green-500" : ""}`}
                />
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <button
                  type="button"
                  aria-label={
                    showConfirmPwd ? "Hide password" : "Show password"
                  }
                  onMouseDown={() => setShowConfirmPwd(true)}
                  onMouseUp={() => setShowConfirmPwd(false)}
                  onMouseLeave={() => setShowConfirmPwd(false)}
                  onTouchStart={() => setShowConfirmPwd(true)}
                  onTouchEnd={() => setShowConfirmPwd(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPwd ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                {confirm && confirm === password && (
                  <CheckCircle2 className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
              </div>
              {errors.confirm && touched.confirm && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirm}
                </p>
              )}
            </div>

            {/* Gender Field */}
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Gender
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger
                  className={
                    errors.gender && touched.gender
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select your gender" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && touched.gender && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.gender}
                </p>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              variant="default"
              disabled={loading || !email || !isFormValid}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={
      <main className="bg-primary flex flex-col justify-center items-center min-h-screen max-w-md mx-auto py-10 px-6">
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl mb-4">Create Account</h1>
          <p className="text-gray-600 mb-8">Loading registration page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </main>
    }>
      <RegistrationPageContent />
    </Suspense>
  );
}
