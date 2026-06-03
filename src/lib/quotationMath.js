import Decimal from "decimal.js";
import { areConvertible, calcPrice, convertToBase, getBaseType } from "./units.js";

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export function safeDecimal(value) {
  try {
    const v = typeof value === "string" ? value.trim() : value;
    if (v === "" || v === "." || v === "-" || v === "+") return new Decimal(0);
    return new Decimal(v || 0);
  } catch (error) {
    return new Decimal(0);
  }
}

export function toDecimalString(value, places = 12) {
  return safeDecimal(value).toDecimalPlaces(places).toFixed();
}

export function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function calculateQuotationLine({
  basePrice,
  quantity,
  orderUnit,
  productBaseUnit,
}) {
  const orderedQuantity = safeDecimal(quantity);

  if (!orderedQuantity.isFinite() || orderedQuantity.lte(0)) {
    throw new Error("Quantity must be greater than zero.");
  }

  if (!areConvertible(orderUnit, productBaseUnit)) {
    throw new Error(`Cannot order ${orderUnit} against product base unit ${productBaseUnit}.`);
  }

  const baseQuantity = convertToBase(orderedQuantity, orderUnit);
  const subtotal = calcPrice(basePrice, orderedQuantity, orderUnit, productBaseUnit);
  const unitPrice = subtotal.dividedBy(orderedQuantity);

  return {
    quantity: toDecimalString(orderedQuantity),
    baseQuantity: toDecimalString(baseQuantity),
    baseUnitAbbr: getBaseType(orderUnit),
    unitPrice: toDecimalString(unitPrice),
    subtotal: toDecimalString(subtotal),
  };
}
