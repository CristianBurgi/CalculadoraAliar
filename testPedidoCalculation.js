import { calculatePedidoRango } from './src/services/pedidoService.js';

console.log('=== TEST MODULO 2: PEDIDO DE COMPRA DE 7 DÍAS ===\n');

const res = calculatePedidoRango('2026-09-17', 7);

console.log(`Rango: ${res.startDateIso} (${res.daysCount} días)`);
console.log(`Días en el rango:`, res.rangeDays.map((d) => `${d.label} (Menú ${d.menuNum}${d.isSpecialDay ? ' - FINDE/FERIADO' : ''})`));

console.log('\n--- 🥬 VERDURA Y FRUTA (BRUTO) ---');
res.verduraYFrutaList.forEach((item) => {
  console.log(`  • ${item.name}: ${item.grossQuantityStr} (Neto: ${item.netQuantityStr}, Factor: ×${item.factor})`);
});

console.log('\n--- 🥩 CARNE, POLLO Y CERDO (BRUTO) ---');
res.carnePolloCerdoList.forEach((item) => {
  console.log(`  • ${item.name}: ${item.grossQuantityStr} (Neto: ${item.netQuantityStr}, Factor: ×${item.factor})`);
});

console.log('\n--- ⚠️ INGREDIENTES SIN CLASIFICAR ---');
res.unclassifiedList.forEach((item) => {
  console.log(`  • ${item.name}: ${item.grossQuantityStr}`);
});
