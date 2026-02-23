export enum GenerationMode {
  TEXT = 'TEXT',
  BUILD_IMAGE = 'BUILD_IMAGE',
  BUILD_VIDEO = 'BUILD_VIDEO',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  FAVORITES = 'FAVORITES',
  SETTINGS = 'SETTINGS'
}

export type PromptPlatform = 'generic' | 'midjourney' | 'dalle3' | 'stable-diffusion' | 'veo' | 'sora' | 'runway';

export interface PromptResult {
  title: string;
  prompt: string;
  tags: string[];
  platform?: PromptPlatform;
}

export interface SavedPrompt extends PromptResult {
  id: string;
  createdAt: number;
}

export interface AdvancedOptions {
  creativity: number; // 0 to 100
  style: string;
  negativePrompt: string;
  platform?: PromptPlatform;
  aspectRatio?: string; // stored for param generation
}

export type LoadingState = 'idle' | 'analyzing' | 'generating' | 'error' | 'success';

export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export type AppTheme = 'cosmic' | 'emerald' | 'rose' | 'amber' | 'slate';
export type FontSize = 'small' | 'medium' | 'large';

export interface UserProfile {
  appearance: {
    theme: AppTheme;
    fontSize: FontSize;
  };
  settings: {
    defaultPlatform: PromptPlatform;
    defaultCreativity: number;
  };
}

export const DEFAULT_PROFILE: UserProfile = {
  appearance: {
    theme: 'cosmic',
    fontSize: 'medium'
  },
  settings: {
    defaultPlatform: 'generic',
    defaultCreativity: 50
  }
};