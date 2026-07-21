/**
 * Projects — the current site shows three project categories with real photos
 * but NO descriptions, locations or dates. We show the real images and honest
 * category labels only. Richer project info (location, year, before/after) must
 * come from Borre. See docs/NEXT-ACTIONS.md — do not invent details.
 */
export interface Project {
  title: string;
  category: string;
  image: string;
  alt: string;
}

export const projects: Project[] = [
  {
    title: "Plat dak project",
    category: "Platte daken",
    image: "/images/all-in-daktechniek/project-plat-dak-171237.webp",
    alt: "Uitgevoerd plat dak project door All-in Daktechniek",
  },
  {
    title: "Pannendak project",
    category: "Pannendaken",
    image: "/images/all-in-daktechniek/pannendaken-4.webp",
    alt: "Uitgevoerd pannendak project door All-in Daktechniek",
  },
  {
    title: "Lood- en zinkwerk project",
    category: "Lood en zinkwerk",
    image: "/images/all-in-daktechniek/pannendaken-2.webp",
    alt: "Uitgevoerd lood- en zinkwerk project door All-in Daktechniek",
  },
  {
    title: "Dakwerk project",
    category: "Pannendaken",
    image: "/images/all-in-daktechniek/pannendaken-3.webp",
    alt: "Uitgevoerd dakwerk door All-in Daktechniek",
  },
  {
    title: "Dakisolatie project",
    category: "Dakisolatie",
    image: "/images/all-in-daktechniek/dakisolatie-1.webp",
    alt: "Uitgevoerd dakisolatie project door All-in Daktechniek",
  },
  {
    title: "Dakdetail",
    category: "Renovatie",
    image: "/images/all-in-daktechniek/project-171357.webp",
    alt: "Detail van uitgevoerd dakwerk door All-in Daktechniek",
  },
];
