import {
  AnalyzeActivityResponse,
  CreateHobbyResponse,
  AnalyzeReflectionResponse,
  RecommendationResponse,
} from './types';

// Verify API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!process.env.SUPABASE_URL) {
  console.warn('[API] SUPABASE_URL not found in environment variables');
}

/**
 * Analyze activity and calculate EXP
 */
export async function analyzeActivity(params: {
  userId: string;
  hobbyId: string;
  text: string;
  imagePath?: string;
}): Promise<AnalyzeActivityResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze-activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to analyze activity');
  }

  return response.json();
}

/**
 * Create a new hobby with AI-generated metadata
 */
export async function createHobby(params: {
  userId: string;
  hobbyName: string;
}): Promise<CreateHobbyResponse> {
  const response = await fetch(`${API_BASE_URL}/api/create-hobby`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create hobby');
  }

  return response.json();
}

/**
 * Analyze reflection and extract emotion/sentiment
 */
export async function analyzeReflection(params: {
  userId: string;
  text: string;
}): Promise<AnalyzeReflectionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze-reflection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to analyze reflection');
  }

  return response.json();
}

/**
 * Get personalized recommendations
 */
export async function getRecommendations(params: {
  userId: string;
  prompt?: string;
}): Promise<RecommendationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get recommendations');
  }

  return response.json();
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  file: File,
  bucket: 'activity-images' | 'moment-images',
  userId: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  formData.append('userId', userId);

  const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload image');
  }

  const data = await response.json();
  return data.path;
}

export const api = {
  analyzeActivity,
  createHobby,
  analyzeReflection,
  getRecommendations,
  uploadImage,
};

export default api;
