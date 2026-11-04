import { WEDDING } from "@/lib/config";
import { STATUS_META, computeStats, formatPhone, type Guest } from "./guests";

const NAVY: [number, number, number] = [12, 26, 54];
const GOLD: [number, number, number] = [194, 161, 90];

export async function downloadGuestReport(guests: Guest[], filterLabel: string) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const s = computeStats(guests);

  // Header band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 110, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(40, 96, W - 40, 96);
  doc.setTextColor(...GOLD);
  doc.setFont("times", "italic");
  doc.setFontSize(26);
  doc.text(`${WEDDING.groom} & ${WEDDING.bride}`, W / 2, 48, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(240, 236, 226);
  doc.text(`${WEDDING.dateLabel}  ·  ${WEDDING.venue.name}, ${WEDDING.venue.address}`, W / 2, 70, { align: "center" });
  doc.setFontSize(8);
  doc.text(`Guest report — ${filterLabel}  ·  Generated ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Colombo" })}`, W / 2, 86, { align: "center" });

  // Summary
  const cards: [string, string][] = [
    ["Invitations", String(s.total)],
    ["Accepted", `${s.accepted} (${s.acceptedSeats} guests)`],
    ["Maybe", `${s.maybe} (${s.maybeSeats})`],
    ["Declined", String(s.declined)],
    ["No response", String(s.pending)],
  ];
  const cw = (W - 80) / cards.length;
  cards.forEach(([label, value], i) => {
    const x = 40 + i * cw;
    doc.setDrawColor(...GOLD);
    doc.roundedRect(x + 3, 128, cw - 6, 48, 4, 4, "S");
    doc.setTextColor(110, 110, 120);
    doc.setFontSize(7.5);
    doc.text(label.toUpperCase(), x + cw / 2, 144, { align: "center" });
    doc.setTextColor(...NAVY);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(value, x + cw / 2, 164, { align: "center" });
    doc.setFont("helvetica", "normal");
  });

  autoTable(doc, {
    startY: 196,
    margin: { left: 40, right: 40 },
    head: [["#", "Guest", "Phone", "Invited", "RSVP", "Attending", "Sent", "Message / notes"]],
    body: guests.map((g, i) => [
      i + 1,
      g.name,
      formatPhone(g.phone),
      g.invited_count,
      STATUS_META[g.rsvp].label,
      g.rsvp === "pending" ? "—" : (g.attendees ?? 0),
      g.invitation_sent ? "Yes" : "No",
      [g.message, g.notes].filter(Boolean).join(" · ") || "",
    ]),
    foot: [["", `Total: ${guests.length}`, "", s.invitedSeats, "", `${s.acceptedSeats} confirmed`, "", ""]],
    styles: { fontSize: 8.5, cellPadding: 5, textColor: [30, 35, 50], lineColor: [230, 224, 210], lineWidth: 0.5 },
    headStyles: { fillColor: NAVY, textColor: [234, 217, 172], fontStyle: "bold" },
    footStyles: { fillColor: [243, 238, 228], textColor: NAVY, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [251, 248, 242] },
    columnStyles: { 0: { cellWidth: 22 }, 3: { halign: "center" }, 5: { halign: "center" }, 6: { halign: "center" }, 7: { cellWidth: 130 } },
    didParseCell: (d) => {
      if (d.section === "body" && d.column.index === 4) {
        const c = { Accepted: [6, 95, 70], Maybe: [146, 64, 14], Declined: [159, 18, 57] }[String(d.cell.raw)];
        if (c) d.cell.styles.textColor = c as [number, number, number];
      }
    },
    didDrawPage: () => {
      const H = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${doc.getNumberOfPages()}`, W - 40, H - 20, { align: "right" });
      doc.text("Private — contains guest contact details", 40, H - 20);
    },
  });

  const slug = filterLabel.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`Thinidu-Chenaji-guests-${slug || "all"}.pdf`);
}
