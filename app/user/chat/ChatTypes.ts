// done
export interface AvailableUser {
  id: string;
  name: string;
  avatar: string;
  status: string;
  role?: string;
}

export interface Attachment {
  name: string; // file name
  url: string; // s3 url
  type: string; // mime type e.g. image/png
  size: number; // in bytes (number instead of string)
}

export interface ChatSession {
  id: string;
  participantIds: string[]; // add current user and pointed user
  lastMessage: string;
  timestamp: string;
  unread: Record<string, number>;
}

export interface ChatMessage {
  id: string; // messageId
  sessionId: string; // link to ChatSession
  senderId: string; // who sent it
  content: string; // text message
  attachments?: {
    name: string; // file name
    url: string; // s3 url
    type: string; // mime type e.g. image/png
    size: number; // in bytes (number instead of string)
  }[];
  timestamp: string; // ISO string
}
