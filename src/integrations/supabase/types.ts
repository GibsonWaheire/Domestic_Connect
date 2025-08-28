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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agency_profiles: {
        Row: {
          agency_name: string
          created_at: string
          description: string | null
          id: string
          license_number: string | null
          location: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          agency_name: string
          created_at?: string
          description?: string | null
          id?: string
          license_number?: string | null
          location: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          agency_name?: string
          created_at?: string
          description?: string | null
          id?: string
          license_number?: string | null
          location?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_access: {
        Row: {
          accessed_at: string
          id: string
          purchaser_id: string
          target_profile_id: string
        }
        Insert: {
          accessed_at?: string
          id?: string
          purchaser_id: string
          target_profile_id: string
        }
        Update: {
          accessed_at?: string
          id?: string
          purchaser_id?: string
          target_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_access_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_profiles: {
        Row: {
          company_name: string | null
          created_at: string
          description: string | null
          id: string
          location: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      housegirl_profiles: {
        Row: {
          accommodation_type: Database["public"]["Enums"]["accommodation_type"]
          age: number
          bio: string | null
          created_at: string
          current_location: string
          education: Database["public"]["Enums"]["education_level"]
          expected_salary: number
          experience: Database["public"]["Enums"]["experience_level"]
          id: string
          is_available: boolean | null
          location: string
          profile_id: string
          profile_photo_url: string | null
          tribe: string
          updated_at: string
        }
        Insert: {
          accommodation_type: Database["public"]["Enums"]["accommodation_type"]
          age: number
          bio?: string | null
          created_at?: string
          current_location: string
          education: Database["public"]["Enums"]["education_level"]
          expected_salary: number
          experience: Database["public"]["Enums"]["experience_level"]
          id?: string
          is_available?: boolean | null
          location: string
          profile_id: string
          profile_photo_url?: string | null
          tribe: string
          updated_at?: string
        }
        Update: {
          accommodation_type?: Database["public"]["Enums"]["accommodation_type"]
          age?: number
          bio?: string | null
          created_at?: string
          current_location?: string
          education?: Database["public"]["Enums"]["education_level"]
          expected_salary?: number
          experience?: Database["public"]["Enums"]["experience_level"]
          id?: string
          is_available?: boolean | null
          location?: string
          profile_id?: string
          profile_photo_url?: string | null
          tribe?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housegirl_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_packages: {
        Row: {
          contacts_included: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          contacts_included: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          contacts_included?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          amount_paid: number
          contacts_remaining: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          mpesa_transaction_id: string | null
          package_id: string
          purchase_date: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          contacts_remaining: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          mpesa_transaction_id?: string | null
          package_id: string
          purchase_date?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          contacts_remaining?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          mpesa_transaction_id?: string | null
          package_id?: string
          purchase_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "payment_packages"
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
      accommodation_type: "live_in" | "live_out" | "both"
      education_level:
        | "primary"
        | "form_2"
        | "form_4"
        | "certificate"
        | "diploma"
        | "degree"
      experience_level:
        | "no_experience"
        | "1_year"
        | "2_years"
        | "3_years"
        | "4_years"
        | "5_plus_years"
      user_type: "employer" | "housegirl" | "agency"
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
      accommodation_type: ["live_in", "live_out", "both"],
      education_level: [
        "primary",
        "form_2",
        "form_4",
        "certificate",
        "diploma",
        "degree",
      ],
      experience_level: [
        "no_experience",
        "1_year",
        "2_years",
        "3_years",
        "4_years",
        "5_plus_years",
      ],
      user_type: ["employer", "housegirl", "agency"],
    },
  },
} as const
