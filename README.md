# Amor Canino Recipes

# OBJETIVO

Crie uma página de vendas extremamente persuasiva, sofisticada, rápida, interativa e mobile-first para o produto digital:

# Pastelería Canina — 100 Recetas

A página será utilizada principalmente com tráfego pago em espanhol para América Latina.

O produto custa:

**US$15 — pagamento único**

A página NÃO deve parecer:

* ebook barato;

* página genérica de Hotmart;

* curso tradicional;

* página cheia de texto;

* página agressiva de marketing;

* template de dropshipping.

Ela deve parecer uma **marca digital premium criada especificamente para pessoas que amam seus cachorros**.

Toda a interface e copy visível devem estar em **espanhol neutro latino-americano**.

---

# CONCEITO PSICOLÓGICO PRINCIPAL

Não estamos vendendo “100 receitas”.

Estamos vendendo:

## “La posibilidad de preparar algo especial, hecho por ti, para alguien que forma parte de tu familia.”

A emoção inicial é:

**AMOR**

Depois:

**CURIOSIDADE**

Depois:

**FACILIDADE**

Depois:

**SEGURANÇA**

Depois:

**VARIEDADE**

Depois:

**VALOR**

Finalmente:

**COMPRA**

Não inverter essa sequência.

---

# GRANDE CONCEITO DA MARCA

Utilizar como conceito recorrente:

# HECHO POR TI. PARA ÉL.

Esse conceito pode aparecer discretamente em diferentes pontos.

Não repetir excessivamente.

---

# PÚBLICO

A página deve conversar principalmente com uma pessoa que:

* tem cachorro;

* considera o cachorro parte da família;

* gosta de mimá-lo/consenti-lo;

* gostaria de preparar algo diferente;

* não necessariamente sabe cozinhar;

* tem medo de usar ingredientes inadequados;

* encontra muitas receitas desconexas na internet;

* gostaria de ter tudo organizado;

* prefere receitas simples;

* gosta de aniversários e ocasiões especiais;

* gostaria de saber exatamente o que está colocando na preparação;

* pode ter curiosidade sobre custos e eventual venda, mas isso NÃO é o desejo principal.

Não utilizar linguagem empresarial no início.

---

# PRINCIPAIS OBJEÇÕES QUE A PÁGINA PRECISA ELIMINAR

A página deve responder silenciosamente:

### “Eu não sei cozinhar.”

Mostrar facilidade.

### “Deve ser complicado.”

Mostrar poucos passos e ingredientes familiares.

### “Posso achar receitas grátis.”

Mostrar organização, profundidade e ferramentas.

### “Tenho medo de usar algo errado.”

Mostrar cuidados e transparência.

### “Meu cachorro pode não gostar.”

Mostrar variedade de 100 opções, sem garantir aceitação.

### “É só um PDF?”

Mostrar claramente a plataforma interativa.

### “US$15 vale a pena?”

Mostrar tudo que recebe e equivalência de US$0,15 por receita.

### “Vou realmente usar?”

Mostrar experiência real da plataforma.

---

# REGRAS DE PERSUASÃO

Persuadir através de:

* desejo;

* identificação;

* demonstração;

* clareza;

* contraste;

* especificidade;

* prova real;

* redução de risco;

* facilidade;

* valor percebido.

NÃO através de:

* mentira;

* medo;

* números inventados;

* compradores falsos;

* escassez falsa;

* depoimentos falsos;

* descontos falsos.

---

# INTERATIVIDADE

Quero uma página que pareça viva sem incomodar o visitante.

As animações devem ser sutis e premium.

## BOTÕES

Todos os CTAs devem:

* possuir microbrilho discreto;

* aumentar aproximadamente 2–3% ao hover;

* elevar suavemente a sombra;

* responder imediatamente ao toque;

* ter transição suave;

* nunca piscar agressivamente.

Em desktop:

hover elegante.

Em mobile:

feedback de toque.

Utilizar `prefers-reduced-motion`.

---

# MICROANIMAÇÕES

Elementos devem aparecer suavemente conforme entram no viewport.

Utilizar:

* fade + pequeno movimento vertical;

* contagem progressiva para “100 recetas”;

* cards de categorias com pequeno movimento no hover;

* leve parallax em uma ou duas imagens;

* expansão suave de FAQ;

* transição entre previews de categorias.

Não exagerar.

---

# BARRA DE PROGRESSO

Adicionar no topo uma linha extremamente fina mostrando progresso de leitura da página.

Discreta.

Isso cria percepção de avanço sem o usuário precisar pensar nisso.

---

# STICKY CTA MOBILE

Depois que o Hero sair da tela, mostrar barra inferior:

**100 Recetas · US$15**

Botão:

**QUIERO ACCEDER**

Manter extremamente compacta.

Quando a seção principal de compra estiver visível, esconder.

---

# PROVA SOCIAL EM TEMPO REAL

Preparar suporte técnico para receber dados REAIS do checkout.

Exemplo de evento:

`purchase_completed`

Se houver compras reais recentes, permitir mostrar notificações discretas como:

**María de México acaba de acceder.**

ou:

**17 personas accedieron en las últimas 24 horas.**

REGRAS:

* utilizar somente dados reais;

* anonimizar nome quando necessário;

* não inventar localização;

* não inventar números;

* não mostrar se não houver dados;

* frequência máxima controlada;

* não interromper navegação.

Se não houver integração real:

**NÃO mostrar notificações de compradores.**

No lugar disso, utilizar pequenas mensagens verdadeiras:

**Acceso inmediato**

**Pago único**

**100 recetas**

**Funciona desde tu celular**

---

# PROMOÇÃO

Criar variáveis:

`PROMO_ACTIVE`

`PROMO_END_AT`

`PROMO_PRICE`

`REGULAR_PRICE`

Só mostrar promoção se ela for realmente configurada.

Se for um preço de lançamento verdadeiro:

mostrar:

**Precio especial de lanzamiento**

Se houver data real de término:

mostrar contador verdadeiro.

Quando chegar a zero:

o contador deve acabar e a promoção deve mudar/desaparecer.

NUNCA reiniciar automaticamente.

NUNCA criar “oferta termina em 10 minutos” falsa.

---

# PREÇO

Preço oficial inicial:

**US$15**

A melhor apresentação deve ser:

### Acceso completo por

# US$15

**Pago único.**

Logo abaixo, chamar bastante atenção para:

## Solo US$0,15 por receta

Microtexto:

**Y las herramientas están incluidas.**

Isso aumenta percepção de valor de forma verdadeira.

---

# PARCELAMENTO

Criar variável:

`INSTALLMENT_TEXT`

Somente exibir se o checkout realmente oferecer parcelamento.

Exemplo autorizado:

## 3 pagos de US$5

Imediatamente abaixo:

**Total: US$15**

Nunca mostrar somente a parcela escondendo o total.

Caso o checkout não permita parcelas:

não mostrar parcelamento.

---

# ESTRUTURA DA PÁGINA

A página deve ser curta.

Quero aproximadamente:

1. Hero

2. Identificação

3. Categorias

4. Demonstração

5. Ferramentas

6. Confiança

7. Oferta

8. FAQ

9. CTA final

Nada além do necessário.

---

# SEÇÃO 1 — HERO

Essa é a seção mais importante.

Fundo clean e emocional.

Utilizar uma composição visual premium:

**cachorro + tutor + preparação pronta + ingredientes.**

Não mostrar somente uma capa de ebook.

No topo:

badge:

**100 recetas fáciles de explorar**

Headline principal:

# 100 formas de preparar algo especial para tu perro.

Subheadline:

**Galletas, snacks, cupcakes, pasteles y premios caseros con ingredientes claros, cantidades exactas y preparación paso a paso.**

Abaixo:

✓ Fácil de seguir

✓ Ingredientes claros

✓ Desde tu celular

✓ Acceso inmediato

Botão:

# QUIERO LAS 100 RECETAS

Microcopy:

**Acceso completo · Pago único**

Logo abaixo:

**US$15**

e:

**Solo US$0,15 por receta**

---

# TESTE DE HEADLINE

Estruturar headline como variável.

## Variante A — padrão

**100 formas de preparar algo especial para tu perro.**

## Variante B

**Prepara algo especial para tu perro, hecho por ti.**

## Variante C

**Convierte ingredientes simples en momentos especiales para tu perro.**

Utilizar A inicialmente.

---

# ELEMENTO INTERATIVO DO HERO

Abaixo da primeira dobra:

## ¿Qué prepararías primero?

Mostrar cards:

🍪 **Galletas**

🦴 **Snacks**

🧁 **Cupcakes**

🎂 **Pasteles**

🎉 **Cumpleaños**

Ao passar o mouse ou tocar:

o card aumenta discretamente.

Ao clicar:

trocar dinamicamente um preview abaixo.

Por exemplo:

### GALLETAS

Mostrar 3 exemplos reais:

* Galletas de Calabaza y Avena

* Galletas de Banana y Avena

* Galletas de Pollo y Zanahoria

Com fotografias.

Se selecionar:

### CUMPLEAÑOS

trocar para preparações dessa categoria.

Isso faz o visitante interagir com o produto antes da compra.

---

# SEÇÃO 2 — IDENTIFICAÇÃO

Não começar com uma lista de dores.

Criar frase:

# Si es parte de tu familia, sabes que a veces quieres darle algo más que “lo de siempre”.

Texto:

**Tal vez ya buscaste recetas para perros en internet. Una dice una cantidad, otra no explica cómo conservarla y otra te hace preguntarte si realmente puedes utilizar ese ingrediente.**

Depois:

**Por eso reunimos todo de una forma mucho más simple.**

Cards:

### Sabes qué necesitas

**Ingredientes y cantidades claras.**

### Sabes qué hacer

**Preparación organizada paso a paso.**

### Sabes cómo guardarlo

**Información de conservación dentro de cada receta.**

Visual extremamente limpo.

---

# SEÇÃO 3 — CATEGORIAS

Título:

# No importa qué momento tengas en mente.

Sub:

**Hay una receta para explorar.**

Grid:

### Galletas

### Snacks y premios

### Cupcakes

### Pasteles

### Cumpleaños

### Recetas fáciles

### Premium

### Especiales

Cada card:

* imagem;

* nome;

* pequena quantidade de exemplos;

* hover elegante.

Não mostrar blocos enormes de texto.

---

# SEÇÃO 4 — DEMONSTRAÇÃO REAL

Essa é uma das seções que mais deve vender.

Título:

# Mira cómo encontrarás cada receta.

Criar mockup REALISTA da plataforma.

Mostrar uma receita:

## Galletas de Calabaza y Avena

**30 min**

**Fácil**

**20 galletas**

### Ingredientes

120 g harina de avena

100 g puré de calabaza

1 huevo

### Preparación

1. Precalienta...

2. Mezcla...

3. Hornea...

Mostrar também:

**Conservación**

e:

**Ajustar cantidad**

Botão demonstrativo:

**20 → 40**

Ao visitante clicar:

as quantidades visíveis devem dobrar animadamente.

120 g → 240 g

100 g → 200 g

1 huevo → 2 huevos

Essa pequena demonstração é extremamente importante.

Ela mostra que não é somente um PDF.

---

# MICROCOPY DEPOIS DA DEMONSTRAÇÃO

# No tienes que hacer cuentas.

Texto:

**Si quieres preparar más o menos, la plataforma puede ayudarte a ajustar las cantidades.**

CTA pequeno:

**QUIERO TENER ACCESO**

---

# SEÇÃO 5 — “NÃO É SÓ RECEITA”

Título:

# Las recetas son solo el comienzo.

Mostrar quatro ferramentas.

## Ajustador de cantidades

**Prepara más o menos sin hacer cálculos manuales.**

## Lista de compras

**Organiza lo que necesitas antes de empezar.**

## Calculadora de costos

**Registra tus precios y entiende cuánto cuesta cada preparación.**

## Precio opcional

**Si algún día quieres vender, también puedes simular un precio.**

Interação:

ao tocar em cada card, abrir uma pequena demonstração.

Não sair da página.

---

# SEÇÃO 6 — CONFIANÇA

Título:

# Porque preparar para él también significa hacerlo con cuidado.

Mostrar visualmente:

### Ingredientes claros

### Cantidades específicas

### Preparación completa

### Conservación

### Avisos cuando corresponde

Texto:

**Las recetas están planteadas como premios y preparaciones complementarias para perros adultos sanos.**

Box discreto:

**Si tu perro tiene alergias, intolerancias, alguna enfermedad o sigue una dieta veterinaria, consulta con su veterinario antes de introducir nuevos alimentos.**

Não colocar medo.

Usar isso como sinal de profissionalismo.

---

# IMPORTANTE

Nunca escrever:

* cura enfermedades;

* previene cáncer;

* alarga la vida;

* 100% seguro para todos;

* reemplaza el alimento;

* aprobado por veterinarios;

sem evidência real.

---

# PROVA SOCIAL

Preparar seção dinâmica.

Se existirem avaliações REAIS:

Título:

# Mira lo que están preparando

Priorizar:

* foto da preparação;

* primeiro nome;

* país;

* comentário.

Pode virar carrossel.

Se houver avaliações suficientes:

mostrar:

**4,8 ★ · 127 opiniones verificadas**

SOMENTE se esses números forem reais do NOSSO produto.

Nunca utilizar as 661 avaliações do concorrente como se fossem nossas.

Se não houver avaliações:

ocultar completamente a seção.

---

# CONTEÚDO GERADO PELOS CLIENTES

Preparar suporte futuro para:

**Preparado por nuestra comunidad**

Mostrar fotos reais enviadas por compradores.

Essa provavelmente será nossa melhor prova social no futuro.

Imagem de:

* biscoitos;

* cupcakes;

* aniversário;

* cachorro com preparação.

Nunca usar UGC falso.

---

# SEÇÃO 7 — OFERTA

Essa é a seção mais impactante depois do Hero.

Fundo diferente.

Card central premium.

Badge:

**ACCESO COMPLETO**

Headline:

# Todo esto por US$15.

Depois:

## 100 recetas

*

## Plataforma interactiva

*

## Ajustador de cantidades

*

## Lista de compras

*

## Calculadora de costos

*

## Herramientas extras

Separador.

Texto:

**100 recetas × US$0,15 = US$15**

Depois:

**Y las herramientas están incluidas.**

Preço:

# US$15

**Pago único**

Se houver parcelamento verdadeiro:

**o [INSTALLMENT_TEXT]**

com total obrigatoriamente visível.

CTA grande:

# QUIERO ACCEDER AHORA

Microcopy:

**Acceso digital inmediato después de la compra.**

---

# EFEITO DO CTA DA OFERTA

Quando entrar no viewport:

o CTA ganha um brilho muito discreto uma única vez.

Depois permanece estático.

No hover:

scale 1.025.

Sombras suaves.

Não pulsar constantemente.

---

# GARANTIA

Variável:

`GUARANTEE_DAYS`

Se houver garantia real:

mostrar:

## Pruébalo con tranquilidad.

**Tienes X días de garantía según las condiciones de compra.**

Não inventar prazo.

---

# SEÇÃO 8 — FAQ

Máximo 5.

Usar accordion.

## ¿Necesito saber cocinar?

**No. Cada receta muestra los ingredientes, cantidades y preparación paso a paso.**

## ¿Son comidas completas para sustituir su alimentación habitual?

**No. El producto está centrado en premios y preparaciones complementarias.**

## ¿Y si mi perro tiene alergia o alguna enfermedad?

**Consulta con su veterinario antes de introducir nuevos ingredientes.**

## ¿Dónde recibo las recetas?

**Tendrás acceso digital a la plataforma después de la compra.**

## ¿El pago es mensual?

**No. El precio indicado de US$15 corresponde a un pago único.**

Essa última pergunta é importante.

Ajuda a reduzir medo de assinatura.

---

# SEÇÃO 9 — CTA FINAL

Imagem emocional.

Cachorro olhando para tutor/cozinha.

Título:

# Él no sabe que estás a un clic de preparar algo especial.

Subheadline:

**Pero tú sí.**

Botão:

# QUIERO LAS 100 RECETAS

Preço:

**US$15 · Pago único**

Micro:

**Acceso inmediato**

---

# INTERAÇÃO EXTRA — SEM PARECER GAMIFICAÇÃO

Adicionar discretamente no meio da página:

## Elige una receta que harías hoy

Mostrar 3 opções.

Quando usuário seleciona:

adicionar coração/seleção e mostrar:

**Buena elección. Esta está incluida dentro de las 100 recetas.**

Depois CTA:

**Desbloquear las 100**

Não salvar dado pessoal.

Isso cria microcompromisso psicológico antes da compra.

---

# URGÊNCIA REAL

Se `PROMO_ACTIVE = true`:

mostrar banner discreto:

**Precio de lanzamiento disponible hasta [fecha].**

Se houver prazo real:

contador verdadeiro.

Ao terminar:

parar promoção.

Se não houver:

não exibir.

---

# NÃO USAR

Nunca implementar:

“184 personas están comprando ahora”

sem dado real.

Nunca:

“32 personas viendo esta página”

sem analytics real.

Nunca:

“quedan 7 plazas”

se produto não tiver vagas.

Nunca:

countdown reiniciável.

Nunca:

preço antigo riscado inventado.

Nunca:

depoimentos fictícios.

Nunca:

notificação falsa de compra.

---

# ALTERNATIVA À NOTIFICAÇÃO FALSA

Criar microtoasts informativos verdadeiros.

Exemplos:

**✓ Acceso inmediato**

**✓ Pago único**

**✓ 100 recetas**

**✓ Consulta desde tu celular**

Mostrar no máximo 1 ocasionalmente.

Sutil.

---

# PERFORMANCE

Essa página receberá tráfego frio.

Portanto:

* mobile-first;

* carregamento rápido;

* WebP/AVIF;

* hero otimizado;

* lazy load;

* sem vídeos pesados automáticos;

* sem bibliotecas desnecessárias;

* sem animações que causem layout shift.

---

# OBJETIVO DE CADA SEÇÃO

Hero:

**“Quero isso.”**

Identificação:

**“Isso foi feito para mim.”**

Categorias:

**“Tem bastante coisa.”**

Demonstração:

**“Agora entendi o que recebo.”**

Ferramentas:

**“É melhor do que um ebook.”**

Confiança:

**“Parece sério.”**

Oferta:

**“US$15 faz sentido.”**

FAQ:

**“Minha dúvida foi resolvida.”**

CTA final:

**“Vou comprar.”**

---

# ANALYTICS

Preparar eventos:

`hero_cta_clicked`

`category_selected`

`recipe_demo_interacted`

`recipe_quantity_demo_changed`

`tool_demo_opened`

`pricing_viewed`

`checkout_clicked`

`faq_opened`

`final_cta_clicked`

`purchase_completed`

Assim poderemos posteriormente descobrir onde o visitante perde interesse.

---

# A/B TESTS FUTUROS

Deixar componentes configuráveis.

Testar posteriormente:

## Hero

“100 formas de preparar algo especial para tu perro.”

vs.

“Prepara algo especial para tu perro, hecho por ti.”

## CTA

“Quiero las 100 recetas”

vs.

“Quiero acceder ahora”

## Valor

“US$15 pago único”

vs.

“US$0,15 por receta · acceso completo US$15”

Não testar tudo simultaneamente.

---

# REGRA DE OURO

A página não deve parecer estar desesperadamente tentando vender.

Ela deve fazer o visitante:

1. se identificar;

2. mexer na página;

3. visualizar as receitas;

4. imaginar preparando;

5. entender o produto;

6. perceber facilidade;

7. sentir confiança;

8. perceber US$15 como baixo em relação ao que recebe;

9. comprar.

O visitante deve sentir que chegou à conclusão sozinho.

Essa é a experiência desejada.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pawsome-creations-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f2a7603c-88d6-4aa8-9d4a-e6e81fd44c03).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
