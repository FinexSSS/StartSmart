import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";
import Logo3D from "@/components/Logo3D";
import { useAuth } from "@/context/AuthContext";

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="flex justify-center mb-6">
          <Logo3D size={80} />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-8xl font-extrabold gradient-text mb-2">404</h1>
        </motion.div>

        <h2 className="text-xl font-semibold text-foreground mb-2">Page Not Found</h2>
        <p className="text-sm text-muted-foreground mb-2">
          The page <code className="font-mono text-xs bg-secondary px-2 py-0.5 rounded text-primary">{location.pathname}</code> doesn't exist.
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          It may have been moved or you may have mistyped the URL.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold neon-glow hover:bg-primary/90 transition-all"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-primary/20 text-primary rounded-lg text-sm hover:bg-primary/10 transition-all"
          >
            <Search className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
