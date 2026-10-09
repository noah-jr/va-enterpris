import type { Page } from '@playwright/test';

export interface ContrastIssue {
  text: string;
  ratio: number;
  color: string;
  background: string;
  selector: string;
}

export interface ThemeAudit {
  isDark: boolean;
  /** Luminância relativa do fundo da área principal (0 = preto, 1 = branco). */
  surfaceLuminance: number;
  issues: ContrastIssue[];
  checked: number;
}

/**
 * Audita no browser o contraste WCAG de todo o texto visível contra o fundo efetivo
 * (compondo camadas semi-transparentes dos ancestrais). Elementos desativados, ocultos
 * ou decorativos (aria-hidden) são ignorados.
 */
export async function auditTheme(page: Page, minRatio = 3): Promise<ThemeAudit> {
  return page.evaluate((min) => {
    // Termina animações de entrada (fade-in) para medir o estado final, não um frame intermédio.
    for (const animation of document.getAnimations()) {
      try {
        animation.finish();
      } catch {
        // Animações infinitas (spinners, pulsos) não têm fim — ficam como estão.
      }
    }

    type RGBA = [number, number, number, number];

    const parse = (value: string): RGBA => {
      const m = value.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 0];
      const parts = m[1]!.split(/[ ,/]+/).filter(Boolean).map(Number);
      return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 1];
    };

    const over = (top: RGBA, bottom: RGBA): RGBA => {
      const a = top[3] + bottom[3] * (1 - top[3]);
      if (a === 0) return [0, 0, 0, 0];
      const mix = (i: number) => (top[i]! * top[3] + bottom[i]! * bottom[3] * (1 - top[3])) / a;
      return [mix(0), mix(1), mix(2), a];
    };

    const luminance = ([r, g, b]: RGBA) => {
      const c = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
    };

    const contrast = (a: RGBA, b: RGBA) => {
      const la = luminance(a);
      const lb = luminance(b);
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    };

    /** Fundo efetivo: compõe os fundos dos ancestrais até ficar opaco. */
    const backgroundOf = (el: Element): RGBA | null => {
      const layers: RGBA[] = [];
      let node: Element | null = el;
      while (node) {
        const style = getComputedStyle(node);
        if (style.backgroundImage && style.backgroundImage !== 'none') return null; // gradiente/imagem: não avaliável
        const bg = parse(style.backgroundColor);
        if (bg[3] > 0) {
          layers.push(bg);
          if (bg[3] >= 1) break;
        }
        node = node.parentElement;
      }
      let result: RGBA = parse(getComputedStyle(document.documentElement).backgroundColor);
      if (result[3] === 0) result = [255, 255, 255, 1];
      for (let i = layers.length - 1; i >= 0; i--) result = over(layers[i]!, result);
      return result;
    };

    const describe = (el: Element) => {
      const tag = el.tagName.toLowerCase();
      const cls = (el.getAttribute('class') ?? '').split(/\s+/).slice(0, 4).join('.');
      return cls ? `${tag}.${cls}` : tag;
    };

    const isDark = document.documentElement.classList.contains('dark');
    const main = document.querySelector('main') ?? document.body;
    const surface = backgroundOf(main) ?? [255, 255, 255, 1];

    const issues: ContrastIssue[] = [];
    let checked = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set<Element>();

    while (walker.nextNode()) {
      const textNode = walker.currentNode as Text;
      const text = textNode.textContent?.trim();
      const el = textNode.parentElement;
      if (!text || !el || seen.has(el)) continue;
      seen.add(el);

      if (el.closest('[aria-hidden="true"], [disabled], [aria-disabled="true"], script, style, noscript, svg, option')) continue;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) < 0.5) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const bg = backgroundOf(el);
      if (!bg) continue;
      const fg = over(parse(style.color), bg);
      const ratio = contrast(fg, bg);
      checked++;
      if (ratio < min) {
        issues.push({
          text: text.slice(0, 60),
          ratio: Math.round(ratio * 100) / 100,
          color: style.color,
          background: `rgb(${bg.slice(0, 3).map(Math.round).join(',')})`,
          selector: describe(el),
        });
      }
    }

    return { isDark, surfaceLuminance: luminance(surface), issues, checked };
  }, minRatio);
}

/** Força o tema antes da navegação (a preferência é lida do localStorage no arranque). */
export async function setThemePreference(page: Page, storageKey: string, theme: 'light' | 'dark'): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      try {
        // Só define se ainda não houver preferência — não desfaz escolhas feitas durante o teste.
        if (!localStorage.getItem(key)) localStorage.setItem(key, value);
      } catch {
        // ignora
      }
    },
    [storageKey, theme] as const,
  );
}

/** Agrupa problemas repetidos (mesmo seletor/rácio) para mensagens de erro legíveis. */
export function summarize(issues: ContrastIssue[]): string[] {
  const counts = new Map<string, number>();
  for (const i of issues) {
    const key = `${i.ratio}:1  ${i.selector}  «${i.text}»  (${i.color} sobre ${i.background})`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].map(([k, n]) => (n > 1 ? `${k} ×${n}` : k));
}
