---
title: Tor Traffic Flow
description: A watch-first visualisation. Glowing particles and afterimages trace Tor's two traffic paths: a .onion connection where both sides build a 3-hop circuit and meet at a rendezvous point, and a clear web connection that goes 3 hops to an exit and back.
icon: material/lan
social:
  cards: false
og:
  enabled: true
  image: https://assets.anoni.net/games/onion-rendezvous-en.png
  image_width: 2560
  image_height: 1440
---

# :material-lan: Tor Traffic Flow

![The Tor Traffic Flow scene, with glowing curves weaving across a dark background, white rendezvous points and red harmful nodes scattered among them](https://assets.anoni.net/games/onion-rendezvous-flow-en.webp){style="border-radius: 10px;box-shadow:1px 1px 0.6rem #00aeff;"}

The one work you can just watch. What runs on screen are Tor's two traffic paths, drawn with small glowing particles and afterimages so you can see which stops a packet is moving between.

<a href="../../games/onion-rendezvous/play/index.html?lang=en" class="md-button md-button--primary">:octicons-arrow-right-24: Watch</a>

## The two paths

Both kinds of traffic run through 3 relays. The difference is in the second half.

For a .onion service, you and the service each build a 3-hop circuit and meet at a randomly chosen rendezvous point, 6 hops end to end. The rendezvous point only forwards; it cannot see what the two sides exchange, and neither side knows the other's real location. On screen your circuit runs cyan and the service's circuit runs purple, and the white dot where they meet is the rendezvous point.

For a clear web site there is only one circuit. You go 3 hops to an exit, the exit reaches the site directly, and the response returns the same way. This one runs green, and the comet with a bright head on the return leg is the response coming back.

The red nodes are relays already flagged as harmful, and circuits route around them.

## Four things you can adjust

The sliders in the lower left take effect immediately:

- **Relay nodes**: how many relays are available on the field
- **Circuits**: how many connections run at once
- **Harmful nodes**: how many red nodes there are, so you can watch circuits avoid them
- **Traffic**: particle density and speed

Clicking anywhere adds another connection, dragging pans the view, and scroll or pinch zooms.

## How it differs from real Tor

The work's own notes panel lists the same points; here they are as three.

Introduction points are left out. In reality a service publishes a list of introduction points, and before connecting you look up that list, choose a rendezvous point, and quietly tell the service through an introduction point. The scene drops that whole step to keep the picture clean.

Every connection re-draws all 3 hops. In real use your entry node (guard) stays fixed for weeks at a time and only the middle and exit change often. Re-drawing everything is what makes it possible to show many circuits at once.

Red nodes represent relays already flagged as problematic. Real Tor path selection only excludes nodes that have been flagged, and a malicious relay that has not been caught yet can still be picked. Tor's safety comes from splitting the path so that no single party can see both who you are and what you are connecting to.

## Further reading

- How Tor actually works: [What is Tor?](../tools/what-is-tor.md)
- Anonymity and what it does not cover: [Anonymity vs privacy](../basics/anonymity-vs-privacy.md)
- Getting through when Tor is blocked: [Tor Snowflake bridges](../tools/tor-snowflake.md)
- The other two works: [Interactive](index.md)

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://anoni.net/docs/games/onion-rendezvous/#work",
      "name": "Tor Traffic Flow",
      "alternateName": ["Tor 連線流量", "Tor 连线流量"],
      "url": "https://anoni.net/docs/games/onion-rendezvous/play/?lang=en",
      "mainEntityOfPage": "https://anoni.net/docs/en/games/onion-rendezvous/",
      "description": "A watch-first visualisation. Glowing particles and afterimages trace Tor's two traffic paths, with a .onion connection having both sides build a 3-hop circuit and meet at a randomly chosen rendezvous point.",
      "image": "https://assets.anoni.net/games/onion-rendezvous-en.png",
      "inLanguage": ["en", "zh-Hant", "zh-Hans"],
      "applicationCategory": "EducationalApplication",
      "browserRequirements": "A browser with WebGPU or WebGL2 support, no installation needed",
      "isAccessibleForFree": true,
      "license": "https://github.com/anoni-net/docs/blob/main/LICENSE",
      "author": { "@id": "https://anoni.net/#organization" },
      "publisher": { "@id": "https://anoni.net/#organization" },
      "isPartOf": { "@id": "https://anoni.net/docs/games/#collection" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Docs", "item": "https://anoni.net/docs/en/" },
        { "@type": "ListItem", "position": 2, "name": "Interactive", "item": "https://anoni.net/docs/en/games/" },
        { "@type": "ListItem", "position": 3, "name": "Tor Traffic Flow" }
      ]
    }
  ]
}
</script>
