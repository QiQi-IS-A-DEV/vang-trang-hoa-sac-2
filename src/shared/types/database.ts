export type LeafType = "leaf" | "lantern" | "star";
export type MemoryMessage = {
  id: string;
  author_name: string;
  role_team: string | null;
  message: string;
  leaf_type: LeafType;
  slot_index: number;
  created_at: string;
};
export type MessageInput = Pick<MemoryMessage, "author_name" | "role_team" | "message" | "leaf_type">;
export type GalleryImage = {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
  sort_order: number;
  created_at: string;
};
export type Database = {
  public: {
    Tables: {
      messages: {
        Row: MemoryMessage;
        Insert: MessageInput;
        Update: Partial<MessageInput>;
        Relationships: [];
      };
      gallery_images: {
        Row: GalleryImage;
        Insert: Omit<GalleryImage, "id" | "created_at">;
        Update: Partial<Omit<GalleryImage, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};