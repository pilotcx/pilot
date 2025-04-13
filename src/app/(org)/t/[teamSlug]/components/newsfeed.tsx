"use client";

import {useCallback, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import {useTeam} from "@/components/providers/team-provider";
import {TeamPost} from "@/components/team-post";
import {TeamPostSkeleton} from "@/components/team-post-skeleton";
import {Post} from "@/lib/types/models/post";
import {CalendarIcon, FileIcon, MegaphoneIcon, PlusIcon} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {CreatePostForm} from "@/app/(org)/t/[teamSlug]/components/CreatePostForm";
import {CreateEventForm} from "@/app/(org)/t/[teamSlug]/components/CreateEventForm";
import {CreateAnnouncementForm} from "@/app/(org)/t/[teamSlug]/components/CreateAnnouncementForm";

export function TeamNewsfeed() {
  const {team} = useTeam();
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [skip, setSkip] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [contentType, setContentType] = useState<'' | 'post' | 'announcement' | 'event'>('');

  // Use API hooks
  const [getTeamPosts, {data: postsData, loading: loadingPosts}] = useApi(api.getTeamPosts);

  // Load posts from API
  const loadPosts = useCallback(async () => {
    if (team?._id) {
      try {
        const response = await getTeamPosts(team._id as string, {limit: 10, skip: 0});
        if (response) {
          setPosts(response.data || []);
          setHasMore(!!response.pagination?.hasNextPage);
          setSkip(response.pagination?.limit || 10);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load posts");
      }
    }
  }, [team, getTeamPosts]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Listen for post-created events
  useEffect(() => {
    const handlePostCreated = () => {
      loadPosts();
    };

    window.addEventListener("post-created", handlePostCreated);
    return () => {
      window.removeEventListener("post-created", handlePostCreated);
    };
  }, [loadPosts]);

  // Function to load more posts
  const loadMorePosts = useCallback(async () => {
    if (!team?._id || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const response = await api.getTeamPosts(team._id.toString(), {limit: 10, skip});

      if (response.data) {
        setPosts(prev => [...prev, ...response.data]);
        setHasMore(!!response.pagination?.hasNextPage);
        setSkip(prev => prev + (response.pagination?.limit || 10));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load more posts");
    } finally {
      setLoadingMore(false);
    }
  }, [team, skip, hasMore, loadingMore]);

  return (
    <div className="space-y-6">
      <div className={'flex flex-row justify-between items-end'}>
        <div className={'font-semibold text-lg'}>
          Latest updates
        </div>
        <div>
          {!contentType ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PlusIcon/>
                  Create
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setContentType('post')}>
                  <FileIcon/>
                  New Post
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setContentType('announcement')}>
                  <MegaphoneIcon/>
                  New Announcement
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setContentType('event')}>
                  <CalendarIcon/>
                  Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setContentType('')} variant={'outline'}>
              Dismiss
            </Button>
          )}
        </div>
      </div>
      {contentType === 'post' && (<CreatePostForm/>)}
      {contentType === 'event' && (<CreateEventForm/>)}
      {contentType === 'announcement' && (<CreateAnnouncementForm/>)}

      <div className="space-y-4">
        {loadingPosts ? (
          // Loading skeletons
          Array.from({length: 3}).map((_, i) => (
            <TeamPostSkeleton key={i}/>
          ))
        ) : posts.length === 0 ? (
          <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          posts.map((post) => (
            <TeamPost
              key={post._id}
              post={post}
            />
          ))
        )}

        {hasMore && !loadingPosts && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={loadMorePosts}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
