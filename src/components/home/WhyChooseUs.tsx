import {
  Crosshair,
  Layers,
  PenTool,
  Repeat,
  Scan,
  Headphones,
} from "lucide-react"
import { Section } from "@/components/ui/Section"
import { Heading } from "@/components/ui/Heading"
import { Card } from "@/components/ui/Card"

const features = [
  {
    icon: Crosshair,
    title: "Crafted with Precision",
    description:
      "Every creation is printed with calibrated FDM technology for clean surface finish and dimensional accuracy — from tiny collectibles to large decor pieces.",
  },
  {
    icon: Layers,
    title: "Custom Orders at Any Scale",
    description:
      "One piece or a hundred — we deliver consistent quality across every run. Whether it's a custom gift or a brand order, each piece gets the same attention.",
  },
  {
    icon: PenTool,
    title: "Design Help, Free",
    description:
      "Have a sketch or just an idea? We help model, optimise, and prepare your design for print — no CAD experience needed, no extra charge for guidance.",
  },
  {
    icon: Repeat,
    title: "Fast Turns, Real Iterations",
    description:
      "From idea to your hands in as little as 48 hours. Quick design revisions, fitment checks, and refinements — we iterate until it's right.",
  },
  {
    icon: Scan,
    title: "Premium Finish, Every Time",
    description:
      "Every piece gets professional post-processing — sanding, priming, coating, and assembly. We deliver creations that look handcrafted, not just printed.",
  },
  {
    icon: Headphones,
    title: "Real Human Support",
    description:
      "A single point of contact from quote to delivery. Real-time updates, material advice, and transparent communication — no bots, no runaround.",
  },
]

export function WhyChooseUs() {
  return (
    <Section id="why-choose-us">
      <Heading
        eyebrow="Why Us"
        title="Why Creators Choose Us"
        subtitle="We're a custom 3D creation studio focused on precision, craftsmanship, and clean finishing — from personalized gifts to production-scale orders."
      />

      <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature) => (
          <Card key={feature.title} as="article" className="p-6 md:p-8">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 mb-5">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>

            <h3 className="text-base font-semibold text-foreground">
              {feature.title}
            </h3>

            <p className="mt-2 text-sm text-muted leading-relaxed">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  )
}
