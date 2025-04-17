"use client";

import { useState, useEffect } from "react";
import { Integration } from "@/lib/types/models/integration";
import { Email, EmailStatus } from "@/lib/types/models/email";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Archive, 
  ChevronLeft, 
  ChevronRight, 
  Inbox, 
  Loader2, 
  Mail, 
  Search, 
  Send, 
  Star, 
  Trash 
} from "lucide-react";
import { format } from "date-fns";

interface MailingContentProps {
  teamId: string;
  userId: string;
  integration: Integration;
}

export function MailingContent({ teamId, userId, integration }: MailingContentProps) {
  const [activeTab, setActiveTab] = useState("inbox");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch emails based on active tab
  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);
      try {
        // Build query parameters based on active tab
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });
        
        if (searchQuery) {
          params.append("search", searchQuery);
        }
        
        // Add tab-specific filters
        switch (activeTab) {
          case "inbox":
            // For inbox, we want received emails
            break;
          case "sent":
            params.append("status", EmailStatus.Sent);
            break;
          case "drafts":
            params.append("status", EmailStatus.Draft);
            break;
          case "starred":
            params.append("isStarred", "true");
            break;
        }
        
        const response = await fetch(`/api/emails?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch emails");
        }
        
        const data = await response.json();
        setEmails(data.data.docs || []);
        setTotalPages(data.data.totalPages || 1);
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch emails");
        setEmails([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmails();
  }, [activeTab, page, searchQuery]);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };
  
  // Format date
  const formatDate = (date: string | Date) => {
    if (!date) return "";
    return format(new Date(date), "MMM d, yyyy");
  };
  
  // Handle pagination
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Email</CardTitle>
            <CardDescription>
              Manage your team's email communications
            </CardDescription>
          </div>
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              <span className="hidden sm:inline">Inbox</span>
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Sent</span>
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              <span className="hidden sm:inline">Drafts</span>
            </TabsTrigger>
            <TabsTrigger value="starred" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Starred</span>
            </TabsTrigger>
          </TabsList>
          
          {["inbox", "sent", "drafts", "starred"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {loading ? (
                // Loading skeleton
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 rounded-md border p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  ))}
                </div>
              ) : emails.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No emails found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery
                      ? "No emails match your search criteria"
                      : `Your ${tab} is empty`}
                  </p>
                </div>
              ) : (
                // Email list
                <div className="space-y-2">
                  {emails.map((email) => (
                    <div
                      key={email._id.toString()}
                      className="flex items-center justify-between rounded-md border p-4 hover:bg-accent cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {email.isRead ? (
                            <Mail className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Mail className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium truncate ${!email.isRead ? 'font-semibold' : ''}`}>
                              {email.subject}
                            </p>
                            {email.isStarred && (
                              <Star className="h-4 w-4 text-yellow-400" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {email.body.replace(/<[^>]*>/g, '').substring(0, 100)}
                            {email.body.length > 100 ? '...' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {email.status === EmailStatus.Draft && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(email.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {!loading && emails.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevPage}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextPage}
                      disabled={page >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
