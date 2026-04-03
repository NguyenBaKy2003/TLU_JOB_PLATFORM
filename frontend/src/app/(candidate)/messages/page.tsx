// src/app/messages/page.tsx
"use client";
import { useState }              from "react";
import { DashboardLayout }       from "@/presentation/components/layout/profile/DashboardLayout";
import { ConversationList }      from "@/presentation/components/messages/ConversationList";
import { ChatWindow }            from "@/presentation/components/messages/ChatWindow";
import { EmptyChat }             from "@/presentation/components/messages/EmptyChat";
import { CONVERSATIONS }         from "@/presentation/components/messages/mockData";

export default function MessagesPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeConv = CONVERSATIONS.find(c => c.id === activeId) ?? null;

  return (

      <div className="flex h-[calc(100vh-65px)] -m-4 sm:-m-6 overflow-hidden rounded-xl border border-gray-100 shadow-sm">

        {/*
          Mobile: chỉ hiện list hoặc chat (toggle)
          Desktop: list cố định 320px + chat flex-1
        */}

        {/* Conversation list */}
        <div className={`${
          activeId ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-96 shrink-0 flex-col`}>
          <ConversationList
            conversations={CONVERSATIONS}
            activeId={activeId}
            onSelect={setActiveId}
          />
        </div>

        {/* Chat area */}
        <div className={`${
          activeId ? "flex" : "hidden md:flex"
        } flex-1 min-w-0 flex-col`}>
          {activeConv
            ? <ChatWindow conv={activeConv} />
            : <EmptyChat />
          }
        </div>

      </div>
  );
}