const testimonials = [
  ["Hgezli gave us a professional website, easier booking and a much calmer front desk.", "Reem Mansour", "Glow Beauty Lounge"],
  ["Appointments, staff and invoices used to live in separate places. Now the team has one clear workflow.", "Faisal Hassan", "Revive Salon"],
  ["The owner dashboard gives me clarity while reception and staff focus on clients.", "Lina Haddad", "Pure Skin Clinic"],
];

const faqs = [
  ["Is Hgezli suitable for both salons and clinics?", "Yes. The onboarding, templates and operations tools adapt to beauty, wellness and medical appointment businesses."],
  ["Can I import existing clients and services?", "The first version supports structured setup during onboarding. Import tools can be added as the migration workflow is finalised."],
  ["Does the live demo use real customer data?", "No. The landing-page demo uses dummy appointments, invoices and customers only."],
  ["Can I customise my website?", "Yes. You can choose a template, brand colour, images, content, sections and contact details."],
  ["Who can see the analytics?", "Owner analytics are restricted to the business owner. Staff and reception focus on operational pages."],
  ["Can I cancel later?", "Yes. The plan is designed without long-term lock-in."],
];

export function FinalCta() {
  return (
    <section className="lp-section lp-fade-section">
      <div className="lp-shell">
        <div className="text-center"><p className="lp-kicker">Trusted by early businesses</p><h2 className="lp-title">What businesses <span className="lp-accent-text">are saying.</span></h2></div>
        <div className="lp-testimonials">{testimonials.map(([quote,name,business]) => <article className="lp-card lp-testimonial" key={name}><blockquote>“{quote}”</blockquote><footer><strong className="text-[#e8ece8]">{name}</strong><br/>{business}</footer></article>)}</div>
        <div className="lp-faq"><div className="text-center"><p className="lp-kicker">FAQ</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em]">Honest answers to <span className="lp-accent-text">real questions.</span></h2></div><div className="mt-8">{faqs.map(([question,answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div>
      </div>
    </section>
  );
}
