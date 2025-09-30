"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI/control state
  const [isUser, setIsUser] = useState(false); // false = ask email, true = ask password
  const [loading, setLoading] = useState(false);

  // Check for success message on component mount
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "success") {
      toast.success("Registration successful! Please sign in.");
      // Clean up the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("message");
      window.history.replaceState(null, "", url.toString());
    }
  }, [searchParams]);

  const handleContinueOrLogin = async () => {
    // STEP 1: Check if user exists
    if (!isUser) {
      if (!email) {
        toast.error("Please enter your email.");
        return;
      }
      setLoading(true);

      try {
        const res = await fetch("/api/auth/user-exists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json().catch(
          () =>
            ({}) as {
              exists?: boolean;
              hasPassword?: boolean;
              error?: string;
            },
        );

        if (!res.ok) throw new Error(data.error || "Failed to check account.");

        if (data.exists) {
          if (data.hasPassword) {
            setIsUser(true);
          } else {
            toast.error(
              <div className="min-w-full flex flex-col space-y-1">
                <p className="font-bold font-main">
                  Please continue with Google
                </p>
                <p className="font-main">
                  This account is associated with Google Oauth
                </p>
              </div>,
            );
          }
        } else {
          router.push(`/register?email=${encodeURIComponent(email)}`);
        }
      } catch (error: unknown) {
        console.error("Error occured: ", error);
        toast.error("Something went wrong.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // STEP 2: Login
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        const role = data.user.role;

        if (role === "admin") {
          router.push("/admin");
        } else if (role === "practitioner") {
          router.push("/practitioner");
        } else if (role === "user") {
          router.push("/user");
        }
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Invalid email or password.");
      }
    } catch (error: unknown) {
      console.error("Error occured: ", error);
      toast.error("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // allow Enter key to submit current step
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleContinueOrLogin();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-8 md:px-16 py-10 bg-white">
      <div className="w-full max-w-sm md:max-w-lg lg:max-w-xl space-y-16">
        <div className="space-y-3 justify-start">
          <h1 className="font-headline text-3xl sm:text-4xl">Welcome Back!</h1>
          <p className="font-main font-medium">
            learn healthy habits, one step at a time
          </p>
        </div>

        <div className="flex flex-col space-y-6">
          {/* Step 1: Email (always visible, but disabled when on password step) */}
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKeyDown}
            required
            disabled={isUser || loading}
          />

          {/* Step 2: Password (only shows after we confirm user exists) */}
          {isUser && (
            <div className="space-y-2">
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKeyDown}
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="text"
                className="w-full justify-end"
                onClick={() => router.push("/forgot-password")}
              >
                Forgot Password?
              </Button>
            </div>
          )}
        </div>

        <Button
          onClick={handleContinueOrLogin}
          className="font-headline"
          disabled={loading || (!isUser && !email) || (isUser && !password)}
        >
          {loading
            ? isUser
              ? "Logging in..."
              : "Checking..."
            : isUser
              ? "Login"
              : "Continue"}
        </Button>
      </div>

      <div className="space-y-5 mt-10">
        <div className="flex items-center gap-3 text-sm">
          <Separator className="flex-1" />
          or with
          <Separator className="flex-1" />
        </div>
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() =>
              (window.location.href = "/api/auth/oauth/start?provider=google")
            }
            className="w-full rounded-xl max-w-xs gap-2 p-5"
            disabled={loading}
          >
            <FcGoogle size={20} />
            Google
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="bg-primary flex flex-col justify-center items-center min-h-screen max-w-md mx-auto py-10 px-6 space-y-10">
        <div className="text-center">
          <h1 className="font-headline text-3xl mb-4">Welcome Back</h1>
          <p className="text-gray-600 mb-8">Loading sign in page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    }>
      <SignInPageContent />
    </Suspense>
  );
}
