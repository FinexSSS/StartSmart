import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Eye, EyeOff, Upload, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Logo3D from "@/components/Logo3D";

const regions = [
  "North America", "South America", "Europe", "Asia", "Africa",
  "Middle East", "Oceania", "Central America", "Caribbean",
];

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);


  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    dateOfBirth: "", region: "", username: "", password: "",
    confirmPassword: "",
  });

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.username || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const result = await signup({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      username: form.username,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      region: form.region,
      password: form.password,
      profilePicture: profilePreview,
    });
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Signup failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo3D size={60} />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join StartSmart and plan your venture</p>
        </div>

        <form onSubmit={handleSubmit} className="neo-card space-y-4">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <div className="w-20 h-20 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleProfilePic} className="hidden" />
              <p className="text-[10px] text-muted-foreground text-center mt-1">Profile Photo</p>
            </label>
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">First Name *</label>
              <Input value={form.firstName} onChange={e => update("firstName", e.target.value)}
                placeholder="John" className="bg-secondary border-border rounded-lg" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Last Name *</label>
              <Input value={form.lastName} onChange={e => update("lastName", e.target.value)}
                placeholder="Doe" className="bg-secondary border-border rounded-lg" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
            <Input type="email" value={form.email} onChange={e => update("email", e.target.value)}
              placeholder="john@example.com" className="bg-secondary border-border rounded-lg" />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
            <Input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)}
              placeholder="+1 (555) 123-4567" className="bg-secondary border-border rounded-lg" />
          </div>

          {/* DOB & Region */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date of Birth</label>
              <Input type="date" value={form.dateOfBirth} onChange={e => update("dateOfBirth", e.target.value)}
                className="bg-secondary border-border rounded-lg" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Region</label>
              <select value={form.region} onChange={e => update("region", e.target.value)}
                className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-foreground">
                <option value="">Select region</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Username *</label>
            <Input value={form.username} onChange={e => update("username", e.target.value)}
              placeholder="johndoe" className="bg-secondary border-border rounded-lg" />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Password *</label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} value={form.password}
                onChange={e => update("password", e.target.value)}
                placeholder="Min 6 characters" className="bg-secondary border-border rounded-lg pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Confirm Password *</label>
            <Input type="password" value={form.confirmPassword}
              onChange={e => update("confirmPassword", e.target.value)}
              placeholder="Re-enter password" className="bg-secondary border-border rounded-lg" />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow font-semibold rounded-lg">
            <UserPlus className="w-4 h-4 mr-2" /> Create Account
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline">Sign In</Link>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
