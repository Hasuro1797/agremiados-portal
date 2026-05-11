/* eslint-disable @next/next/no-img-element */
"use client";
import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { FIND_ONE_POST_FOR_WEBSITE } from "@/graphql/query/post.query";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { IPost } from "@/types/activities";
import { useQuery } from "@apollo/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  ExternalLink,
  Megaphone,
  Newspaper,
  Pin,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";

interface PostDetailComponentProps {
  postId: string;
  type: "communications" | "news";
}

const formatDate = (date: string | null | undefined) =>
  date ? format(parseISO(date), "dd 'de' MMMM yyyy", { locale: es }) : null;

function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      <div className="h-72 bg-gray-200 w-full" />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-5 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-gray-100 rounded-2xl" />
            <div className="h-32 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailComponent({
  postId,
  type,
}: PostDetailComponentProps) {
  const { data, loading, error } = useQuery(FIND_ONE_POST_FOR_WEBSITE, {
    variables: { id: +postId },
  });

  const post: IPost | undefined = data?.findOnePostForWebsite;

  const isNews = type === "news";
  const Icon = isNews ? Newspaper : Megaphone;
  const homeRoute = isNews ? routes.news.home : routes.communications.home;
  const homeLabel = isNews ? "Noticias" : "Comunicados";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      {loading && <SkeletonDetail />}

      {(error || (!loading && !post)) && (
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="text-center">
            <CircleAlert className="size-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No se pudo cargar la publicación.
            </p>
            <Link
              href={homeRoute}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="size-4" /> Volver a {homeLabel}
            </Link>
          </div>
        </div>
      )}

      {!loading && post && (
        <>
          {/* ── Hero ── */}
          <div className="relative w-full min-h-64 sm:min-h-80 bg-gray-900 overflow-hidden">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />

            <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col justify-end h-full min-h-64 sm:min-h-80">
              <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-4">
                <Link
                  href={routes.home}
                  className="hover:text-white transition-colors"
                >
                  Inicio
                </Link>
                <span>/</span>
                <Link
                  href={homeRoute}
                  className="hover:text-white transition-colors"
                >
                  {homeLabel}
                </Link>
                <span>/</span>
                <span className="text-white/90 font-medium line-clamp-1 max-w-[200px]">
                  {post.title}
                </span>
              </nav>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {post.isPinned && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-primary text-white backdrop-blur-sm">
                    <Pin className="size-3" /> Destacado
                  </span>
                )}
                {post.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-white/20 text-white backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3 max-w-3xl">
                {post.title}
              </h1>
              {post.description && (
                <p className="text-white/70 text-sm max-w-2xl line-clamp-2">
                  {post.description}
                </p>
              )}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* LEFT */}
              <div className="lg:col-span-2 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                {post.contentHtml && (
                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                      <span className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="size-4 text-primary" />
                      </span>
                      Contenido
                    </h2>
                    <div
                      className="prose prose-sm prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800 prose-li:text-gray-600 prose-img:rounded-xl"
                      dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                    />
                  </section>
                )}

                {!post.contentHtml && post.description && (
                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {post.description}
                    </p>
                  </section>
                )}

                {/* {post.href && (
                  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-gray-600 text-sm mb-4">Más información disponible en el enlace oficial.</p>
                    <a
                      href={post.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Ver más <ExternalLink className="size-4" />
                    </a>
                  </section>
                )}

                <Link
                  href={homeRoute}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="size-4" /> Volver a {homeLabel}
                </Link> */}
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-75 fill-mode-both">
                {/* Meta card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-700">
                    Información
                  </h3>

                  {post.publishedAt && (
                    <div className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CalendarDays className="size-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Publicado
                        </p>
                        <p>{formatDate(post.publishedAt)}</p>
                      </div>
                    </div>
                  )}

                  {post.author && (
                    <div className="flex items-start gap-2.5 text-sm text-gray-600">
                      <User className="size-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Autor
                        </p>
                        <p>{post.author}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags card */}
                {post.tags && post.tags.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <h3
                      className={cn(
                        "text-sm font-bold text-gray-700 flex items-center gap-2",
                      )}
                    >
                      <Tag className="size-4 text-primary" /> Etiquetas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* External link CTA */}
                {post.href && (
                  <a
                    href={post.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
                  >
                    Ver publicación completa <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}
