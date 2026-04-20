export function supportsViewTransitions() {
  return (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function withViewTransition(callback: () => void | Promise<void>) {
  if (!supportsViewTransitions()) {
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

  return startViewTransition.call(document, callback).finished;
}
