import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LogIn, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Logo3D from "@/components/Logo3D";

export default function SignInPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) return;
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/dashboard";
    navigate(from, { replace: true });
  }, [isAuthenticated, location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("SignInPage: handleSubmit triggered");
    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      console.log("SignInPage: calling login...");
      const success = await login(identifier, password);
      console.log("SignInPage: login result:", success);
      if (success) {
        console.log("SignInPage: directing to dashboard");
        navigate("/dashboard");
      } else {
        setError("Invalid email/username or password.");
      }
    } catch (err) {
      console.error("SignInPage: handleSubmit error:", err);
      setError("An unexpected error occurred.");
    } finally {
      console.log("SignInPage: setting loading to false");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo3D size={60} />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your StartSmart account</p>
        </div>

        <form onSubmit={handleSubmit} className="neo-card space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email or Username</label>
            <Input value={identifier} onChange={e => { setIdentifier(e.target.value); setError(""); }}
              placeholder="john@example.com or johndoe" className="bg-secondary border-border rounded-lg" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Password</label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password" className="bg-secondary border-border rounded-lg pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot Password?</Link>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow font-semibold rounded-lg">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogIn className="w-4 h-4 mr-2" />}
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">Sign Up</Link>
          </div>
        </form>

        <div className="text-center mt-4 space-y-2">
          <Link to="/dev-login" className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground block">
            Developer Access
          </Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
