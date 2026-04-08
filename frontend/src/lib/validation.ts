import { z } from "zod";
import { MIN_TIP_AMOUNT, MAX_MESSAGE_LENGTH } from "./constants";

const STACKS_ADDRESS_REGEX = /^S[PM][0-9A-Z]{38,40}$/;

export const stacksAddressSchema = z
  .string()
  .min(1, "Recipient address is required")
  .regex(STACKS_ADDRESS_REGEX, "Invalid Stacks address format");

  export const tipAmountSchema = z
  .number({ message: "Amount must be a number" })
  .positive("Amount must be greater than 0")
  .min(MIN_TIP_AMOUNT, `Minimum tip is ${MIN_TIP_AMOUNT} STX`);

  export const tipMessageSchema = z
  .string()
  .max(MAX_MESSAGE_LENGTH, `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`)
  .optional();