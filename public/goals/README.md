# Goal banners

One picture per goal, named for the goal's slug. The rail shows a file the
moment it appears here — there is no code or data change to make, because
GoalsShowcase checks the filesystem and falls back to the drawn motif when a
file is missing.

    increase-revenue.jpg          charts / revenue
    automate-operations.jpg       automation, gears, workflow
    improve-customer-support.jpg  agents, chat, support
    make-better-decisions.jpg     a dashboard or analytics view

Shape: landscape, 4:3. Around 1200x900 is plenty — they render about 300px
wide. .jpg, .png and .webp all work; if you use a different extension, change
`image` for that goal in src/data/site.json to match.

The lower third of each picture is covered by a dark gradient carrying the
headline number in white, so keep faces and any text out of the bottom band.
