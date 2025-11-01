// RE:ME Type Definitions

export interface Profile {
  id: string;
  display_name: string | null;
  mbti: string | null;
  age: number | null;
  reminder_time: string | null;
  created_at: string;
}

export interface Hobby {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  description: string | null;
  level: number;
  exp: number;
  meta: HobbyMeta;
  created_at: string;
}

export interface HobbyMeta {
  subskills?: string[];
  level_thresholds?: number[];
  category?: string;
  description?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  hobby_id: string;
  text: string | null;
  image_path: string | null;
  ai_summary: string | null;
  ai_skills: string[] | null;
  exp_gained: number;
  created_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  text: string;
  ai_summary: string | null;
  emotion: string | null;
  sentiment_score: number | null;
  created_at: string;
}

export interface Moment {
  id: string;
  user_id: string;
  text: string | null;
  image_path: string | null;
  created_at: string;
}

export interface UserMemory {
  id: string;
  user_id: string;
  source_type: 'activity' | 'reflection' | 'moment';
  source_id: string | null;
  content: string;
  embedding: number[] | null;
  created_at: string;
}

// API Response Types

export interface AnalyzeActivityResponse {
  summary?: string;
  skills?: string[];
  exp_gained?: number;
  new_level?: number;
  total_exp?: number;
  suggested_next?: string[];
  should_split?: boolean;
  activities?: string[];
  confidence?: number;
  split?: boolean;
  total_exp_gained?: number;
}

export interface CreateHobbyResponse {
  hobby: Hobby;
}

export interface AnalyzeReflectionResponse {
  ai_summary: string;
  emotion: string;
  sentiment_score: number;
}

export interface RecommendationResponse {
  recommendations: string[];
  motivational_quote: string;
}

// Tree Visualization Types

export interface TreeNode {
  id: string;
  name: string;
  type: 'root' | 'hobby' | 'activity' | 'reflection' | 'moment';
  value?: number;
  children?: TreeNode[];
  data?: any;
}
