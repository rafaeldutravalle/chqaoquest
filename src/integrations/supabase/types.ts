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
      caramelo_messages: {
        Row: {
          active: boolean
          category: string
          id: string
          text: string
        }
        Insert: {
          active?: boolean
          category: string
          id?: string
          text: string
        }
        Update: {
          active?: boolean
          category?: string
          id?: string
          text?: string
        }
        Relationships: []
      }
      daily_missions: {
        Row: {
          active_date: string
          description: string
          goal_subject: Database["public"]["Enums"]["subject"] | null
          goal_type: string
          goal_value: number
          id: string
          reward_municao: number
          reward_xp: number
        }
        Insert: {
          active_date?: string
          description: string
          goal_subject?: Database["public"]["Enums"]["subject"] | null
          goal_type: string
          goal_value: number
          id?: string
          reward_municao?: number
          reward_xp?: number
        }
        Update: {
          active_date?: string
          description?: string
          goal_subject?: Database["public"]["Enums"]["subject"] | null
          goal_type?: string
          goal_value?: number
          id?: string
          reward_municao?: number
          reward_xp?: number
        }
        Relationships: []
      }
      dilemmas: {
        Row: {
          active: boolean
          best_answer: string
          context: string
          explanation: string | null
          id: string
          min_rank: Database["public"]["Enums"]["military_rank"]
          option_a: string
          option_b: string
          option_c: string | null
          option_d: string | null
          question: string
          subject: Database["public"]["Enums"]["subject"] | null
          title: string
        }
        Insert: {
          active?: boolean
          best_answer: string
          context: string
          explanation?: string | null
          id?: string
          min_rank?: Database["public"]["Enums"]["military_rank"]
          option_a: string
          option_b: string
          option_c?: string | null
          option_d?: string | null
          question: string
          subject?: Database["public"]["Enums"]["subject"] | null
          title: string
        }
        Update: {
          active?: boolean
          best_answer?: string
          context?: string
          explanation?: string | null
          id?: string
          min_rank?: Database["public"]["Enums"]["military_rank"]
          option_a?: string
          option_b?: string
          option_c?: string | null
          option_d?: string | null
          question?: string
          subject?: Database["public"]["Enums"]["subject"] | null
          title?: string
        }
        Relationships: []
      }
      league_members: {
        Row: {
          id: string
          joined_at: string
          league_id: string
          position: number | null
          user_id: string
          xp_week: number
        }
        Insert: {
          id?: string
          joined_at?: string
          league_id: string
          position?: number | null
          user_id: string
          xp_week?: number
        }
        Update: {
          id?: string
          joined_at?: string
          league_id?: string
          position?: number | null
          user_id?: string
          xp_week?: number
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues_weekly"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues_weekly: {
        Row: {
          created_at: string
          group_index: number
          id: string
          liga: Database["public"]["Enums"]["liga"]
          week_start: string
        }
        Insert: {
          created_at?: string
          group_index?: number
          id?: string
          liga: Database["public"]["Enums"]["liga"]
          week_start: string
        }
        Update: {
          created_at?: string
          group_index?: number
          id?: string
          liga?: Database["public"]["Enums"]["liga"]
          week_start?: string
        }
        Relationships: []
      }
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
          mission_id: string | null
          prontidao_used: number
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
          mission_id?: string | null
          prontidao_used?: number
          rank_target?: Database["public"]["Enums"]["military_rank"]
          score?: number
          series_index: number
          total?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          correct?: number
          id?: string
          mission_id?: string | null
          prontidao_used?: number
          rank_target?: Database["public"]["Enums"]["military_rank"]
          score?: number
          series_index?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_attempts_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_progress: {
        Row: {
          attempts_count: number
          best_score: number
          completed_at: string | null
          id: string
          mission_id: string
          stars: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts_count?: number
          best_score?: number
          completed_at?: string | null
          id?: string
          mission_id: string
          stars?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts_count?: number
          best_score?: number
          completed_at?: string | null
          id?: string
          mission_id?: string
          stars?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          display_order: number
          id: string
          num_questions: number
          rank_target: Database["public"]["Enums"]["military_rank"]
          region_code: string
          subject: Database["public"]["Enums"]["subject"]
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          num_questions?: number
          rank_target: Database["public"]["Enums"]["military_rank"]
          region_code: string
          subject: Database["public"]["Enums"]["subject"]
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          num_questions?: number
          rank_target?: Database["public"]["Enums"]["military_rank"]
          region_code?: string
          subject?: Database["public"]["Enums"]["subject"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_region_code_fkey"
            columns: ["region_code"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["code"]
          },
        ]
      }
      museum_cards: {
        Row: {
          code: string
          created_at: string
          description: string | null
          era: string | null
          id: string
          image_url: string | null
          name: string
          rarity: Database["public"]["Enums"]["rarity"]
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          era?: string | null
          id?: string
          image_url?: string | null
          name: string
          rarity?: Database["public"]["Enums"]["rarity"]
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          era?: string | null
          id?: string
          image_url?: string | null
          name?: string
          rarity?: Database["public"]["Enums"]["rarity"]
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
          account_level: number
          avatar_id: string | null
          created_at: string
          display_name: string | null
          id: string
          liga_atual: Database["public"]["Enums"]["liga"]
          municao: number
          nome_guerra: string | null
          onboarded: boolean
          plan: Database["public"]["Enums"]["subscription_plan"]
          pontos_merito: number
          prontidao: number
          prontidao_max: number
          prontidao_updated_at: string
          punicoes: number
          rank: Database["public"]["Enums"]["military_rank"]
          region_unlocked: string[]
          specialty: Database["public"]["Enums"]["specialty"] | null
          streak_dias: number
          streak_freezes: number
          streak_updated_at: string | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          account_level?: number
          avatar_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          liga_atual?: Database["public"]["Enums"]["liga"]
          municao?: number
          nome_guerra?: string | null
          onboarded?: boolean
          plan?: Database["public"]["Enums"]["subscription_plan"]
          pontos_merito?: number
          prontidao?: number
          prontidao_max?: number
          prontidao_updated_at?: string
          punicoes?: number
          rank?: Database["public"]["Enums"]["military_rank"]
          region_unlocked?: string[]
          specialty?: Database["public"]["Enums"]["specialty"] | null
          streak_dias?: number
          streak_freezes?: number
          streak_updated_at?: string | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          account_level?: number
          avatar_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          liga_atual?: Database["public"]["Enums"]["liga"]
          municao?: number
          nome_guerra?: string | null
          onboarded?: boolean
          plan?: Database["public"]["Enums"]["subscription_plan"]
          pontos_merito?: number
          prontidao?: number
          prontidao_max?: number
          prontidao_updated_at?: string
          punicoes?: number
          rank?: Database["public"]["Enums"]["military_rank"]
          region_unlocked?: string[]
          specialty?: Database["public"]["Enums"]["specialty"] | null
          streak_dias?: number
          streak_freezes?: number
          streak_updated_at?: string | null
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
          region_code: string | null
          subject: Database["public"]["Enums"]["subject"]
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
          region_code?: string | null
          subject?: Database["public"]["Enums"]["subject"]
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
          region_code?: string | null
          subject?: Database["public"]["Enums"]["subject"]
          text?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      regions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          name: string
          primary_subject: Database["public"]["Enums"]["subject"]
          short_name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          name: string
          primary_subject: Database["public"]["Enums"]["subject"]
          short_name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          name?: string
          primary_subject?: Database["public"]["Enums"]["subject"]
          short_name?: string
        }
        Relationships: []
      }
      store_items: {
        Row: {
          active: boolean
          category: string
          code: string
          description: string | null
          id: string
          name: string
          price_municao: number
          rarity: Database["public"]["Enums"]["rarity"]
        }
        Insert: {
          active?: boolean
          category: string
          code: string
          description?: string | null
          id?: string
          name: string
          price_municao?: number
          rarity?: Database["public"]["Enums"]["rarity"]
        }
        Update: {
          active?: boolean
          category?: string
          code?: string
          description?: string | null
          id?: string
          name?: string
          price_municao?: number
          rarity?: Database["public"]["Enums"]["rarity"]
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          price_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tropa_stories: {
        Row: {
          active: boolean
          body: string
          correct_answer: string
          id: string
          option_a: string
          option_b: string
          question: string
          title: string
        }
        Insert: {
          active?: boolean
          body: string
          correct_answer: string
          id?: string
          option_a: string
          option_b: string
          question: string
          title: string
        }
        Update: {
          active?: boolean
          body?: string
          correct_answer?: string
          id?: string
          option_a?: string
          option_b?: string
          question?: string
          title?: string
        }
        Relationships: []
      }
      user_cunhetes: {
        Row: {
          contents: Json | null
          created_at: string
          id: string
          opened: boolean
          rarity: Database["public"]["Enums"]["rarity"]
          source: string
          user_id: string
        }
        Insert: {
          contents?: Json | null
          created_at?: string
          id?: string
          opened?: boolean
          rarity?: Database["public"]["Enums"]["rarity"]
          source: string
          user_id: string
        }
        Update: {
          contents?: Json | null
          created_at?: string
          id?: string
          opened?: boolean
          rarity?: Database["public"]["Enums"]["rarity"]
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      user_daily_progress: {
        Row: {
          claimed: boolean
          daily_mission_id: string
          id: string
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed?: boolean
          daily_mission_id: string
          id?: string
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed?: boolean
          daily_mission_id?: string
          id?: string
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_progress_daily_mission_id_fkey"
            columns: ["daily_mission_id"]
            isOneToOne: false
            referencedRelation: "daily_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inventory: {
        Row: {
          acquired_at: string
          equipped: boolean
          id: string
          item_id: string
          qty: number
          user_id: string
        }
        Insert: {
          acquired_at?: string
          equipped?: boolean
          id?: string
          item_id: string
          qty?: number
          user_id: string
        }
        Update: {
          acquired_at?: string
          equipped?: boolean
          id?: string
          item_id?: string
          qty?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_museum_cards: {
        Row: {
          acquired_at: string
          card_id: string
          id: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          card_id: string
          id?: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          card_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_museum_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "museum_cards"
            referencedColumns: ["id"]
          },
        ]
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
      [_ in never]: never
    }
    Functions: {
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
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
      regen_prontidao_tick: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "admin" | "user"
      liga:
        | "recruta"
        | "max_wolf_filho"
        | "prata"
        | "vilagran_cabrita"
        | "bitencourt"
        | "mallet"
        | "osorio"
        | "sampaio"
        | "rondon"
        | "caxias"
      military_rank:
        | "recruta"
        | "soldado"
        | "cabo"
        | "terceiro_sgt"
        | "segundo_sgt"
        | "primeiro_sgt"
        | "subtenente"
        | "segundo_tenente"
        | "primeiro_tenente"
        | "capitao_qao"
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
      rarity: "comum" | "raro" | "epico" | "lendario"
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
      subject:
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
        | "doutrina"
        | "sindicancia"
        | "ingles"
        | "musica"
      subscription_plan: "free" | "supersub" | "maxwolf"
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
      liga: [
        "recruta",
        "max_wolf_filho",
        "prata",
        "vilagran_cabrita",
        "bitencourt",
        "mallet",
        "osorio",
        "sampaio",
        "rondon",
        "caxias",
      ],
      military_rank: [
        "recruta",
        "soldado",
        "cabo",
        "terceiro_sgt",
        "segundo_sgt",
        "primeiro_sgt",
        "subtenente",
        "segundo_tenente",
        "primeiro_tenente",
        "capitao_qao",
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
      rarity: ["comum", "raro", "epico", "lendario"],
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
      subject: [
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
        "doutrina",
        "sindicancia",
        "ingles",
        "musica",
      ],
      subscription_plan: ["free", "supersub", "maxwolf"],
    },
  },
} as const
