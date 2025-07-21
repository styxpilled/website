export type Spec = {
  key: string;
  value?: string;
};
export type ElementSpec = {
  id: string;
  timestamp: number;
  specs: Spec[];
};
export type CrossingStorage = {
  pseudoAddress(object: object): string;
  setItem(id: string, object: any): void;
  getItem(id: string): any | undefined;
  removeItem(id: string): void;
  clear(): void;
};

type ElementCrossing = {
  addrWeakMap: WeakMap<any, string>;
  storageMap?: Map<string, any>;
  frameDocument?: Document;
  fun: CrossingStorage;
  iframe?: HTMLIFrameElement;
};

declare global {
  interface Window {
    __vtbag: {
      elementCrossing?: ElementCrossing | undefined;
    };
    crossingStorage: ElementCrossing["fun"];
  }
}

const DEBUG = false;
const SELECTOR = `#bg g`;
const crossing = top!.__vtbag?.elementCrossing;

export function init() {
  if (crossing?.fun) {
    if (self === top) {
      return;
    }
    top!.document.title = self.document.title;
    top!.history.replaceState(self.history.state, "", self.location.href);
    self.crossingStorage = crossing.fun;
  }

  document.addEventListener("astro:after-preparation", pageSwap);
  document.addEventListener("astro:after-swap", pageReveal);

  self.addEventListener(
    "pagehide",
    // "onpageswap" in self ? "pageswap" : "pagehide",
    pageSwap
  );
  self.addEventListener(
    "DOMContentLoaded",
    // "onpagereveal" in self ? "pagereveal" : "DOMContentLoaded",
    pageReveal
  );
}

function pageSwap() {
  if (self.crossingStorage) {
    self.crossingStorage.setItem("@vtbag/element-crossing", collect());
  } else {
    top!.sessionStorage.setItem(
      "@vtbag/element-crossing",
      JSON.stringify(collect())
    );
  }
}

function pageReveal() {
  let values;
  let storage;
  if ((storage = self.crossingStorage)) {
    values = storage.getItem("@vtbag/element-crossing") ?? [];
  } else {
    storage = top!.sessionStorage;
    values = JSON.parse(storage.getItem("@vtbag/element-crossing") ?? "[]");
  }
  // top!.sessionStorage.removeItem("@vtbag/element-crossing");
  // self.crossingStorage?.removeItem("@vtbag/element-crossing");
  if (
    ("navigation" in self &&
      self.navigation?.activation?.navigationType !== "reload") ||
    performance?.navigation?.type !== 1
  ) {
    restore(values);
  }
}

function collect() {
  const known = new Set<string>();
  const values: ElementSpec[] = [];
  self.document.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => {
    const spec = elementSpec(element);
    if (spec) {
      if (known.has(spec.id))
        console.error("[crossing]", "non unique id", spec.id);
      values.push(spec);
      known.add(spec.id);
    }
  });
  DEBUG && console.log("[crossing]", "retrieve", values);
  return values;
}

function elementSpec(element: HTMLElement) {
  let id = element.id;
  const specs: Spec[] = [];
  const animations = element
    .getAnimations()
    .filter((a) => a instanceof CSSAnimation);
  if (animations.length > 1) {
    console.error("duplicate animation id");
  }
  if (animations.length > 0) {
    specs.push({
      key: animations[0].animationName,
      value: "" + (animations[0].currentTime ?? 0),
    });
  }
  if (!id) console.error("[crossing]", "missing id in", element);
  else return { id, timestamp: new Date().getTime(), specs };
}

function restore(values: ElementSpec[]) {
  DEBUG && console.log("[crossing]", "restore", values);
  values.forEach((elementSpec: ElementSpec) => {
    let element = document.querySelector<HTMLElement>("#" + elementSpec.id);
    if (element) {
      elementSpec.specs.forEach((s) => {
        const animations = element!
          .getAnimations()
          .filter(
            (a) => a instanceof CSSAnimation && a.animationName === s.key
          );
        if (animations.length > 1) {
          console.warn(
            "[crossing]",
            `restore: animation name ${s.key} is not unique for`,
            element
          );
        }
        animations.forEach(
          (a) =>
            (a.currentTime =
              ~~(s.value ?? "0") +
              (new Date().getTime() - elementSpec.timestamp))
        );
      });
    }
  });
}
