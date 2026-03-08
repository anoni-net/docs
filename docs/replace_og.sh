# output 結構已改為依年份 blog/YYYY/MM/
# rightscon25-pre-event (slug: rightscon25-tor-tails-ooni) -> 2025/02
# g0v-hackath65n -> 2025/02
# rightscon25-tor-tails-ooni-after -> 2025/03

for base in ./output ./output/zh-tw ./output/en; do
  [ -d "$base" ] || continue
  mkdir -p "$base/assets/images/social/blog/2025/02" "$base/assets/images/social/blog/2025/03"
done

wget -q https://s3.toomore.net/ocf/tor-pre-event-zh-tw.png -O ./output/assets/images/social/blog/2025/02/rightscon25-tor-tails-ooni.png
[ -d ./output/zh-tw ] && wget -q https://s3.toomore.net/ocf/tor-pre-event-zh-tw.png -O ./output/zh-tw/assets/images/social/blog/2025/02/rightscon25-tor-tails-ooni.png
[ -d ./output/en ] && wget -q https://s3.toomore.net/ocf/tor-pre-event.png -O ./output/en/assets/images/social/blog/2025/02/rightscon25-tor-tails-ooni.png

for base in ./output ./output/zh-tw ./output/en; do
  [ -d "$base" ] || continue
  [ -f "$base/blog/assets/images/g0v-hackath65n.webp" ] && cp "$base/blog/assets/images/g0v-hackath65n.webp" "$base/assets/images/social/blog/2025/02/g0v-hackath65n.png"
  [ -f "$base/blog/assets/images/tor-tails-workshop-slide.webp" ] && cp "$base/blog/assets/images/tor-tails-workshop-slide.webp" "$base/assets/images/social/blog/2025/03/rightscon25-tor-tails-ooni-after.png"
done
