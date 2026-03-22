/**
 * Loads Leaflet (+ optional MarkerCluster) from unpkg CDN for client-only maps.
 * Types come from @types/leaflet; markercluster uses minimal structural typing.
 */

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

const CLUSTER_CSS = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";
const CLUSTER_CSS_DEFAULT = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";
const CLUSTER_JS = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";

function ensureCss(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
    document.head.appendChild(link);
  });
}

function ensureScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}

export type LeafletModule = typeof import("leaflet");

let leafletPromise: Promise<LeafletModule> | null = null;

export function loadLeafletFromCdn(): Promise<LeafletModule> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadLeafletFromCdn is client-only"));
  }
  if (leafletPromise) return leafletPromise;
  leafletPromise = (async () => {
    await ensureCss(LEAFLET_CSS);
    await ensureScript(LEAFLET_JS);
    const L = (window as unknown as { L?: LeafletModule }).L;
    if (!L) throw new Error("Leaflet global L missing after script load");
    return L;
  })();
  return leafletPromise;
}

export type MarkerClusterGroup = import("leaflet").LayerGroup & {
  clearLayers(): MarkerClusterGroup;
  addLayer(layer: import("leaflet").Layer): MarkerClusterGroup;
};

export type LeafletWithCluster = LeafletModule & {
  markerClusterGroup(options?: Record<string, unknown>): MarkerClusterGroup;
};

let clusterPromise: Promise<LeafletWithCluster> | null = null;

export function loadLeafletWithClusterFromCdn(): Promise<LeafletWithCluster> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadLeafletWithClusterFromCdn is client-only"));
  }
  if (clusterPromise) return clusterPromise;
  clusterPromise = (async () => {
    const L = await loadLeafletFromCdn();
    await ensureCss(CLUSTER_CSS);
    await ensureCss(CLUSTER_CSS_DEFAULT);
    await ensureScript(CLUSTER_JS);
    return L as LeafletWithCluster;
  })();
  return clusterPromise;
}
