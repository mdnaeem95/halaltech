﻿export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          is_processed: boolean | null
          message: string | null
          name: string
          phone: string | null
          processed_at: string | null
          processed_by: string | null
          service_interested: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_processed?: boolean | null
          message?: string | null
          name: string
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          service_interested?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_processed?: boolean | null
          message?: string | null
          name?: string
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          service_interested?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          paid_at: string | null
          payment_method: string | null
          project_id: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          paid_at?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          paid_at?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio: {
        Row: {
          client_name: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          images: Json | null
          is_featured: boolean | null
          live_url: string | null
          service_id: string | null
          technologies: Json | null
          title: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          live_url?: string | null
          service_id?: string | null
          technologies?: Json | null
          title: string
        }
        Update: {
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          live_url?: string | null
          service_id?: string | null
          technologies?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          business_registration_no: string | null
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          business_registration_no?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          business_registration_no?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      project_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          project_id: string | null
          sender_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          project_id?: string | null
          sender_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          project_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          final_price: number | null
          id: string
          package_id: string | null
          quoted_price: number | null
          requirements: string | null
          service_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          final_price?: number | null
          id?: string
          package_id?: string | null
          quoted_price?: number | null
          requirements?: string | null
          service_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          final_price?: number | null
          id?: string
          package_id?: string | null
          quoted_price?: number | null
          requirements?: string | null
          service_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          accepted_at: string | null
          amount: number
          created_at: string | null
          deliverables: Json | null
          id: string
          is_accepted: boolean | null
          payment_terms: string | null
          project_id: string | null
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          amount: number
          created_at?: string | null
          deliverables?: Json | null
          id?: string
          is_accepted?: boolean | null
          payment_terms?: string | null
          project_id?: string | null
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          amount?: number
          created_at?: string | null
          deliverables?: Json | null
          id?: string
          is_accepted?: boolean | null
          payment_terms?: string | null
          project_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          client_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          is_featured: boolean | null
          project_id: string | null
          rating: number | null
        }
        Insert: {
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          project_id?: string | null
          rating?: number | null
        }
        Update: {
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          project_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          created_at: string | null
          delivery_days: number | null
          features: Json | null
          id: string
          is_popular: boolean | null
          name: string
          price: number
          revisions: number | null
          service_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_days?: number | null
          features?: Json | null
          id?: string
          is_popular?: boolean | null
          name: string
          price: number
          revisions?: number | null
          service_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_days?: number | null
          features?: Json | null
          id?: string
          is_popular?: boolean | null
          name?: string
          price?: number
          revisions?: number | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number | null
          category: Database["public"]["Enums"]["service_category"]
          created_at: string | null
          description: string | null
          display_order: number | null
          duration_estimate: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          price_unit: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_estimate?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          price_unit?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_estimate?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          price_unit?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status:
        | "inquiry"
        | "quoted"
        | "in_progress"
        | "review"
        | "completed"
        | "cancelled"
      service_category: "web" | "mobile" | "design" | "consulting"
      user_role: "client" | "admin" | "service_provider"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      project_status: [
        "inquiry",
        "quoted",
        "in_progress",
        "review",
        "completed",
        "cancelled",
      ],
      service_category: ["web", "mobile", "design", "consulting"],
      user_role: ["client", "admin", "service_provider"],
    },
  },
} as const
