# AI Photo Prompts for Peter Law

For use in Gemini, Midjourney, ChatGPT (DALL-E), or similar. These prompts target the brand direction we locked: calm, warm-neutral palette, off-white background (#f6f4f0), serif typography energy, hospitality-grade refinement. Think *boutique brokerage*, not *Wix template*.

**Photo aspect ratios to request:**
- Hero photo (home, about): **4:5 portrait** (1024×1280 in Gemini, `--ar 4:5` in Midjourney)
- Section / environmental shots: **3:2 landscape** or **16:9**
- Social / square: **1:1**

---

## Headshot direction (if you proceed despite the regulatory pushback)

To minimize uncanny-valley and "AI face" tells, the prompts below specify *editorial photography style*, narrow depth of field, real-photo lighting, and explicit anti-glamour markers.

### Prompt A — Editorial portrait, downtown context

> Editorial real estate agent portrait. East Asian Canadian man in his early 30s, short dark hair, warm easy smile, dressed in a charcoal blazer over an open-collar white shirt. Standing on a downtown Toronto sidewalk at the golden hour, condo towers softly blurred in the background. Natural light from camera left, gentle shadow falling on his right. Shot on a 50mm lens at f/2, shallow depth of field, color-graded to warm neutrals — off-white background tones, soft browns, no oversaturation. Photorealistic, magazine editorial quality, not stylized. 4:5 vertical.

### Prompt B — Calm interior portrait

> Calm interior portrait of an East Asian Canadian male real estate professional in his early 30s. Sitting at a wood dining table near a large window with diffused natural light, holding a coffee cup. Warm beige sweater, simple. Neutral interior background — light walls, soft shadows, blurred plants. Shot on a medium-format camera, 85mm equivalent, f/2.8. Color palette: off-white, warm taupe, muted earth tones. Editorial real estate magazine style, not stock photo, not promotional. 4:5 vertical.

### Prompt C — Walking shot, environmental

> Wide environmental shot of a young East Asian Canadian man walking through a Toronto neighborhood (low-rise King West or Liberty Village). Casual blazer, jeans, walking with light forward energy. Late afternoon sun, long shadows, golden hour. Street is slightly busy but he's the clear subject. Composition: rule of thirds, subject on left third. Photorealistic editorial style, color graded to warm neutrals, no HDR feel. 3:2 landscape.

---

## Environmental imagery (no person — much safer to use)

These avoid the AI-portrait issue entirely. Use throughout the site as hero backgrounds, section dividers, or social.

### Prompt 1 — Toronto skyline, warm dawn

> Wide cinematic photograph of Toronto downtown skyline at dawn. CN Tower visible left of center, financial district cluster behind it, condo towers reflecting first light. Calm Lake Ontario in the foreground. Color palette: warm peach in the sky, soft charcoal buildings, off-white mist near water. Photorealistic, fine art landscape photography style, not over-saturated, no birds or people. 16:9.

### Prompt 2 — King Street condo at twilight

> Photorealistic photograph of a contemporary mid-rise Toronto condo on King Street West at blue hour. Warm interior lights glowing through floor-to-ceiling windows. Wet pavement slightly reflecting streetlights. Calm, no people. Color palette: warm interior amber light against cool deep blue exterior. Editorial real estate photography style. 3:2 landscape.

### Prompt 3 — Calm interior — staged condo living room

> Calm photorealistic interior of a downtown Toronto condo living room. Warm natural light through a large window. Furnishings: low cream sofa, light oak coffee table, simple ceramic vase with a single branch, woven rug, off-white walls, soft shadows. Minimalist, lived-in feel — a book on the table, a coffee cup. Neutral warm palette: off-white, taupe, soft black, hints of clay. Architectural photography style. 3:2 landscape.

### Prompt 4 — Toronto waterfront morning

> Wide photograph of the Toronto Harbourfront on a clear early morning. Calm water, sailboats moored, low sun warming the condo towers along the shoreline. Composition pulls the eye from the water in the foreground to the cityscape in the back. Color palette: cool blue water, warm peach sky, off-white tower facades. Fine art landscape photography. 16:9.

### Prompt 5 — Neighborhood character (Cabbagetown / Trinity Bellwoods)

> Photorealistic photograph of a Toronto Victorian residential street (Cabbagetown style). Red brick row houses with painted trim, mature maple trees in early autumn light, sidewalk in good condition. Calm, no people, no cars in foreground. Warm afternoon sun, long shadows. Editorial residential real estate style, neutral natural color palette. 3:2 landscape.

---

## Where to use each on the site

| Spot | Recommended prompt |
|---|---|
| Home page hero | Headshot Prompt A (or env Prompt 2 if going person-free) |
| About page hero | Headshot Prompt B |
| 中文 page hero | Env Prompt 1 (skyline) — clean separation from EN version |
| For Renters hero / section break | Env Prompt 3 (interior) |
| For Landlords hero / section break | Env Prompt 2 (King St condo) |
| Social cards / OG images | Env Prompt 4 (waterfront) |
| Blog / Journal post headers | Env Prompt 5 (neighborhood) |

---

## Output guidelines for any generator

When you generate, ask the model for:
- **Real photo style**, not illustration / digital art / stylized
- **No text or watermarks** in the image
- **Natural light**, not studio harsh lighting
- **Subtle, not over-processed**
- **No HDR / glow effects**

After generation:
- Save as **WebP** if possible (smaller, faster site)
- If JPG, keep file size under 400KB per image
- Drop into `public/` in the Astro project folder
- Tell Claude the filename and where to use it

---

## Last honest note

These prompts are tuned to produce the most defensible AI output possible. They will still be **better than nothing but worse than a real photographer**. If you ever want to upgrade later, a one-hour shoot with a Toronto real estate photographer runs $200–500 and the images last 5+ years. Just leaving the door open.
