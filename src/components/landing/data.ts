import galletas from "@/assets/cat-galletas.jpg";
import snacks from "@/assets/cat-snacks.jpg";
import cupcakes from "@/assets/cat-cupcakes.jpg";
import pasteles from "@/assets/cat-pasteles.jpg";
import cumple from "@/assets/cat-cumple.jpg";

export const IMG = { galletas, snacks, cupcakes, pasteles, cumple };

export type CategoryKey = "galletas" | "snacks" | "cupcakes" | "pasteles" | "cumple";

export const HERO_CATEGORIES: {
  key: CategoryKey;
  emoji: string;
  label: string;
  image: string;
  examples: string[];
}[] = [
  {
    key: "galletas",
    emoji: "🍪",
    label: "Galletas",
    image: galletas,
    examples: [
      "Galletas de Calabaza y Avena",
      "Galletas de Banana y Avena",
      "Galletas de Pollo y Zanahoria",
    ],
  },
  {
    key: "snacks",
    emoji: "🦴",
    label: "Snacks",
    image: snacks,
    examples: [
      "Snacks de Batata al Horno",
      "Bocaditos de Pollo y Arroz",
      "Premios de Manzana y Avena",
    ],
  },
  {
    key: "cupcakes",
    emoji: "🧁",
    label: "Cupcakes",
    image: cupcakes,
    examples: [
      "Cupcakes de Banana y Yogur",
      "Cupcakes de Zanahoria",
      "Mini Cupcakes de Calabaza",
    ],
  },
  {
    key: "pasteles",
    emoji: "🎂",
    label: "Pasteles",
    image: pasteles,
    examples: ["Pastel de Carne y Avena", "Pastel de Banana", "Pastel de Zanahoria y Yogur"],
  },
  {
    key: "cumple",
    emoji: "🎉",
    label: "Cumpleaños",
    image: cumple,
    examples: [
      "Pastel de Cumpleaños Clásico",
      "Galletas para Invitados Peludos",
      "Cupcake de Celebración",
    ],
  },
];

export const CATEGORY_GRID: { name: string; hint: string; image: string }[] = [
  { name: "Galletas", hint: "Calabaza, banana, pollo, avena", image: galletas },
  { name: "Snacks y premios", hint: "Bocaditos para entrenar y consentir", image: snacks },
  { name: "Cupcakes", hint: "Porciones pequeñas para ocasiones", image: cupcakes },
  { name: "Pasteles", hint: "Preparaciones para compartir el momento", image: pasteles },
  { name: "Cumpleaños", hint: "Para su día especial", image: cumple },
  { name: "Recetas fáciles", hint: "Pocos ingredientes, pocos pasos", image: galletas },
  { name: "Premium", hint: "Preparaciones más elaboradas", image: pasteles },
  { name: "Especiales", hint: "Fechas, visitas y momentos únicos", image: cumple },
];

export const FAQS = [
  {
    q: "¿Necesito saber cocinar?",
    a: "No. Cada receta muestra los ingredientes, cantidades y preparación paso a paso.",
  },
  {
    q: "¿Son comidas completas para sustituir su alimentación habitual?",
    a: "No. El producto está centrado en premios y preparaciones complementarias.",
  },
  {
    q: "¿Y si mi perro tiene alergia o alguna enfermedad?",
    a: "Consulta con su veterinario antes de introducir nuevos ingredientes.",
  },
  {
    q: "¿Dónde recibo las recetas?",
    a: "Tendrás acceso digital a la plataforma después de la compra.",
  },
  {
    q: "¿El pago es mensual?",
    a: "No. El precio indicado de US$15 corresponde a un pago único.",
  },
];
