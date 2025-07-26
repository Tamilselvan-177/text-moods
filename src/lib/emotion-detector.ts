import { pipeline } from '@huggingface/transformers';

export type Emotion = 'happy' | 'sad' | 'angry' | 'fear' | 'surprise' | 'neutral';

// Enhanced keyword-based emotion detection (now primary method)
const EMOTION_KEYWORDS = {
  happy: [
    // Basic positive emotions
    'happy', 'joy', 'joyful', 'excited', 'thrilled', 'elated', 'cheerful', 'delighted',
    'pleased', 'content', 'satisfied', 'glad', 'grateful', 'thankful', 'blessed',
    // Achievement words
    'promoted', 'success', 'won', 'victory', 'accomplished', 'achieved', 'passed', 'graduated',
    'celebration', 'congratulations', 'proud', 'amazing', 'awesome', 'fantastic', 'wonderful',
    'brilliant', 'excellent', 'perfect', 'great', 'love', 'adore', 'best', 'favorite',
    // Positive expressions
    'yay', 'hooray', 'woohoo', 'yes!', 'finally', 'at last'
  ],
  sad: [
    // Basic sadness
    'sad', 'sadness', 'depressed', 'depression', 'crying', 'cry', 'tears', 'weep',
    'hurt', 'pain', 'ache', 'heartbroken', 'broken', 'devastated', 'crushed',
    'disappointed', 'disappointment', 'let down', 'failed', 'failure', 'lost', 'loss',
    'lonely', 'alone', 'isolated', 'empty', 'hollow', 'miserable', 'awful', 'terrible',
    'sorrow', 'grief', 'mourning', 'upset', 'down', 'blue', 'gloomy', 'hopeless',
    'regret', 'sorry', 'wish', 'miss', 'missing', 'gone'
  ],
  angry: [
    // Basic anger
    'angry', 'mad', 'furious', 'rage', 'enraged', 'livid', 'irate', 'outraged',
    'annoyed', 'irritated', 'frustrated', 'aggravated', 'pissed', 'hate', 'hatred',
    'disgusted', 'disgust', 'fed up', 'sick of', 'tired of', 'can\'t stand',
    'stupid', 'idiot', 'ridiculous', 'absurd', 'unfair', 'injustice', 'wrong',
    // Expressive anger
    'damn', 'dammit', 'hell', 'wtf', 'screw', 'bite me', 'shut up',
    'ugh', 'grr', 'argh', 'gah'
  ],
  fear: [
    // Basic fear
    'scared', 'afraid', 'fear', 'fearful', 'terrified', 'terror', 'horrified',
    'anxious', 'anxiety', 'worried', 'worry', 'nervous', 'panic', 'panicked',
    'frightened', 'spooked', 'startled', 'alarmed', 'concerned', 'uneasy',
    'apprehensive', 'dread', 'dreading', 'intimidated', 'threatened', 'vulnerable',
    'insecure', 'uncertain', 'doubtful', 'hesitant', 'cautious', 'careful',
    'danger', 'dangerous', 'risky', 'unsafe', 'help', 'emergency'
  ],
  surprise: [
    // Basic surprise
    'surprised', 'surprise', 'shocked', 'shock', 'amazed', 'amazing', 'astonished',
    'astounded', 'stunned', 'speechless', 'blown away', 'mind-blown', 'incredible',
    'unbelievable', 'unexpected', 'sudden', 'suddenly', 'all of a sudden',
    'out of nowhere', 'can\'t believe', 'no way', 'really?', 'seriously?',
    // Expressions of surprise
    'wow', 'whoa', 'oh my', 'oh my god', 'omg', 'what?', 'huh?', 'wait what',
    'plot twist', 'didn\'t see that coming'
  ],
  neutral: [
    'okay', 'ok', 'fine', 'normal', 'regular', 'standard', 'typical', 'usual',
    'average', 'ordinary', 'common', 'routine', 'everyday', 'plain', 'simple',
    'nothing special', 'whatever', 'meh', 'so-so', 'alright'
  ]
};

// Emotional intensifiers and modifiers
const INTENSIFIERS = ['very', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely', 'really', 'so', 'quite', 'pretty', 'rather'];
const NEGATORS = ['not', 'never', 'no', 'hardly', 'barely', 'scarcely', 'don\'t', 'doesn\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'can\'t', 'couldn\'t'];

function analyzeEmotionAdvanced(text: string): { emotion: Emotion; confidence: number } {
  const lowercaseText = text.toLowerCase();
  const words = lowercaseText.split(/\s+/);
  
  const scores: Record<Emotion, number> = {
    happy: 0,
    sad: 0,
    angry: 0,
    fear: 0,
    surprise: 0,
    neutral: 0
  };

  // Check each word and surrounding context
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';
    const nextWord = i < words.length - 1 ? words[i + 1] : '';
    
    // Check for negation
    const isNegated = NEGATORS.includes(prevWord) || NEGATORS.includes(nextWord);
    
    // Check for intensification
    const isIntensified = INTENSIFIERS.includes(prevWord) || INTENSIFIERS.includes(nextWord);
    const multiplier = isIntensified ? 2 : 1;
    
    // Score each emotion
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      for (const keyword of keywords) {
        if (word.includes(keyword) || keyword.includes(word)) {
          let score = 1 * multiplier;
          
          // Exact matches get higher scores
          if (word === keyword) score *= 1.5;
          
          // Handle negation
          if (isNegated) {
            // Negated emotions often flip to opposite or neutral
            if (emotion === 'happy') scores.sad += score * 0.5;
            else if (emotion === 'sad') scores.neutral += score * 0.5;
            else scores.neutral += score * 0.3;
          } else {
            scores[emotion as Emotion] += score;
          }
        }
      }
    }
  }

  // Special patterns
  const patterns = [
    { regex: /[!]{2,}/, emotion: 'surprise' as Emotion, score: 2 },
    { regex: /[?]{2,}/, emotion: 'surprise' as Emotion, score: 1.5 },
    { regex: /[.]{3,}/, emotion: 'neutral' as Emotion, score: 1 },
    { regex: /[A-Z]{3,}/, emotion: 'angry' as Emotion, score: 1.5 }, // ALL CAPS
    { regex: /:\)/, emotion: 'happy' as Emotion, score: 2 },
    { regex: /:\(/, emotion: 'sad' as Emotion, score: 2 },
    { regex: /:D/, emotion: 'happy' as Emotion, score: 3 },
    { regex: />:\(/, emotion: 'angry' as Emotion, score: 2 },
  ];

  patterns.forEach(({ regex, emotion, score }) => {
    if (regex.test(text)) {
      scores[emotion] += score;
    }
  });

  // Find the emotion with the highest score
  const maxEntry = Object.entries(scores).reduce((a, b) => 
    scores[a[0] as Emotion] > scores[b[0] as Emotion] ? a : b
  );
  
  const topEmotion = maxEntry[0] as Emotion;
  const topScore = maxEntry[1];
  
  // Calculate confidence based on score and text length
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const confidence = totalScore > 0 ? Math.min(topScore / totalScore, 1) : 0;
  
  return {
    emotion: topScore > 0 ? topEmotion : 'neutral',
    confidence: Math.max(confidence, 0.1) // Minimum confidence
  };
}

let emotionPipeline: any = null;

export async function detectEmotion(text: string): Promise<Emotion> {
  if (!text.trim()) {
    return 'neutral';
  }

  // Use fast advanced keyword detection as primary method
  const result = analyzeEmotionAdvanced(text);
  return result.emotion;
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