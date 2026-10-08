// Datos del kit: personajes, sus 7 looks y sus 12 historias.
// Cada personaje tiene looks propios (no se repiten entre personajes) y cada
// historia está escrita para un look que ese personaje tiene, así el dibujo
// de la página siempre coincide con lo que cuenta el texto.

export type Character = "nino" | "nina" | "nino2" | "nina2";
export const isGirl = (c: Character) => c === "nina" || c === "nina2";

export type LookKey =
  | "ninguno"
  | "superheroe"
  | "pirata"
  | "astronauta"
  | "mago"
  | "guerreiro"
  | "realeza"
  | "bombero"
  | "dinos"
  | "chef"
  | "hada"
  | "bailarina"
  | "dragones"
  | "buzo"
  | "futbolista"
  | "jardinera"
  | "doctora";

export type Look = { key: LookKey; label: string };

export const CHARACTERS: { key: Character; label: string }[] = [
  { key: "nino", label: "Niño" },
  { key: "nina", label: "Niña" },
  { key: "nino2", label: "Niño 2" },
  { key: "nina2", label: "Niña 2" },
];

// 7 looks por personaje: su ropa de siempre y 6 disfraces.
export const LOOKS: Record<Character, Look[]> = {
  nino: [
    { key: "ninguno", label: "Normal" },
    { key: "superheroe", label: "Superhéroe" },
    { key: "pirata", label: "Pirata" },
    { key: "astronauta", label: "Astronauta" },
    { key: "bombero", label: "Bombero" },
    { key: "dinos", label: "Explorador" },
    { key: "chef", label: "Chef" },
  ],
  nina: [
    { key: "ninguno", label: "Normal" },
    { key: "superheroe", label: "Superheroína" },
    { key: "mago", label: "Maga" },
    { key: "guerreiro", label: "Caballera" },
    { key: "realeza", label: "Princesa" },
    { key: "hada", label: "Hada" },
    { key: "bailarina", label: "Bailarina" },
  ],
  nino2: [
    { key: "ninguno", label: "Normal" },
    { key: "superheroe", label: "Superhéroe" },
    { key: "guerreiro", label: "Caballero" },
    { key: "realeza", label: "Príncipe" },
    { key: "dragones", label: "Dragones" },
    { key: "buzo", label: "Buzo" },
    { key: "futbolista", label: "Futbolista" },
  ],
  nina2: [
    { key: "ninguno", label: "Normal" },
    { key: "superheroe", label: "Superheroína" },
    { key: "pirata", label: "Capitana" },
    { key: "mago", label: "Brujita" },
    { key: "realeza", label: "Princesa" },
    { key: "jardinera", label: "Jardinera" },
    { key: "doctora", label: "Doctora" },
  ],
};

export const LOOKS_POR_PERSONAJE = 7;

export const imagen = (c: Character, k: LookKey) => `/personajes/${c}-${k === "ninguno" ? "base" : k}.webp`;
// Miniaturas livianas (240 px de alto) para los selectores.
export const mini = (src: string) => src.replace("/personajes/", "/personajes/mini/");

export const lookDe = (c: Character, k: LookKey): Look => LOOKS[c].find((l) => l.key === k) ?? LOOKS[c][0]!;

// ---------------------------------------------------------------------------
// Historias. El nombre del niño entra en el texto.
// ---------------------------------------------------------------------------

export type Story = { look: LookKey; label: string; title: string; paragraphs: string[] };
type Texto = { title: string; paragraphs: string[] };
type Escribir = (name: string, girl: boolean) => Texto;

const HISTORIAS: Partial<Record<LookKey, Escribir[]>> = {
  superheroe: [
    (name) => ({
      title: "El día que salvó el parque",
      paragraphs: [
        `Esa tarde, el gato del señor Antonio se había subido al árbol más alto del parque y no quería bajar. Todos miraban hacia arriba sin saber qué hacer, hasta que llegó ${name}.`,
        `No hicieron falta poderes mágicos: bastaron unos brazos fuertes, una capa que ondeaba con el viento y muchas ganas de ayudar. ${name} subió rama por rama, con cuidado, hablándole despacito al gato asustado.`,
        "Cuando por fin llegó arriba, lo sostuvo con firmeza contra el pecho y bajó despacio, un escalón invisible a la vez, mientras el parque entero contenía la respiración.",
        `Abajo, todos aplaudieron. El señor Antonio le dio las gracias con los ojos brillosos. ${name} solo sonrió: los héroes de verdad no buscan medallas, buscan un buen final.`,
      ],
    }),
    (name) => ({
      title: "La misión secreta del vecindario",
      paragraphs: [
        `Todo empezó con una nota debajo de la puerta: «Se necesita un héroe. La pelota quedó atrapada en el tejado». ${name} se puso la capa y salió corriendo.`,
        `La escalera era demasiado corta y el tejado, demasiado alto. Un héroe sin poderes tenía que usar la cabeza: ${name} reunió a los vecinos, y entre todos armaron un plan.`,
        `Uno sostuvo la escalera, otro pasó una caña, otro hizo de vigía. ${name} dio las órdenes con voz firme y amable, y la pelota bajó girando, sana y salva.`,
        `El vecindario entero aplaudió. ${name} entendió que el mejor superpoder no era volar: era lograr que todos ayudaran juntos.`,
      ],
    }),
  ],
  pirata: [
    (name, girl) => ({
      title: "El mapa del tesoro escondido",
      paragraphs: [
        "La lluvia había lavado el jardín y, entre las piedras del camino, algo brillaba distinto. Era la esquina de un papel doblado en cuatro, con bordes quemados a propósito y una equis dibujada con tinta gruesa.",
        "El mapa marcaba el camino: pasar bajo la mesa de la cocina, rodear dos veces la maceta grande y girar a la izquierda en el sillón azul. Cada paso se sentía más importante que el anterior.",
        `Con el catalejo en alto para vigilar peligros invisibles, ${girl ? "la capitana" : "el capitán"} ${name} avanzó sin apuro. Los verdaderos tesoros nunca están donde uno espera, y eso lo hace todo más emocionante.`,
        `Al final del camino, detrás del cojín más grande del sofá, esperaba el cofre: un puñado de piedritas brillantes y una nota que decía "el tesoro más grande fue el viaje". ${name} sonrió: ya sabía que volvería a navegar.`,
      ],
    }),
  ],
  astronauta: [
    (name, girl) => ({
      title: "Un viaje a la luna de papel",
      paragraphs: [
        "La cuenta regresiva empezó en la sala: diez, nueve, ocho... El cohete —hecho con dos sillas y una manta bien estirada— estaba listo para despegar rumbo a una luna hecha de papel plateado.",
        "Flotar era más fácil de lo que parecía: solo había que mover los brazos despacio y fingir que el suelo ya no tiraba hacia abajo. Afuera de la ventana imaginaria, las estrellas se dejaban contar una por una.",
        "En la superficie lunar —la alfombra de la sala, ahora cubierta de cráteres invisibles— cada paso se sentía enorme y silencioso, como si el mundo entero estuviera esperando para ver qué se descubría ahí.",
        `La bandera se plantó justo al lado del sillón: ${name} era ${girl ? "la primera exploradora" : "el primer explorador"} en pisar esa luna en particular. La misión había sido un éxito, y ya se estaba planeando el próximo viaje para después de la cena.`,
      ],
    }),
    (name) => ({
      title: "El planeta de los colores",
      paragraphs: [
        `La nave aterrizó con un suave «pum» sobre un planeta desconocido. ${name} abrió la escotilla y se quedó sin palabras: todo allí era de colores que no existen en la Tierra.`,
        `El suelo era azul eléctrico, las montañas, de un naranja brillante, y los árboles cambiaban de color cada vez que se los miraba. ${name} anotó todo en el cuaderno de la misión.`,
        `De pronto, una criatura redonda y peluda salió de detrás de una roca. No hablaba, pero movía las orejas como diciendo «hola». ${name} le devolvió el saludo con las dos manos.`,
        `Se despidieron como buenos amigos. Al volver a casa, ${name} escribió la conclusión más importante de la misión: «El universo es enorme, pero la amabilidad se entiende en cualquier planeta».`,
      ],
    }),
  ],
  mago: [
    (name, girl) => ({
      title: "El hechizo de las estrellas",
      paragraphs: [
        "El libro de hechizos —en realidad, un cuaderno con dibujos de estrellas— decía que esa noche el cielo iba a estar de humor para la magia. Solo hacía falta una varita, un sombrero puntiagudo y mucha concentración.",
        'El primer hechizo era sencillo: "Luces, brillen fuerte". Con la varita en alto, dando una vuelta completa sobre los talones, las luces de verdad parecían titilar un poquito más.',
        "El segundo hechizo era más ambicioso: hacer que la manta del sillón volara como una capa mágica. No funcionó exactamente como en el libro, pero terminó siendo aún mejor: una capa de verdad, lista para la próxima aventura.",
        `Cuando el reloj marcó la hora de dormir, ${girl ? "la maga" : "el mago"} ${name} guardó la varita bajo la almohada. Mañana habría más estrellas que encender, y ninguna magia es tan poderosa como la de una buena noche de sueño.`,
      ],
    }),
    (name, girl) => ({
      title: "La poción de la risa",
      paragraphs: [
        `En la cocina del castillo mágico, ${name} preparaba la poción más difícil del libro: la poción de la risa. Los ingredientes eran raros: una pizca de polvo de estrellas, una cucharada de luz de luna y tres cosquillas.`,
        `Pero faltaba el ingrediente final, y estaba escondido: una sonrisa sincera. ${name} buscó en el armario, debajo de la mesa, dentro del sombrero... pero la sonrisa no aparecía.`,
        `Entonces ${girl ? "la maga" : "el mago"} se miró en el espejo, vio el sombrero torcido y el pelo despeinado, y se echó a reír de verdad. La sonrisa cayó directo dentro del caldero.`,
        `La poción brilló, burbujeó y llenó el castillo de risas. Desde ese día, ${name} sabe que la mejor magia siempre estuvo adentro.`,
      ],
    }),
  ],
  guerreiro: [
    (name, girl) => ({
      title: girl ? "La guardiana de la muralla de almohadas" : "El guardián de la muralla de almohadas",
      paragraphs: [
        `El castillo era la sala de juegos, y esa tarde alguien tenía que protegerlo. Se escuchaban pasos pesados del otro lado de la puerta, y la guardia del reino estaba formada por una sola persona: ${name}.`,
        `Con el escudo en alto y el casco bien ajustado, ${name} levantó una muralla de almohadas, una sobre otra, hasta que quedó más alta que el sillón. Cada almohada era un ladrillo, y cada ladrillo, una promesa de valentía.`,
        `Los pasos se acercaron, la puerta crujió... y apareció el gato, que solo quería dormir en la torre más blanda. ${name} lo pensó un segundo: ${girl ? "una guerrera" : "un guerrero"} de verdad también sabe cuándo bajar la espada.`,
        `Le hizo un lugar en lo alto de la muralla, y el reino quedó a salvo: protegido por ${girl ? "una guerrera valiente" : "un guerrero valiente"} y por un gato muy dormido.`,
      ],
    }),
    (name) => ({
      title: "El torneo de los valientes",
      paragraphs: [
        `Ese sábado se celebraba el gran torneo del reino, y ${name} se había preparado toda la semana: armadura brillante, escudo firme y una espada de cartón que, para sus propósitos, funcionaba perfecto.`,
        `La primera prueba era cruzar el río: seis hojas de papel pegadas al suelo del pasillo. Había que saltar de una a otra sin pisar el agua imaginaria. ${name} respiró hondo y saltó, una, dos, tres veces.`,
        `La segunda prueba era la más difícil: ayudar a un competidor que se había tropezado. Nadie lo miraba, pero ${name} se detuvo, le tendió la mano y lo ayudó a levantarse.`,
        `Cuando el jurado entregó la medalla, dijo: «Este premio es para quien ganó la carrera… y también para quien no dejó a nadie atrás». ${name} sonrió: había ganado dos veces.`,
      ],
    }),
  ],
  realeza: [
    (name) => ({
      title: "El baile del reino de papel",
      paragraphs: [
        `En el reino de papel se celebraba el baile más esperado del año, y ${name} tenía la tarea más importante: abrir la fiesta con el primer saludo.`,
        `La corona le quedaba un poquito grande y el manto arrastraba por el suelo, pero ${name} caminó por la alfombra con la espalda recta y una sonrisa enorme. Todos se pusieron de pie.`,
        `En medio del baile, un invitado pequeño se quedó solo en un rincón, sin atreverse a bailar. ${name} cruzó el salón, le ofreció la mano y le dijo: «Aquí todos son bienvenidos».`,
        "Esa noche el reino aprendió que lo más brillante de una corona no son las joyas, sino la amabilidad de quien la lleva.",
      ],
    }),
    (name) => ({
      title: "El tesoro más raro del castillo",
      paragraphs: [
        `En lo alto del castillo había una puerta que nadie había abierto en cien años, y ${name} acababa de encontrar la llave: dorada, pequeña y un poco pegajosa de mermelada.`,
        "Detrás de la puerta no había oro ni diamantes, sino un cuarto lleno de juguetes olvidados: un caballito de madera, un tambor sin parche, un osito con un solo ojo.",
        `${name} decidió que un reino generoso no deja juguetes olvidados. Los limpió, los acomodó y organizó una fiesta para devolverles la alegría.`,
        "Esa noche el castillo sonó a risas, y el tesoro más raro de todos resultó ser ese: un cuarto que volvió a tener vida.",
      ],
    }),
  ],
  ninguno: [
    (name) => ({
      title: "Un día perfecto para ser valiente",
      paragraphs: [
        `No hacía falta capa, ni espada, ni cohete: ese día ${name} despertó con una idea muy simple. Hoy iba a hacer algo valiente.`,
        "Primero, probó una comida nueva que parecía sospechosa. Después, saludó al vecino al que siempre le daba un poco de vergüenza hablar. Cada cosa pequeña era una misión en sí misma.",
        "A la tarde, armó un fuerte con sábanas y sillas, y llevó a todos sus peluches a una reunión de emergencia: había que decidir quién era el más valiente de la casa.",
        `Ganó ${name}, por supuesto. Porque los héroes de verdad no necesitan disfraz: solo ganas de intentarlo.`,
      ],
    }),
  ],
  bombero: [
    (name, girl) => ({
      title: "La alarma del cuartel",
      paragraphs: [
        `¡Riiing! La alarma del cuartel sonó en la sala: en la cocina, una olla de mentira echaba humo de algodón. ${name} se puso el casco rojo, ajustó las botas y corrió hacia el camión, que esa tarde era el sillón grande.`,
        `La manguera era una bufanda larga y el agua, puro sonido: ¡fshhh, fshhh! Había que apuntar bien, mantener la calma y no correr cerca de la mesa, porque ${girl ? "una buena bombera" : "un buen bombero"} también cuida que nadie se lastime.`,
        `En pocos minutos, el humo de algodón desapareció y la cocina quedó a salvo. Los peluches, que habían esperado en la vereda, aplaudieron con sus patitas. ${name} revisó todo dos veces, como hacen los profesionales.`,
        `Esa noche, antes de dormir, ${name} le explicó a su familia el plan de seguridad de la casa: dónde está la salida, a quién llamar y por qué nunca se juega con fuego de verdad. El cuartel podía descansar tranquilo.`,
      ],
    }),
    (name, girl) => ({
      title: "Después de la gran tormenta",
      paragraphs: [
        `Después de la gran tormenta, la radio del cuartel trajo una noticia: una rama enorme había caído en medio de la calle, que esa tarde era el pasillo de la casa. ${name} tomó el casco y llamó a su equipo.`,
        "La rama era un palo de escoba envuelto en hojas de papel, pero pesaba como un árbol de verdad. Nadie podía moverla sin ayuda. Hacía falta contar hasta tres y levantarla entre todos.",
        `«¡Uno, dos, tres!», gritó ${name}, y la rama se movió. El camino quedó libre y los autitos de juguete pudieron pasar otra vez por la calle.`,
        `Antes de volver al cuartel, ${name} pasó por la casa de la abuela del barrio para ver si estaba bien. Ella le regaló una galleta y una sonrisa. Ser ${girl ? "bombera" : "bombero"} no es solo apagar fuegos: es estar cuando alguien necesita ayuda.`,
      ],
    }),
  ],
  dinos: [
    (name, girl) => ({
      title: "El huevo misterioso",
      paragraphs: [
        `En el jardín, detrás de la maceta grande, ${name} encontró algo redondo y blanco. La lupa no dejaba dudas: era un huevo de dinosaurio, o al menos una pelota muy parecida a uno.`,
        `Había que cuidarlo como hacen los científicos: una manta suave, un lugar tibio y una libreta para anotar cada cambio. ${name} lo revisó cada diez minutos, con la paciencia de ${girl ? "una gran exploradora" : "un gran explorador"}.`,
        `Al atardecer se escuchó un «crac». O tal vez fue el ruido de la merienda en la cocina. Pero cuando ${name} levantó la manta, ahí estaba: un pequeño dinosaurio verde, de peluche, con cara de tener hambre.`,
        `${name} lo llamó Rex y le preparó una cama en una caja de zapatos. Esa noche, en la libreta, escribió la conclusión más importante de la expedición: «Los grandes descubrimientos empiezan por mirar de cerca».`,
      ],
    }),
    (name, girl) => ({
      title: "La expedición al valle perdido",
      paragraphs: [
        `El mapa decía que más allá del sillón, cruzando el mar de almohadas, estaba el valle perdido de los dinosaurios. ${name} se ajustó el sombrero, tomó la lupa y avanzó con Rex bajo el brazo.`,
        `Las huellas eran enormes: tres dedos dibujados con tiza en el piso del patio. Algunas iban hacia la izquierda y otras hacia la derecha. ${girl ? "Una buena exploradora" : "Un buen explorador"} no adivina: compara, mide y recién después decide.`,
        `Siguiendo las huellas más frescas, ${name} llegó a una cueva hecha con una mesa y una sábana. Adentro había huesos de cartón: un cuello larguísimo, una cola y una cabeza con dientes de papel.`,
        `Armar el esqueleto llevó toda la tarde, pieza por pieza, como un rompecabezas gigante. Cuando quedó terminado, ${name} le puso un nombre: Cuellolargo. El museo de la casa acababa de inaugurar su sala más importante.`,
      ],
    }),
  ],
  chef: [
    (name) => ({
      title: "El restaurante de la casa",
      paragraphs: [
        `Esa noche el restaurante de la casa abría sus puertas por primera vez, y quien cocinaba era ${name}. El gorro blanco estaba en su lugar, el delantal bien atado y la cuchara de madera lista para trabajar.`,
        "El menú tenía un solo plato, pero muy especial: la ensalada arcoíris. Una zanahoria naranja, un tomate rojo, hojas de lechuga verde y granos de maíz amarillo. Cada color tenía su lugar en el plato.",
        `Con la ayuda de un adulto para todo lo que corta, ${name} lavó, mezcló y decoró. Lo más difícil fue esperar a que todos estuvieran sentados: la comida se disfruta mejor en la mesa y en familia.`,
        `Cuando la familia probó el primer bocado, hubo un silencio y después un aplauso. ${name} hizo una reverencia con el gorro en la mano. El restaurante recibió esa noche cinco estrellas, dibujadas con crayón en una servilleta.`,
      ],
    }),
    (name) => ({
      title: "El pastel para la abuela",
      paragraphs: [
        `Faltaba un día para el cumpleaños de la abuela y ${name} tenía una misión secreta: preparar el pastel más rico del mundo sin que nadie se enterara.`,
        "La receta pedía harina, huevos, azúcar y una pizca de paciencia. La harina terminó un poco en el bol y otro poco en la nariz del chef, pero eso también es parte de cocinar.",
        `Mientras el pastel se horneaba con la ayuda de un adulto, ${name} preparó la decoración: fresas en forma de corazón y una vela que esperaba su turno.`,
        `Al día siguiente, cuando la abuela vio el pastel, se le llenaron los ojos de alegría. «¿Quién lo hizo?», preguntó. ${name} levantó la cuchara de madera: el ingrediente secreto había sido el cariño.`,
      ],
    }),
  ],
  hada: [
    (name) => ({
      title: "La planta que no quería florecer",
      paragraphs: [
        `En el rincón más tranquilo del jardín había una maceta triste: la planta no daba flores desde hacía semanas. ${name} desplegó sus alas, se acomodó la corona de flores y decidió que esa sería su misión del día.`,
        "Las hadas saben que la magia de las plantas no se hace con varitas: se hace con agua, con sol y con tiempo. Así que llevó la maceta junto a la ventana y le dio de beber despacito.",
        `Todos los días, ${name} pasaba a saludarla y le contaba un cuento corto. Las otras plantas parecían escuchar también. Una mañana, entre las hojas, apareció un botón pequeñito, cerrado como un secreto.`,
        `Cuando la flor por fin se abrió, era del mismo color lila que el vestido de ${name}. Desde entonces, el jardín tiene una regla nueva: cada planta recibe un cuento antes de dormir.`,
      ],
    }),
    (name) => ({
      title: "La fiesta de las luciérnagas",
      paragraphs: [
        `Esa noche el bosque de los peluches celebraba la fiesta de las luciérnagas, y ${name} estaba a cargo de la iluminación. Había linternas, guirnaldas y un frasco lleno de estrellas de papel brillante.`,
        "Pero cuando todo estaba listo, una luciérnaga pequeñita se quedó escondida bajo una hoja. Le daba vergüenza que su luz fuera más débil que la de las demás.",
        `${name} se sentó a su lado y le dijo: «Las luces pequeñas son las que mejor se ven cuando todo está oscuro». Juntas practicaron un rato, encendiendo y apagando, hasta que la luciérnaga se animó.`,
        "Al final de la fiesta apagaron todas las linternas, y la luz pequeñita brilló sola en el medio del bosque. Fue el momento más lindo de la noche, y todos los peluches lo recordaron por mucho tiempo.",
      ],
    }),
  ],
  bailarina: [
    (name, girl) => ({
      title: "El gran estreno",
      paragraphs: [
        `La sala estaba llena: los peluches en primera fila, la familia en el sillón y una lámpara que hacía de reflector. Era la noche del gran estreno, y ${girl ? "la bailarina principal" : "el bailarín principal"} era ${name}.`,
        "Antes de salir al escenario sintió mariposas en la panza. La profesora de baile siempre decía que eso es normal: los nervios son la forma que tiene el cuerpo de avisar que algo importa.",
        `Respiró hondo, se paró en puntas de pie y empezó a girar. En el segundo giro casi pierde el equilibrio, pero sonrió y siguió bailando. Nadie se dio cuenta, y ${name} aprendió que bailar también es saber seguir.`,
        "Cuando terminó la música, el aplauso fue enorme. Le regalaron una flor de papel y una reverencia de cada peluche. Esa noche, antes de dormir, ya estaba pensando en el próximo baile.",
      ],
    }),
    (name) => ({
      title: "El baile de la lluvia",
      paragraphs: [
        `Llovía tanto que no se podía salir al parque, y ${name} miraba las gotas correr por la ventana. Entonces tuvo una idea: si la lluvia tenía música, se podía bailar.`,
        "Cada gota era una nota: las pequeñas sonaban «tic» y las grandes sonaban «toc». Con los brazos como olas y los pies muy livianos, armó una coreografía que seguía el ritmo del agua.",
        "Primero se sumó papá, después mamá y hasta el gato, que no bailaba pero miraba con mucha atención. La sala se convirtió en un salón de baile lleno de risas y de pasos inventados.",
        `Cuando la lluvia se detuvo, apareció un arcoíris detrás de las nubes. ${name} hizo la última reverencia frente a la ventana: el día gris había terminado siendo el más colorido de la semana.`,
      ],
    }),
  ],
  dragones: [
    (name, girl) => ({
      title: "Chispa, el dragón que no podía volar",
      paragraphs: [
        `En la cima de la montaña de almohadas vivía Chispa, un dragón rojo y pequeñito que todavía no sabía volar. ${name}, ${girl ? "la domadora" : "el domador"} de dragones del reino, le había prometido ayudarlo.`,
        "Primero practicaron los saltos: uno desde el escalón, otro desde el sillón bajito. Chispa movía las alas con fuerza, pero siempre aterrizaba de panza, un poco enojado.",
        `${name} le enseñó un truco: no mirar al piso, sino al lugar adonde uno quiere llegar. Chispa respiró hondo, miró la ventana y agitó las alas una vez más.`,
        "Esta vez no cayó: planeó por toda la sala hasta aterrizar en el hombro de su amigo. Desde ese día vuelan juntos, y cuando alguien tiene miedo de intentar algo nuevo, Chispa le cuenta cómo empezó él.",
      ],
    }),
    (name) => ({
      title: "El dragón que estornudaba chispas",
      paragraphs: [
        `Chispa tenía un problema: cada vez que estornudaba, se le escapaban unas chispitas de colores que dejaban todo lleno de brillo. ${name} sabía que había que encontrar una solución.`,
        "Investigaron juntos en el libro de los dragones. El libro decía que los estornudos de dragón aparecen cuando hay polvo en la cueva. Y la cueva de Chispa, debajo de la cama, tenía muchísimo polvo.",
        `Así que ${name} y Chispa hicieron la limpieza más grande de la historia: barrieron, ordenaron los juguetes y sacudieron las mantas. Encontraron dos medias perdidas y un autito que creían desaparecido.`,
        "Con la cueva limpia, los estornudos se terminaron. Chispa estaba tan contento que hizo su mejor truco: un soplido tibio que dejó la cueva calentita para la siesta.",
      ],
    }),
  ],
  buzo: [
    (name) => ({
      title: "El tesoro del barco hundido",
      paragraphs: [
        `La alfombra azul de la sala era esa tarde el océano más profundo del mundo, y ${name} se preparaba para la gran inmersión: máscara en la frente, tanque en la espalda y aletas bien puestas.`,
        "Allá abajo, entre algas de lana y peces de colores, apareció un barco hundido. Tenía un agujero en el costado y, adentro, un cofre cerrado con un candado dorado.",
        `La llave estaba escondida en la concha de un cangrejo muy desconfiado. ${name} no se la quitó a la fuerza: le habló con calma, le ofreció un caracol brillante a cambio y el cangrejo aceptó el trato.`,
        `Dentro del cofre había monedas de chocolate y una nota: «Para quien cuida el mar». Antes de volver a la superficie, ${name} juntó tres envoltorios que flotaban por ahí. Los tesoros del océano se cuidan entre todos.`,
      ],
    }),
    (name) => ({
      title: "La ballena que cantaba",
      paragraphs: [
        `En el fondo del mar se escuchaba una canción triste, larga y muy grave. ${name} se ajustó la máscara y nadó siguiendo el sonido, entre corales de cartón y estrellas de mar de papel.`,
        "Al final del camino encontró una ballena enorme. Cantaba triste porque se había separado de su familia en una tormenta y no sabía hacia dónde nadar.",
        `${name} sacó su brújula y su mapa de corrientes marinas. Juntos buscaron la ruta: dos vueltas alrededor de la roca grande, derecho hasta el bosque de algas y después hacia la luz.`,
        "Allí, entre las olas, se escuchó otra canción: era la familia de la ballena, que la estaba buscando. Las dos canciones se juntaron en una sola, y el mar entero pareció bailar.",
      ],
    }),
  ],
  futbolista: [
    (name) => ({
      title: "El penal más importante",
      paragraphs: [
        `La final del campeonato del patio estaba empatada y faltaba un solo tiro: un penal. El equipo entero miró a ${name}, que se acomodó la camiseta número 7 y colocó la pelota en el punto.`,
        "La portería era una caja de cartón y el portero, un oso de peluche muy alto. Desde el borde de la cancha, los vecinos gritaban y aplaudían. El corazón latía rapidísimo.",
        `${name} respiró, miró la esquina de la portería y pateó. La pelota pasó rozando la oreja del oso y entró. ¡Gol! El patio entero explotó de alegría.`,
        `Pero lo primero que hizo ${name} fue ir a abrazar al portero de peluche. Ganar es lindo, y jugar limpio, felicitando al otro equipo, es lo que hace grande a un campeón.`,
      ],
    }),
    (name) => ({
      title: "El equipo de los que nunca jugaban",
      paragraphs: [
        `En el parque había niños que siempre miraban desde lejos: nadie los elegía para jugar. ${name} lo notó un sábado, con la pelota bajo el brazo y una idea en la cabeza.`,
        "Esa tarde armó un equipo nuevo con todos los que quisieran sumarse. Algunos corrían muy rápido, otros pateaban despacito y uno no sabía las reglas, pero tenía muchísimas ganas.",
        `${name} les enseñó a pasarse la pelota y a festejar cada pase, no solo los goles. Al principio perdieron todos los partidos, pero cada semana jugaban un poco mejor y se reían mucho más.`,
        "El último sábado del mes ganaron su primer partido. Lo de menos fue el resultado: lo mejor fue ver a todos los que antes miraban desde lejos corriendo juntos dentro de la cancha.",
      ],
    }),
  ],
  jardinera: [
    (name, girl) => ({
      title: "La semilla más pequeña",
      paragraphs: [
        `En el paquete había una semilla tan pequeña que casi no se veía. Las demás eran grandes y redondas, pero ${name} decidió plantarla igual, en una maceta propia y con un cartel: «Chiquita».`,
        `Las semillas grandes brotaron primero. Chiquita tardaba, y algunos días parecía que no iba a pasar nada. Pero ${girl ? "una buena jardinera" : "un buen jardinero"} sabe que cada planta tiene su tiempo.`,
        `${name} la regó con la regadera verde todas las mañanas y le acercó la maceta al sol de la tarde. Un lunes, por fin, asomaron dos hojitas que parecían saludar.`,
        "Semanas después, Chiquita era la planta más alta de la ventana, con flores amarillas que atraían mariposas. Desde entonces, cuando algo tarda en salir bien, en casa dicen: «Paciencia, como Chiquita».",
      ],
    }),
    (name) => ({
      title: "El huerto de la familia",
      paragraphs: [
        `El patio tenía un rincón vacío, y ${name} tuvo una idea: convertirlo en un huerto para toda la familia. Se puso el sombrero de paja, las botas de lluvia y salió con un plan dibujado en un papel.`,
        "Cada integrante de la familia eligió algo para plantar: tomates, lechugas, zanahorias y, para las meriendas, fresas.",
        `Trabajaron juntos todos los fines de semana: sacar piedras, mezclar la tierra, regar y esperar. ${name} se encargó de los carteles, para que nadie confundiera las zanahorias con las flores.`,
        "El día de la primera cosecha prepararon una ensalada con todo lo que había crecido. Era la más rica que habían probado, porque tenía un ingrediente que no se compra: el trabajo de todos.",
      ],
    }),
  ],
  doctora: [
    (name) => ({
      title: "La clínica de los peluches",
      paragraphs: [
        "Esa mañana la clínica de los peluches abrió más temprano: había una fila larga en la puerta. El conejo tenía la oreja descosida, el oso tosía y la jirafa decía que le dolía el cuello, que era larguísimo.",
        `${name} se puso la bata blanca, se colgó el estetoscopio y atendió a cada uno con calma. Primero escuchar, después revisar y al final explicar, para que nadie tuviera miedo.`,
        "Al conejo le cosió la oreja con ayuda de un adulto. Al oso le recetó un té tibio y una siesta larga. Y a la jirafa le dio una bufanda, porque los cuellos largos también necesitan abrigo.",
        `Al final del día, la sala de espera estaba vacía y todos los pacientes dormían felices. ${name} guardó su maletín rojo y anotó en su libreta: «Hoy atendí a doce pacientes. El remedio que más funcionó fue un abrazo».`,
      ],
    }),
    (name, girl) => ({
      title: "Aquí atienden los valientes",
      paragraphs: [
        `Al día siguiente, ${name} tenía que ir al médico de verdad para una vacuna, y la verdad es que le daba un poco de miedo. Esa noche, antes de dormir, se le ocurrió una idea.`,
        "Tomó su maletín rojo y practicó con el oso: le explicó que la vacuna es un pinchazo rápido, que puede doler un poquito y que sirve para que el cuerpo aprenda a defenderse.",
        `En el consultorio, cuando llegó su turno, ${name} respiró como le había enseñado al oso: aire por la nariz, despacito, y afuera por la boca. Contó hasta tres y, cuando quiso acordarse, ya había terminado.`,
        `La doctora ${girl ? "la" : "lo"} felicitó y le regaló una curita con estrellas. Esa tarde, en la clínica de los peluches, colgaron un cartel nuevo: «Aquí también atienden los valientes».`,
      ],
    }),
  ],
};

// Qué historias trae el kit de cada personaje y en qué orden (12 en total).
// [look, número de historia de ese look]
const PLAN: Record<Character, [LookKey, number][]> = {
  nino: [
    ["superheroe", 0], ["pirata", 0], ["astronauta", 0], ["bombero", 0], ["dinos", 0], ["chef", 0],
    ["ninguno", 0], ["superheroe", 1], ["astronauta", 1], ["bombero", 1], ["dinos", 1], ["chef", 1],
  ],
  nina: [
    ["superheroe", 0], ["mago", 0], ["guerreiro", 0], ["realeza", 0], ["hada", 0], ["bailarina", 0],
    ["ninguno", 0], ["mago", 1], ["guerreiro", 1], ["realeza", 1], ["hada", 1], ["bailarina", 1],
  ],
  nino2: [
    ["superheroe", 0], ["guerreiro", 0], ["realeza", 0], ["dragones", 0], ["buzo", 0], ["futbolista", 0],
    ["ninguno", 0], ["superheroe", 1], ["guerreiro", 1], ["dragones", 1], ["buzo", 1], ["futbolista", 1],
  ],
  nina2: [
    ["superheroe", 0], ["pirata", 0], ["mago", 0], ["realeza", 0], ["jardinera", 0], ["doctora", 0],
    ["ninguno", 0], ["superheroe", 1], ["mago", 1], ["realeza", 1], ["jardinera", 1], ["doctora", 1],
  ],
};

export function buildStories(name: string, character: Character): Story[] {
  const girl = isGirl(character);
  return PLAN[character].map(([look, i]) => {
    const escribir = HISTORIAS[look]![i]!;
    const label = look === "ninguno" ? "Aventura libre" : lookDe(character, look).label;
    return { look, label, ...escribir(name, girl) };
  });
}

export const STORY_COUNT = 12;
// portada + looks + historias + certificado
export const TOTAL_PAGES = 1 + LOOKS_POR_PERSONAJE + STORY_COUNT + 1;
