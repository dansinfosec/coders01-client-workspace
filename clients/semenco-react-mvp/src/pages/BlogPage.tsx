import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/sections/Section";
import { Card } from "@/components/ui/Card";
import { getPublishedPosts } from "@/data/blogPosts";
import { blogPostPath } from "@/routes/paths";
import { formatDate } from "@/utils/formatDate";

/** Blog overview (route "/blog"). Sample posts are clearly labelled examples. */
export function BlogPage() {
  const posts = getPublishedPosts();

  return (
    <>
      <SEO
        title="Blog"
        description="Placeholder meta description voor de blog van Sem & Co. Voorbeeldartikelen, te vervangen."
      />
      <PageHero
        eyebrow="Blog"
        title="Verhalen en nieuws"
        subtitle="Voorbeeldoverzicht. De onderstaande artikelen zijn placeholders (voorbeeldinhoud)."
        breadcrumbs={[{ label: "Blog" }]}
      />

      <Section>
        {posts.length === 0 ? (
          <p className="text-text-secondary">Er zijn nog geen artikelen.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <Card interactive className="flex h-full flex-col">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand-strong">
                      {post.category}
                    </span>
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-text-primary">
                    <Link
                      to={blogPostPath(post.slug)}
                      className="rounded hover:text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-text-secondary">{post.summary}</p>
                  <p className="mt-4 text-xs text-text-secondary">
                    {post.author.name} · {post.readingTimeMinutes} min lezen
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
