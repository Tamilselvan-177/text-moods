import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Emotion, getEmotionEmoji } from "@/lib/emotion-detector";
import { cn } from "@/lib/utils";

interface EmotionCardProps {
  emotion: Emotion;
  confidence?: number;
  className?: string;
}

const emotionStyles = {
  happy: "bg-emotion-happy/10 border-emotion-happy/20 text-emotion-happy",
  sad: "bg-emotion-sad/10 border-emotion-sad/20 text-emotion-sad", 
  angry: "bg-emotion-angry/10 border-emotion-angry/20 text-emotion-angry",
  fear: "bg-emotion-fear/10 border-emotion-fear/20 text-emotion-fear",
  surprise: "bg-emotion-surprise/10 border-emotion-surprise/20 text-emotion-surprise",
  neutral: "bg-emotion-neutral/10 border-emotion-neutral/20 text-emotion-neutral"
};

export function EmotionCard({ emotion, confidence, className }: EmotionCardProps) {
  return (
    <Card className={cn(
      "p-6 transition-all duration-500 hover:shadow-emotion",
      emotionStyles[emotion],
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={emotion}>
            {getEmotionEmoji(emotion)}
          </span>
          <div>
            <h3 className="font-semibold text-lg capitalize">{emotion}</h3>
            {confidence && (
              <p className="text-sm opacity-75">
                {Math.round(confidence * 100)}% confidence
              </p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="capitalize">
          {emotion}
        </Badge>
      </div>
    </Card>
  );
}