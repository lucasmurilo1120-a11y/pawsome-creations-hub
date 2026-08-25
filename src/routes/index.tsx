import { createFileRoute } from "@tanstack/react-router";

import { Hero } from "@/components/landing/hero";
import { PromoBanner, ReadingProgress, StickyCta, TrueToasts } from "@/components/landing/chrome";
import { ComoFunciona, RecetaDemo } from "@/components/landing/demo";
import { Oferta } from "@/components/landing/oferta";
import {
  Categorias,
  Confianza,
  EligeReceta,
  Faq,
  FinalCta,
  Identificacion,
  ParaQuien,
  PruebaSocial,
} from "@/components/landing/sections";

const TITLE = "Pastelería Canina — 100 Recetas Caseras para tu Perro";
const DESCRIPTION =
  "100 recetas caseras de galletas, snacks, cupcakes y pasteles para perros: ingredientes claros, cantidades exactas y paso a paso. Pago único de US$15.";
const URL = "https://pawsome-creations-hub.lovable.app/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Pastelería Canina — 100 Recetas",
          description: DESCRIPTION,
          offers: {
            "@type": "Offer",
            price: "15",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: URL,
          },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <ReadingProgress />
      <PromoBanner />
      <main>
        <Hero />
        <Identificacion />
        <Categorias />
        <RecetaDemo />
        <ComoFunciona />
        <EligeReceta />
        <ParaQuien />
        <Confianza />
        <PruebaSocial />
        <Oferta />
        <Faq />
        <FinalCta />
      </main>
      <footer className="border-t border-border px-5 py-10 text-center text-xs text-muted-foreground">
        <p>Pastelería Canina · 100 Recetas</p>
        <p className="mt-2">
          Contenido informativo. No sustituye la orientación de un médico veterinario.
        </p>
      </footer>
      <StickyCta />
      <TrueToasts />
      <div className="h-16 md:hidden" />
    </>
  );
}
