"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GET_ALL_POSTS_BANNER } from "@/graphql/query/post.query";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { IPost } from "@/types/activities";
import { PostType } from "@/utils/enum";
import { useQuery } from "@apollo/client";
import { get } from "lodash";
import { ChevronRight, ExternalLink, Megaphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroBanner() {
  const { data, loading } = useQuery(GET_ALL_POSTS_BANNER, {
    variables: { type: PostType.NEWS },
    fetchPolicy: "cache-and-network",
  });
  const [current, setCurrent] = useState(0);
  const posts: IPost[] = get(data, "findPostsFromBanner", []) || [];

  useEffect(() => {
    if (posts.length <= 1) return;
    const id = setInterval(
      () => setCurrent((prev) => (prev + 1) % posts.length),
      5000,
    );
    return () => clearInterval(id);
  }, [posts.length]);

  if (loading) {
    return <Skeleton className="w-full h-52 rounded-2xl" />;
  }

  if (posts.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-primary flex items-center justify-center min-h-[200px]">
        <p className="text-white/50 text-sm">No hay anuncios disponibles</p>
      </div>
    );
  }

  const post = posts[current];
  const hasImage = !!get(post, "coverImage", null);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden min-h-[210px]">
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`banner-img-${current}`}
          src={get(post, "coverImage", "")}
          alt={get(post, "title", "")}
          className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700"
        />
      )}

      <div
        className={cn(
          "absolute inset-0",
          hasImage
            ? "bg-gradient-to-r from-primary/95 via-primary/80 to-primary/30"
            : "bg-primary",
        )}
      />

      {/* Decorative icon */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08] hidden md:block pointer-events-none">
        <Megaphone className="size-40 text-white" />
      </div>

      {/* Content */}
      <div
        key={`banner-content-${current}`}
        className="relative px-6 py-7 md:px-8 md:py-8 md:max-w-[75%] animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        <span className="inline-flex items-center gap-1.5 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
          <Megaphone className="size-3" />
          Últimos Anuncios
        </span>

        <h2 className="text-white text-xl md:text-2xl font-bold leading-tight mb-2.5 line-clamp-2">
          {post.title}
        </h2>

        <p className="text-white/70 text-sm leading-relaxed mb-5 line-clamp-2">
          {post.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {post.href && (
            <Button
              asChild
              size="sm"
              className="bg-white text-primary hover:bg-white/90 h-9 text-sm font-semibold gap-1.5"
            >
              <Link href={post.href} target="_blank" rel="noopener noreferrer">
                Ver Detalles
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          )}
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-white/40 text-white bg-white/10 hover:bg-white/20 h-9 text-sm gap-1.5"
          >
            <Link href={routes.news.home}>
              Ver Más
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Pagination dots */}
      {posts.length > 1 && (
        <div className="absolute bottom-4 right-5 flex gap-1.5 items-center">
          {posts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-full transition-all duration-300 h-2",
                i === current ? "bg-white w-5" : "bg-white/40 w-2",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
