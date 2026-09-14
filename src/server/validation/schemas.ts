import { z } from "zod";

export const measurementRowSchema = z.object({
  rowNumber: z.number().int().positive(),
  area: z.string().min(1, "Area is required"),
  widthMm: z.number().int().positive("Width must be greater than 0"),
  dropMm: z.number().int().positive("Drop must be greater than 0"),
  chainCordControl: z.string().max(20).optional(),
  wandControl: z.string().max(20).optional(),
  control: z.enum(["T", "FF"]).optional(),
  comments: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  agentName: z.string().min(1, "Agent is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerAddress: z.string().min(1, "Customer address is required"),
  customerPostcode: z.string().min(1, "Post code is required"),
  customerTel: z.string().min(1, "Telephone number is required"),
  customerMobile: z.string().max(40).optional(),
  orderDate: z.string().datetime(),
  takeOldBlindsOff: z.boolean(),
  measurerSignature: z.string().startsWith("data:image/png;base64,", "Measurer signature is required"),
  customerSignature: z.string().startsWith("data:image/png;base64,", "Customer signature is required"),
  depositAmountPence: z.number().int().nonnegative(),
  totalAmountPence: z.number().int().nonnegative(),
  balanceDuePence: z.number().int().nonnegative(),
  paymentMethod: z.enum(["CARD", "BT", "CASH"]).optional(),
  fittingDate: z.string().datetime().optional(),
  rows: z.array(measurementRowSchema).min(1, "At least one measurement row is required"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type MeasurementRowInput = z.infer<typeof measurementRowSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
