import { EmotionCategory, ExpressionScores } from "../types";

export interface BlendshapeCategory {
  categoryName: string;
  score: number;
}

export function getBlendshapeMap(categories: BlendshapeCategory[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const c of categories) {
    map[c.categoryName] = c.score;
  }
  return map;
}

export function calculateExpressionsFromBlendshapes(categories: BlendshapeCategory[]): ExpressionScores {
  const b = getBlendshapeMap(categories);

  const smileLeft = b["mouthSmileLeft"] || 0;
  const smileRight = b["mouthSmileRight"] || 0;
  const cheekSquintL = b["cheekSquintLeft"] || 0;
  const cheekSquintR = b["cheekSquintRight"] || 0;

  const browDownL = b["browDownLeft"] || 0;
  const browDownR = b["browDownRight"] || 0;

  const browInnerUp = b["browInnerUp"] || 0;
  const mouthFrownL = b["mouthFrownLeft"] || 0;
  const mouthFrownR = b["mouthFrownRight"] || 0;
  const mouthPucker = b["mouthPucker"] || 0;

  const browOuterUpL = b["browOuterUpLeft"] || 0;
  const browOuterUpR = b["browOuterUpRight"] || 0;
  const jawOpen = b["jawOpen"] || 0;
  const eyeWideL = b["eyeWideLeft"] || 0;
  const eyeWideR = b["eyeWideRight"] || 0;

  const noseSneerL = b["noseSneerLeft"] || 0;
  const noseSneerR = b["noseSneerRight"] || 0;
  const mouthLowerDownL = b["mouthLowerDownLeft"] || 0;
  const mouthLowerDownR = b["mouthLowerDownRight"] || 0;

  // Raw sub-scores calculation
  let happyRaw = ((smileLeft + smileRight) / 2) * 1.5 + ((cheekSquintL + cheekSquintR) / 2) * 0.5;
  let sadRaw = (browInnerUp * 1.2) + (((mouthFrownL + mouthFrownR) / 2) * 1.5) + (mouthPucker * 0.4);
  let angryRaw = (((browDownL + browDownR) / 2) * 1.6) + (((noseSneerL + noseSneerR) / 2) * 0.8) + (((mouthLowerDownL + mouthLowerDownR) / 2) * 0.6);
  let surpriseRaw = (((browOuterUpL + browOuterUpR) / 2) * 1.2) + (jawOpen * 1.1) + (((eyeWideL + eyeWideR) / 2) * 0.7);

  // Neutral calculation: inverse of active expressiveness, baseline ~0.45
  const activeSum = happyRaw + sadRaw + angryRaw + surpriseRaw;
  let neutralRaw = Math.max(0.12, 0.45 - activeSum * 0.6);

  // Apply subtle floor thresholds to eliminate tiny noise
  happyRaw = happyRaw < 0.08 ? 0.01 : happyRaw;
  sadRaw = sadRaw < 0.10 ? 0.01 : sadRaw;
  angryRaw = angryRaw < 0.12 ? 0.01 : angryRaw;
  surpriseRaw = surpriseRaw < 0.12 ? 0.01 : surpriseRaw;

  const total = happyRaw + sadRaw + angryRaw + surpriseRaw + neutralRaw;

  return {
    Happy: Math.round((happyRaw / total) * 100) / 100,
    Sad: Math.round((sadRaw / total) * 100) / 100,
    Neutral: Math.round((neutralRaw / total) * 100) / 100,
    Angry: Math.round((angryRaw / total) * 100) / 100,
    Surprised: Math.round((surpriseRaw / total) * 100) / 100,
  };
}

export class EmotionSmoother {
  private historyWindow: ExpressionScores[] = [];
  private windowSize: number;

  constructor(windowSize: number = 8) {
    this.windowSize = windowSize;
  }

  public addFrame(scores: ExpressionScores): ExpressionScores {
    this.historyWindow.push(scores);
    if (this.historyWindow.length > this.windowSize) {
      this.historyWindow.shift();
    }

    const smoothed: ExpressionScores = {
      Happy: 0,
      Sad: 0,
      Neutral: 0,
      Angry: 0,
      Surprised: 0,
    };

    const count = this.historyWindow.length;
    for (const item of this.historyWindow) {
      smoothed.Happy += item.Happy;
      smoothed.Sad += item.Sad;
      smoothed.Neutral += item.Neutral;
      smoothed.Angry += item.Angry;
      smoothed.Surprised += item.Surprised;
    }

    smoothed.Happy = Math.round((smoothed.Happy / count) * 100) / 100;
    smoothed.Sad = Math.round((smoothed.Sad / count) * 100) / 100;
    smoothed.Neutral = Math.round((smoothed.Neutral / count) * 100) / 100;
    smoothed.Angry = Math.round((smoothed.Angry / count) * 100) / 100;
    smoothed.Surprised = Math.round((smoothed.Surprised / count) * 100) / 100;

    return smoothed;
  }

  public getDominantEmotion(scores: ExpressionScores): { emotion: EmotionCategory; confidence: number } {
    let dominant: EmotionCategory = "Neutral";
    let maxVal = -1;

    for (const [key, val] of Object.entries(scores)) {
      if (val > maxVal) {
        maxVal = val;
        dominant = key as EmotionCategory;
      }
    }

    const confidence = Math.min(98, Math.max(55, Math.round(maxVal * 100)));
    return { emotion: dominant, confidence };
  }

  public reset(): void {
    this.historyWindow = [];
  }
}
