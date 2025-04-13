"use client";

import {useCallback, useEffect, useState} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import {useTeam} from "@/components/providers/team-provider";
import {TeamPost} from "@/components/team-post";
import {TeamPostSkeleton} from "@/components/team-post-skeleton";
import {Post, ReactionType} from "@/lib/types/models/post";
import {TeamMember} from "@/lib/types/models/team";

export function TeamNewsfeed() {
  const {team, membership} = useTeam();
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [skip, setSkip] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Use API hooks
  const [getTeamPosts, {data: postsData, loading: loadingPosts}] = useApi(api.getTeamPosts);
  const [createPost, {loading: isSubmitting}] = useApi(api.createPost);

  // Load posts from API
  useEffect(() => {
    const loadPosts = async () => {
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
    };

    loadPosts();
  }, [team, getTeamPosts]);

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

  const handleSubmitPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !team?._id) return;

    try {
      const response = await createPost(team._id.toString(), {
        title: newPostTitle,
        content: newPostContent
      });

      if (response) {
        // Refresh the posts list to include the new post
        const refreshResponse = await getTeamPosts(team._id.toString(), {limit: 10, skip: 0});
        if (refreshResponse) {
          setPosts(refreshResponse.data || []);
          setHasMore(!!refreshResponse.pagination?.hasNextPage);
          setSkip(refreshResponse.pagination?.limit || 10);
        }

        setNewPostTitle("");
        setNewPostContent("");
        toast.success("Post created successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={membership.user?.avatar} alt={membership.displayName}/>
            <AvatarFallback>
              {membership.displayName?.substring(0, 2).toUpperCase() || "ME"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Create a post"
              className="w-full px-4 py-2 rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <Textarea
            placeholder="Text (optional)"
            className="w-full resize-none min-h-[100px]"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setNewPostTitle("");
              setNewPostContent("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPost}
            disabled={isSubmitting || !newPostTitle.trim()}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>

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
