import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, Code2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const CodeWithFriends = () => {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  
  // Mock friends data
  const friends = [
    { id: "1", username: "alex_dev", online: true },
    { id: "2", username: "sarah_codes", online: true },
    { id: "3", username: "mike_js", online: false },
    { id: "4", username: "emma_py", online: true },
  ];

  const toggleFriend = (id: string) => {
    setSelectedFriends(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Code with Friends
            </h1>
            <p className="text-muted-foreground">
              Select friends to start a collaborative coding session
            </p>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add More Friends
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {friends.map((friend) => (
              <Card key={friend.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <Checkbox
                    checked={selectedFriends.includes(friend.id)}
                    onCheckedChange={() => toggleFriend(friend.id)}
                  />
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {friend.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{friend.username}</p>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${friend.online ? 'bg-success' : 'bg-muted-foreground'}`} />
                      <span className="text-sm text-muted-foreground">
                        {friend.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-card border-border">
            <CardContent className="p-6 text-center space-y-4">
              <Code2 className="h-12 w-12 mx-auto text-primary" />
              <div>
                <p className="font-medium mb-2">
                  {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Start a coding session with your selected friends
                </p>
              </div>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
                disabled={selectedFriends.length === 0}
              >
                Start Coding
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CodeWithFriends;
