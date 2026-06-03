import Decimal from "decimal.js";
import {
  convertToBase,
  convertFromBase,
  convert,
  calcPrice,
  getUnitPrice,
  areConvertible,
  getBaseType,
} from "../src/lib/units.js";
import { calculateQuotationLine } from "../src/lib/quotationMath.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

function assertDecimalEq(actual, expected, message) {
  const a = new Decimal(actual);
  const e = new Decimal(expected);
  assert(a.eq(e), `${message} — expected ${e}, got ${a}`);
}

function assertThrows(fn, message) {
  try {
    fn();
    assert(false, `${message} — expected to throw but did not`);
  } catch {
    assert(true, message);
  }
}

// ============================================================
console.log("\n🧪 Unit Conversion Engine — Test Suite\n");

// --- convertToBase ---
console.log("▸ convertToBase");
assertDecimalEq(convertToBase(1, "kg"), 1000, "1 kg = 1000 g");
assertDecimalEq(convertToBase(2.5, "kg"), 2500, "2.5 kg = 2500 g");
assertDecimalEq(convertToBase(500, "g"), 500, "500 g = 500 g");
assertDecimalEq(convertToBase(1, "L"), 1000, "1 L = 1000 mL");
assertDecimalEq(convertToBase(250, "mL"), 250, "250 mL = 250 mL");
assertDecimalEq(convertToBase(5, "unit"), 5, "5 unit = 5 unit");

// --- convertFromBase ---
console.log("\n▸ convertFromBase");
assertDecimalEq(convertFromBase(1000, "kg"), 1, "1000 g → 1 kg");
assertDecimalEq(convertFromBase(500, "g"), 500, "500 g → 500 g");
assertDecimalEq(convertFromBase(1000, "L"), 1, "1000 mL → 1 L");
assertDecimalEq(convertFromBase(250, "mL"), 250, "250 mL → 250 mL");

// --- convert (unit to unit) ---
console.log("\n▸ convert");
assertDecimalEq(convert(1, "kg", "g"), 1000, "1 kg → 1000 g");
assertDecimalEq(convert(1000, "g", "kg"), 1, "1000 g → 1 kg");
assertDecimalEq(convert(1, "L", "mL"), 1000, "1 L → 1000 mL");
assertDecimalEq(convert(500, "mL", "L"), 0.5, "500 mL → 0.5 L");

// --- areConvertible ---
console.log("\n▸ areConvertible");
assert(areConvertible("kg", "g") === true, "kg and g are convertible");
assert(areConvertible("L", "mL") === true, "L and mL are convertible");
assert(areConvertible("kg", "mL") === false, "kg and mL are NOT convertible");
assert(areConvertible("unit", "kg") === false, "unit and kg are NOT convertible");
assert(areConvertible("unit", "unit") === true, "unit and unit are convertible");

// --- Cross-type conversion should throw ---
console.log("\n▸ Cross-type errors");
assertThrows(() => convert(1, "kg", "mL"), "kg → mL throws");
assertThrows(() => convert(1, "unit", "kg"), "unit → kg throws");
assertThrows(() => convertToBase(1, "unknown_unit"), "Unknown unit throws");

// --- calcPrice ---
console.log("\n▸ calcPrice");
// Product base unit is kg, price ₹500/kg. Customer orders 2 kg.
assertDecimalEq(calcPrice(500, 2, "kg", "kg"), 1000, "₹500/kg × 2 kg = ₹1000");
// Product base unit is kg, price ₹500/kg. Customer orders 500 g.
assertDecimalEq(calcPrice(500, 500, "g", "kg"), 250, "₹500/kg × 500 g = ₹250");
// Product base unit is L, price ₹200/L. Customer orders 250 mL.
assertDecimalEq(calcPrice(200, 250, "mL", "L"), 50, "₹200/L × 250 mL = ₹50");
// Product base unit is unit, price ₹25/unit. Customer orders 3 units.
assertDecimalEq(calcPrice(25, 3, "unit", "unit"), 75, "₹25/unit × 3 units = ₹75");

// --- getUnitPrice ---
console.log("\n▸ getUnitPrice");
assertDecimalEq(getUnitPrice(500, "g", "kg"), 0.5, "₹500/kg → ₹0.5/g");
assertDecimalEq(getUnitPrice(500, "kg", "kg"), 500, "₹500/kg → ₹500/kg");
assertDecimalEq(getUnitPrice(200, "mL", "L"), 0.2, "₹200/L → ₹0.2/mL");

// --- High-precision edge cases ---
console.log("\n▸ Precision edge cases");
assertDecimalEq(calcPrice("0.00000001", 1, "kg", "kg"), "0.00000001", "Very small base price");
assertDecimalEq(calcPrice("99999999999.12345678", 1, "kg", "kg"), "99999999999.12345678", "Very large base price");
// 0.001 kg = 1 g, price ₹1000/kg → ₹1
assertDecimalEq(calcPrice(1000, "0.001", "kg", "kg"), 1, "₹1000/kg × 0.001 kg = ₹1");

// --- calculateQuotationLine ---
console.log("\n▸ calculateQuotationLine");
let line = calculateQuotationLine({ basePrice: 0.5, quantity: 1000, orderUnit: "g", productBaseUnit: "g" });
assertDecimalEq(line.baseQuantity, 1000, "1000 g order stores 1000 g base quantity");
assertDecimalEq(line.subtotal, 500, "₹0.5/g × 1000 g = ₹500");

line = calculateQuotationLine({ basePrice: 0.5, quantity: 1, orderUnit: "kg", productBaseUnit: "g" });
assertDecimalEq(line.baseQuantity, 1000, "1 kg order stores 1000 g base quantity");
assertDecimalEq(line.subtotal, 500, "₹0.5/g × 1 kg = ₹500");

line = calculateQuotationLine({ basePrice: 0.2, quantity: 250, orderUnit: "mL", productBaseUnit: "mL" });
assertDecimalEq(line.baseQuantity, 250, "250 mL order stores 250 mL base quantity");
assertDecimalEq(line.subtotal, 50, "₹0.2/mL × 250 mL = ₹50");

line = calculateQuotationLine({ basePrice: 0.2, quantity: 1, orderUnit: "L", productBaseUnit: "mL" });
assertDecimalEq(line.baseQuantity, 1000, "1 L order stores 1000 mL base quantity");
assertDecimalEq(line.subtotal, 200, "₹0.2/mL × 1 L = ₹200");

line = calculateQuotationLine({ basePrice: 12.5, quantity: 4, orderUnit: "unit", productBaseUnit: "unit" });
assertDecimalEq(line.baseQuantity, 4, "4 unit order stores 4 unit base quantity");
assertDecimalEq(line.subtotal, 50, "₹12.5/unit × 4 units = ₹50");

assertThrows(
  () => calculateQuotationLine({ basePrice: 1, quantity: 1, orderUnit: "kg", productBaseUnit: "mL" }),
  "Quotation line rejects cross-dimension units"
);

// ============================================================
console.log(`\n${"═".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log(`${"═".repeat(50)}\n`);

if (failed > 0) process.exit(1);
