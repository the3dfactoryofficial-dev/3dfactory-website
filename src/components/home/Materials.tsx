import { Hexagon, Layers, Sparkles, Zap } from "lucide-react"
import { Section } from "@/components/ui/Section"
import { Heading } from "@/components/ui/Heading"
import { Card } from "@/components/ui/Card"

const materials = [
  {
    icon: Hexagon,
    name: "PLA+",
    tagline: "Everyday Precision",
    description:
      "High-quality PLA+ with excellent dimensional accuracy and a clean matte finish. Our primary material for decorative pieces, prototypes, and collectibles.",
    finish: "Matte, Consistent",
    strength: "High",
    detail: "Excellent",
    applications: ["Spiritual Decor", "Cosplay Props", "Collectibles", "Prototypes"],
  },
  {
    icon: Layers,
    name: "Matte PLA",
    tagline: "Premium Surface Quality",
    description:
      "Specialty matte PLA that reduces layer visibility for a smooth, almost injection-molded surface finish. Ideal for display-grade pieces.",
    finish: "Ultra-Matte, Smooth",
    strength: "Medium-High",
    detail: "Superior",
    applications: ["Display Models", "Desk Organizers", "Gifts", "Art Pieces"],
  },
  {
    icon: Sparkles,
    name: "Silk PLA",
    tagline: "Lustrous Metallic Sheen",
    description:
      "Silk PLA produces a beautiful satin-to-glossy finish with a subtle metallic shimmer. Perfect for premium decor and gift-grade prints.",
    finish: "Satin, Metallic Sheen",
    strength: "Medium",
    detail: "Excellent",
    applications: ["Premium Decor", "Gifts", "Jewelry", "Figurines"],
  },
  {
    icon: Zap,
    name: "Glow PLA",
    tagline: "Luminous Night Effect",
    description:
      "Photoluminescent PLA that charges under light and emits a soft glow in darkness. A unique material for ambient and specialty pieces.",
    finish: "Semi-Matte, Glow",
    strength: "Medium",
    detail: "Good",
    applications: ["Night Decor", "Spiritual Art", "Novelty Items", "Kids Rooms"],
  },
]

export function Materials() {
  return (
    <Section id="materials" dark>
      <Heading
        eyebrow="Materials"
        title="Materials We Print"
        subtitle="Every material is selected for its specific finish, strength, and application. We guide you to the right choice for your project."
      />

      <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {materials.map((material) => (
          <Card
            key={material.name}
            as="article"
            className="flex flex-col p-6 md:p-7"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <material.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {material.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {material.tagline}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted leading-relaxed">
              {material.description}
            </p>

            <div className="mt-5 pt-5 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Finish</span>
                <span className="text-foreground font-medium">{material.finish}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Strength</span>
                <span className="text-foreground font-medium">{material.strength}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Detail</span>
                <span className="text-foreground font-medium">{material.detail}</span>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2.5">
                Applications
              </p>
              <div className="flex flex-wrap gap-1.5">
                {material.applications.map((use) => (
                  <span
                    key={use}
                    className="inline-block px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase rounded-full bg-zinc-800 text-muted-foreground border border-border/50"
                  >
                    {use}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}
