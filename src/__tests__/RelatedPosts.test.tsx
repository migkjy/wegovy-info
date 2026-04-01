import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RelatedPosts from '@/components/RelatedPosts'
import { PostMeta } from '@/lib/posts'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/components/PostCard', () => ({
  default: ({ post }: { post: PostMeta }) => (
    <div data-testid="post-card" data-slug={post.slug}>
      <span>{post.frontmatter.title}</span>
    </div>
  ),
}))

function makePost(slug: string, category: string, tags: string[], title = `Post ${slug}`): PostMeta {
  return {
    slug,
    frontmatter: {
      title,
      description: `Description for ${slug}`,
      date: '2026-01-01',
      category,
      tags,
      author: '편집팀',
    },
  }
}

describe('RelatedPosts', () => {
  it('shows related posts from same category excluding current post', () => {
    const allPosts: PostMeta[] = [
      makePost('current-post', 'wegovy', ['위고비']),
      makePost('related-1', 'wegovy', ['위고비'], 'Related Post 1'),
      makePost('related-2', 'wegovy', ['세마글루타이드'], 'Related Post 2'),
      makePost('other-category', 'saxenda', ['삭센다'], 'Other Category Post'),
    ]

    render(
      <RelatedPosts
        currentSlug="current-post"
        currentCategory="wegovy"
        currentTags={['위고비']}
        allPosts={allPosts}
      />
    )

    const cards = screen.getAllByTestId('post-card')
    const slugs = cards.map((c) => c.getAttribute('data-slug'))

    expect(slugs).toContain('related-1')
    expect(slugs).toContain('related-2')
    expect(slugs).not.toContain('current-post')
    expect(slugs).not.toContain('other-category')
  })

  it('sorts posts by tag overlap score (higher overlap = higher rank)', () => {
    const allPosts: PostMeta[] = [
      makePost('current-post', 'wegovy', ['위고비', '체중감량', '임상연구']),
      makePost('low-overlap', 'wegovy', ['위고비'], 'Low Overlap'),
      makePost('high-overlap', 'wegovy', ['위고비', '체중감량', '임상연구'], 'High Overlap'),
      makePost('mid-overlap', 'wegovy', ['위고비', '체중감량'], 'Mid Overlap'),
    ]

    render(
      <RelatedPosts
        currentSlug="current-post"
        currentCategory="wegovy"
        currentTags={['위고비', '체중감량', '임상연구']}
        allPosts={allPosts}
      />
    )

    const cards = screen.getAllByTestId('post-card')
    const slugs = cards.map((c) => c.getAttribute('data-slug'))

    expect(slugs[0]).toBe('high-overlap')
    expect(slugs[1]).toBe('mid-overlap')
    expect(slugs[2]).toBe('low-overlap')
  })

  it('shows at most 3 related posts', () => {
    const allPosts: PostMeta[] = [
      makePost('current-post', 'wegovy', ['위고비']),
      makePost('post-1', 'wegovy', ['위고비'], 'Post 1'),
      makePost('post-2', 'wegovy', ['위고비'], 'Post 2'),
      makePost('post-3', 'wegovy', ['위고비'], 'Post 3'),
      makePost('post-4', 'wegovy', ['위고비'], 'Post 4'),
      makePost('post-5', 'wegovy', ['위고비'], 'Post 5'),
    ]

    render(
      <RelatedPosts
        currentSlug="current-post"
        currentCategory="wegovy"
        currentTags={['위고비']}
        allPosts={allPosts}
      />
    )

    const cards = screen.getAllByTestId('post-card')
    expect(cards).toHaveLength(3)
  })

  it('returns null when no related posts exist', () => {
    const allPosts: PostMeta[] = [
      makePost('current-post', 'wegovy', ['위고비']),
      makePost('only-other', 'saxenda', ['삭센다'], 'Other Category'),
    ]

    const { container } = render(
      <RelatedPosts
        currentSlug="current-post"
        currentCategory="wegovy"
        currentTags={['위고비']}
        allPosts={allPosts}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('returns null when allPosts contains only the current post', () => {
    const allPosts: PostMeta[] = [
      makePost('current-post', 'wegovy', ['위고비']),
    ]

    const { container } = render(
      <RelatedPosts
        currentSlug="current-post"
        currentCategory="wegovy"
        currentTags={['위고비']}
        allPosts={allPosts}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('does not show current post in related list', () => {
    const allPosts: PostMeta[] = [
      makePost('current-post', 'wegovy', ['위고비', '체중감량']),
      makePost('another-wegovy', 'wegovy', ['위고비'], 'Another Wegovy Post'),
    ]

    render(
      <RelatedPosts
        currentSlug="current-post"
        currentCategory="wegovy"
        currentTags={['위고비', '체중감량']}
        allPosts={allPosts}
      />
    )

    const cards = screen.getAllByTestId('post-card')
    const slugs = cards.map((c) => c.getAttribute('data-slug'))

    expect(slugs).not.toContain('current-post')
    expect(slugs).toContain('another-wegovy')
  })

  it('renders section heading when related posts exist', () => {
    const allPosts: PostMeta[] = [
      makePost('current-post', 'wegovy', ['위고비']),
      makePost('related', 'wegovy', ['위고비'], 'Related Post'),
    ]

    render(
      <RelatedPosts
        currentSlug="current-post"
        currentCategory="wegovy"
        currentTags={['위고비']}
        allPosts={allPosts}
      />
    )

    expect(screen.getByText('관련 글')).toBeInTheDocument()
  })
})
