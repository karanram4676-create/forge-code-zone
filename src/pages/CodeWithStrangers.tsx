import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users, Video, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const CodeWithStrangers = () => {
  const [submitted, setSubmitted] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Looking for collaborators...");
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Collaboration Space
              </h1>
              <p className="text-muted-foreground">
                Waiting for a collaborator to join...
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    Video Call
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Video call will appear here</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-secondary rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Chat will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Back
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                Start Coding
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Code with Strangers
            </h1>
            <p className="text-muted-foreground">
              Share your project idea and get matched with a collaborator
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Build a Weather App"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    required
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you want to build..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    required
                    rows={6}
                    className="bg-secondary border-border resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90 gap-2"
                >
                  <Users className="h-5 w-5" />
                  Find Collaborator
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CodeWithStrangers;
