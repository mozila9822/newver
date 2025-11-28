import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Plane, LogIn, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    setLocation(user.role === "admin" ? "/admin" : "/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = login(email, password);
    
    if (result.success) {
      // Check the user's role after login to redirect appropriately
      // We need to check the email to determine role since state updates are async
      const isAdmin = email.trim().toLowerCase() === "admin@voyager.com";
      setLocation(isAdmin ? "/admin" : "/");
    } else {
      setError(result.error || "Login failed");
    }
    
    setIsLoading(false);
  };

  const fillDemoCredentials = (type: "admin" | "user") => {
    if (type === "admin") {
      setEmail("admin@voyager.com");
      setPassword("admin123");
    } else {
      setEmail("user@voyager.com");
      setPassword("user123");
    }
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/10">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
             <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center">
               <Plane className="w-8 h-8" />
             </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-serif font-bold text-primary">Welcome Back</CardTitle>
            <CardDescription>Sign in to your Voyager Hub account</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="w-full text-sm"
              onClick={() => fillDemoCredentials("user")}
              type="button"
            >
              Fill User Demo
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-sm"
              onClick={() => fillDemoCredentials("admin")}
              type="button"
            >
              Fill Admin Demo
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p><strong>User:</strong> user@voyager.com / user123</p>
            <p><strong>Admin:</strong> admin@voyager.com / admin123</p>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/"><a className="hover:underline">Back to Home</a></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
