import { projects, type Project } from "@/data/projects";

interface ProjectsGalleryProps {
  /** Limit the number of tiles (e.g. on the homepage). */
  limit?: number;
}

/** Masonry-ish gallery of real project photos with an honest category label. */
export function ProjectsGallery({ limit }: ProjectsGalleryProps) {
  const items: Project[] = limit ? projects.slice(0, limit) : projects;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((project) => (
        <li
          key={project.title}
          className="group relative overflow-hidden rounded-2xl border border-line shadow-soft"
        >
          <img
            src={project.image}
            alt={project.alt}
            className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            width={1200}
            height={900}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-green">
              {project.category}
            </span>
            <p className="text-sm font-semibold text-text-invert">{project.title}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
