export type ApiTransportRequest = {
  path: string;
  url: string;
  token: string | null;
  init: RequestInit;
};

export interface ApiTransport {
  readonly kind: "live" | "demo";
  request(input: ApiTransportRequest): Promise<Response>;
}

let activeTransport: ApiTransport | null = null;

export function installApiTransport(transport: ApiTransport) {
  const previous = activeTransport;
  activeTransport = transport;

  return () => {
    if (activeTransport === transport) activeTransport = previous;
  };
}

export function getInstalledApiTransport() {
  return activeTransport;
}

export function isDemoApiTransportActive() {
  return activeTransport?.kind === "demo";
}
