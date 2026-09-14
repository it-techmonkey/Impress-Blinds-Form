import PDFDocument from "pdfkit";
import type { MeasurementRow, Order } from "@/generated/prisma/client";
import { AGREEMENT_TEXT, COMPANY_LETTERHEAD, CUSTOMER_CONFIRMATION_TEXT, PAYMENT_METHOD_LABELS, TERMS_SMALL_PRINT } from "@/lib/site";
import { formatPence } from "@/lib/money";
import { drawPdfLetterhead, drawPdfSectionHeading } from "@/server/services/pdf-layout";

export type OrderForPdf = Order & { rows: MeasurementRow[] };

// A4 portrait with 40pt margins: usable width ≈ 515.28pt.
const LEFT = 40;
const RIGHT = 555.28;
const CONTENT_WIDTH = RIGHT - LEFT;

const INK = "#111827"; // gray-900
const BORDER = "#9ca3af"; // gray-400
const HAIRLINE = "#d1d5db"; // gray-300
const HEADER_FILL = "#f3f4f6"; // gray-100
const STRIPE_FILL = "#f9fafb"; // gray-50
const MUTED = "#6b7280"; // gray-500

const COL_W = {
  num: 20,
  area: 85,
  w: 38,
  d: 38,
  chain: 65,
  wand: 55,
  t: 18,
  ff: 18,
};
const COL_X = {
  num: LEFT,
  area: LEFT + COL_W.num,
  w: LEFT + COL_W.num + COL_W.area,
  d: LEFT + COL_W.num + COL_W.area + COL_W.w,
  chain: LEFT + COL_W.num + COL_W.area + COL_W.w + COL_W.d,
  wand: LEFT + COL_W.num + COL_W.area + COL_W.w + COL_W.d + COL_W.chain,
  t: LEFT + COL_W.num + COL_W.area + COL_W.w + COL_W.d + COL_W.chain + COL_W.wand,
  ff: LEFT + COL_W.num + COL_W.area + COL_W.w + COL_W.d + COL_W.chain + COL_W.wand + COL_W.t,
};
const COMMENTS_X = COL_X.ff + COL_W.ff;
const COL_BOUNDARIES = [
  COL_X.num,
  COL_X.area,
  COL_X.w,
  COL_X.d,
  COL_X.chain,
  COL_X.wand,
  COL_X.t,
  COL_X.ff,
  COMMENTS_X,
  RIGHT,
];

function drawLetterhead(doc: PDFKit.PDFDocument): void {
  drawPdfLetterhead(doc, "Measurement & Order Form");
}

function drawBox(doc: PDFKit.PDFDocument, x: number, y: number, width: number, height: number): void {
  doc.lineWidth(0.75).strokeColor(BORDER).rect(x, y, width, height).stroke();
  doc.strokeColor("black");
}

function drawCheckbox(doc: PDFKit.PDFDocument, x: number, y: number, checked: boolean, size = 9): void {
  doc.lineWidth(0.75).strokeColor(INK).rect(x, y, size, size).stroke();
  if (checked) {
    doc.save();
    doc.lineWidth(1.2).strokeColor(INK);
    doc.moveTo(x + 1.8, y + size / 2).lineTo(x + size / 2, y + size - 2).stroke();
    doc.moveTo(x + size / 2, y + size - 2).lineTo(x + size - 1.5, y + 1.5).stroke();
    doc.restore();
  }
}

function drawAgentAndCustomerBlock(doc: PDFKit.PDFDocument, order: OrderForPdf): void {
  drawPdfSectionHeading(doc, "Customer");
  const top = doc.y;
  const lineHeight = 13.5;
  const colWidth = CONTENT_WIDTH / 2;

  const leftLines = [
    ["Agent", order.agentName],
    ["Date", order.orderDate.toISOString().slice(0, 10)],
    ["Customer Name", order.customerName],
    ["Post Code", order.customerPostcode],
  ] as const;
  const rightLines = [
    ["Customer Address", order.customerAddress],
    ["Tel", order.customerTel],
    ["Mobile", order.customerMobile ?? "—"],
  ] as const;

  const boxHeight = Math.max(leftLines.length, rightLines.length) * lineHeight + 16;
  drawBox(doc, LEFT, top, CONTENT_WIDTH, boxHeight);
  doc.moveTo(LEFT + colWidth, top).lineTo(LEFT + colWidth, top + boxHeight).lineWidth(0.5).strokeColor(HAIRLINE).stroke();
  doc.strokeColor("black");

  doc.fontSize(8.5).fillColor(INK);
  let y = top + 8;
  for (const [label, value] of leftLines) {
    doc.font("Helvetica-Bold").fillColor(MUTED).text(`${label}: `, LEFT + 10, y, { continued: true, width: colWidth - 20 });
    doc.font("Helvetica").fillColor(INK).text(value);
    y += lineHeight;
  }
  y = top + 8;
  for (const [label, value] of rightLines) {
    doc.font("Helvetica-Bold").fillColor(MUTED).text(`${label}: `, LEFT + colWidth + 10, y, { continued: true, width: colWidth - 20 });
    doc.font("Helvetica").fillColor(INK).text(value);
    y += lineHeight;
  }
  doc.fillColor("black");
  doc.y = top + boxHeight + 10;
}

function drawMeasurementsTableHeader(doc: PDFKit.PDFDocument, y: number): number {
  const height = 16;
  doc.rect(LEFT, y, CONTENT_WIDTH, height).fill(HEADER_FILL);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(6.8);
  doc.text("#", COL_X.num + 2, y + 5, { width: COL_W.num - 3 });
  doc.text("Area", COL_X.area + 3, y + 5, { width: COL_W.area - 5 });
  doc.text("W (mm)", COL_X.w + 2, y + 5, { width: COL_W.w - 3 });
  doc.text("D (mm)", COL_X.d + 2, y + 5, { width: COL_W.d - 3 });
  doc.text("Chain & Cord", COL_X.chain + 2, y + 5, { width: COL_W.chain - 3 });
  doc.text("Wand", COL_X.wand + 2, y + 5, { width: COL_W.wand - 3 });
  doc.text("T", COL_X.t, y + 5, { width: COL_W.t, align: "center" });
  doc.text("FF", COL_X.ff, y + 5, { width: COL_W.ff, align: "center" });
  doc.text("Comments", COMMENTS_X + 3, y + 5, { width: RIGHT - COMMENTS_X - 5 });
  doc.font("Helvetica").fontSize(8);
  return y + height;
}

function drawGrid(doc: PDFKit.PDFDocument, top: number, bottom: number, rowYs: number[]): void {
  doc.lineWidth(0.5).strokeColor(HAIRLINE);
  for (const x of COL_BOUNDARIES) {
    doc.moveTo(x, top).lineTo(x, bottom).stroke();
  }
  for (const y of [top, ...rowYs, bottom]) {
    doc.moveTo(COL_BOUNDARIES[0], y).lineTo(COL_BOUNDARIES[COL_BOUNDARIES.length - 1], y).stroke();
  }
  doc.lineWidth(0.75).strokeColor(BORDER).rect(LEFT, top, CONTENT_WIDTH, bottom - top).stroke();
  doc.strokeColor("black");
}

function drawMeasurementsTable(doc: PDFKit.PDFDocument, rows: MeasurementRow[]): void {
  drawPdfSectionHeading(doc, "Measurements");

  const contentBottom = doc.page.height - doc.page.margins.bottom - 20;
  let tableTop = doc.y;
  let y = drawMeasurementsTableHeader(doc, tableTop);
  let rowYs: number[] = [];
  const commentsWidth = RIGHT - COMMENTS_X - 5;

  rows.forEach((row, index) => {
    const rowHeight = Math.max(15, doc.heightOfString(row.comments ?? "", { width: commentsWidth }) + 6);
    if (y + rowHeight > contentBottom) {
      drawGrid(doc, tableTop, y, rowYs);
      doc.addPage();
      drawLetterhead(doc);
      tableTop = doc.y;
      y = drawMeasurementsTableHeader(doc, tableTop);
      rowYs = [];
    }
    if (index % 2 === 1) {
      doc.rect(LEFT, y, CONTENT_WIDTH, rowHeight).fill(STRIPE_FILL);
      doc.fillColor("black");
    }
    doc.fillColor(INK).fontSize(7.8);
    const textY = y + 4;
    doc.text(String(row.rowNumber), COL_X.num + 2, textY, { width: COL_W.num - 3 });
    doc.text(row.area, COL_X.area + 3, textY, { width: COL_W.area - 5 });
    doc.text(String(row.widthMm), COL_X.w + 2, textY, { width: COL_W.w - 3 });
    doc.text(String(row.dropMm), COL_X.d + 2, textY, { width: COL_W.d - 3 });
    doc.text(row.chainCordControl ?? "", COL_X.chain + 2, textY, { width: COL_W.chain - 3 });
    doc.text(row.wandControl ?? "", COL_X.wand + 2, textY, { width: COL_W.wand - 3 });
    doc.text(row.control === "T" ? "✓" : "", COL_X.t, textY, { width: COL_W.t, align: "center" });
    doc.text(row.control === "FF" ? "✓" : "", COL_X.ff, textY, { width: COL_W.ff, align: "center" });
    doc.text(row.comments ?? "", COMMENTS_X + 3, textY, { width: commentsWidth });
    y += rowHeight;
    rowYs.push(y);
  });
  rowYs.pop();
  drawGrid(doc, tableTop, y, rowYs);
  doc.fillColor("black").fontSize(9);
  doc.y = y + 12;
}

function drawTakeOldBlindsOffFlag(doc: PDFKit.PDFDocument, takeOldBlindsOff: boolean): void {
  const y = doc.y;
  drawCheckbox(doc, LEFT, y, takeOldBlindsOff);
  doc.fontSize(9).font("Helvetica-Bold").fillColor(INK).text("Please Take Old Blinds Off", LEFT + 16, y);
  doc.font("Helvetica").fillColor("black");
  doc.y = y + 20;
}

function drawSignatureBox(doc: PDFKit.PDFDocument, x: number, y: number, width: number, label: string, dataUrl: string): number {
  doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text(label, x, y, { width });
  doc.fillColor("black");
  const imgTop = doc.y + 4;
  const boxHeight = 60;
  drawBox(doc, x, imgTop, width, boxHeight);
  try {
    const base64 = dataUrl.split(",")[1] ?? "";
    const buffer = Buffer.from(base64, "base64");
    doc.image(buffer, x + 4, imgTop + 4, { fit: [width - 8, boxHeight - 8] });
  } catch {
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text("(signature unavailable)", x + 6, imgTop + boxHeight / 2 - 4);
    doc.fillColor("black");
  }
  doc.font("Helvetica");
  return imgTop + boxHeight;
}

function drawSignaturesAndAgreement(doc: PDFKit.PDFDocument, order: OrderForPdf): void {
  const colWidth = (CONTENT_WIDTH - 16) / 2;
  const rightX = LEFT + colWidth + 16;
  const startY = doc.y;

  const measurerBottom = drawSignatureBox(doc, LEFT, startY, colWidth, "Measurer Signature", order.measurerSignature);

  doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text("Agreement", rightX, startY, { width: colWidth, underline: true });
  doc.fillColor("black").font("Helvetica").fontSize(6.8);
  for (const line of AGREEMENT_TEXT) {
    doc.text(line, rightX, doc.y, { width: colWidth });
  }
  doc.moveDown(0.3);
  doc.font("Helvetica-Bold").fontSize(7.3).fillColor(INK).text(CUSTOMER_CONFIRMATION_TEXT, rightX, doc.y, { width: colWidth });
  doc.font("Helvetica").fontSize(9).fillColor("black");
  doc.moveDown(0.3);
  const customerBottom = drawSignatureBox(doc, rightX, doc.y, colWidth, "Customer Signature", order.customerSignature);

  doc.y = Math.max(measurerBottom, customerBottom) + 12;
}

function drawFinancialsFooter(doc: PDFKit.PDFDocument, order: OrderForPdf): void {
  drawPdfSectionHeading(doc, "Payment");

  const bankBoxWidth = 210;
  const top = doc.y;
  const bankLines = [
    `Account Number: ${COMPANY_LETTERHEAD.bankDetails.accountNumber}`,
    `Sort Code: ${COMPANY_LETTERHEAD.bankDetails.sortCode}`,
  ];
  const boxHeight = bankLines.length * 12.5 + 34;
  drawBox(doc, LEFT, top, bankBoxWidth, boxHeight);
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(INK).text("Bank Details", LEFT + 8, top + 6);
  doc.font("Helvetica").fontSize(8.3).fillColor("black");
  let by = top + 19;
  for (const line of bankLines) {
    doc.text(line, LEFT + 8, by);
    by += 12.5;
  }
  doc.font("Helvetica-Bold").fontSize(7.8).text("We do not accept cheques.", LEFT + 8, by);
  doc.font("Helvetica");

  const figuresX = LEFT + bankBoxWidth + 20;
  const figuresWidth = CONTENT_WIDTH - bankBoxWidth - 20;
  doc.fontSize(8.8);
  doc.text(`Deposit: ${formatPence(order.depositAmountPence)}`, figuresX, top + 2, { width: figuresWidth });
  doc.text(`Total: ${formatPence(order.totalAmountPence)}`, figuresX, doc.y + 2, { width: figuresWidth });
  doc.font("Helvetica-Bold").text(`Balance Due: ${formatPence(order.balanceDuePence)}`, figuresX, doc.y + 2, { width: figuresWidth });
  doc.font("Helvetica").text(`Fitting Date: ${order.fittingDate ? order.fittingDate.toISOString().slice(0, 10) : "—"}`, figuresX, doc.y + 2, { width: figuresWidth });

  doc.y = top + boxHeight + 14;

  doc.fontSize(9).font("Helvetica-Bold").fillColor(INK).text("Payment Method", LEFT, doc.y);
  doc.fillColor("black").font("Helvetica");
  doc.moveDown(0.3);
  const methodY = doc.y;
  const groupWidth = CONTENT_WIDTH / 3;
  (["CARD", "BT", "CASH"] as const).forEach((method, i) => {
    const x = LEFT + i * groupWidth;
    drawCheckbox(doc, x, methodY, order.paymentMethod === method, 9);
    doc.fontSize(9).text(PAYMENT_METHOD_LABELS[method], x + 14, methodY);
  });
  doc.y = methodY + 20;
}

function drawSmallPrint(doc: PDFKit.PDFDocument): void {
  doc.moveDown(0.4);
  doc.fontSize(6).fillColor(MUTED);
  for (const line of TERMS_SMALL_PRINT) {
    doc.text(line, LEFT, doc.y, { width: CONTENT_WIDTH });
  }
  doc.fillColor("black");
}

export function buildOrderPdf(order: OrderForPdf): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4", bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawLetterhead(doc);
    doc.fontSize(9).fillColor(MUTED).text(`Job #${order.jobNumber}`, { align: "right" });
    doc.fillColor("black");
    drawAgentAndCustomerBlock(doc, order);
    drawMeasurementsTable(doc, order.rows);
    drawTakeOldBlindsOffFlag(doc, order.takeOldBlindsOff);
    drawSignaturesAndAgreement(doc, order);
    drawFinancialsFooter(doc, order);
    drawSmallPrint(doc);

    doc.end();
  });
}
