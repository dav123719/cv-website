export function withViewTransition(callback: () => void | Promise<void>) {
  if (
    typeof document === "undefined" ||
    !("startViewTransition" in document) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return Promise.resolve(callback());
  }

  const startViewTransition = (
    document as Document & {
      startViewTransition?: (update: () => void | Promise<void>) => { finished: Promise<void> };
    }
  ).startViewTransition;

  if (!startViewTransition) {
    return Promise.resolve(callback());
  }

  return startViewTransition(callback).finished;
}
