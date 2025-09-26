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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      countdown_subscriptions: {
        Row: {
          countdown_id: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          countdown_id: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          countdown_id?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_countdown_subscriptions_countdown_id"
            columns: ["countdown_id"]
            isOneToOne: false
            referencedRelation: "countdowns"
            referencedColumns: ["id"]
          },
        ]
      }
      countdown_votes: {
        Row: {
          countdown_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          countdown_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          countdown_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "countdown_votes_countdown_id_fkey"
            columns: ["countdown_id"]
            isOneToOne: false
            referencedRelation: "countdowns"
            referencedColumns: ["id"]
          },
        ]
      }
      countdowns: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_public: boolean
          mode: string
          target_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          mode?: string
          target_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          mode?: string
          target_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_splits: {
        Row: {
          amount: number
          created_at: string
          custom_amount: number | null
          expense_id: string | null
          id: string
          participant_id: string | null
          weight: number | null
        }
        Insert: {
          amount: number
          created_at?: string
          custom_amount?: number | null
          expense_id?: string | null
          id?: string
          participant_id?: string | null
          weight?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          custom_amount?: number | null
          expense_id?: string | null
          id?: string
          participant_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_splits_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_splits_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          description: string | null
          expense_type: string | null
          group_id: string | null
          id: string
          paid_by: string
          split_type: Database["public"]["Enums"]["split_type"] | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          expense_type?: string | null
          group_id?: string | null
          id?: string
          paid_by: string
          split_type?: Database["public"]["Enums"]["split_type"] | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          expense_type?: string | null
          group_id?: string | null
          id?: string
          paid_by?: string
          split_type?: Database["public"]["Enums"]["split_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      group: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      group_views: {
        Row: {
          created_at: string
          group_id: string
          id: string
          participant_id: string
          viewed_at: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          participant_id: string
          viewed_at?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          participant_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_views_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_views_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      "nepse-portfolio-portfolios": {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      "nepse-portfolio-transactions": {
        Row: {
          created_at: string | null
          date: string
          id: string
          include_dp_charge: boolean | null
          portfolio_id: string
          price: number
          quantity: number
          symbol: string
          tags: string[] | null
          transaction_type: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          include_dp_charge?: boolean | null
          portfolio_id: string
          price: number
          quantity: number
          symbol: string
          tags?: string[] | null
          transaction_type: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          include_dp_charge?: boolean | null
          portfolio_id?: string
          price?: number
          quantity?: number
          symbol?: string
          tags?: string[] | null
          transaction_type?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nepse-portfolio-transactions_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "nepse-portfolio-portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          created_at: string
          email: string | null
          group_id: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          group_id?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          group_id?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["id"]
          },
        ]
      }
      pollify_poll_options: {
        Row: {
          created_at: string | null
          id: string
          option_text: string
          poll_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_text: string
          poll_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_text?: string
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pollify_poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "pollify_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      pollify_polls: {
        Row: {
          active: boolean | null
          allow_multiple: boolean | null
          created_at: string | null
          id: string
          question: string
          require_name_email: boolean | null
        }
        Insert: {
          active?: boolean | null
          allow_multiple?: boolean | null
          created_at?: string | null
          id?: string
          question: string
          require_name_email?: boolean | null
        }
        Update: {
          active?: boolean | null
          allow_multiple?: boolean | null
          created_at?: string | null
          id?: string
          question?: string
          require_name_email?: boolean | null
        }
        Relationships: []
      }
      pollify_votes: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          option_id: string
          poll_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          option_id: string
          poll_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          option_id?: string
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pollify_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "pollify_poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pollify_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "pollify_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      settlements: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          from_participant_id: string
          group_id: string
          id: string
          settlement_date: string
          to_participant_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          from_participant_id: string
          group_id: string
          id?: string
          settlement_date?: string
          to_participant_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          from_participant_id?: string
          group_id?: string
          id?: string
          settlement_date?: string
          to_participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_from_participant_id_fkey"
            columns: ["from_participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_to_participant_id_fkey"
            columns: ["to_participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      wt_categories: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      wt_monthly_data: {
        Row: {
          created_at: string | null
          id: string
          month: string
          monthly_note: string | null
          tags: Json | null
          total_net_worth: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: string
          monthly_note?: string | null
          tags?: Json | null
          total_net_worth?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: string
          monthly_note?: string | null
          tags?: Json | null
          total_net_worth?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      wt_monthly_entries: {
        Row: {
          amount: number
          category_id: string
          created_at: string | null
          id: string
          monthly_data_id: string
          notes: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number
          category_id: string
          created_at?: string | null
          id?: string
          monthly_data_id: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string | null
          id?: string
          monthly_data_id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wt_monthly_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "wt_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wt_monthly_entries_monthly_data_id_fkey"
            columns: ["monthly_data_id"]
            isOneToOne: false
            referencedRelation: "wt_monthly_data"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      split_type: "equal" | "amount" | "weight"
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
      split_type: ["equal", "amount", "weight"],
    },
  },
} as const
