import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PromptResult, AdvancedOptions, PromptPlatform } from '../types';

// Helper to get the API client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to parse JSON from Markdown code blocks if necessary
const cleanJsonOutput = (text: string): string => {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }
  return clean;
};

// Robust parsing helper to prevent undefined property errors
const parsePromptResult = (text: string, platform?: PromptPlatform): PromptResult => {
  try {
    const cleaned = cleanJsonOutput(text);
    if (!cleaned) throw new Error("Empty response from model");
    
    const parsed = JSON.parse(cleaned);
    
    return {
      title: parsed.title || "Generated Prompt",
      prompt: parsed.prompt || "No prompt generated.",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      platform: platform || 'generic'
    };
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return {
      title: "Raw Response",
      prompt: text || "Error processing response.",
      tags: ["raw-output"],
      platform: platform || 'generic'
    };
  }
};

const getPlatformInstructions = (platform: PromptPlatform = 'generic', aspectRatio?: string): string => {
  switch (platform) {
    case 'midjourney':
      return `
        FORMATTING RULES:
        - Construct the prompt as a single, highly descriptive paragraph.
        - Use sophisticated artistic vocabulary.
        - END the prompt with Midjourney parameters.
        - If an aspect ratio is provided (${aspectRatio || 'none'}), append '--ar ${aspectRatio ? aspectRatio.replace(':', ':') : '16:9'}'.
        - Append '--v 6.0' and '--stylize 250' by default unless instructed otherwise.
        - Example: "/imagine prompt: A stunning landscape... --ar 16:9 --v 6.0" (Only return the prompt text, not the /imagine command).
      `;
    case 'dalle3':
      return `
        FORMATTING RULES:
        - DALL-E 3 thrives on natural language. Write a cohesive, detailed story-like description.
        - Focus on physical descriptions, lighting, and composition.
        - Do NOT use technical parameters (like --ar) inside the text.
      `;
    case 'stable-diffusion':
      return `
        FORMATTING RULES:
        - Use a tag-based format with emphasis syntax.
        - Example: "(masterpiece, best quality:1.2), subject description, lighting tags, style tags".
        - Use comma separation.
      `;
    case 'veo':
      return `
        FORMATTING RULES:
        - Optimize for Google Veo (Video).
        - Focus on: Cinematic descriptions, camera movement (pan, tilt, zoom), and temporal consistency.
        - Format: "Cinematic shot of [Subject], [Action], [Environment], [Style], [Tech Specs]".
      `;
    case 'sora':
      return `
        FORMATTING RULES:
        - Optimize for OpenAI Sora.
        - Extremely detailed scene descriptions, specifically describing how things move and change over time.
        - Mention persistence of objects and physics.
      `;
    default:
      return `
        FORMATTING RULES:
        - General high-quality prompt structure: Subject + Environment + Style + Tech Specs.
      `;
  }
};

const buildAdvancedInstruction = (options?: AdvancedOptions): string => {
  if (!options) return '';
  
  let instruction = getPlatformInstructions(options.platform, options.aspectRatio);
  
  if (options.style) {
    instruction += `\nEnsure the visual style specifically matches: "${options.style}".`;
  }
  if (options.negativePrompt) {
    instruction += `\nEnsure the prompt explicitly excludes or avoids these elements: "${options.negativePrompt}".`;
  }
  return instruction;
};

const getTemperature = (creativity?: number): number => {
  if (creativity === undefined) return 0.7;
  return 0.1 + (creativity / 100) * 1.4;
};

export const enhanceTextPrompt = async (
  idea: string,
  targetModelType: 'image' | 'video' = 'image',
  options?: AdvancedOptions
): Promise<PromptResult> => {
  const ai = getAiClient();
  const platform = options?.platform || 'generic';
  
  const advancedInstructions = buildAdvancedInstruction(options);
  
  const systemInstruction = `You are a world-class prompt engineer specialized in ${platform} prompting. 
  Your goal is to take a simple concept and expand it into a highly detailed, professional prompt.
  ${advancedInstructions}
  
  Return the response in strict JSON format with the following schema:
  {
    "title": "A short, catchy title for the prompt",
    "prompt": "The full, detailed prompt text optimized for ${platform}",
    "tags": ["array", "of", "keywords"]
  }
  `;

  const promptText = `
    User Concept: "${idea}"
    Target Medium: ${targetModelType === 'image' ? 'Text-to-Image' : 'Text-to-Video'}
    Target Platform: ${platform}
    
    Create a detailed prompt that covers Subject, Environment, Style, and Technical specs appropriate for the platform.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: getTemperature(options?.creativity)
      }
    });

    const text = response.text || "{}";
    return parsePromptResult(text, platform);
  } catch (error) {
    console.error("Error enhancing text prompt:", error);
    throw error;
  }
};

export const analyzeImageForPrompt = async (
  base64Data: string, 
  mimeType: string,
  options?: AdvancedOptions
): Promise<PromptResult> => {
  const ai = getAiClient();
  const platform = options?.platform || 'generic';
  
  const advancedInstructions = buildAdvancedInstruction(options);

  const systemInstruction = `You are an expert at reverse-engineering generative AI prompts. 
  Analyze the provided image and write a prompt that would generate this exact image using ${platform}.
  ${advancedInstructions}
  Return JSON: { "title": "Short title", "prompt": "The detailed prompt", "tags": ["style", "content"] }`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this image and create a detailed text-to-image generation prompt optimized for ${platform}.`
          }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: getTemperature(options?.creativity)
      }
    });

    const text = response.text || "{}";
    return parsePromptResult(text, platform);
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

export const analyzeVideoForPrompt = async (
  base64Data: string, 
  mimeType: string,
  options?: AdvancedOptions
): Promise<PromptResult> => {
  const ai = getAiClient();
  const platform = options?.platform || 'generic';

  const advancedInstructions = buildAdvancedInstruction(options);

  const systemInstruction = `You are an expert at reverse-engineering generative AI prompts for video.
  Analyze the provided video clip and write a prompt that would generate this exact video using ${platform}.
  ${advancedInstructions}
  Return JSON: { "title": "Short title", "prompt": "The detailed prompt", "tags": ["style", "motion", "content"] }`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this video and create a detailed text-to-video generation prompt optimized for ${platform}.`
          }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: getTemperature(options?.creativity)
      }
    });

    const text = response.text || "{}";
    return parsePromptResult(text, platform);
  } catch (error) {
    console.error("Error analyzing video:", error);
    throw error;
  }
};