import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useNavigate } from "react-router-dom";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  gradient?: boolean;
}

export const ActionCard = ({ title, description, icon: Icon, path, gradient }: ActionCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow border-border/50 ${
        gradient ? 'bg-gradient-card' : 'bg-card'
      }`}
      onClick={() => navigate(path)}
    >
      <CardContent className="p-8 text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
