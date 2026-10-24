/*
 * AGRO FARM – SITE SETTINGS
 * ------------------------------------------------------------
 * Edit this file to update contact details, products, gallery
 * photos and news. You do not need to touch index.html for this.
 *
 * Leave a value as "" (empty) if you don't have it yet – that
 * part is simply hidden or shown as "coming soon" on the site.
 */
window.FARM = {
  name: "Agro Farm",

  // WhatsApp number in international format, digits only, no "+".
  // Example for Nigeria: "2348012345678"
  whatsapp: "",

  phone: "",
  email: "",
  address: "",
  hours: "",

  // Full links to your pages, e.g. "https://facebook.com/yourpage"
  social: {
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: ""
  },

  currency: "₦",

  /*
   * PRODUCTS
   * price: a number (e.g. 25000) or null to show "Ask for price".
   * unit:  what the price is for (e.g. "per bag", "per bird").
   * type:  "crop", "livestock" or "produce" (chooses the icon).
   * image: optional – { base: "images/name", widths: [640, 1024] }
   *        (see "gallery" below). Leave null to show an icon.
   * The entries below are SAMPLES – replace with what you sell.
   */
  products: [
    { name: "Maize",             type: "crop",      unit: "",  price: null, description: "Dried and fresh maize from our fields.",   image: null },
    { name: "Cassava",           type: "crop",      unit: "",  price: null, description: "Fresh cassava tubers, harvested to order.", image: null },
    { name: "Yam",               type: "crop",      unit: "",  price: null, description: "Yam tubers, sorted and ready for delivery.", image: null },
    { name: "Fresh vegetables",  type: "produce",   unit: "",  price: null, description: "Seasonal vegetables picked fresh.",          image: null },
    { name: "Free-range chickens", type: "livestock", unit: "", price: null, description: "Healthy birds raised on the farm.",          image: null },
    { name: "Goats",             type: "livestock", unit: "", price: null, description: "Healthy goats raised on the farm.",          image: null }
  ],

  /*
   * GALLERY – "Our farm in action"
   * To add a photo: put the optimised .webp files in /images, named
   * like  harvest-640.webp  harvest-1024.webp, then set
   *   base: "images/harvest", widths: [640, 1024]
   * Entries with base: null show a "photo coming soon" tile.
   */
  gallery: [
    { base: "images/field",          widths: [640, 1024, 1366],       ratio: "3 / 2", alt: "Rows of green crops stretching towards the horizon at sunset", caption: "Crop cultivation" },
    { base: "images/maize-farmer",   widths: [480, 913],              ratio: "3 / 2", alt: "A farmer inspecting maize leaves in the field",               caption: "Caring for the crop" },
    { base: "images/harvest-basket", widths: [640, 1024, 1600, 2000], ratio: "3 / 2", alt: "A farmer holding a basket of maize, a pumpkin, potatoes and a cassava root", caption: "Fresh harvest" },
    { base: null, caption: "Planting" },
    { base: null, caption: "Feeding our animals" },
    { base: null, caption: "Sorting and packaging" }
  ],

  /*
   * NEWS – add items like:
   * { date: "2026-10-24", title: "Harvest season begins", text: "Short summary…" }
   */
  news: []
};
