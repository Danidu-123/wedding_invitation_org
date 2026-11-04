export const WEDDING = {
  groom: "Thinidu",
  bride: "Chenaji",
  dateLabel: "Thursday, 10 December 2026",
  shortDate: "10 · 12 · 2026",
  // All times are Sri Lanka time (UTC+05:30)
  celebrationStart: "2026-12-10T10:00:00+05:30",
  celebrationEnd: "2026-12-10T16:00:00+05:30",
  poruwa: "2026-12-10T10:10:00+05:30",
  poruwaLabel: "10:10 AM",
  timeLabel: "10:00 AM – 4:00 PM",
  // Must match v_deadline in the submit_rsvp database function
  rsvpDeadline: "2026-11-20T23:59:59+05:30",
  rsvpDeadlineLabel: "Friday, 20 November 2026",
  venue: {
    name: "Senuri Grand Castello",
    hall: "Emperor's Banquet",
    address: "Negombo Road, Divulapitiya",
    placeId: "ChIJyTnQvwnk4joRU9OajXvtzaA",
    lat: 7.226484,
    lng: 80.007129,
  },
  contacts: [
    { name: "Thinidu", display: "071 915 6368", phone: "94719156368" },
    { name: "Chenaji", display: "071 975 3056", phone: "94719753056" },
  ],
} as const;

const q = encodeURIComponent(`${WEDDING.venue.name}, Divulapitiya`);
export const MAPS = {
  open: `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${WEDDING.venue.placeId}`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${q}&destination_place_id=${WEDDING.venue.placeId}`,
  embed: `https://maps.google.com/maps?q=${WEDDING.venue.lat},${WEDDING.venue.lng}&z=15&output=embed`,
};

export const PHOTOS = [
  { src: "/photos/1.jpg", alt: "Thinidu and Chenaji taking a joyful selfie on the lawn", pos: "50% 40%" },
  { src: "/photos/2.jpg", alt: "Thinidu and Chenaji smiling at each other", pos: "50% 30%" },
  { src: "/photos/3.jpg", alt: "Thinidu and Chenaji posing together with a white bouquet", pos: "50% 25%" },
  { src: "/photos/4.jpg", alt: "Thinidu in a navy suit", pos: "50% 30%" },
  { src: "/photos/5.jpg", alt: "Chenaji touching Thinidu's face lovingly", pos: "50% 30%" },
  { src: "/photos/6.jpg", alt: "Chenaji in her white saree holding lotus flowers", pos: "50% 25%" },
] as const;

export type RsvpChoice = "accepted" | "maybe" | "declined";

export function rsvpOpen(now = Date.now()) {
  return now <= new Date(WEDDING.rsvpDeadline).getTime();
}
