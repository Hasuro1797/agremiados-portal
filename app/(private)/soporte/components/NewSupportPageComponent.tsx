"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CREATE_SUPPORT } from "@/graphql/mutation/support.mutation";
import { SUPPORT_CATEGORIES } from "@/graphql/query/support.query";
import { routes } from "@/lib/routes";
import { SupportCategory } from "@/types/support.type";
import { useMutation, useQuery } from "@apollo/client";
import { get } from "lodash";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import AttachmentsPicker from "./AttachmentsPicker";

const MAX_ATTACHMENTS = 10;

export default function NewSupportPageComponent() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [place, setPlace] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: catData, loading: catLoading } = useQuery(SUPPORT_CATEGORIES, {
    fetchPolicy: "cache-first",
  });

  // Defensive client-side filter: only active categories are pickable, in
  // case the backend ever returns the full list.
  const categories = useMemo(() => {
    const list = (get(catData, "supportCategories", []) ??
      []) as SupportCategory[];
    return list.filter((c) => c.isActive !== false);
  }, [catData]);

  const [createSupport] = useMutation(CREATE_SUPPORT, {
    context: {
      headers: {
        "apollo-require-preflight": "true",
      },
    },
  });

  const canSubmit =
    topic.trim().length > 0 &&
    details.trim().length > 0 &&
    place.trim().length > 0 &&
    files.length <= MAX_ATTACHMENTS &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { data } = await createSupport({
        variables: {
          input: {
            topic: topic.trim(),
            details: details.trim(),
            place: place.trim(),
            ...(categoryId ? { categoryId: Number(categoryId) } : {}),
          },
          // graphql-upload travels through the Apollo upload link as
          // multipart/form-data. Backend creates the first member message
          // automatically with body=details + these attachments.
          ...(files.length > 0 ? { files } : {}),
        },
      });
      const supportId = get(data, "createSupport.id", null) as number | null;
      toast.success("Reclamo creado", {
        description: "Te responderemos pronto.",
      });
      if (supportId) {
        router.push(routes.support.detail(supportId));
      } else {
        router.push(routes.support.home);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear el reclamo.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-primary"
          >
            <Link href={routes.support.home}>
              <ArrowLeft className="mr-2 size-4" />
              Volver a soporte
            </Link>
          </Button>

          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">Nuevo reclamo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Tema
                  </Label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Resumen breve de tu reclamo"
                    maxLength={150}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Detalle
                  </Label>
                  <Textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe lo ocurrido con el mayor detalle posible"
                    rows={6}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Dónde ocurrió
                  </Label>
                  <Input
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="Sede, oficina, plataforma, etc."
                    maxLength={120}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Categoría{" "}
                    <span className="text-gray-400 font-normal">
                      (opcional)
                    </span>
                  </Label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    disabled={catLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Adjuntar evidencia{" "}
                    <span className="text-gray-400 font-normal">
                      (opcional · imágenes o PDF · máx {MAX_ATTACHMENTS})
                    </span>
                  </Label>
                  <AttachmentsPicker
                    files={files}
                    onChange={setFiles}
                    max={MAX_ATTACHMENTS}
                    disabled={submitting}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="bg-accent hover:bg-accent-hover text-white"
                  >
                    {submitting && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Enviar reclamo
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
