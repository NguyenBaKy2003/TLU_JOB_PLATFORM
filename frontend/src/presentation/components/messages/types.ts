// src/domain/models/Message.ts

export interface Conversation {
  id:          string;
  company:     string;
  avatar:      string;       // URL hoặc initials fallback
  lastMessage: string;
  time:        string;
  unread:      number;
  online:      boolean;
}

export type MessageType = "text" | "file" | "image" | "audio" | "emoji";

export interface Message {
  id:        string;
  type:      MessageType;
  content:   string;
  time:      string;
  fromMe:    boolean;
  // file/image
  fileName?: string;
  fileSize?: string;
  // audio
  duration?: string;
}