import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { getPostBySlug } from "@/data/blogPosts";
import { blogPostPath } from "@/routes/paths";
import { formatDate } from "@/utils/formatDate";

/** Blog detail (route "/blog/:slug"). Falls back to 404 for unknown slugs. */
export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post || post.status !== "published") {
    return <NotFoundPage />;
  }

  return (
    <>
      <SEO
        title={post.seoTitle ?? post.title}
        description={post.metaDescription ?? post.summary}
        image={post.featuredImage}
      />
      <PageHero
        eyebrow={post.category}
        title={post.title}
        subtitle={post.summary}
        breadcrumbs={[
          { label: "Blog", to: "/blog" },
          { label: post.title, to: blogPostPath(post.slug) },
        ]}
      />

      <Section width="prose">
        {post.isExample && (
          <p className="mb-6 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2 text-sm text-text-primary">
            Voorbeeldartikel — deze inhoud is placeholdertekst.
          </p>
        )}

        <p className="text-sm text-text-secondary">
          {post.author.name}
          {post.author.role ? ` · ${post.author.role}` : ""} ·{" "}
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> ·{" "}
          {post.readingTimeMinutes} min lezen
        </p>

        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt ?? ""}
            className="mt-6 w-full rounded-2xl border border-border object-cover"
            loading="lazy"
          />
        )}

        <div className="mt-6 space-y-4 text-base leading-relaxed text-text-primary">
          {post.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {post.tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-surface-muted px-3 py-1 text-xs text-text-secondary"
              >
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
