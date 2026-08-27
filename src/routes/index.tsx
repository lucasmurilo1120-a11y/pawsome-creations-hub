import { createFileRoute } from "@tanstack/react-router";

import { ExplorarCategorias, Hero, TrustStrip } from "@/components/landing/hero";
import {
  Header,
  PromoBanner,
  ReadingProgress,
  ScrollDepth,
  StickyCta,
  TrueToasts,
} from "@/components/landing/chrome";
import { RecetaDemo } from "@/components/landing/demo";
import { Oferta } from "@/components/landing/oferta";
import {
  Categorias,
  Comparacion,
  ComoFunciona,
  Confianza,
  Faq,
  FinalCta,
  Herramientas,
  ParaQuien,
  PlataformaReveal,
  Problema,
  PruebaSocial,
  PuenteEmocional,
} from "@/components/landing/sections";

const TITLE = "Pastelería Canina — 100 Recetas Caseras para tu Perro";
const DESCRIPTION =
  "Plataforma interactiva con 100 recetas caseras para perros: elige, ajusta las cantidades y prepara paso a paso desde el celular. Pago único de US$15.";
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
      <ScrollDepth />
      <PromoBanner />
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <ExplorarCategorias />
        <PuenteEmocional />
        <Problema />
        <PlataformaReveal />
        <RecetaDemo />
        <ComoFunciona />
        <Herramientas />
        <Categorias />
        <Comparacion />
        <Confianza />
        <ParaQuien />
        <PruebaSocial />
        <Oferta />
        <Faq />
        <FinalCta />
      </main>
      <footer className="border-t border-border px-5 py-12 text-center text-xs text-muted-foreground">
        <p className="font-display text-base text-foreground">Pastelería Canina</p>
        <p className="mt-1">Hecho por ti. Para quien siempre está contigo.</p>
        <p className="mx-auto mt-4 max-w-md leading-relaxed">
          Contenido informativo con fines educativos. No sustituye la orientación de un médico
          veterinario.
        </p>
        <p className="mt-4">© {new Date().getFullYear()} Pastelería Canina</p>
      </footer>
      <StickyCta />
      <TrueToasts />
      <div className="h-16 md:hidden" />
    </>
  );
}
