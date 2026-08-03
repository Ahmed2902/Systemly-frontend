import type {
  CommissionType,
  StaffBreakInput,
  StaffProfileInput,
  StaffTimeOffInput,
  StaffWorkspaceResponse,
} from "@/modules/staff/staff.types";
import type { DemoStoredStaff } from "./demo-fixtures";
import type { DemoOperationsStore } from "./DemoOperationsStore";
import type { DemoRequest, DemoRequestHandler } from "./demo-http";
import { fail, objectBody, ok, parseBody } from "./demo-http";

export class DemoStaffHandler implements DemoRequestHandler {
  constructor(private readonly store: DemoOperationsStore) {}

  canHandle({ pathname }: DemoRequest) {
    return pathname === "/staff" || pathname.startsWith("/staff/");
  }

  handle(request: DemoRequest) {
    const state = this.store.read();
    const parts = request.pathname.split("/").filter(Boolean);
    const id = parts[1] ? decodeURIComponent(parts[1]) : null;
    if (!id && request.method === "GET") return ok(this.directory(request));
    if (!id && request.method === "POST") {
      const created = this.create(objectBody(request) as unknown as StaffProfileInput);
      return ok({ id: created.id }, 201);
    }
    const member = state.staff.find((item) => item.id === id);
    if (!member) return fail("Staff member not found.", 404);
    const resource = parts[2];
    const resourceId = parts[3] ? decodeURIComponent(parts[3]) : null;
    if (resource === "workspace" && request.method === "GET") return ok(this.workspace(member));
    if (!resource && request.method === "PATCH") {
      this.update(member, objectBody(request));
      return ok({ id: member.id });
    }
    if (!resource && request.method === "DELETE") {
      member.isActive = false;
      member.availableToday = false;
      return ok({ id: member.id, isActive: false });
    }
    if (resource === "availability" && request.method === "PUT") {
      const parsed = parseBody(request);
      member.availability = Array.isArray(parsed) ? parsed as typeof member.availability : [];
      member.workingDays = member.availability.map((item) => item.dayOfWeek);
      return ok({ success: true });
    }
    if (resource === "services" && !resourceId && request.method === "POST") {
      const payload = objectBody(request);
      const service = state.services.find((item) => item.id === String(payload.serviceId));
      if (!service) throw new Error("Service not found.");
      if (!member.services.some((item) => item.id === service.id)) {
        member.services.push({
          id: service.id,
          name: service.name,
          category: service.category,
          durationMin: service.durationMin,
          isActive: service.isActive,
          priceEgp: service.priceEgp,
          commissionType: String(payload.commissionType || "NONE") as CommissionType,
          commissionAmount: Number(payload.commissionAmount || 0),
        });
      }
      return ok({ success: true });
    }
    if (resource === "services" && resourceId && request.method === "PATCH") {
      const relation = member.services.find((item) => item.id === resourceId);
      if (relation) {
        const payload = objectBody(request);
        relation.commissionType = String(payload.commissionType || "NONE") as CommissionType;
        relation.commissionAmount = Number(payload.commissionAmount || 0);
      }
      return ok({ success: true });
    }
    if (resource === "services" && resourceId && request.method === "DELETE") {
      member.services = member.services.filter((item) => item.id !== resourceId);
      return ok({ success: true });
    }
    if (resource === "time-off" && !resourceId && request.method === "POST") {
      member.timeOff.push({ id: this.store.nextId("time-off"), ...(objectBody(request) as unknown as StaffTimeOffInput) });
      return ok({ success: true }, 201);
    }
    if (resource === "time-off" && resourceId && request.method === "DELETE") {
      member.timeOff = member.timeOff.filter((item) => item.id !== resourceId);
      return ok({ success: true });
    }
    if (resource === "breaks" && !resourceId && request.method === "POST") {
      member.breaks.push({ id: this.store.nextId("break"), ...(objectBody(request) as unknown as StaffBreakInput) });
      return ok({ success: true }, 201);
    }
    if (resource === "breaks" && resourceId && request.method === "DELETE") {
      member.breaks = member.breaks.filter((item) => item.id !== resourceId);
      return ok({ success: true });
    }
    if (resource === "photo") return ok({ id: member.id, photoUrl: null });
    return fail(`Unsupported staff request: ${request.method} ${request.pathname}.`, 404);
  }

  private directory(request: DemoRequest) {
    const state = this.store.read();
    const query = (request.searchParams.get("search") || "").trim().toLowerCase();
    const status = request.searchParams.get("status") || "all";
    const role = request.searchParams.get("role");
    const serviceId = request.searchParams.get("serviceId");
    const items = state.staff.filter((member) =>
      (!query || `${member.name} ${member.jobTitle || ""}`.toLowerCase().includes(query)) &&
      (status === "all" || (status === "active" ? member.isActive : !member.isActive)) &&
      (!role || member.role === role) &&
      (!serviceId || member.services.some((service) => service.id === serviceId)));
    return {
      items,
      total: items.length,
      page: 1,
      perPage: 100,
      metrics: {
        total: state.staff.length,
        active: state.staff.filter((item) => item.isActive).length,
        availableToday: state.staff.filter((item) => item.availableToday).length,
        onTimeOff: state.staff.filter((item) => item.currentTimeOff).length,
      },
      serviceOptions: state.services.map(({ id, name, category, durationMin, isActive, priceEgp }) => ({ id, name, category, durationMin, isActive, priceEgp })),
      canManageMoney: true,
      canManageProtectedFields: true,
    };
  }

  private create(payload: StaffProfileInput): DemoStoredStaff {
    const state = this.store.read();
    const assigned = state.services.filter((service) => payload.serviceIds.includes(service.id));
    const availability = [0, 1, 2, 3, 4, 6].map((dayOfWeek) => ({
      id: this.store.nextId("availability"),
      dayOfWeek,
      startTime: "09:00",
      endTime: "18:00",
      breakAfterMin: null,
    }));
    const member: DemoStoredStaff = {
      id: this.store.nextId("staff"),
      name: payload.name,
      role: payload.role,
      jobTitle: payload.jobTitle ?? null,
      yearsExperience: payload.yearsExperience ?? null,
      bio: payload.bio ?? null,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
      photoUrl: payload.photoUrl ?? null,
      isActive: payload.isActive,
      availableToday: payload.isActive,
      workingDays: availability.map((item) => item.dayOfWeek),
      currentTimeOff: null,
      services: assigned.map((service) => ({ id: service.id, name: service.name, category: service.category, durationMin: service.durationMin, isActive: service.isActive, priceEgp: service.priceEgp, commissionType: "NONE", commissionAmount: 0 })),
      updatedAt: new Date().toISOString(),
      availability,
      overrides: [],
      breaks: [],
      timeOff: [],
    };
    state.staff.push(member);
    return member;
  }

  private update(member: DemoStoredStaff, raw: Record<string, unknown>) {
    const fields = ["name", "role", "jobTitle", "yearsExperience", "bio", "phone", "email", "photoUrl", "isActive"] as const;
    for (const field of fields) if (field in raw) Object.assign(member, { [field]: raw[field] });
    if (Array.isArray(raw.serviceIds)) {
      const ids = raw.serviceIds.map(String);
      member.services = this.store.read().services.filter((service) => ids.includes(service.id)).map((service) => ({
        id: service.id,
        name: service.name,
        category: service.category,
        durationMin: service.durationMin,
        isActive: service.isActive,
        priceEgp: service.priceEgp,
        commissionType: "NONE",
        commissionAmount: 0,
      }));
    }
    member.updatedAt = new Date().toISOString();
  }

  private workspace(member: DemoStoredStaff): StaffWorkspaceResponse {
    const state = this.store.read();
    return {
      staff: {
        id: member.id,
        name: member.name,
        role: member.role,
        jobTitle: member.jobTitle,
        yearsExperience: member.yearsExperience,
        bio: member.bio,
        phone: member.phone,
        email: member.email,
        photoUrl: member.photoUrl,
        isActive: member.isActive,
        updatedAt: member.updatedAt,
        createdAt: new Date(Date.now() - 180 * 86_400_000).toISOString(),
      },
      services: member.services,
      availability: member.availability,
      overrides: member.overrides,
      breaks: member.breaks,
      timeOff: member.timeOff,
      upcomingAppointments: state.appointments.flatMap((appointment) => (appointment.appointmentServices ?? [])
        .filter((segment) => segment.staffId === member.id && !["completed", "no_show"].includes(appointment.status))
        .map((segment) => ({
          segmentId: segment.id,
          appointmentId: appointment.id,
          status: appointment.status,
          startsAt: segment.startsAt,
          endsAt: segment.endsAt,
          service: { id: segment.serviceId, name: segment.service?.name ?? "Service" },
          customer: { id: appointment.customer?.id ?? appointment.customerId ?? "", name: appointment.customer?.name ?? "Customer", phone: appointment.customer?.phone ?? "" },
        }))),
      serviceOptions: state.services.map(({ id, name, category, durationMin, isActive, priceEgp }) => ({ id, name, category, durationMin, isActive, priceEgp })),
      canManageMoney: true,
      canManageProtectedFields: true,
    };
  }
}
