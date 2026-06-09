import { Cog, Layers, Zap, Timer, ShieldCheck, Ruler } from "lucide-react"
import { Section } from "@/components/ui/Section"
import { Heading } from "@/components/ui/Heading"
import { Card } from "@/components/ui/Card"

const capabilities = [
  {
    icon: Layers,
    title: "FDM Printing",
    specs: ["0.1mm layer height", "PLA / PETG / ABS / TPU", "Up to 300×300×400mm"],
  },
  {
    icon: Zap,
    title: "Resin Printing",
    specs: ["0.025mm layer height", "Standard / Tough / Flexible", "High-detail miniatures & jewelry"],
  },
  {
    icon: Cog,
    title: "Post-Processing",
    specs: ["Sanding & priming", "Custom paint & finish", "Chrome / glow / matte coatings"],
  },
  {
    icon: Ruler,
    title: "Design Support",
    specs: ["STL / OBJ / 3MF accepted", "Design review & optimization", "Iterative prototyping"],
  },
]

const guarantees = [
  { icon: Timer, label: "3–5 Day Turnaround" },
  { icon: ShieldCheck, label: "Quality Guarantee" },
]

export function ManufacturingCapabilities() {
  return (
    <Section id="capabilities">
      <Heading
        eyebrow="Process"
        title="How We Build"
        subtitle="Industrial-grade FDM and resin printing with full post-processing capabilities — from digital file to finished product."
      />

      <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {capabilities.map((cap) => {
          const Icon = cap.icon
          return (
            <Card key={cap.title} hover>
              <div className="p-6 md:p-7">
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 text-primary mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {cap.title}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {cap.specs.map((spec) => (
                    <li
                      key={spec}
                      className="text-sm text-muted leading-relaxed flex items-start gap-2"
                    >
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
        {guarantees.map((g) => {
          const Icon = g.icon
          return (
            <span
              key={g.label}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <Icon className="w-4 h-4 text-primary" />
              {g.label}
            </span>
          )
        })}
      </div>
    </Section>
  )
}