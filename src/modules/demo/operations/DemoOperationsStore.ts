import type { OperationsVertical } from "@/modules/operations/runtime/operations-runtime";
import {
  cloneDemoState,
  createDemoOperationsState,
  type DemoOperationsState,
} from "./demo-fixtures";

export class DemoOperationsStore {
  private readonly vertical: OperationsVertical;
  private initialState: DemoOperationsState;
  private state: DemoOperationsState;
  private counters = new Map<string, number>();

  constructor(vertical: OperationsVertical) {
    this.vertical = vertical;
    this.initialState = createDemoOperationsState(vertical);
    this.state = cloneDemoState(this.initialState);
  }

  read() {
    return this.state;
  }

  mutate(mutator: (state: DemoOperationsState) => void) {
    mutator(this.state);
  }

  reset() {
    this.initialState = createDemoOperationsState(this.vertical);
    this.state = cloneDemoState(this.initialState);
    this.counters.clear();
  }

  nextId(prefix: string) {
    const next = (this.counters.get(prefix) ?? 100) + 1;
    this.counters.set(prefix, next);
    return `${prefix}-${next}`;
  }
}
