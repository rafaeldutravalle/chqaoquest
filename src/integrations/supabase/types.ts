export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      medals: {
        Row: {
          awarded_at: string
          code: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          code: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          code?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      mission_attempts: {
        Row: {
          completed_at: string
          correct: number
          id: string
          rank_target: Database["public"]["Enums"]["military_rank"]
          score: number
          series_index: number
          total: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          correct?: number
          id?: string
          rank_target: Database["public"]["Enums"]["military_rank"]
          score?: number
          series_index: number
          total?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          correct?: number
          id?: string
          rank_target?: Database["public"]["Enums"]["military_rank"]
          score?: number
          series_index?: number
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          choice: string
          id: string
          poll_id: string
          user_id: string
          voted_at: string
        }
        Insert: {
          choice: string
          id?: string
          poll_id: string
          user_id: string
          voted_at?: string
        }
        Update: {
          choice?: string
          id?: string
          poll_id?: string
          user_id?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          active_date: string
          created_at: string
          created_by: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string | null
          option_d: string | null
          question: string
        }
        Insert: {
          active_date?: string
          created_at?: string
          created_by?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c?: string | null
          option_d?: string | null
          question: string
        }
        Update: {
          active_date?: string
          created_at?: string
          created_by?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string | null
          option_d?: string | null
          question?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_id: string | null
          created_at: string
          display_name: string | null
          energy: number
          energy_max: number
          energy_updated_at: string
          fvm_score: number
          gems: number
          id: string
          onboarded: boolean
          rank: Database["public"]["Enums"]["military_rank"]
          specialty: Database["public"]["Enums"]["specialty"] | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_id?: string | null
          created_at?: string
          display_name?: string | null
          energy?: number
          energy_max?: number
          energy_updated_at?: string
          fvm_score?: number
          gems?: number
          id?: string
          onboarded?: boolean
          rank?: Database["public"]["Enums"]["military_rank"]
          specialty?: Database["public"]["Enums"]["specialty"] | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_id?: string | null
          created_at?: string
          display_name?: string | null
          energy?: number
          energy_max?: number
          energy_updated_at?: string
          fvm_score?: number
          gems?: number
          id?: string
          onboarded?: boolean
          rank?: Database["public"]["Enums"]["military_rank"]
          specialty?: Database["public"]["Enums"]["specialty"] | null
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      questions: {
        Row: {
          active: boolean
          correct_answer: string
          created_at: string
          created_by: string | null
          difficulty: Database["public"]["Enums"]["question_difficulty"]
          explanation: string | null
          id: string
          min_rank: Database["public"]["Enums"]["military_rank"]
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_number: number | null
          subject: Database["public"]["Enums"]["question_subject"]
          text: string
          updated_at: string
          year: number | null
        }
        Insert: {
          active?: boolean
          correct_answer: string
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["question_difficulty"]
          explanation?: string | null
          id?: string
          min_rank?: Database["public"]["Enums"]["military_rank"]
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_number?: number | null
          subject: Database["public"]["Enums"]["question_subject"]
          text: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          active?: boolean
          correct_answer?: string
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["question_difficulty"]
          explanation?: string | null
          id?: string
          min_rank?: Database["public"]["Enums"]["military_rank"]
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question_number?: number | null
          subject?: Database["public"]["Enums"]["question_subject"]
          text?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      weekly_ranking: {
        Row: {
          avatar_id: string | null
          display_name: string | null
          missions_done: number | null
          rank: Database["public"]["Enums"]["military_rank"] | null
          user_id: string | null
          week_fvm: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      poll_results: {
        Args: { _poll_id: string }
        Returns: {
          choice: string
          votes: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      military_rank:
        | "soldado"
        | "cabo"
        | "terceiro_sgt"
        | "segundo_sgt"
        | "primeiro_sgt"
        | "subtenente"
        | "segundo_ten_qao"
      question_difficulty: "easy" | "medium" | "hard"
      question_subject:
        | "portugues"
        | "geografia"
        | "historia"
        | "estatuto"
        | "risg"
        | "rae"
        | "rde"
        | "licitacoes"
        | "cpm"
        | "cppm"
        | "musica"
      specialty:
        | "infantaria"
        | "artilharia"
        | "cavalaria"
        | "engenharia"
        | "comunicacoes"
        | "material_belico"
        | "intendencia"
        | "saude"
        | "topografia"
        | "aviacao"
        | "musica"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      military_rank: [
        "soldado",
        "cabo",
        "terceiro_sgt",
        "segundo_sgt",
        "primeiro_sgt",
        "subtenente",
        "segundo_ten_qao",
      ],
      question_difficulty: ["easy", "medium", "hard"],
      question_subject: [
        "portugues",
        "geografia",
        "historia",
        "estatuto",
        "risg",
        "rae",
        "rde",
        "licitacoes",
        "cpm",
        "cppm",
        "musica",
      ],
      specialty: [
        "infantaria",
        "artilharia",
        "cavalaria",
        "engenharia",
        "comunicacoes",
        "material_belico",
        "intendencia",
        "saude",
        "topografia",
        "aviacao",
        "musica",
      ],
    },
  },
} as const
