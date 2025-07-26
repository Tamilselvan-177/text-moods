import { pipeline } from '@huggingface/transformers';

export type Emotion = 'happy' | 'sad' | 'angry' | 'fear' | 'surprise' | 'neutral';

// Emotion mapping for different model outputs
const EMOTION_MAPPING: Record<string, Emotion> = {
  'joy': 'happy',
  'happiness': 'happy',
  'positive': 'happy',
  'love': 'happy',
  'sadness': 'sad',
  'negative': 'sad',
  'anger': 'angry',
  'rage': 'angry',
  'fear': 'fear',
  'anxiety': 'fear',
  'surprise': 'surprise',
  'amazement': 'surprise',
  'neutral': 'neutral',
  'disgust': 'angry' // Map disgust to angry for simplicity
};

// Keyword-based emotion detection as fallback
const EMOTION_KEYWORDS = {
  happy: ['happy', 'joy', 'excited', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'love', 'brilliant', 'excellent', 'promoted', 'celebration', 'congratulations'],
  sad: ['sad', 'depressed', 'crying', 'hurt', 'disappointed', 'lonely', 'heartbroken', 'miserable', 'sorrow', 'grief', 'upset', 'down'],
  angry: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated', 'hate', 'disgusted', 'outraged', 'livid', 'pissed'],
  fear: ['scared', 'afraid', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'frightened', 'fearful', 'concerned'],
  surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'wow', 'incredible', 'unbelievable', 'unexpected', 'sudden'],
  neutral: ['okay', 'fine', 'normal', 'regular', 'standard', 'typical', 'usual']
};

let emotionPipeline: any = null;

async function initializeEmotionPipeline() {
  if (!emotionPipeline) {
    try {
      emotionPipeline = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
        { device: 'webgpu' }
      );
    } catch (error) {
      console.warn('Failed to load WebGPU model, falling back to CPU:', error);
      emotionPipeline = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
    }
  }
  return emotionPipeline;
}

function detectEmotionByKeywords(text: string): Emotion {
  const lowercaseText = text.toLowerCase();
  const scores: Record<Emotion, number> = {
    happy: 0,
    sad: 0,
    angry: 0,
    fear: 0,
    surprise: 0,
    neutral: 0
  };

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowercaseText.includes(keyword)) {
        scores[emotion as Emotion] += 1;
      }
    }
  }

  // Find emotion with highest score
  const maxEmotion = Object.entries(scores).reduce((a, b) => 
    scores[a[0] as Emotion] > scores[b[0] as Emotion] ? a : b
  )[0] as Emotion;

  return scores[maxEmotion] > 0 ? maxEmotion : 'neutral';
}

export async function detectEmotion(text: string): Promise<Emotion> {
  if (!text.trim()) {
    return 'neutral';
  }

  try {
    // Try AI model first
    const pipeline = await initializeEmotionPipeline();
    const result = await pipeline(text);
    
    if (result && result.length > 0) {
      const prediction = result[0];
      const label = prediction.label.toLowerCase();
      
      // Map to our emotion categories
      if (label.includes('positive') || prediction.score > 0.7) {
        return 'happy';
      } else if (label.includes('negative') || prediction.score < 0.3) {
        return 'sad';
      }
    }
  } catch (error) {
    console.warn('AI model failed, using keyword detection:', error);
  }

  // Fallback to keyword-based detection
  return detectEmotionByKeywords(text);
}

export function getEmotionColor(emotion: Emotion): string {
  const colors = {
    happy: 'hsl(var(--emotion-happy))',
    sad: 'hsl(var(--emotion-sad))',
    angry: 'hsl(var(--emotion-angry))',
    fear: 'hsl(var(--emotion-fear))',
    surprise: 'hsl(var(--emotion-surprise))',
    neutral: 'hsl(var(--emotion-neutral))'
  };
  return colors[emotion];
}

export function getEmotionEmoji(emotion: Emotion): string {
  const emojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    fear: '😨',
    surprise: '😲',
    neutral: '😐'
  };
  return emojis[emotion];
}