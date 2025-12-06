import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { LoginPage } from "./components/LoginPage";
import { HomePage } from "./components/HomePage";
import { TheoryPage } from "./components/TheoryPage";
import { PracticePage } from "./components/PracticePage";
import { VideoPage } from "./components/VideoPage";
import { ProgressPage } from "./components/ProgressPage";
import { ForumPage } from "./components/ForumPage";
import { NotificationProvider } from "./components/NotificationContext";
import { Toaster } from "./components/ui/sonner";
import { authAPI } from "./utils/api";
import { toast } from "sonner@2.0.3";

interface User {
  name: string;
  email: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("home");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Kiểm tra session khi app khởi động
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // Add timeout to prevent hanging
      const sessionPromise = authAPI.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Session check timeout")),
          10000,
        ),
      );

      const session = await Promise.race([
        sessionPromise,
        timeoutPromise,
      ]);

      if (session?.user) {
        setCurrentUser({
          name:
            session.user.user_metadata?.name ||
            session.user.email,
          email: session.user.email,
        });
        console.log(
          "✅ Session restored for user:",
          session.user.email,
        );
      } else {
        console.log("ℹ️ No existing session found");
      }
    } catch (error) {
      console.error("Error checking session:", error);
      // Don't show error toast on session check failure
      console.log(
        "⚠️ Session check failed, user will need to login",
      );
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await authAPI.signout();
      setCurrentUser(null);
      setActiveTab("home");
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Lỗi khi đăng xuất");
    }
  };

  // Hiển thị loading khi đang kiểm tra auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage currentUser={currentUser} />;
      case "theory":
        return <TheoryPage />;
      case "practice":
        return <PracticePage />;
      case "videos":
        return <VideoPage />;
      case "progress":
        return <ProgressPage />;
      case "forum":
        return <ForumPage />;
      default:
        return <HomePage currentUser={currentUser} />;
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          onTabChange={setActiveTab}
        />

        <div className="flex">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <main className="flex-1 overflow-x-hidden">
            {renderContent()}
          </main>
        </div>

        <Toaster
          position="top-right"
          expand={true}
          richColors
          closeButton
        />
      </div>
    </NotificationProvider>
  );
}