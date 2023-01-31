export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Boards: {
        Row: {
          guests: number[] | null
          id: number
          ownerId: number | null
        }
        Insert: {
          guests?: number[] | null
          id?: number
          ownerId?: number | null
        }
        Update: {
          guests?: number[] | null
          id?: number
          ownerId?: number | null
        }
      }
      UserData: {
        Row: {
          id: number
          lang: string | null
          lastSubmitted: string | null
          lastUpdated: string | null
          statusDisplay: string | null
          streak: number | null
          submittedToday: boolean | null
          timestamp: string | null
          title: string | null
          titleSlug: string | null
          username: string | null
        }
        Insert: {
          id?: number
          lang?: string | null
          lastSubmitted?: string | null
          lastUpdated?: string | null
          statusDisplay?: string | null
          streak?: number | null
          submittedToday?: boolean | null
          timestamp?: string | null
          title?: string | null
          titleSlug?: string | null
          username?: string | null
        }
        Update: {
          id?: number
          lang?: string | null
          lastSubmitted?: string | null
          lastUpdated?: string | null
          statusDisplay?: string | null
          streak?: number | null
          submittedToday?: boolean | null
          timestamp?: string | null
          title?: string | null
          titleSlug?: string | null
          username?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
