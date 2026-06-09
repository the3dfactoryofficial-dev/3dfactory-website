import Image from "next/image"
import { Globe, Heart, Play, Camera } from "lucide-react"
import Link from "next/link"
import { Section } from "@/components/ui/Section"
import { Heading } from "@/components/ui/Heading"
import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import { getBlurBackgroundStyle } from "@/lib/media/placeholders"

const stats = [
  { icon: Globe, label: "Followers", value: "2.4K+" },
  { icon: Camera, label: "Projects Delivered", value: "500+" },
  { icon: Play, label: "Reel Views", value: "1M+" },
  { icon: Heart, label: "Satisfaction", value: "98%" },
] as const

const posts = [
  {
    image: "/images/products/ShivaGlow.jpeg",
    caption: "Glow-in-the-dark Shiva — perfect for ambient night decor",
    likes: "342",
  },
  {
    image: "/images/products/ChromiumHanuman.jpg",
    caption: "Chromium-finished Hanuman — a custom decor piece ready for delivery",
    likes: "891",
  },
  {
    image: "/images/products/Mew2-1.jpg",
    caption: "Mewtwo armor figure — assembly in progress for a fellow collector",
    likes: "567",
  },
  {
    image: "/images/products/CustomGun-1.jpg",
    caption: "Custom mechanical prototype — precision fitment for a client build",
    likes: "234",
  },
  {
    image: "/images/products/IronManMask.jpeg",
    caption: "Iron Man mask — sanded and primed, ready for its final paint job",
    likes: "423",
  },
  {
    image: "/images/products/Gengar-1.jpg",
    caption: "Articulated Gengar — fully assembled and posed for display",
    likes: "178",
  },
]

export function InstagramTrust() {
  return (
    <Section id="instagram">
      <Heading
        eyebrow="Instagram"
        title="Follow Our Work on Instagram"
        subtitle="We share custom builds, timelapses, customer deliveries, and behind-the-scenes content daily. See our craft in action."
      />

      <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-surface border border-border/50"
          >
            <stat.icon className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold text-foreground">
              {stat.value}
            </span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 md:mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {posts.map((post) => (
          <Card
            key={post.caption}
            className="group aspect-square relative overflow-hidden"
            style={getBlurBackgroundStyle(post.image)}
            hover
          >
            <Image
              src={post.image}
              alt={post.caption}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-opacity duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-[10px] leading-tight text-white/80 line-clamp-2">
                {post.caption}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <Heart className="w-3 h-3 text-rose-400" />
                <span className="text-[10px] text-white/60">{post.likes}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-10 md:mt-14 text-center">
        <Link
          href="https://www.instagram.com/3d_factory___/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center justify-center gap-2.5 h-13 px-8 text-base font-medium rounded-lg",
            "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white",
            "hover:brightness-110 active:scale-[0.97]",
            "transition-all duration-200"
          )}
        >
          <Globe className="w-5 h-5" />
          <span>Follow Our Journey</span>
        </Link>
      </div>
    </Section>
  )
}
