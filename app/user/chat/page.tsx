/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import type React from "react";
import { useState, useRef, useEffect, Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Send,
  Menu,
  X,
  Plus,
  Paperclip,
  FileText,
  ImageIcon,
  Eye,
  BadgeCheck,
} from "lucide-react";
import {
  ChatSession,
  AvailableUser,
  ChatMessage,
  Attachment,
} from "./ChatTypes";
import { useAuth } from "@/contexts/AuthContext";
import { getAblyClient } from "@/lib/ably";
import { useSearchParams } from "next/navigation";

async function markConversationAsRead(sessionId: string, userId: string) {
  try {
    await fetch("/api/chat/mark-as-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userId }),
    });
  } catch (err) {
    console.error("Failed to mark read:", err);
  }
}

function LiveChatPageContent() {
  const [allConversations, setAllConversations] = useState<ChatSession[]>();
  const [selectedConversation, setSelectedConversation] =
    useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const searchParams = useSearchParams();
  const to = searchParams.get("to");

  useEffect(() => {
    if (to && typeof to === "string") {
      setDialogOpen(true);
      setUserSearchTerm(to);
      setSearchTerm(to);
    }
  }, [to]);

  // auth context from session login
  const { user: sessionUser } = useAuth();
  const currentUserId = sessionUser?.id || "";

  // set the first conversation
  useEffect(() => {
    if (
      allConversations &&
      allConversations.length > 0 &&
      !selectedConversation
    ) {
      setSelectedConversation(allConversations[0]);
    }
  }, [allConversations, selectedConversation]);

  // fetches the conversation based on selected chat session Id
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/api/chat/get-messages?sessionId=${selectedConversation.id}`,
        );
        if (!res.ok) throw new Error("Failed to fetch messages");
        const msgs: ChatMessage[] = await res.json();

        setChatMessages((prev) => ({
          ...prev,
          [selectedConversation.id]: msgs,
        }));
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  // fetch chat session which contains logged in user's id (Completed) order desc
  useEffect(() => {
    async function fetchConversations() {
      if (!currentUserId) return;

      const res = await fetch(`/api/chat/get-sessions?userId=${currentUserId}`);
      if (!res.ok) {
        console.error("Failed to fetch chat sessions");
        return;
      }

      const data: ChatSession[] = await res.json();

      const sorted = data.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setAllConversations(sorted);
    }

    fetchConversations();
  }, [currentUserId]);

  // fetch all users in add user dialog (Completed)
  useEffect(() => {
    fetch("/api/chat/users")
      .then((res) => res.json())
      .then((data) =>
        setAvailableUsers(
          data.map((u: any) => ({
            id: u.id,
            name: u.username,
            avatar: u.profile_picture_url ?? "/images/johnson.png",
            status: u.online_status ? "online" : "offline",
            role: u.role,
          })),
        ),
      );
  }, []);

  // mark as read if the user scroll to bottom of the scroll area
  useEffect(() => {
    if (!selectedConversation?.id || !currentUserId) return;

    const container = chatContainerRef.current;
    if (!container) return;

    console.log("[Chat] useEffect mounted for", selectedConversation.id);

    const ablyClient = getAblyClient();
    const channel = ablyClient.channels.get(`chat-${selectedConversation.id}`);

    const checkAtBottom = () => {
      const diff =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      return diff <= 20;
    };

    const handleScroll = () => {
      console.log("[Scroll event]", {
        scrollTop: container.scrollTop,
        clientHeight: container.clientHeight,
        scrollHeight: container.scrollHeight,
      });
      if (checkAtBottom()) {
        console.log("[Chat] At bottom → marking as read");
        markConversationAsRead(selectedConversation.id, currentUserId);
      }
    };

    container.addEventListener("scroll", handleScroll);

    const handleReadEvent = (msg: any) => {
      console.log("[Chat] Read event received", msg.data);
      const { sessionId, userId } = msg.data;
      if (sessionId === selectedConversation.id) {
        setAllConversations((prev) =>
          prev?.map((c) =>
            c.id === sessionId
              ? { ...c, unread: { ...c.unread, [userId]: 0 } }
              : c,
          ),
        );
      }
    };

    channel.subscribe("read", handleReadEvent);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      channel.unsubscribe("read", handleReadEvent);
    };
  }, [selectedConversation?.id, currentUserId]);

  // listen for messages directed to any user
  useEffect(() => {
    if (!currentUserId) return;

    const client = getAblyClient();
    const channel = client.channels.get(`chat:user:${currentUserId}`);

    const onAnyMessage = (msg: any) => {
      const data = msg.data as ChatMessage;
      const convId = data.sessionId;

      // update conversations list (lastMessage + timestamp + unread count)
      setAllConversations((prev) => {
        if (!prev) return prev;
        const idx = prev.findIndex((c) => c.id === convId);
        if (idx === -1) return prev;

        const updated = [...prev];
        const ts = data.timestamp ?? new Date().toISOString();

        const updatedSession: ChatSession = {
          ...updated[idx],
          timestamp: ts,
          lastMessage: data.content || "Attachment",
          unread: {
            ...updated[idx].unread,
            [currentUserId]:
              selectedConversation?.id === convId
                ? 0
                : (updated[idx].unread?.[currentUserId] || 0) + 1,
          },
        };

        updated.splice(idx, 1);
        updated.unshift(updatedSession);

        return updated;
      });
    };

    channel.subscribe("message", onAnyMessage);

    return () => {
      channel.unsubscribe("message", onAnyMessage);
    };
  }, [currentUserId, selectedConversation?.id]);

  useEffect(() => {
    if (!selectedConversation?.id) return;

    const container = chatContainerRef.current;
    if (!container) return;

    // jump instantly to bottom
    container.scrollTop = container.scrollHeight;
  }, [selectedConversation?.id]);

  // real time session push (new chats being created)
  useEffect(() => {
    const client = getAblyClient();
    const channel = client.channels.get("chat:sessions");

    const listener = (msg: any) => {
      if (msg.name === "created") {
        const newSession: ChatSession = msg.data;

        if (newSession.participantIds.includes(currentUserId)) {
          setAllConversations((prev) => [newSession, ...(prev || [])]);
          setChatMessages((prev) => ({ ...prev, [newSession.id]: [] }));
        }
      }
    };

    channel.subscribe(listener);

    return () => {
      channel.unsubscribe(listener);
    };
  }, [currentUserId]);

  // pushes updates upon receiving new messages
  useEffect(() => {
    if (!selectedConversation?.id) return;

    const client = getAblyClient();
    const channelName = `chat:${selectedConversation.id}`;
    const channel = client.channels.get(channelName);

    const onMsg = (msg: any) => {
      const data = msg.data as ChatMessage;
      const convId = selectedConversation.id;

      // append message to the active conversation
      setChatMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), data],
      }));

      // update sessions list (timestamp + move to top)
      setAllConversations((prev) => {
        if (!prev) return prev;
        const idx = prev.findIndex((c) => c.id === convId);
        if (idx === -1) return prev;

        const updated = [...prev];
        const ts = data.timestamp ?? new Date().toISOString();

        const updatedSession = {
          ...updated[idx],
          timestamp: ts,
          lastMessage: data.content,
        };

        updated.splice(idx, 1);
        updated.unshift(updatedSession as ChatSession);
        return updated;
      });

      // update the conversation session
      setSelectedConversation((prev) =>
        prev && prev.id === convId
          ? ({
              ...prev,
              timestamp: data.timestamp ?? new Date().toISOString(),
              lastMessage: data.content,
            } as ChatSession)
          : prev,
      );
    };

    channel.subscribe("message", onMsg);

    return () => {
      channel.unsubscribe("message", onMsg);
    };
  }, [selectedConversation?.id]);

  // find the "other" user in a chat (Completed)
  const getOtherUser = (conv: ChatSession): AvailableUser | undefined => {
    const otherId = conv.participantIds.find((id) => id !== currentUserId);
    return availableUsers.find((u) => u.id === otherId);
  };

  // setting the selected conversation user (Completed)
  const selectedOtherUser = selectedConversation
    ? getOtherUser(selectedConversation)
    : undefined;

  // bugs -- fixed [this one need the s3 and dynamodb connection]
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedAttachment) || !selectedConversation)
      return;

    const formData = new FormData();
    formData.append("sessionId", selectedConversation.id);
    formData.append("senderId", currentUserId);

    // get the other participant
    const targetUserId = selectedConversation.participantIds.find(
      (id) => id !== currentUserId,
    );
    if (!targetUserId) return console.error("No target user found");
    formData.append("targetUserId", targetUserId);

    formData.append("content", newMessage);

    if (selectedAttachment) {
      formData.append("attachment", selectedAttachment);
    }

    const res = await fetch("/api/chat/send-messages", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error("Failed to send message", await res.text());
      return;
    }

    const newMsg: ChatMessage = await res.json();

    // update local state
    const updated = [...(chatMessages[selectedConversation.id] || []), newMsg];
    setChatMessages({ ...chatMessages, [selectedConversation.id]: updated });
    setNewMessage("");
    setSelectedAttachment(null);

    setAllConversations((prev) =>
      prev?.map((c) =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: newMsg.content, timestamp: newMsg.timestamp }
          : c,
      ),
    );
  };

  // Add new Chat Session (Completed)
  const handleAddUser = async (user: AvailableUser) => {
    const existingConversation = allConversations?.find(
      (conv) =>
        conv.participantIds.includes(user.id) &&
        conv.participantIds.includes(currentUserId),
    );

    if (existingConversation) {
      setSelectedConversation(existingConversation);
      return;
    }

    const res = await fetch("/api/chat/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentUserId, targetUserId: user.id }),
    });

    if (!res.ok) {
      console.error("Failed to create session");
      return;
    }

    const newConversation: ChatSession = await res.json();

    setAllConversations([newConversation, ...(allConversations || [])]);
    setChatMessages({ ...chatMessages, [newConversation.id]: [] });
    setSelectedConversation(newConversation);
    setDialogOpen(false);
    setUserSearchTerm("");
    setSidebarOpen(false);
  };

  const filteredConversations = allConversations?.filter((conv) => {
    const otherUser = getOtherUser(conv);
    return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredAvailableUsers = availableUsers.filter(
    (user) =>
      (user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.id === userSearchTerm) &&
      !allConversations?.some((conv) => conv.participantIds.includes(user.id)),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
      default:
        return "bg-gray-400";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedAttachment(file);
  };

  const removeAttachment = () => {
    setSelectedAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleView = (att: Attachment) => {
    window.open(att.url, "_blank");
  };

  const renderAttachment = (
    att: NonNullable<ChatMessage["attachments"]>[0],
  ) => {
    if (!att) return null;

    const sizeKb = Math.round(att.size / 1024);

    // Image attachment
    if (att.type.startsWith("image")) {
      return (
        <div className="mt-2 relative group max-w-xs">
          <img
            src={att.url}
            alt={att.name}
            className="rounded-lg border border-gray-200"
          />
          <Button
            variant="outline"
            onClick={() => handleView(att)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white p-1 h-8 w-8"
            size="sm"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <div className="mt-1 text-xs opacity-70 truncate">
            {att.name} • {sizeKb} KB
          </div>
        </div>
      );
    }

    // Other file types
    return (
      <div className="mt-2 flex items-center gap-2 p-3 bg-white/10 rounded-lg border border-white/20">
        <FileText className="w-6 h-6 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{att.name}</p>
          <p className="text-xs opacity-70">{sizeKb} KB</p>
        </div>
        <Button
          variant="outline"
          onClick={() => handleView(att)}
          className="bg-white/20 hover:bg-white/30 text-current p-1 h-8 w-8 border-0"
          size="sm"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-25 md:pb-0 mb-0 md:mb-12">
      <div className="mb-6">
        <h1 className="font-montserrat font-bold text-3xl text-gray-900 mb-2">
          Live Chat
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex h-[850px] relative">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={selectedOtherUser?.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback className="bg-[#F5BE66] text-white">
                      {selectedOtherUser?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {selectedOtherUser?.name || "Unknown User"}
                      </h3>
                      {selectedOtherUser?.role === "practitioner" && (
                        <BadgeCheck className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 capitalize flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${getStatusColor(selectedOtherUser?.status || "offline")}`}
                      ></span>
                      {selectedOtherUser?.status || "offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    {sidebarOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 p-4 overflow-y-scroll custom-scrollbar"
              ref={chatContainerRef}
            >
              <div className="space-y-4" ref={chatContainerRef}>
                {(chatMessages[selectedConversation?.id || ""] || []).map(
                  (message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUserId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl ${
                          message.senderId === currentUserId
                            ? "bg-[#F5BE66] text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>

                        {message.attachments?.map((att, index) => (
                          <div key={index}>{renderAttachment(att)}</div>
                        ))}

                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === currentUserId
                              ? "text-white/70"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ),
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              {selectedAttachment && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    {selectedAttachment.type.startsWith("image/") ? (
                      <ImageIcon className="w-6 h-6 text-gray-500" />
                    ) : (
                      <FileText className="w-6 h-6 text-gray-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedAttachment.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(selectedAttachment.size / 1024)} KB
                      </p>
                    </div>
                    <Button
                      onClick={removeAttachment}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-red-500 p-1 h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />

                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  disabled={!selectedConversation}
                  className="text-gray-500 hover:text-[#F5BE66] rounded-xl hover:bg-[#F5BE66]/10 w-12 h-12 flex items-center justify-center"
                >
                  <Paperclip className="w-20 h-20" />
                </Button>

                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  disabled={!selectedConversation}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border-gray-300 focus:border-[#F5BE66] focus:ring-[#F5BE66]"
                />
                <Button
                  type="submit"
                  className="bg-[#F5BE66] hover:bg-[#E5AE56] w-15 h-12 text-white flex items-center justify-center"
                  disabled={!newMessage.trim() && !selectedAttachment}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Conversations Sidebar */}
          <div
            className={`
              md:w-96 border-l border-gray-200 flex flex-col bg-white 
              md:static md:translate-x-0 transition-transform duration-300
              fixed top-0 left-0 h-full w-80 z-50 md:z-20
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            {/* Search hidden in mobile */}
            <div className="p-4 border-b border-gray-200 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#F5BE66] focus:ring-[#F5BE66]"
                />
              </div>
            </div>

            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Conversations</h3>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 hover:bg-[#F5BE66]/10 hover:text-[#F5BE66]"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-[#F5BE66] focus:ring-[#F5BE66]"
                      />
                    </div>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {filteredAvailableUsers.map((user) => (
                          <div
                            key={user.id}
                            className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleAddUser(user)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage
                                    src={user.avatar || "/placeholder.svg"}
                                  />
                                  <AvatarFallback className="bg-[#F5BE66] text-white text-sm">
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div
                                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                                    user.status,
                                  )}`}
                                ></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {user.name}
                                  </p>
                                  {user.role === "practitioner" && (
                                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                                  ID: {user.id}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {filteredAvailableUsers.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">No users found</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredConversations?.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  return (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                        selectedConversation?.id === conversation.id
                          ? "bg-[#F5BE66]/10 border-r-4 border-r-[#F5BE66]"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        setSidebarOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={otherUser?.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="bg-[#F5BE66] text-white text-sm">
                              {otherUser?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                              otherUser?.status || "offline",
                            )}`}
                          ></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate text-sm">
                                {otherUser?.name || "Unknown User"}
                              </p>
                              {otherUser?.role === "practitioner" && (
                                <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {conversation.unread[currentUserId] > 0 && (
                                <div className="bg-[#F5BE66] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unread[currentUserId]}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {conversation.lastMessage}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(conversation.timestamp).toLocaleString(
                              "en-US",
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserChatPage() {
  return (
    <Suspense fallback={
      <div className="p-6 max-w-7xl mx-auto pb-25 md:pb-0 mb-0 md:mb-12">
        <div className="mb-6">
          <h1 className="font-montserrat font-bold text-3xl text-gray-900 mb-2">
            Live Chat
          </h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex h-[850px] relative items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <span className="ml-4 text-gray-600">Loading chat...</span>
          </div>
        </div>
      </div>
    }>
      <LiveChatPageContent />
    </Suspense>
  );
}
