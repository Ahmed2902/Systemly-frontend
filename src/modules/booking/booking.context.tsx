"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { BookingState, BookingService, BookingStaff } from "./booking.types";

type Action = { type: "PATCH"; payload: Partial<BookingState> };

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case "PATCH":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const BookingContext = createContext<{
  state: BookingState;
  patch: (payload: Partial<BookingState>) => void;
} | null>(null);

export function BookingProvider({
  businessId,
  branchId,
  services,
  staff,
  children,
}: {
  businessId: string;
  branchId: string;
  services: BookingService[];
  staff: BookingStaff[];
  children: ReactNode;
}) {
  const initialState: BookingState = {
    businessId,
    branchId,
    services,
    staff,
    selectedServiceIds: [],
    staffChoices: {},
    date: new Date().toISOString().slice(0, 10),
    selectedSlot: null,
    customerName: "",
    customerPhone: "",
    dateOfBirth: "",
    gender: "",
    notes: "",
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const patch = (payload: Partial<BookingState>) =>
    dispatch({ type: "PATCH", payload });

  return (
    <BookingContext.Provider value={{ state, patch }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
