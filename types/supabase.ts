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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          alt: string
          created_at: string
          filename: string
          id: string
          mime_type: string
          size_bytes: number
          storage_path: string | null
          thumbnail_url: string | null
          thumbnail_storage_path: string | null
          url: string
        }
        Insert: {
          alt?: string
          created_at?: string
          filename: string
          id?: string
          mime_type: string
          size_bytes: number
          storage_path?: string | null
          thumbnail_url?: string | null
          thumbnail_storage_path?: string | null
          url: string
        }
        Update: {
          alt?: string
          created_at?: string
          filename?: string
          id?: string
          mime_type?: string
          size_bytes?: number
          storage_path?: string | null
          thumbnail_url?: string | null
          thumbnail_storage_path?: string | null
          url?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          department_id: string | null
          id: string
          person_id: string
          responsibility: string
          role: string
          sort_order: number
          title: string
          visible: boolean
        }
        Insert: {
          department_id?: string | null
          id?: string
          person_id: string
          responsibility?: string
          role: string
          sort_order?: number
          title?: string
          visible?: boolean
        }
        Update: {
          department_id?: string | null
          id?: string
          person_id?: string
          responsibility?: string
          role?: string
          sort_order?: number
          title?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "assignments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string | null
          description: string
          id: string
          name: string
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          code?: string | null
          description?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          code?: string | null
          description?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          title?: string | null
        }
        Relationships: []
      }
      landing_sections: {
        Row: {
          asset_id: string | null
          content: Json
          description: string
          enabled: boolean
          id: string
          key: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          content?: Json
          description?: string
          enabled?: boolean
          id?: string
          key: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          content?: Json
          description?: string
          enabled?: boolean
          id?: string
          key?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_sections_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          author_name: string
          created_at: string
          id: string
          leaf_type: string
          message: string
          role_team: string | null
          slot_index: number
        }
        Insert: {
          author_name: string
          created_at?: string
          id?: string
          leaf_type?: string
          message: string
          role_team?: string | null
          slot_index?: never
        }
        Update: {
          author_name?: string
          created_at?: string
          id?: string
          leaf_type?: string
          message?: string
          role_team?: string | null
          slot_index?: never
        }
        Relationships: []
      }
      people: {
        Row: {
          asset_id: string | null
          badge: string
          code: string | null
          id: string
          name: string
          quote: string
          sort_order: number
          unit: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          asset_id?: string | null
          badge?: string
          code?: string | null
          id?: string
          name: string
          quote?: string
          sort_order?: number
          unit?: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          asset_id?: string | null
          badge?: string
          code?: string | null
          id?: string
          name?: string
          quote?: string
          sort_order?: number
          unit?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "people_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      post_content_assets: {
        Row: {
          asset_id: string
          post_id: string
        }
        Insert: {
          asset_id: string
          post_id: string
        }
        Update: {
          asset_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_content_assets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_content_assets_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_images: {
        Row: {
          asset_id: string
          caption: string
          id: string
          post_id: string
          sort_order: number
        }
        Insert: {
          asset_id: string
          caption?: string
          id?: string
          post_id: string
          sort_order?: number
        }
        Update: {
          asset_id?: string
          caption?: string
          id?: string
          post_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_images_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          category_id: string
          content: Json
          cover_asset_id: string | null
          created_at: string
          excerpt: string
          id: string
          published_at: string | null
          slug: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id: string
          content?: Json
          cover_asset_id?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published_at?: string | null
          slug: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          content?: Json
          cover_asset_id?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published_at?: string | null
          slug?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          background_asset_id: string | null
          content: Json
          id: string
          logo_asset_id: string | null
          updated_at: string
        }
        Insert: {
          background_asset_id?: string | null
          content?: Json
          id: string
          logo_asset_id?: string | null
          updated_at?: string
        }
        Update: {
          background_asset_id?: string | null
          content?: Json
          id?: string
          logo_asset_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_background_asset_id_fkey"
            columns: ["background_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_settings_logo_asset_id_fkey"
            columns: ["logo_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_cleanup: {
        Row: {
          created_at: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          storage_path: string
        }
        Update: {
          created_at?: string
          storage_path?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      save_website: { Args: { payload: Json }; Returns: undefined };
      delete_cms_group: { Args: {resource_name:string;target_id:string;replacement_id?:string|null}; Returns: undefined }
      delete_program_card: { Args: {card_id:string}; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      save_post: { Args: { payload: Json; post_id: string }; Returns: string }
      update_site_settings: { Args: { payload: Json }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

