import galletas from "@/assets/cat-galletas.jpg";
import snacks from "@/assets/cat-snacks.jpg";
import cupcakes from "@/assets/cat-cupcakes.jpg";
import pasteles from "@/assets/cat-pasteles.jpg";
import cumple from "@/assets/cat-cumple.jpg";

export const IMG = { galletas, snacks, cupcakes, pasteles, cumple };

export type CategoryKey = "galletas" | "snacks" | "cupcakes" | "pasteles" | "cumple";

export const HERO_CATEGORIES: {
  key: CategoryKey;
  label: string;
  image: string;
  examples: string[];
}[] = [
  {
    key: "galletas",
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
    label: "Pasteles",
    image: pasteles,
    examples: ["Pastel de Carne y Avena", "Pastel de Banana", "Pastel de Zanahoria y Yogur"],
  },
  {
    key: "cumple",
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
  { name: "Galletas", hint: "Para tener un premio casero listo cuando quieras.", image: galletas },
  {
    name: "Snacks y premios",
    hint: "Pequeñas preparaciones para variar los momentos del día.",
    image: snacks,
  },
  {
    name: "Cupcakes",
    hint: "Porciones pequeñas que convierten cualquier momento en algo especial.",
    image: cupcakes,
  },
  {
    name: "Pasteles",
    hint: "Cuando quieres preparar algo que se vea tan especial como se siente.",
    image: pasteles,
  },
  {
    name: "Cumpleaños",
    hint: "Para celebrar el día en que también celebras que está contigo.",
    image: cumple,
  },
  { name: "Fáciles", hint: "Cuando quieres empezar con algo simple.", image: galletas },
  {
    name: "Premium",
    hint: "Preparaciones para cuando quieres ir un paso más allá.",
    image: pasteles,
  },
  { name: "Especiales", hint: "Ideas para fechas y momentos diferentes.", image: cumple },
];

export const FAQS = [
  {
    q: "¿Necesito saber cocinar?",
    a: "No. Cada receta incluye ingredientes, cantidades y una preparación organizada paso a paso.",
  },
  {
    q: "¿Son comidas completas?",
    a: "No. Están planteadas como premios y preparaciones complementarias para perros adultos sanos. No sustituyen una alimentación completa y equilibrada.",
  },
  {
    q: "¿Qué pasa si mi perro tiene alergias o una enfermedad?",
    a: "Consulta con su veterinario antes de introducir nuevos alimentos.",
  },
  {
    q: "¿Puedo utilizarlo desde mi celular?",
    a: "Sí. La plataforma está diseñada para celular, tablet y computadora.",
  },
  {
    q: "¿Puedo cambiar cuánto quiero preparar?",
    a: "Sí. El ajustador recalcula las cantidades de los ingredientes según el rendimiento que elijas.",
  },
  {
    q: "¿Puedo guardar mis favoritas?",
    a: "Sí. Puedes marcar tus recetas favoritas para volver a ellas cuando quieras.",
  },
  {
    q: "¿Puedo crear mi lista de compras?",
    a: "Sí. La lista de compras agrupa los ingredientes de las recetas que elegiste.",
  },
  {
    q: "¿Puedo calcular cuánto cuesta preparar una receta?",
    a: "Sí. Registra el precio de tus ingredientes y la calculadora de costos estima el valor de cada preparación.",
  },
  {
    q: "¿Dónde recibo mi acceso?",
    a: "Después de la confirmación del pago recibes tu acceso digital para entrar a la plataforma.",
  },
  {
    q: "¿Tengo que pagar cada mes?",
    a: "No. US$15 es un único pago para el acceso incluido en esta oferta.",
  },
];
