import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ActionCard } from "@/components/ActionCard";
import { Users, Globe, Trophy } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Developer';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Welcome Banner */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome back, {username}!
            </h1>
            <p className="text-xl text-muted-foreground">
              Collaborate, Compete, and Code Smarter.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <ActionCard
              title="Code with Friends"
              description="Collaborate on projects with your friends in real-time"
              icon={Users}
              path="/code-with-friends"
              gradient
            />
            <ActionCard
              title="Code with Strangers"
              description="Get matched with developers and build something amazing"
              icon={Globe}
              path="/code-with-strangers"
              gradient
            />
            <ActionCard
              title="Coding Challenge"
              description="Solve problems, earn points, and climb the leaderboard"
              icon={Trophy}
              path="/coding-challenge"
              gradient
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
