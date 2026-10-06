import { calculatePedidoRango } from './src/services/pedidoService.js';

console.log('===================================================');
console.log('   VERIFICACIÓN MÓDULO 2 - PEDIDOS DE COMPRA');
console.log('===================================================\n');

// 1. Helper to construct zeroed averages table
function createEmptyAverages() {
  return {
    weekday: {
      PERSONAL: { almuerzo: 0, cena: 0 },
      REGIMEN_NORMAL: { almuerzo: 0, cena: 0 },
      REGIMEN_DIABETICO: { almuerzo: 0, cena: 0 },
      REGIMEN_HEPATICO: { almuerzo: 0, cena: 0 },
    },
    weekend: {
      PERSONAL: { almuerzo: 0, cena: 0 },
      REGIMEN_NORMAL: { almuerzo: 0, cena: 0 },
      REGIMEN_DIABETICO: { almuerzo: 0, cena: 0 },
      REGIMEN_HEPATICO: { almuerzo: 0, cena: 0 },
    },
  };
}

// --------------------------------------------------------------------------
// TEST 1: Rango de 1 día (día de semana: 2026-09-17, Jueves).
// Solo Personal Autorizado almuerzo semana = 10, todo lo demás en 0.
// --------------------------------------------------------------------------
console.log('--- TEST 1: Día de semana (2026-09-17) | Personal Almuerzo Semana = 10, Cena = 0 ---');
const averagesTest1 = createEmptyAverages();
averagesTest1.weekday.PERSONAL.almuerzo = 10;

const res1 = calculatePedidoRango('2026-09-17', 1, averagesTest1);

console.log(`Día evaluado: ${res1.rangeDays[0].label} (Menú ${res1.rangeDays[0].menuNum})`);
console.log('🥬 Verdura y Fruta:');
if (res1.verduraYFrutaList.length === 0) console.log('  (Sin ítems)');
res1.verduraYFrutaList.forEach((item) => {
  console.log(`  • ${item.name}: Bruto = ${item.grossQuantityStr} (Neto = ${item.netQuantityStr}, Factor = ×${item.factor})`);
});
console.log('🥩 Carne, Pollo y Cerdo:');
if (res1.carnePolloCerdoList.length === 0) console.log('  (Sin ítems)');
res1.carnePolloCerdoList.forEach((item) => {
  console.log(`  • ${item.name}: Bruto = ${item.grossQuantityStr} (Neto = ${item.netQuantityStr}, Factor = ×${item.factor})`);
});
console.log('⚠️ Sin clasificar:');
if (res1.unclassifiedList.length === 0) console.log('  (Sin ítems)');
res1.unclassifiedList.forEach((item) => {
  console.log(`  • ${item.name}: ${item.grossQuantityStr}`);
});

// --------------------------------------------------------------------------
// TEST 2: Mismo día (2026-09-17, Jueves).
// Personal Almuerzo semana = 10 Y Personal Cena semana = 10.
// --------------------------------------------------------------------------
console.log('\n--- TEST 2: Día de semana (2026-09-17) | Personal Almuerzo Semana = 10 Y Cena Semana = 10 ---');
const averagesTest2 = createEmptyAverages();
averagesTest2.weekday.PERSONAL.almuerzo = 10;
averagesTest2.weekday.PERSONAL.cena = 10;

const res2 = calculatePedidoRango('2026-09-17', 1, averagesTest2);

console.log(`Día evaluado: ${res2.rangeDays[0].label} (Menú ${res2.rangeDays[0].menuNum})`);
console.log('🥬 Verdura y Fruta:');
if (res2.verduraYFrutaList.length === 0) console.log('  (Sin ítems)');
res2.verduraYFrutaList.forEach((item) => {
  console.log(`  • ${item.name}: Bruto = ${item.grossQuantityStr} (Neto = ${item.netQuantityStr}, Factor = ×${item.factor})`);
});
console.log('🥩 Carne, Pollo y Cerdo:');
if (res2.carnePolloCerdoList.length === 0) console.log('  (Sin ítems)');
res2.carnePolloCerdoList.forEach((item) => {
  console.log(`  • ${item.name}: Bruto = ${item.grossQuantityStr} (Neto = ${item.netQuantityStr}, Factor = ×${item.factor})`);
});
console.log('⚠️ Sin clasificar:');
if (res2.unclassifiedList.length === 0) console.log('  (Sin ítems)');
res2.unclassifiedList.forEach((item) => {
  console.log(`  • ${item.name}: ${item.grossQuantityStr}`);
});

// --------------------------------------------------------------------------
// TEST 3: Un sábado (2026-09-19) con valores SOLO en las columnas de semana.
// --------------------------------------------------------------------------
console.log('\n--- TEST 3: Sábado (2026-09-19) | Valores cargados SOLO en columnas de semana ---');
const averagesTest3 = createEmptyAverages();
averagesTest3.weekday.PERSONAL.almuerzo = 100;
averagesTest3.weekday.PERSONAL.cena = 100;
averagesTest3.weekday.REGIMEN_NORMAL.almuerzo = 150;
averagesTest3.weekday.REGIMEN_NORMAL.cena = 150;
// Note: weekend columns remain ALL 0

const res3 = calculatePedidoRango('2026-09-19', 1, averagesTest3);

console.log(`Día evaluado: ${res3.rangeDays[0].label} (Es Finde/Feriado: ${res3.rangeDays[0].isSpecialDay})`);
console.log(`Ítems Verdura/Fruta: ${res3.verduraYFrutaList.length}`);
console.log(`Ítems Carne/Pollo/Cerdo: ${res3.carnePolloCerdoList.length}`);
console.log(`Ítems Sin Clasificar: ${res3.unclassifiedList.length}`);
