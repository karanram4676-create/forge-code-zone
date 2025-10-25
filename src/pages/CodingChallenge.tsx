import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, User } from "lucide-react";

const CodingChallenge = () => {
  const challenges = [
    {
      id: 1,
      title: "Two Sum Problem",
      difficulty: "Easy",
      points: 100,
    },
    {
      id: 2,
      title: "Binary Tree Traversal",
      difficulty: "Medium",
      points: 200,
    },
    {
      id: 3,
      title: "Dynamic Programming - Knapsack",
      difficulty: "Hard",
      points: 300,
    },
    {
      id: 4,
      title: "String Manipulation",
      difficulty: "Easy",
      points: 100,
    },
  ];

  const leaderboard = [
    { rank: 1, username: "code_master", points: 1250 },
    { rank: 2, username: "algo_wizard", points: 1100 },
    { rank: 3, username: "debug_hero", points: 950 },
    { rank: 4, username: "syntax_ninja", points: 800 },
    { rank: 5, username: "loop_legend", points: 750 },
  ];

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
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{challenge.title}</h3>
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
                      <Button variant="default" className="gap-2">
                        <User className="h-4 w-4" />
                        Solo Challenge
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Users className="h-4 w-4" />
                        With Friends
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  {leaderboard.map((entry) => (
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
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CodingChallenge;
