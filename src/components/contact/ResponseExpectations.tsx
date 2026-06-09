import { Clock, MessageCircle, Truck, FileText } from "lucide-react"

const expectations = [
  {
    icon: Clock,
    title: "Reply within hours",
    description:
      "We typically respond to WhatsApp messages within 2-4 hours during business hours.",
  },
  {
    icon: MessageCircle,
    title: "Personal consultation",
    description:
      "Every inquiry gets a real conversation with a real person — no bots, no autoresponders.",
  },
  {
    icon: Truck,
    title: "Pan-India delivery",
    description:
      "We ship to all major cities and towns across India with trackable courier service.",
  },
  {
    icon: FileText,
    title: "Free quotes always",
    description:
      "Share your idea and we'll provide a detailed quote with no obligation to proceed.",
  },
]

export function ResponseExpectations() {
  return (
    <section className="pb-20 md:pb-28">
      <div className="container-main">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              What to Expect
            </h2>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              We believe in clear communication and fast responses. Here&apos;s
              how we handle every inquiry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expectations.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
