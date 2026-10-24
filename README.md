# Agro Farm website

Static website (no build step). Open `index.html` or host the folder on GitHub Pages, Netlify, etc.

## Updating content
Edit `js/config.js`: WhatsApp number, phone, email, address, social links, products and prices, gallery photos, news.

## Adding photos
Save optimised WebP files in `images/` as `name-640.webp`, `name-1024.webp`, `name-1600.webp`, then reference `base: "images/name"` and `widths: [640, 1024, 1600]` in `js/config.js`. Only use photos you own or are licensed to use.

## Hero slideshow
The three hero slides are in `index.html` (`<section class="hero">`). Copy a `<figure class="slide">` block to add more; dots and arrows appear automatically.
