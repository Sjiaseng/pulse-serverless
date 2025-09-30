import NavigationBar from "@/components/custom/NavigationBar";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnlinePresence } from "@/lib/online-status/online_presence";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main content with bottom padding for navigation */}
      <main className="pb-20">
        <AuthProvider>
          <OnlinePresence /> 
          {children}
        </AuthProvider>
      </main>

      {/* Bottom Navigation */}
      <NavigationBar role={"user"} />
    </div>
  );
}
