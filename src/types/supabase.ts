
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
          is_stride_crm_user: boolean
          stride_location_id: string | null
        }
        Insert: {
          id: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          is_stride_crm_user?: boolean
          stride_location_id?: string | null
        }
        Update: {
          id?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          is_stride_crm_user?: boolean
          stride_location_id?: string | null
        }
      }
      credit_packages: {
        Row: {
          id: number
          name: string
          user_type_restriction: string | null
          min_credits_to_purchase: number
          price_per_credit_usd_cents: number
          description: string | null
          is_active: boolean
        }
        Insert: {
          id?: number
          name: string
          user_type_restriction?: string | null
          min_credits_to_purchase: number
          price_per_credit_usd_cents: number
          description?: string | null
          is_active?: boolean
        }
        Update: {
          id?: number
          name?: string
          user_type_restriction?: string | null
          min_credits_to_purchase?: number
          price_per_credit_usd_cents?: number
          description?: string | null
          is_active?: boolean
        }
      }
    }
  }
}
