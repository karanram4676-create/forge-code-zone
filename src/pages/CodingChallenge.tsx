import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  points: number;
  problem_statement: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  user_id: string;
}

interface Friend {
  id: string;
  username: string;
  status: string;
}

const CodingChallenge = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showFriendDialog, setShowFriendDialog] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchChallenges();
    fetchLeaderboard();
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const fetchChallenges = async () => {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .order("difficulty", { ascending: true });

    if (error) {
      toast.error("Failed to load challenges");
      return;
    }

    setChallenges(data || []);
  };

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from("challenge_attempts")
      .select(`
        user_id,
        points_earned,
        profiles!challenge_attempts_user_id_fkey(username)
      `)
      .eq("status", "completed");

    if (error) {
      console.error("Failed to load leaderboard:", error);
      return;
    }

    // Aggregate points by user
    const userPoints = (data || []).reduce((acc: any, attempt: any) => {
      const userId = attempt.user_id;
      const username = attempt.profiles?.username || "Unknown";
      if (!acc[userId]) {
        acc[userId] = { user_id: userId, username, points: 0 };
      }
      acc[userId].points += attempt.points_earned || 0;
      return acc;
    }, {});

    // Convert to array and sort
    const leaderboardData = Object.values(userPoints)
      .sort((a: any, b: any) => b.points - a.points)
      .slice(0, 10)
      .map((entry: any, index: number) => ({
        rank: index + 1,
        username: entry.username,
        points: entry.points,
        user_id: entry.user_id,
      }));

    setLeaderboard(leaderboardData as LeaderboardEntry[]);
  };

  const fetchFriends = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("friendships")
      .select(`
        user_id,
        friend_id,
        status,
        profiles!friendships_friend_id_fkey(id, username)
      `)
      .eq("status", "accepted")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (error) {
      console.error("Failed to load friends:", error);
      return;
    }

    const friendsList = (data || []).map((friendship: any) => {
      const friendProfile = friendship.profiles;
      const isFriendIdMatch = friendship.friend_id !== user.id;
      
      return {
        id: isFriendIdMatch ? friendship.friend_id : friendship.user_id,
        username: friendProfile?.username || "Unknown",
        status: friendship.status,
      };
    });

    setFriends(friendsList);
  };

  const handleSoloChallenge = async (challengeId: string) => {
    if (!user) {
      toast.error("Please login to start a challenge");
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("challenge_attempts")
      .insert({
        challenge_id: challengeId,
        user_id: user.id,
        language: "javascript",
        status: "in_progress",
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to start challenge");
      return;
    }

    toast.success("Challenge started!");
    navigate(`/coding-session?attempt_id=${data.id}`);
  };

  const handleFriendChallenge = (challengeId: string) => {
    if (!user) {
      toast.error("Please login to start a challenge");
      navigate("/login");
      return;
    }

    if (friends.length === 0) {
      toast.error("You need friends to start a friend challenge. Add friends first!");
      return;
    }

    setSelectedChallengeId(challengeId);
    setShowFriendDialog(true);
  };

  const handleStartFriendChallenge = async () => {
    if (!user || !selectedChallengeId) return;

    if (selectedFriends.length === 0) {
      toast.error("Please select at least one friend");
      return;
    }

    // Create the challenge attempt
    const { data: attemptData, error: attemptError } = await supabase
      .from("challenge_attempts")
      .insert({
        challenge_id: selectedChallengeId,
        user_id: user.id,
        language: "javascript",
        status: "in_progress",
      })
      .select()
      .single();

    if (attemptError) {
      toast.error("Failed to start challenge");
      return;
    }

    // Add selected friends as participants
    const participants = selectedFriends.map((friendId) => ({
      attempt_id: attemptData.id,
      user_id: friendId,
    }));

    const { error: participantsError } = await supabase
      .from("challenge_participants")
      .insert(participants);

    if (participantsError) {
      console.error("Failed to add participants:", participantsError);
    }

    // Send notifications to friends
    const notifications = selectedFriends.map((friendId) => ({
      user_id: friendId,
      type: "challenge_invite",
      title: "Challenge Invitation",
      message: `${user.email} invited you to join a coding challenge!`,
    }));

    await supabase.from("notifications").insert(notifications);

    setShowFriendDialog(false);
    setSelectedFriends([]);
    toast.success("Challenge started with friends!");
    navigate(`/coding-session?attempt_id=${attemptData.id}`);
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-success text-success-foreground";
      case "medium":
        return "bg-accent text-accent-foreground";
      case "hard":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Coding Challenges
            </h1>
            <p className="text-muted-foreground">
              Test your skills and compete with the community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold">Daily Challenges</h2>
              {challenges.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Loading challenges...
                  </CardContent>
                </Card>
              ) : (
                challenges.map((challenge) => (
                  <Card key={challenge.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold">{challenge.title}</h3>
                          {challenge.description && (
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(challenge.difficulty)}>
                              {challenge.difficulty}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {challenge.points} points
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          className="gap-2"
                          onClick={() => handleSoloChallenge(challenge.id)}
                        >
                          <User className="h-4 w-4" />
                          Solo Challenge
                        </Button>
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => handleFriendChallenge(challenge.id)}
                        >
                          <Users className="h-4 w-4" />
                          With Friends
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div>
              <Card className="bg-gradient-card border-border sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaderboard.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm">
                      No leaderboard data yet
                    </p>
                  ) : (
                    leaderboard.map((entry) => (
                      <div
                        key={entry.rank}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          entry.rank === 1 ? 'bg-primary text-primary-foreground' :
                          entry.rank === 2 ? 'bg-accent text-accent-foreground' :
                          entry.rank === 3 ? 'bg-success text-success-foreground' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {entry.rank}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{entry.username}</p>
                          <p className="text-sm text-muted-foreground">{entry.points} pts</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showFriendDialog} onOpenChange={setShowFriendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Friends for Challenge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {friends.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                You don't have any friends yet. Add friends to challenge them!
              </p>
            ) : (
              <>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary"
                      onClick={() => toggleFriendSelection(friend.id)}
                    >
                      <Checkbox
                        checked={selectedFriends.includes(friend.id)}
                        onCheckedChange={() => toggleFriendSelection(friend.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{friend.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleStartFriendChallenge} 
                  className="w-full"
                  disabled={selectedFriends.length === 0}
                >
                  Start Challenge ({selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''} selected)
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CodingChallenge;
