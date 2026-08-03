import type {
  ApiTransport,
  ApiTransportRequest,
} from "@/shared/lib/api-transport";
import type { OperationsVertical } from "@/modules/operations/runtime/operations-runtime";
import { DemoOperationsRouter } from "./DemoOperationsRouter";
import { DemoOperationsStore } from "./DemoOperationsStore";

export class DemoApiTransport implements ApiTransport {
  readonly kind = "demo" as const;
  private readonly store: DemoOperationsStore;
  private readonly router: DemoOperationsRouter;

  constructor(vertical: OperationsVertical) {
    this.store = new DemoOperationsStore(vertical);
    this.router = new DemoOperationsRouter(this.store);
  }

  request(input: ApiTransportRequest) {
    return this.router.handle(input);
  }

  reset() {
    this.store.reset();
  }
}
