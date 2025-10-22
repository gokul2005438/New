import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MatchWithUsers, MessageWithSender } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export default function Chat() {
  const { matchId } = useParams<{ matchId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch match details
  const { data: match } = useQuery<MatchWithUsers>({
    queryKey: ["/api/matches", matchId],
    enabled: !!matchId,
  });

  // Fetch messages
  const { data: messages = [] } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/messages", matchId],
    enabled: !!matchId,
    refetchInterval: 3000, // Poll for new messages
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/matches/${matchId}/messages`, { content });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", matchId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket connection for real-time messages
  useEffect(() => {
    if (!matchId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log("Connecting to WebSocket:", wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected successfully");
      // Subscribe to this match's messages
      ws.send(JSON.stringify({ type: "subscribe", matchId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        if (data.type === "new_message" && data.matchId === matchId) {
          queryClient.invalidateQueries({ queryKey: ["/api/messages", matchId] });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [matchId, queryClient]);

  if (!match) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  const otherUser = match.user1Id === user?.id ? match.user2 : match.user1;
  const otherProfile = otherUser.profile;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card flex items-center gap-4 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/matches")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
            <img
              src={otherProfile?.photos?.[0] || "/placeholder-avatar.png"}
              alt={`${otherUser.firstName}'s profile`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate" data-testid="text-chat-partner-name">
              {otherUser.firstName}
            </h2>
            <p className="text-xs text-muted-foreground">Active recently</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" data-testid="button-more">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center space-y-4 max-w-md">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl font-semibold">Start the Conversation</h3>
                <p className="text-sm text-muted-foreground">
                  You matched with {otherUser.firstName}! Say hello and get to know each other.
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => {
              const isOwnMessage = message.senderId === user?.id;
              const showTimestamp = idx === 0 || 
                new Date(messages[idx - 1].createdAt).getTime() - new Date(message.createdAt).getTime() > 300000;

              return (
                <div key={message.id}>
                  {showTimestamp && (
                    <div className="text-center text-xs text-muted-foreground my-4">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </div>
                  )}
                  <div
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${message.id}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted text-foreground rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full"
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className="rounded-full"
            data-testid="button-send"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
