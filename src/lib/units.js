import Decimal from "decimal.js";

// ============================================================
// Unit Conversion Engine — aasamedchem
//
// Canonical base units:
//   Weight → grams (g)
//   Volume → millilitres (mL)
//   Count  → unit/count
// ============================================================

/**
 * Conversion factor map.
 * Each unit maps to its canonical base and the factor to multiply by
 * to get the base unit value.
 *
 *   qty_in_base = qty × factor
 */
export const UNIT_MAP = {
  // Weight
  kg:  { base: "g",   factor: "1000" },
  g:   { base: "g",   factor: "1" },

  // Volume
  L:   { base: "mL",  factor: "1000" },
  mL:  { base: "mL",  factor: "1" },

  // Count
  unit: { base: "unit", factor: "1" },
  pcs:  { base: "unit", factor: "1" },
};

/**
 * Returns the unit type family ("g", "mL", "pcs", etc.)
 */
export function getBaseType(unitAbbr) {
  const entry = UNIT_MAP[unitAbbr];
  if (!entry) throw new Error(`Unknown unit: "${unitAbbr}"`);
  return entry.base;
}

/**
 * Check if two units are in the same convertible family
 * (e.g. kg and g are both in "g" family).
 * Count units use the same "unit" family and do not convert across dimensions.
 */
export function areConvertible(unitA, unitB) {
  return getBaseType(unitA) === getBaseType(unitB);
}

/**
 * Convert a quantity from the given unit to the canonical base unit.
 *
 * @param {string|number} qty  — the quantity
 * @param {string} unitAbbr    — e.g. "kg", "g", "mL"
 * @returns {Decimal} quantity in canonical base unit
 */
export function convertToBase(qty, unitAbbr) {
  const entry = UNIT_MAP[unitAbbr];
  if (!entry) throw new Error(`Unknown unit: "${unitAbbr}"`);
  return new Decimal(qty).times(entry.factor);
}

/**
 * Convert a quantity FROM the canonical base unit TO a target unit.
 *
 * @param {string|number} baseQty  — quantity in canonical base
 * @param {string} targetUnitAbbr  — e.g. "kg", "mg"
 * @returns {Decimal} quantity in target unit
 */
export function convertFromBase(baseQty, targetUnitAbbr) {
  const entry = UNIT_MAP[targetUnitAbbr];
  if (!entry) throw new Error(`Unknown unit: "${targetUnitAbbr}"`);
  return new Decimal(baseQty).dividedBy(entry.factor);
}

/**
 * Convert a quantity from one unit to another (same family only).
 *
 * @param {string|number} qty
 * @param {string} fromUnit
 * @param {string} toUnit
 * @returns {Decimal}
 */
export function convert(qty, fromUnit, toUnit) {
  if (!areConvertible(fromUnit, toUnit)) {
    throw new Error(`Cannot convert between "${fromUnit}" and "${toUnit}" — different unit types.`);
  }
  const baseQty = convertToBase(qty, fromUnit);
  return convertFromBase(baseQty, toUnit);
}

/**
 * Calculate the total price for a given quantity + unit,
 * based on a known price per base unit.
 *
 * @param {string|number} basePricePerBaseUnit — price for 1 unit of the product's base unit
 * @param {string|number} qty                  — how many of `orderUnit` the customer wants
 * @param {string} orderUnit                   — the unit the customer is ordering in (e.g. "kg")
 * @param {string} productBaseUnit             — the product's base unit (e.g. "g")
 * @returns {Decimal} total price
 */
export function calcPrice(basePricePerBaseUnit, qty, orderUnit, productBaseUnit) {
  if (!areConvertible(orderUnit, productBaseUnit)) {
    throw new Error(`Cannot calculate price: "${orderUnit}" and "${productBaseUnit}" are different unit types.`);
  }
  // Convert ordered qty to the product's base unit
  const qtyInBase = convertToBase(qty, orderUnit);
  const qtyInProductUnit = convertFromBase(qtyInBase, productBaseUnit);
  return new Decimal(basePricePerBaseUnit).times(qtyInProductUnit);
}

/**
 * Get the price for 1 unit of targetUnit, given the price per 1 productBaseUnit.
 *
 * Example: base price is ₹500/kg → getUnitPrice(500, "g", "kg") → ₹0.5/g
 *
 * @param {string|number} basePricePerBaseUnit
 * @param {string} targetUnit     — the unit to get the price for
 * @param {string} productBaseUnit — the product's base unit
 * @returns {Decimal}
 */
export function getUnitPrice(basePricePerBaseUnit, targetUnit, productBaseUnit) {
  return calcPrice(basePricePerBaseUnit, 1, targetUnit, productBaseUnit);
}
