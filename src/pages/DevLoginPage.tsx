import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Logo3D from "@/components/Logo3D";

export default function DevLoginPage() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    const success = await adminLogin(username, password);
    if (success) {
      navigate("/dashboard/admin");
    } else {
      setError("Invalid developer credentials. Sign in with an account that has admin role.");
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
            <Logo3D size={50} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 mb-3">
            <Shield className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs text-destructive font-medium">Developer Access Only</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="neo-card space-y-4 border-destructive/10">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Username</label>
            <Input value={username} onChange={e => { setUsername(e.target.value); setError(""); }}
              placeholder="admin" className="bg-secondary border-border rounded-lg" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Password</label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••" className="bg-secondary border-border rounded-lg pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <Button type="submit" className="w-full h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold rounded-lg">
            <Shield className="w-4 h-4 mr-2" /> Access Dashboard
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link to="/signin" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
