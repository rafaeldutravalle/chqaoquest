import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-dvh grid place-items-center bg-gradient-hero" />;
  if (!user) return <Navigate to="/onboarding" replace />;
  if (!profile?.onboarded) return <Navigate to="/setup" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default Index;
