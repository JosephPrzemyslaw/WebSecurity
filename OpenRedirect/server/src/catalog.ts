export type CatalogBook = {
  id: string;
  title: string;
  author: string;
  blurb: string;
  coverInitials: string;
  coverAccent: string;
  coverSrc?: string;
  shopTitle?: boolean;
};

export const CATALOG: CatalogBook[] = [
  {
    id: "1",
    title: "Gone with the Wind",
    author: "Margaret Mitchell",
    blurb: "Scarlett O'Hara wants her life at Tara back. Buy the ebook for your personal library.",
    coverInitials: "GW",
    coverAccent: "#6e2433",
    coverSrc: "/gone-with-the-wind.svg",
    shopTitle: true,
  },
  {
    id: "2",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    blurb: "Elizabeth Bennet and Mr Darcy — wit, pride, and country society.",
    coverInitials: "PP",
    coverAccent: "#2f5a4a",
  },
  {
    id: "3",
    title: "Moby-Dick",
    author: "Herman Melville",
    blurb: "Captain Ahab hunts the white whale across the open sea.",
    coverInitials: "MD",
    coverAccent: "#1e3a5f",
  },
  {
    id: "4",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    blurb: "Long Island glamour, green lights, and the summer Nick Carraway remembers.",
    coverInitials: "GG",
    coverAccent: "#7a5c2e",
  },
  {
    id: "5",
    title: "Frankenstein",
    author: "Mary Shelley",
    blurb: "Victor Frankenstein’s experiment and the creature who reaches for belonging.",
    coverInitials: "FR",
    coverAccent: "#3d3d52",
  },
  {
    id: "6",
    title: "Dracula",
    author: "Bram Stoker",
    blurb: "Jonathan Harker’s journal and the count who leaves Transylvania for England.",
    coverInitials: "DR",
    coverAccent: "#4a1520",
  },
];

export function filterCatalog(query: string): CatalogBook[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") {
    return CATALOG;
  }
  return CATALOG.filter((book) => {
    const haystack = `${book.title} ${book.author} ${book.blurb}`.toLowerCase();
    return haystack.includes(needle);
  });
}