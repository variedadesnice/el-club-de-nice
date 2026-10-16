import { useState, useEffect } from "react";
import type { ContentCategory } from "../../../types";
import { apiFetch } from "../../../lib/api";

/**
 * Categorías de contenido activas (GET /api/content-categories/), en el orden
 * del panel. Las usan los atajos de Comunidad, el filtro de Classroom y el
 * selector al crear un contenido.
 */
export function useContentCategories() {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch<ContentCategory[]>("/api/content-categories/")
      .then(({ data }) => {
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("[useContentCategories]", err);
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { categories, isLoading };
}
