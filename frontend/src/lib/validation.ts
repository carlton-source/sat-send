import { z } from "zod";
import { MIN_TIP_AMOUNT, MAX_MESSAGE_LENGTH } from "./constants";

const STACKS_ADDRESS_REGEX = /^S[PM][0-9A-Z]{38,40}$/;

export const stacksAddressSchema = z
  .string()
  .min(1, "Recipient address is required")
  .regex(STACKS_ADDRESS_REGEX, "Invalid Stacks address format");