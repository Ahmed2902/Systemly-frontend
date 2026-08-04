import type {
  CatalogService,
  ServiceInput,
} from "@/modules/services/services.types";
import type {
  BusinessSettingsInput,
  WebsiteSettingsInput,
} from "@/modules/settings/settings.types";
import { toServiceCatalogResponse } from "./demo-fixtures";
import type { DemoOperationsStore } from "./DemoOperationsStore";
import type { DemoRequest, DemoRequestHandler } from "./demo-http";
import { fail, objectBody, ok } from "./demo-http";

export class DemoServiceSettingsHandler implements DemoRequestHandler {
  constructor(private readonly store: DemoOperationsStore) {}

  canHandle({ pathname }: DemoRequest) {
    return (
      pathname === "/services" ||
      pathname.startsWith("/services/") ||
      pathname === "/settings" ||
      pathname.startsWith("/settings/")
    );
  }

  handle(request: DemoRequest) {
    return request.pathname.startsWith("/settings")
      ? this.settings(request)
      : this.services(request);
  }

  private services(request: DemoRequest) {
    const state = this.store.read();
    const parts = request.pathname.split("/").filter(Boolean);
    const id = parts[1] ? decodeURIComponent(parts[1]) : null;

    if (!id && request.method === "GET") {
      const response = toServiceCatalogResponse(state);
      const query = (request.searchParams.get("search") || "")
        .trim()
        .toLowerCase();
      const category = request.searchParams.get("category");
      const status = request.searchParams.get("status");

      response.items = response.items
        .map((service) => ({
          ...service,
          eligibleStaff: state.staff
            .filter(
              (member) =>
                member.isActive &&
                member.services.some((assigned) => assigned.id === service.id),
            )
            .map((member) => ({
              id: member.id,
              name: member.name,
              photoUrl: member.photoUrl,
              isActive: member.isActive,
            })),
        }))
        .filter(
          (service) =>
            (!query || service.name.toLowerCase().includes(query)) &&
            (!category || service.category === category) &&
            (!status ||
              status === "all" ||
              (status === "active" ? service.isActive : !service.isActive)),
        );
      response.total = response.items.length;
      response.activeTotal = response.items.filter(
        (item) => item.isActive,
      ).length;
      return ok(response);
    }

    if (!id && request.method === "POST") {
      return ok(
        this.createService(objectBody(request) as unknown as ServiceInput),
        201,
      );
    }

    const service = state.services.find((item) => item.id === id);
    if (!service) return fail("Service not found.", 404);

    if (request.method === "PATCH") {
      this.updateService(service, objectBody(request));
      return ok(service);
    }
    if (request.method === "DELETE") {
      service.isActive = false;
      return ok({ id: service.id, isActive: false });
    }
    return fail(
      `Unsupported service request: ${request.method} ${request.pathname}.`,
      404,
    );
  }

  private createService(payload: ServiceInput): CatalogService {
    const state = this.store.read();
    const now = new Date().toISOString();
    const service: CatalogService = {
      id: this.store.nextId("service"),
      name: payload.name,
      description: payload.description ?? null,
      category: payload.category ?? null,
      durationMin: payload.durationMin,
      priceEgp: payload.priceEgp ?? 0,
      isActive: payload.isActive,
      eligibleStaff: state.staff
        .filter((member) => payload.staffIds.includes(member.id))
        .map((member) => ({
          id: member.id,
          name: member.name,
          photoUrl: member.photoUrl,
          isActive: member.isActive,
        })),
      createdAt: now,
      updatedAt: now,
    };
    state.services.push(service);
    return service;
  }

  private updateService(
    service: CatalogService,
    raw: Record<string, unknown>,
  ) {
    const fields = [
      "name",
      "description",
      "category",
      "durationMin",
      "priceEgp",
      "isActive",
    ] as const;
    for (const field of fields) {
      if (field in raw) Object.assign(service, { [field]: raw[field] });
    }
    if (Array.isArray(raw.staffIds)) {
      const ids = raw.staffIds.map(String);
      service.eligibleStaff = this.store
        .read()
        .staff.filter((member) => ids.includes(member.id))
        .map((member) => ({
          id: member.id,
          name: member.name,
          photoUrl: member.photoUrl,
          isActive: member.isActive,
        }));
    }
    service.updatedAt = new Date().toISOString();
  }

  private settings(request: DemoRequest) {
    const state = this.store.read();
    if (request.pathname === "/settings" && request.method === "GET") {
      return ok(state.settings);
    }
    if (
      request.pathname === "/settings/business" &&
      request.method === "PATCH"
    ) {
      Object.assign(
        state.settings,
        objectBody(request) as unknown as BusinessSettingsInput,
      );
      state.businessName = state.settings.name;
      return ok(state.settings);
    }
    if (
      request.pathname === "/settings/website" &&
      request.method === "PATCH"
    ) {
      state.settings.websiteContent =
        objectBody(request) as unknown as WebsiteSettingsInput;
      return ok(state.settings.websiteContent);
    }
    if (
      request.pathname === "/settings/publish" &&
      request.method === "PATCH"
    ) {
      state.settings.isActive = Boolean(objectBody(request).isActive);
      return ok({ id: state.settings.id, isActive: state.settings.isActive });
    }
    if (request.pathname.startsWith("/settings/branding/")) {
      const kind = request.pathname.split("/")[3] as "logo" | "cover";
      if (request.method === "DELETE") {
        if (kind === "logo") state.settings.logoUrl = null;
        else state.settings.coverUrl = null;
        return ok({ success: true });
      }
      return ok({
        uploadUrl: "demo://upload",
        publicUrl: null,
        publicId: this.store.nextId("branding"),
      });
    }
    return fail(
      `Unsupported settings request: ${request.method} ${request.pathname}.`,
      404,
    );
  }
}
