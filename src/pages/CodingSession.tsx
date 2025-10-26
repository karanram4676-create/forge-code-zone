import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CodeEditor } from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface SessionParticipant {
  id: string;
  user_id: string;
  profiles: {
    username: string;
  };
}

const CodingSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId && user) {
      fetchSession();
      fetchParticipants();
      subscribeToParticipants();
    }
  }, [sessionId, user]);

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error) {
      console.error("Error fetching session:", error);
      toast.error("Session not found");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data: participantsData, error } = await supabase
        .from("session_participants")
        .select("*")
        .eq("session_id", sessionId);

      if (error) throw error;

      if (participantsData && participantsData.length > 0) {
        const userIds = participantsData.map(p => p.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        const participantsWithProfiles = participantsData.map(participant => ({
          ...participant,
          profiles: profilesData?.find(p => p.id === participant.user_id) || { username: "Unknown" },
        }));

        setParticipants(participantsWithProfiles as any);
      } else {
        setParticipants([]);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const subscribeToParticipants = () => {
    const channel = supabase
      .channel("session_participants")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1E1E1E]">
      {/* Header */}
      <div className="bg-[#252526] border-b border-[#3E3E42] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-[#3C3C3C]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Session
          </Button>
          <div className="text-white font-semibold">
            Coding Session
          </div>
        </div>

        <div className="flex items-center gap-2">
          {participants.map((participant) => (
            <Avatar key={participant.id} className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {participant.profiles?.username?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <CodeEditor
          sessionId={sessionId}
          initialLanguage={session?.language}
          initialCode={session?.code}
        />
      </div>
    </div>
  );
};

export default CodingSession;