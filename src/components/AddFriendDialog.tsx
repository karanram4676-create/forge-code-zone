import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface AddFriendDialogProps {
  onFriendAdded?: () => void;
}

export const AddFriendDialog = ({ onFriendAdded }: AddFriendDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    setLoading(true);
    try {
      // Find user by username
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (profileError || !profile) {
        toast.error("User not found");
        return;
      }

      if (profile.id === user?.id) {
        toast.error("You cannot add yourself as a friend");
        return;
      }

      // Create friend request
      const { error: friendError } = await supabase
        .from("friendships")
        .insert({
          user_id: user?.id,
          friend_id: profile.id,
          status: "pending",
        });

      if (friendError) {
        if (friendError.code === "23505") {
          toast.error("Friend request already sent");
        } else {
          throw friendError;
        }
        return;
      }

      // Create notification for the recipient
      await supabase.from("notifications").insert({
        user_id: profile.id,
        type: "friend_request",
        title: "New Friend Request",
        message: `You have a new friend request from ${user?.email}`,
      });

      toast.success("Friend request sent!");
      setUsername("");
      setOpen(false);
      onFriendAdded?.();
    } catch (error: any) {
      console.error("Error adding friend:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 hover:bg-secondary">
          <UserPlus className="h-4 w-4" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Enter the username of the person you want to add as a friend
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="bg-secondary border-border"
            onKeyPress={(e) => e.key === "Enter" && handleAddFriend()}
          />
          <Button
            onClick={handleAddFriend}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? "Sending..." : "Send Friend Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};