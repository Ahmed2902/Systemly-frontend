"use client";

import { useState } from "react";
import { ArrowRight, BarChart3, CalendarDays, FileText, LayoutDashboard, ReceiptText, Settings, Users } from "lucide-react";

const appointments = [
  ["10:00", "Mariam Adel", "Haircut", "Nour", "Confirmed"],
  ["12:30", "Salma Tarek", "Skin consultation", "Dr. Lina", "Confirmed"],
  ["15:00", "Yasmine Ali", "Gel manicure", "Mona", "Pending"],
];
const invoices = [
  ["INV-1047", "Mariam Adel", "EGP 450", "Paid"],
  ["INV-1046", "Salma Tarek", "EGP 700", "Paid"],
  ["INV-1045", "Yasmine Ali", "EGP 320", "Sent"],
];
const customers = [
  ["Mariam Adel", "7 visits", "EGP 3,250", "Regular"],
  ["Salma Tarek", "3 visits", "EGP 2,100", "New"],
  ["Yasmine Ali", "11 visits", "EGP 5,480", "VIP"],
];

type DemoTab = "overview" | "appointments" | "invoices" | "customers";

export function LiveOperationsDemo() {
  const [tab, setTab] = useState<DemoTab>("overview");
  const rows = tab === "invoices" ? invoices : tab === "customers" ? customers : appointments;
  const headers = tab === "invoices"
    ? ["Invoice", "Customer", "Total", "Status"]
    : tab === "customers"
      ? ["Customer", "Visits", "Lifetime value", "Segment"]
      : ["Time", "Customer", "Service", "Status"];

  return (
    <section id="demo" className="lp-section lp-fade-section">
      <div className="lp-shell text-center">
        <p className="lp-kicker">Interactive demo</p>
        <h2 className="lp-title">See Hgezli <span className="lp-accent-text">operations</span> in action.</h2>
        <p className="lp-copy mx-auto max-w-2xl">Explore realistic bookings, invoices and customer records without creating an account. Every area below is clickable and uses safe dummy data.</p>

        <div className="lp-demo-window text-left">
          <div className="lp-browser-bar"><div className="lp-browser-dots"><span className="bg-red-400"/><span className="bg-amber-300"/><span className="bg-emerald-400"/></div><div className="lp-browser-url">demo.hgezli.com/operations</div></div>
          <div className="lp-demo-layout">
            <aside className="lp-demo-sidebar">
              <div className="lp-demo-brand">Hgezli</div>
              <div className="lp-demo-nav">
                <button className="active"><LayoutDashboard size={15}/>Overview</button>
                <button onClick={() => setTab("appointments")}><CalendarDays size={15}/>Calendar</button>
                <button onClick={() => setTab("appointments")}><CalendarDays size={15}/>Bookings</button>
                <button onClick={() => setTab("invoices")}><ReceiptText size={15}/>Invoices</button>
                <button onClick={() => setTab("customers")}><Users size={15}/>Customers</button>
                <button><FileText size={15}/>Services</button>
                <button><BarChart3 size={15}/>Reports</button>
                <button><Settings size={15}/>Settings</button>
              </div>
            </aside>
            <div className="lp-demo-main">
              <div className="lp-demo-tabs">
                {(["overview","appointments","invoices","customers"] as DemoTab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`lp-demo-tab ${tab === item ? "active" : ""}`}>{item[0].toUpperCase()+item.slice(1)}</button>)}
              </div>
              <div className="lp-demo-summary">
                <div className="lp-metric"><span>Appointments today</span><strong>18</strong></div>
                <div className="lp-metric"><span>Revenue</span><strong>EGP 14,280</strong></div>
                <div className="lp-metric"><span>New customers</span><strong>6</strong></div>
                <div className="lp-metric"><span>No-show rate</span><strong>3%</strong></div>
              </div>
              <div className="lp-demo-grids">
                <div className="lp-demo-panel">
                  <h3>{tab === "invoices" ? "Recent invoices" : tab === "customers" ? "Customer records" : "Upcoming appointments"}</h3>
                  <div className="lp-demo-table">
                    <div className="lp-demo-row text-[#78847c]">{headers.map((header) => <span key={header}>{header}</span>)}</div>
                    {rows.map((row) => <div className="lp-demo-row" key={row[0]}>{row.map((cell,index) => <span key={`${row[0]}-${index}`} className={index === 3 ? "lp-status" : ""}>{cell}</span>)}</div>)}
                  </div>
                </div>
                <div className="lp-demo-panel">
                  <h3>Today&apos;s snapshot</h3>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-[#9da69f]">
                    <div className="lp-card p-4"><strong className="block text-xl text-white">75%</strong><span>Occupancy</span></div>
                    <div className="lp-card p-4"><strong className="block text-xl text-white">5</strong><span>Open appointments</span></div>
                    <div className="lp-card p-4"><strong className="block text-xl text-white">12</strong><span>Completed</span></div>
                    <div className="lp-card p-4"><strong className="block text-xl text-white">2</strong><span>Walk-ins</span></div>
                  </div>
                  <p className="mt-5 text-xs leading-6 text-[#7f8982]">Switch between the tabs to preview the dummy appointment, invoice and customer experiences.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-3"><a href="#demo" className="lp-button lp-button-primary">Open live demo <ArrowRight size={16}/></a><a href="/signup" className="lp-button lp-button-secondary">Start with Hgezli <ArrowRight size={16}/></a></div>
      </div>
    </section>
  );
}
