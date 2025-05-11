
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          credits: number
        }
        Insert: {
          id: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
        }
        Update: {
          id?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
        }
      }
    }
  }
}
