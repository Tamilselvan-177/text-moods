import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { detectEmotion, type Emotion, getEmotionEmoji } from "@/lib/emotion-detector";
import { EmotionCard } from "./EmotionCard";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmotionAnalyzer() {
  const [text, setText] = useState("");
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const analyzeEmotion = useCallback(async (inputText: string) => {
    if (!inputText.trim()) {
      setEmotion("neutral");
      setHasAnalyzed(false);
      return;
    }

    setIsAnalyzing(true);
    try {
      const detectedEmotion = await detectEmotion(inputText);
      setEmotion(detectedEmotion);
      setHasAnalyzed(true);
    } catch (error) {
      console.error("Error analyzing emotion:", error);
      setEmotion("neutral");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      analyzeEmotion(text);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [text, analyzeEmotion]);

  const exampleTexts = [
    "I just got promoted at work!",
    "I'm feeling really down today",
    "This traffic is making me so frustrated",
    "I can't believe what just happened!",
    "I'm nervous about the presentation tomorrow"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="text-primary h-8 w-8" />
          <h1 className="text-4xl font-bold bg-gradient-emotion bg-clip-text text-transparent">
            Text Mood Analyzer
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover the emotional tone of any text using advanced AI. Type or paste your message below to see what emotions it conveys.
        </p>
      </div>

      {/* Main analyzer */}
      <Card className="backdrop-blur-sm bg-background/80 shadow-glow border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Analyze Your Text</span>
            {isAnalyzing && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Textarea
              placeholder="Type or paste your text here to analyze its emotional tone..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-32 resize-none text-base transition-all duration-300 focus:shadow-emotion"
              maxLength={1000}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Type something to see the emotion analysis</span>
              <span>{text.length}/1000</span>
            </div>
          </div>

          {/* Emotion Result */}
          {(hasAnalyzed || isAnalyzing) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Detected Emotion:</h3>
              {isAnalyzing ? (
                <div className="flex items-center justify-center p-8">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span>Analyzing emotional tone...</span>
                  </div>
                </div>
              ) : (
                <EmotionCard emotion={emotion} />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Example texts */}
      <Card className="backdrop-blur-sm bg-background/60">
        <CardHeader>
          <CardTitle>Try These Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {exampleTexts.map((example, index) => (
              <button
                key={index}
                onClick={() => setText(example)}
                className={cn(
                  "text-left p-4 rounded-lg border transition-all duration-300 hover:shadow-md",
                  "bg-card hover:bg-accent hover:border-primary/30",
                  text === example && "border-primary bg-accent"
                )}
              >
                <span className="text-sm font-medium">{example}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emotion legend */}
      <Card className="backdrop-blur-sm bg-background/60">
        <CardHeader>
          <CardTitle>Emotion Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(['happy', 'sad', 'angry', 'fear', 'surprise', 'neutral'] as Emotion[]).map((emotionType) => (
              <div key={emotionType} className="flex items-center gap-3 p-3 rounded-lg bg-card">
                <span className="text-2xl">{getEmotionEmoji(emotionType)}</span>
                <div>
                  <Badge variant="outline" className="capitalize">
                    {emotionType}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}