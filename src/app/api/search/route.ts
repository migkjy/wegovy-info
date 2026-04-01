import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-static';

export async function GET() {
  const posts = getAllPosts();

  const searchIndex = posts.map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    tags: post.frontmatter.tags ?? [],
    category: post.frontmatter.category,
    date: post.frontmatter.date,
  }));

  return NextResponse.json(searchIndex);
}
