# SPEC.MD - THE TECHNICAL BIBLE

## Casino Mariage - "Love Casino 777"

> Bienvenue au Love Casino, une expérience mobile '777' qui mélange le clinquant de Las Vegas
> et le romantisme kitch d'un mariage heureux. Ici, les néons clignotent, les cœurs remplacent
> les piques, et le jackpot n'est pas une montagne de dollars mais une célébration de l'Amour
> (et des shots).

---

## 1. CORE LOGIC & ALGORITHM

- **Win Rate:** Exactly 33% (1/3) global probability.
- **RNG Distribution:** If Win = True, pick one of the 7 characters (Uniform Distribution).
- **Loss Logic (The "Near Miss"):**
  - If Win = False, there is a 50% chance to force a "Near Miss" (Reel 1 & 2 match, Reel 3 differs) to create tension.
  - The remaining 50% are pure random mismatch.
- **The "God Mode" (Backdoor):**
  - Action: Double-tap the main "Casino Mariage" logo in the header.
  - Effect: Sets hidden state `forceNextWin = true`.
  - Result: The VERY NEXT spin is a guaranteed Jackpot. Resets to normal after the win.
- **Cooldown:** The "LANCER" button is disabled for 5 seconds after a press.

## 2. SYMBOLS (7 FACES)

Files are in `/public/images/`. These EXACT filenames must be used:

1. `ANAÉ.jpeg`
2. `NATHAN.jpeg`
3. `ARTHUR.jpeg`
4. `CHRISTOPHE_ET_KATIA.jpeg`
5. `JB ET AGNES.jpeg`
6. `JULES.jpeg`

## 3. UX/UI DESIGN (THEME: VEGAS KITSCH LOVE)

- **Layout:** Mobile Portrait enforced (max-width 450px, centered).
- **Palette:**
  - Background: Deep Midnight Blue (#0a1628)
  - Accents: Gold (#FFD700), Neon Pink (#FF69B4) for Hearts
  - Text: White (#FFFFFF)
- **Typography:** Serif for titles (casino feel), bold for numbers.
- **Visuals:**
  - The "LANCER" button: big physical casino button look.
  - Decorative elements: Hearts, sparkles, Vegas-style border.
- **Animations (Framer Motion):**
  - Reels accelerate, blur, and stop sequentially (0.5s delays).
  - Heavy "Spring/Bounce" effect when stopping.
- **Victory:**
  - Flashing text: "JACKPOT ! SHOT TIME !"
  - Full screen confetti explosion with emojis (❤️, 💍, 🥂).
- **Audio:** SILENT.

## 4. ARCHITECTURE

- `/app/page.tsx`: Main game container.
- `/app/layout.tsx`: Root layout with metadata and fonts.
- `/app/globals.css`: Global styles and theme.
- `/components/SlotMachine.tsx`: Logic controller.
- `/components/Reel.tsx`: Presentation component.
- `/lib/utils.ts`: Helper for RNG.
