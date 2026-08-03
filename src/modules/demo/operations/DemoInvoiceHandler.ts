import { invoiceListItem } from "./demo-domain";
import type { DemoOperationsStore } from "./DemoOperationsStore";
import type { DemoRequest, DemoRequestHandler } from "./demo-http";
import { fail, objectBody, ok } from "./demo-http";

export class DemoInvoiceHandler implements DemoRequestHandler {
  constructor(private readonly store: DemoOperationsStore) {}

  canHandle({ pathname }: DemoRequest) {
    return pathname === "/invoices" || pathname.startsWith("/invoices/");
  }

  handle(request: DemoRequest) {
    const state = this.store.read();
    const parts = request.pathname.split("/").filter(Boolean);
    const id = parts[1] ? decodeURIComponent(parts[1]) : null;
    if (!id && request.method === "GET") {
      const query = (request.searchParams.get("search") || "").trim().toLowerCase();
      const status = request.searchParams.get("status");
      const paymentMethod = request.searchParams.get("paymentMethod");
      const items = state.invoices
        .filter((invoice) =>
          (!query || `${invoice.invoiceNumber} ${invoice.customer.name} ${invoice.customer.phone}`.toLowerCase().includes(query)) &&
          (!status || invoice.status === status) &&
          (!paymentMethod || invoice.paymentMethod === paymentMethod))
        .map(invoiceListItem);
      return ok({ items, total: items.length, page: 1, perPage: 50 });
    }
    const invoice = state.invoices.find((item) => item.id === id);
    if (!invoice) return fail("Invoice not found.", 404);
    if (parts[2] === "void" && request.method === "POST") {
      invoice.status = "voided";
      invoice.voidReason = String(objectBody(request).reason || "Voided in demo");
      invoice.voidedAt = new Date().toISOString();
      invoice.voidedBy = { id: "demo-owner", name: "Demo Owner" };
      return ok(invoice);
    }
    if (parts[2] === "receipt" && request.method === "GET") {
      return new Response(
        `Systemly demo receipt\n${invoice.invoiceNumber}\n${invoice.customer.name}\nEGP ${(invoice.totalCents / 100).toFixed(2)}`,
        { status: 200, headers: { "Content-Type": "application/pdf" } },
      );
    }
    if (!parts[2] && request.method === "GET") return ok(invoice);
    return fail(`Unsupported invoice request: ${request.method} ${request.pathname}.`, 404);
  }
}
