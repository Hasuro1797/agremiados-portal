/* eslint-disable @next/next/no-img-element */
"use client";
import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { FIND_POSTS_FOR_WEBSITE } from "@/graphql/query/post.query";
import { routes } from "@/lib/routes";
import { IPost } from "@/types/activities";
import { PostType } from "@/utils/enum";
import { useQuery } from "@apollo/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, CircleAlert, Megaphone, Pin, Search, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PAGE_SIZE = 9;

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function PostCard({ post }: { post: IPost }) {
  const date = post.publishedAt
    ? format(parseISO(post.publishedAt), "dd MMM yyyy", { locale: es })
    : null;

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Cover */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
            <Megaphone className="size-10 text-primary/30" />
          </div>
        )}
        {post.isPinned && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-primary text-white shadow-sm">
            <Pin className="size-2.5" /> Destacado
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex flex-wrap gap-1.5">
          {post.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold uppercase tracking-wide">
              {tag}
            </span>
          ))}
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{post.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {date && (
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-primary shrink-0" />
              {date}
            </p>
          )}
          {post.author && (
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <User className="size-3.5 text-primary shrink-0" />
              {post.author}
            </p>
          )}
        </div>

        <div className="flex-1" />
        <div className="pt-3 border-t border-gray-100">
          <Link
            href={routes.communications.detail(post.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Leer más
          </Link>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="aspect-video bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
        <div className="pt-2 border-t border-gray-50 mt-1">
          <div className="h-8 bg-gray-200 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

export default function CommunicationsPageComponent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, loading, error } = useQuery(FIND_POSTS_FOR_WEBSITE, {
    variables: {
      type: PostType.COMMUNICATIONS,
      page,
      pageSize: PAGE_SIZE,
      sort: "publishedAt-desc",
      search: search || undefined,
    },
    fetchPolicy: "cache-and-network",
  });

  const posts: IPost[] = data?.findPostsForWebsite?.posts ?? [];
  const totalPages: number = data?.findPostsForWebsite?.meta?.totalPages ?? 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href={routes.home} className="hover:text-gray-600 transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Comunicados</span>
          </nav>
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Megaphone className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Comunicados</h1>
              <p className="text-gray-500 text-sm mt-0.5">Mantente informado con las últimas comunicaciones oficiales.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <form onSubmit={handleSearch} className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar comunicados..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 items-center justify-center py-24">
            <CircleAlert className="text-primary/60 size-10" />
            <p className="text-gray-500 text-sm">No se pudieron cargar los comunicados.</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 py-24">
            <div className="rounded-2xl bg-gray-50 p-5">
              <Megaphone className="size-9 text-gray-300" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-600">
                {search ? "Sin resultados" : "No hay comunicados publicados"}
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                {search ? `No se encontraron resultados para "${search}"` : "Vuelve más tarde."}
              </p>
            </div>
            {search && (
              <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                className="text-xs text-primary hover:underline">
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="size-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`size-8 rounded-lg text-sm font-medium transition-colors ${
                        page === p ? "bg-primary text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}