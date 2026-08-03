import type { ApiTransportRequest } from "@/shared/lib/api-transport";
import { DemoAppointmentHandler } from "./DemoAppointmentHandler";
import { DemoCalendarHandler } from "./DemoCalendarHandler";
import { DemoCustomerHandler } from "./DemoCustomerHandler";
import { DemoInvoiceHandler } from "./DemoInvoiceHandler";
import { DemoServiceSettingsHandler } from "./DemoServiceSettingsHandler";
import { DemoStaffHandler } from "./DemoStaffHandler";
import type { DemoOperationsStore } from "./DemoOperationsStore";
import { fail, normalizeRequest, type DemoRequestHandler } from "./demo-http";

export class DemoOperationsRouter {
  private readonly handlers: DemoRequestHandler[];

  constructor(store: DemoOperationsStore) {
    this.handlers = [
      new DemoCalendarHandler(store),
      new DemoAppointmentHandler(store),
      new DemoCustomerHandler(store),
      new DemoInvoiceHandler(store),
      new DemoStaffHandler(store),
      new DemoServiceSettingsHandler(store),
    ];
  }

  async handle(input: ApiTransportRequest): Promise<Response> {
    await new Promise((resolve) => setTimeout(resolve, 70));
    const request = normalizeRequest(input);
    try {
      const handler = this.handlers.find((candidate) => candidate.canHandle(request));
      return handler
        ? await handler.handle(request)
        : fail(`The demo does not implement ${request.method} ${request.pathname}.`, 404);
    } catch (error) {
      return fail(error instanceof Error ? error.message : "Demo request failed.", 400);
    }
  }
}
