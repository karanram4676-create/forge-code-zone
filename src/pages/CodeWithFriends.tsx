import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Code2, Check, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddFriendDialog } from "@/components/AddFriendDialog";

interface Friend {
  id: string;
  friend_id: string;
  status: string;
  profiles: {
    username: string;
  };
}

interface FriendRequest {
  id: string;
  user_id: string;
  status: string;
  profiles: {
    username: string;
  };
}

const CodeWithFriends = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchFriendRequests();
      
      // Subscribe to friendship changes
      const channel = supabase
        .channel("friendships_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "friendships",
          },
          () => {
            fetchFriends();
            fetchFriendRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      // Fetch friendships where current user is user_id
      const { data: sentFriendships, error: error1 } = await supabase
        .from("friendships")
        .select("id, friend_id, status")
        .eq("user_id", user?.id)
        .eq("status", "accepted");

      if (error1) throw error1;

      // Fetch friendships where current user is friend_id
      const { data: receivedFriendships, error: error2 } = await supabase
        .from("friendships")
        .select("id, user_id, status")
        .eq("friend_id", user?.id)
        .eq("status", "accepted");

      if (error2) throw error2;

      // Combine both and get the friend IDs
      const sentFriendIds = sentFriendships?.map(f => f.friend_id) || [];
      const receivedFriendIds = receivedFriendships?.map(f => f.user_id) || [];
      const allFriendIds = [...sentFriendIds, ...receivedFriendIds];

      if (allFriendIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", allFriendIds);

        const friendsWithProfiles = allFriendIds.map(friendId => ({
          id: friendId,
          friend_id: friendId,
          status: "accepted",
          profiles: profilesData?.find(p => p.id === friendId) || { username: "Unknown" },
        }));

        setFriends(friendsWithProfiles as any);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const { data: requestsData, error } = await supabase
        .from("friendships")
        .select("id, user_id, status")
        .eq("friend_id", user?.id)
        .eq("status", "pending");

      if (error) throw error;

      if (requestsData && requestsData.length > 0) {
        const userIds = requestsData.map(r => r.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        const requestsWithProfiles = requestsData.map(request => ({
          ...request,
          profiles: profilesData?.find(p => p.id === request.user_id) || { username: "Unknown" },
        }));

        setFriendRequests(requestsWithProfiles as any);
      } else {
        setFriendRequests([]);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (error) throw error;

      toast.success("Friend request accepted!");
      fetchFriends();
      fetchFriendRequests();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      toast.success("Friend request rejected");
      fetchFriendRequests();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId) ? prev.filter(f => f !== friendId) : [...prev, friendId]
    );
  };

  const startCodingSession = async () => {
    if (selectedFriends.length === 0) {
      toast.error("Please select at least one friend");
      return;
    }

    try {
      // Create coding session
      const { data: session, error: sessionError } = await supabase
        .from("coding_sessions")
        .insert({
          host_id: user?.id,
          language: "javascript",
          code: "",
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Add host as participant
      await supabase.from("session_participants").insert({
        session_id: session.id,
        user_id: user?.id,
      });

      // Add selected friends as participants
      const participants = selectedFriends.map(friendId => ({
        session_id: session.id,
        user_id: friendId,
      }));

      const { error: participantError } = await supabase
        .from("session_participants")
        .insert(participants);

      if (participantError) throw participantError;

      toast.success("Coding session created!");
      navigate(`/session/${session.id}`);
    } catch (error: any) {
      console.error("Error creating session:", error);
      toast.error(error.message);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.profiles?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

          {friendRequests.length > 0 && (
            <Card className="bg-card border-primary/50">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">Friend Requests</h3>
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between">
                    <span>{request.profiles?.username}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-success hover:bg-success/90"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <AddFriendDialog onFriendAdded={fetchFriends} />
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading friends...</p>
          ) : filteredFriends.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No friends found" : "No friends yet"}
                </p>
                {!searchQuery && <AddFriendDialog onFriendAdded={fetchFriends} />}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredFriends.map((friend) => (
                <Card key={friend.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Checkbox
                      checked={selectedFriends.includes(friend.friend_id)}
                      onCheckedChange={() => toggleFriend(friend.friend_id)}
                    />
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {friend.profiles?.username?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{friend.profiles?.username}</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        <span className="text-sm text-muted-foreground">Online</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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
                onClick={startCodingSession}
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
