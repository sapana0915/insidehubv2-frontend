import type { ReactNode } from "react";
import { usePostsFeed } from "../../hooks/posts";
import { errorMessage } from "../../api/client";
import type { PostFilters } from "../../types";
import { PostcardCard } from "./PostcardCard";
import { EmptyState, Spinner } from "../ui/Decor";
import { Button } from "../ui/Button";
import { FormError } from "../ui/Field";

interface PostGridProps {
  filters: PostFilters;
  pageSize?: number;
  paginate?: boolean;
  empty?: ReactNode;
  excludeId?: string;
}

export function PostGrid({ filters, pageSize, paginate = true, empty, excludeId }: PostGridProps) {
  const feed = usePostsFeed(filters, pageSize);

  if (feed.isPending) return <Spinner />;
  if (feed.isError) return <FormError message={errorMessage(feed.error)} />;

  const posts = feed.data.pages.flat().filter((p) => p.id !== excludeId);
  if (posts.length === 0) {
    return <>{empty ?? <EmptyState title="No postcards in this drawer." />}</>;
  }

  return (
    <div>
      <div className="columns-1 gap-8 pt-3 sm:columns-2 lg:columns-3">
        {posts.map((post, i) => (
          <PostcardCard key={post.id} post={post} index={i} />
        ))}
      </div>
      {paginate && feed.hasNextPage ? (
        <div className="mt-6 flex justify-center">
          <Button variant="ghost" onClick={() => feed.fetchNextPage()} loading={feed.isFetchingNextPage}>
            Turn the page
          </Button>
        </div>
      ) : null}
    </div>
  );
}
