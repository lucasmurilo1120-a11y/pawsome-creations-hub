// Capas de categoría (exclusivas) — nunca se reutilizan como foto de receta.
import catGalletas from "@/assets/categories/galletas.jpg";
import catSnacks from "@/assets/categories/snacks.jpg";
import catCupcakes from "@/assets/categories/cupcakes.jpg";
import catPasteles from "@/assets/categories/pasteles.jpg";
import catCumple from "@/assets/categories/cumpleanos.jpg";
import catFaciles from "@/assets/categories/faciles.jpg";
import catPremium from "@/assets/categories/premium.jpg";
import catEspeciales from "@/assets/categories/especiales.jpg";

// Fotos propias de cada receta demostrada.
import recGalletasCalabaza from "@/assets/recipes/galletas-calabaza.jpg";
import recGalletasBanana from "@/assets/recipes/galletas-banana.jpg";
import recGalletasManzana from "@/assets/recipes/galletas-manzana.jpg";
import recSnackBatata from "@/assets/recipes/snack-batata.jpg";
import recSnackPollo from "@/assets/recipes/snack-pollo.jpg";
import recCupcakeBanana from "@/assets/recipes/cupcake-banana.jpg";
import recCupcakeZanahoria from "@/assets/recipes/cupcake-zanahoria.jpg";
import recPastelCarne from "@/assets/recipes/pastel-carne.jpg";
import recPastelBanana from "@/assets/recipes/pastel-banana.jpg";
import recCumplePastel from "@/assets/recipes/cumple-pastel.jpg";
import recCumpleGalletas from "@/assets/recipes/cumple-galletas.jpg";

export const RECIPE_IMG = {
  galletasCalabaza: recGalletasCalabaza,
  galletasBanana: recGalletasBanana,
  galletasManzana: recGalletasManzana,
  snackBatata: recSnackBatata,
  snackPollo: recSnackPollo,
  cupcakeBanana: recCupcakeBanana,
  cupcakeZanahoria: recCupcakeZanahoria,
  pastelCarne: recPastelCarne,
  pastelBanana: recPastelBanana,
  cumplePastel: recCumplePastel,
  cumpleGalletas: recCumpleGalletas,
};

export type CategoryKey =
  | "galletas"
  | "snacks"
  | "cupcakes"
  | "pasteles"
  | "cumple"
  | "faciles"
  | "premium"
  | "especiales";

export type CategoryRecipe = { title: string; image: string; alt: string };

export type Category = {
  key: CategoryKey;
  label: string;
  hint: string;
  /** Foto exclusiva de la categoría. Nunca es la foto de una receta. */
  categoryImage: string;
  categoryAlt: string;
  /** Recetas reales de la categoría, cada una con foto propia. */
  recipes: CategoryRecipe[];
  /** Las 5 primeras se muestran de entrada; el resto tras "Ver todas". */
  primary: boolean;
};

export const CATEGORIES: Category[] = [
  {
    key: "galletas",
    label: "Galletas",
    hint: "Premios caseros para tener listos cuando quieras.",
    categoryImage: catGalletas,
    categoryAlt: "Bandeja con galletas caseras para perros recién horneadas",
    primary: true,
    recipes: [
      {
        title: "Galletas de Calabaza y Avena",
        image: recGalletasCalabaza,
        alt: "Galletas caseras de calabaza y avena para perros sobre rejilla",
      },
      {
        title: "Galletas de Banana",
        image: recGalletasBanana,
        alt: "Galletas de banana y avena en forma de hueso para perros",
      },
      {
        title: "Galletas de Manzana",
        image: recGalletasManzana,
        alt: "Galletas crocantes de manzana y avena para perros en un plato",
      },
    ],
  },
  {
    key: "snacks",
    label: "Snacks y Premios",
    hint: "Bocados pequeños para los momentos del día.",
    categoryImage: catSnacks,
    categoryAlt: "Variedad de snacks y premios pequeños caseros para perros",
    primary: true,
    recipes: [
      {
        title: "Snacks de Batata al Horno",
        image: recSnackBatata,
        alt: "Cubos de batata al horno para perros en una bandeja",
      },
      {
        title: "Bocaditos de Pollo y Arroz",
        image: recSnackPollo,
        alt: "Bocaditos redondos de pollo y arroz para perros en un bol",
      },
    ],
  },
  {
    key: "cupcakes",
    label: "Cupcakes",
    hint: "Porciones pequeñas para un momento especial.",
    categoryImage: catCupcakes,
    categoryAlt: "Mini cupcakes para perros con cobertura de yogur natural",
    primary: true,
    recipes: [
      {
        title: "Cupcakes de Banana y Yogur",
        image: recCupcakeBanana,
        alt: "Cupcakes de banana con yogur natural para perros",
      },
      {
        title: "Cupcakes de Zanahoria",
        image: recCupcakeZanahoria,
        alt: "Cupcakes de zanahoria para perros sobre tabla de madera",
      },
    ],
  },
  {
    key: "pasteles",
    label: "Pasteles",
    hint: "Para preparar algo que se vea tan especial como se siente.",
    categoryImage: catPasteles,
    categoryAlt: "Pastel casero para perros cubierto con yogur y zanahoria rallada",
    primary: true,
    recipes: [
      {
        title: "Pastel de Carne y Avena",
        image: recPastelCarne,
        alt: "Pastel salado de carne y avena para perros, cortado en porciones",
      },
      {
        title: "Pastel de Banana",
        image: recPastelBanana,
        alt: "Pastel de banana y avena para perros con rodajas encima",
      },
    ],
  },
  {
    key: "cumple",
    label: "Cumpleaños",
    hint: "Para celebrar el día en que él llegó a tu vida.",
    categoryImage: catCumple,
    categoryAlt: "Pastel de cumpleaños para perro sobre la mesa con el perro al fondo",
    primary: true,
    recipes: [
      {
        title: "Pastel de Cumpleaños Clásico",
        image: recCumplePastel,
        alt: "Pastel de cumpleaños de dos pisos para perros con cobertura de yogur",
      },
      {
        title: "Galletas para Invitados Peludos",
        image: recCumpleGalletas,
        alt: "Galletas de fiesta en forma de patita para perros",
      },
    ],
  },
  {
    key: "faciles",
    label: "Fáciles",
    hint: "Pocos ingredientes para empezar hoy mismo.",
    categoryImage: catFaciles,
    categoryAlt: "Ingredientes simples y galletas fáciles para perros",
    primary: false,
    recipes: [
      {
        title: "Galletas de Banana",
        image: recGalletasBanana,
        alt: "Galletas fáciles de banana y avena para perros",
      },
      {
        title: "Snacks de Batata al Horno",
        image: recSnackBatata,
        alt: "Batata al horno cortada en cubos para perros",
      },
    ],
  },
  {
    key: "premium",
    label: "Premium",
    hint: "Preparaciones con un acabado más cuidado.",
    categoryImage: catPremium,
    categoryAlt: "Galletas decoradas con glaseado de yogur para perros en plato verde",
    primary: false,
    recipes: [
      {
        title: "Pastel de Cumpleaños Clásico",
        image: recCumplePastel,
        alt: "Pastel de dos pisos para perros con cobertura de yogur",
      },
      {
        title: "Cupcakes de Banana y Yogur",
        image: recCupcakeBanana,
        alt: "Cupcakes de banana con cobertura de yogur para perros",
      },
    ],
  },
  {
    key: "especiales",
    label: "Especiales",
    hint: "Ideas pensadas para fechas y momentos distintos.",
    categoryImage: catEspeciales,
    categoryAlt: "Galletas temáticas de fin de año para perros sobre lino claro",
    primary: false,
    recipes: [
      {
        title: "Galletas de Calabaza y Avena",
        image: recGalletasCalabaza,
        alt: "Galletas de calabaza para perros, ideales para otoño",
      },
      {
        title: "Galletas para Invitados Peludos",
        image: recCumpleGalletas,
        alt: "Galletas decoradas para celebraciones caninas",
      },
    ],
  },
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
