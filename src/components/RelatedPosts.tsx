import { PostMeta } from '@/lib/posts';
import PostCard from '@/components/PostCard';

interface RelatedPostsProps {
  currentSlug: string;
  currentCategory: string;
  currentTags: string[];
  allPosts: PostMeta[];
}

function getTagOverlapScore(postTags: string[], currentTags: string[]): number {
  if (!postTags || postTags.length === 0) return 0;
  return postTags.filter((tag) => currentTags.includes(tag)).length;
}

export default function RelatedPosts({
  currentSlug,
  currentCategory,
  currentTags,
  allPosts,
}: RelatedPostsProps) {
  const related = allPosts
    .filter(
      (post) =>
        post.slug !== currentSlug && post.frontmatter.category === currentCategory
    )
    .map((post) => ({
      post,
      score: getTagOverlapScore(post.frontmatter.tags ?? [], currentTags),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ post }) => post);

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-5">관련 글</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
