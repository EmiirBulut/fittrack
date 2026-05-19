export interface Exercise {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  youtube_url: string | null;
  image_url: string | null;
  created_at: string;
}

export interface ExerciseFormValues {
  name: string;
  description?: string;
  youtube_url?: string;
  image_url?: string;
}
