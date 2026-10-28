import { useLayoutEffect, type ReactNode } from 'react';
import { useI18n, type UiLanguage } from '../../shared/i18n/I18n';
import { mediaCatalog } from './localization.catalog';

const originals = new WeakMap<Node, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const attributes = ['aria-label', 'title', 'placeholder', 'data-tooltip', 'alt'];

function translate(value: string, language: UiLanguage): string {
  const catalog = mediaCatalog[language] as Record<string, string>;
  const exact = catalog[value];
  if (exact) return exact;
  const leading = value.match(/^\s+/)?.[0] ?? '';
  const trailing = value.match(/\s+$/)?.[0] ?? '';
  const core = value.trim();
  return leading + (catalog[core] ?? core) + trailing;
}

function localizeNode(root: Node, language: UiLanguage) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  if (root.nodeType === Node.TEXT_NODE) nodes.push(root as Text);
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const source = originals.get(node) ?? node.data;
    originals.set(node, source);
    const next = translate(source, language);
    if (node.data !== next) node.data = next;
  }
  const elements: Element[] = root instanceof Element ? [root, ...root.querySelectorAll('*')] : [];
  for (const element of elements) {
    let saved = originalAttributes.get(element);
    if (!saved) { saved = new Map(); originalAttributes.set(element, saved); }
    for (const name of attributes) {
      const current = element.getAttribute(name);
      if (current == null) continue;
      const source = saved.get(name) ?? current;
      saved.set(name, source);
      const next = translate(source, language);
      if (current !== next) element.setAttribute(name, next);
    }
  }
}

export function ScreenshotsLocalization({ children }: { children: ReactNode }) {
  const { language } = useI18n();
  useLayoutEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    localizeNode(root, language);
    const observer = new MutationObserver((records) => {
      observer.disconnect();
      for (const record of records) {
        if (record.type === 'characterData') { originals.delete(record.target); localizeNode(record.target, language); }
        else for (const node of record.addedNodes) localizeNode(node, language);
      }
      observer.observe(root, { childList: true, subtree: true, characterData: true });
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);
  return <>{children}</>;
}
