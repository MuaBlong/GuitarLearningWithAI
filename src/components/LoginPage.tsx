import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { authAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";

interface LoginPageProps {
  onLogin: (user: { name: string; email: string }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authAPI.signin(email, password);
      toast.success("Đăng nhập thành công!");
      onLogin({ 
        name: result.user.user_metadata?.name || result.user.email, 
        email: result.user.email 
      });
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = (error as Error).message;
      
      if (errorMessage.includes("Invalid login credentials") || errorMessage.includes("Invalid email or password")) {
        toast.error("Email hoặc mật khẩu không đúng. Bạn có chắc đã đăng ký tài khoản chưa?");
      } else if (errorMessage.includes("Email not confirmed")) {
        toast.error("Vui lòng xác nhận email trước khi đăng nhập");
      } else {
        toast.error("Đăng nhập thất bại: " + errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.signup(email, password, name);
      toast.success("Đăng ký thành công! Đang đăng nhập...");
      
      // Tự động đăng nhập sau khi đăng ký
      const result = await authAPI.signin(email, password);
      onLogin({ 
        name: result.user.user_metadata?.name || name, 
        email: result.user.email 
      });
    } catch (error) {
      console.error("Register error:", error);
      const errorMessage = (error as Error).message;
      
      if (errorMessage.includes('already been registered') || errorMessage.includes('User already registered')) {
        toast.error("Email này đã được sử dụng. Vui lòng thử đăng nhập hoặc sử dụng email khác.");
      } else if (errorMessage.includes('invalid email')) {
        toast.error("Địa chỉ email không hợp lệ");
      } else if (errorMessage.includes('weak password')) {
        toast.error("Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.");
      } else {
        toast.error("Đăng ký thất bại: " + errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background musical notes */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 text-6xl">🎵</div>
        <div className="absolute top-40 right-32 text-4xl">🎶</div>
        <div className="absolute bottom-32 left-16 text-5xl">♪</div>
        <div className="absolute bottom-20 right-20 text-3xl">♫</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-30">🎸</div>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🎸</span>
          </div>
          <CardTitle className="text-2xl text-gray-900">Guitar Master</CardTitle>
          <CardDescription>Hành trình chinh phục guitar của bạn bắt đầu từ đây</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              {/* Demo Account Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800 mb-2">🎸 <strong>Tài khoản demo:</strong></p>
                <p className="text-xs text-blue-700">Email: demo@guitar.com</p>
                <p className="text-xs text-blue-700">Mật khẩu: demo123</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => {
                    setEmail("demo@guitar.com");
                    setPassword("demo123");
                  }}
                >
                  Sử dụng tài khoản demo
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Mật khẩu</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
              
              <p className="text-xs text-center text-gray-600 mt-2">
                Chưa có tài khoản? Hãy chuyển sang tab "Đăng ký" để tạo tài khoản mới.
              </p>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">✨ <strong>Tạo tài khoản mới miễn phí</strong></p>
                <p className="text-xs text-green-700 mt-1">Bắt đầu hành trình học guitar của bạn ngay hôm nay!</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-name">Họ và tên</Label>
                <Input
                  id="register-name"
                  placeholder="Nhập họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Mật khẩu</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Ít nhất 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                onClick={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Button>
              
              <p className="text-xs text-center text-gray-600 mt-2">
                Đã có tài khoản? Hãy chuyển sang tab "Đăng nhập" để vào ứng dụng.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}