import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { KeyRound, ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Logo3D from "@/components/Logo3D";

export default function ForgotPasswordPage() {
  const { resetPasswordRequest } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    const ok = await resetPasswordRequest(email);
    setLoading(false);
    if (ok) {
      setSuccess(true);
    } else {
      setError("We could not send a reset link. Check the email address or try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3"><Logo3D size={60} /></div>
          <h1 className="text-2xl font-bold gradient-text">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        {success ? (
          <div className="neo-card text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground">We sent a password reset link to <strong>{email}</strong>. Use the link to set a new password.</p>
            <Link to="/signin">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold">
                Go to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="neo-card space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email Address</label>
              <Input
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="Enter your registered email"
                className="bg-secondary border-border rounded-lg"
                type="email"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow font-semibold rounded-lg"
              disabled={loading}
            >
              <KeyRound className="w-4 h-4 mr-2" /> {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/signin" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
