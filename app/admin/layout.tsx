
import AdminNavigator from "@/app/admin/navigator";
import { AuthProvider } from "./authContext";
import { OnlinePresence } from "@/lib/online-status/online_presence";


export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <AuthProvider>
        <OnlinePresence />
        <AdminNavigator />
        {children}
      </AuthProvider>
    </div>
  );
}
