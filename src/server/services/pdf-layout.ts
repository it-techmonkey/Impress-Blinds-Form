import { COMPANY_LETTERHEAD } from "@/lib/site";

export function drawPdfLetterhead(doc: PDFKit.PDFDocument, title: string): void {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const top = doc.page.margins.top;

  doc.font("Helvetica-Bold").fontSize(18).text(COMPANY_LETTERHEAD.name, left, top, { align: "left" });
  doc
    .font("Helvetica")
    .fontSize(8)
    .text(
      [
        ...COMPANY_LETTERHEAD.addressLines,
        `Free phone: ${COMPANY_LETTERHEAD.freePhone}`,
        `Mobile: ${COMPANY_LETTERHEAD.mobile}`,
        COMPANY_LETTERHEAD.email,
        COMPANY_LETTERHEAD.website,
      ].join("\n"),
      { align: "right", width: right - left }
    );

  const ruleY = doc.y + 6;
  doc.moveTo(left, ruleY).lineTo(right, ruleY).lineWidth(1).strokeColor("#999999").stroke();
  doc.strokeColor("black");
  doc.y = ruleY + 14;

  doc.font("Helvetica-Bold").fontSize(16).text(title, left, doc.y, { align: "center", width: right - left });
  doc.moveDown();
  doc.font("Helvetica").fontSize(10);
}

export function drawPdfSectionHeading(doc: PDFKit.PDFDocument, heading: string): void {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(11).text(heading, left, doc.y, { width: right - left, underline: true });
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(9);
}
