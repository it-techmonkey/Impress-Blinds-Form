import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

// A 1x1 transparent PNG, used as a placeholder signature for the seeded demo order.
const BLANK_SIGNATURE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

async function main() {
  const { prisma } = await import("../src/lib/db");

  await prisma.order.create({
    data: {
      agentName: "Sam",
      customerName: "Mr & Mrs Grant",
      customerAddress: "2 Cow Close",
      customerPostcode: "LS12 5NZ",
      customerTel: "07802857543",
      customerMobile: "07802857543",
      orderDate: new Date("2026-09-20"),
      takeOldBlindsOff: true,
      measurerSignature: BLANK_SIGNATURE,
      customerSignature: BLANK_SIGNATURE,
      depositAmountPence: 7000,
      totalAmountPence: 21000,
      balanceDuePence: 14000,
      paymentMethod: "CARD",
      fittingDate: new Date("2026-10-02"),
      rows: {
        create: [
          { rowNumber: 1, area: "Lounge", widthMm: 1120, dropMm: 1818, comments: "Cloud White" },
          { rowNumber: 2, area: "Kitchen", widthMm: 815, dropMm: 1505, chainCordControl: "LW" },
        ],
      },
    },
  });

  console.log("Seeded one demo order.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
