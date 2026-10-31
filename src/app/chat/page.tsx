"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Send, MessageCircle, ArrowLeft, Tag, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import type { ConversationListItem, MessageWithSender, UserSummary } from "@/types";

interface Message {
  id: string;
  text: string;
  senderId: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  sender: UserSummary;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) return;
    fetchConversations();
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    setLoadingConvos(true);
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (json.success) setConversations(json.data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoadingConvos(false);
    }
  };

  const fetchMessages = useCallback(async (convoId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations/${convoId}/messages`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (json.success) setMessages(json.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const selectConversation = (convoId: string) => {
    setSelectedConvoId(convoId);
    fetchMessages(convoId);
  };

  const sendMessage = async (text: string, messageType: string = "TEXT") => {
    if (!selectedConvoId || !text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedConvoId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, messageType }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [...prev, json.data]);
        setNewMessage("");
        fetchConversations(); // refresh last message
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleMakeOffer = () => {
    const amount = prompt("Enter your offer amount ($):");
    if (amount) sendMessage(`💰 Made an offer: $${amount}`, "OFFER");
  };

  const handleMarkSold = () => sendMessage("✅ Item marked as Sold", "SOLD");

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <MessageCircle className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-700">Sign in to access chat</h2>
        <Button onClick={() => router.push("/auth/signin")} className="mt-4">Sign In</Button>
      </div>
    );
  }

  const getOtherParticipant = (convo: ConversationListItem) => {
    const other = convo.participants.find((p) => p.userId !== session.user.id);
    return other?.user || { id: "", name: "Unknown", avatarUrl: null, rating: 0, reviewCount: 0 };
  };

  const selectedConvo = conversations.find((c) => c.id === selectedConvoId);
  const otherUser = selectedConvo ? getOtherParticipant(selectedConvo) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex h-[calc(100vh-10rem)] rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {/* Conversation List */}
        <div className={`w-full md:w-80 shrink-0 border-r border-gray-200 flex flex-col ${selectedConvoId ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" /> Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2"><div className="h-4 w-24 rounded bg-gray-200" /><div className="h-3 w-32 rounded bg-gray-200" /></div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No conversations yet</div>
            ) : (
              conversations.map((convo) => {
                const other = getOtherParticipant(convo);
                const lastMsg = convo.messages[0];
                const isSelected = convo.id === selectedConvoId;
                return (
                  <button
                    key={convo.id}
                    onClick={() => selectConversation(convo.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50 border-l-2 border-blue-600" : ""}`}
                  >
                    <Avatar name={other.name} src={other.avatarUrl || undefined} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{other.name}</p>
                      {lastMsg && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{lastMsg.text}</p>
                      )}
                    </div>
                    {lastMsg && (
                      <span className="text-[10px] text-gray-400 shrink-0">{formatDate(lastMsg.createdAt)}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className={`flex-1 flex flex-col ${selectedConvoId ? "flex" : "hidden md:flex"}`}>
          {selectedConvoId && otherUser ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                <button onClick={() => setSelectedConvoId(null)} className="md:hidden p-1 text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar name={otherUser.name} src={otherUser.avatarUrl || undefined} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{otherUser.name}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleMakeOffer} className="text-xs gap-1">
                    <Tag className="h-3 w-3" /> Make Offer
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleMarkSold} className="text-xs gap-1 text-green-600 border-green-200 hover:bg-green-50">
                    <CheckCircle className="h-3 w-3" /> Mark Sold
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="text-center text-sm text-gray-500 py-8">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 py-8">No messages yet. Say hello!</div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === session.user.id;
                    const isSpecial = msg.messageType !== "TEXT";
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isSpecial
                            ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                            : isMine
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isMine && !isSpecial ? "text-blue-200" : "text-gray-400"}`}>
                            {formatDate(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="border-t border-gray-100 px-4 py-3 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <Button type="submit" disabled={!newMessage.trim() || sending} size="md" className="gap-1.5">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                title="Select a Conversation"
                description="Choose a conversation from the list to start chatting."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
