# Especificación PWA — Menús y Calculadora Aliar

## 8. Módulo 2: Pedido de Compra a Proveedores (Despensero)

### 8.1 Reglas del Cálculo de Raciones Promedio
1. El cálculo del pedido consolida las necesidades de insumos (peso bruto) para un rango de días determinado (3, 5, 7, 10, 14 o 30 días).
2. Para la clasificación de días, sábado, domingo o feriado nacional argentino se consideran como tipo `finde/feriado`. Los días de lunes a viernes no feriados se consideran como tipo `semana`.
3. Cada día del rango consulta el menú asignado según la rotación de ciclos.
4. **Promedios de raciones (16 valores):** Los promedios de raciones se configuran por matriz de **Categoría × Turno × Tipo de día**:
   - Categorías: Personal Autorizado, Régimen Normal, Régimen Diabético, Régimen Hepático.
   - Turnos: Almuerzo (☀️) y Cena (🌙).
   - Tipo de día: Semana (lun-vie) y Finde/Feriado (sáb-dom-feriado).
5. **Cálculo por día (Almuerzo y Cena):** Para cada día del rango, la función de cálculo sumará **almuerzo Y cena** del menú correspondiente a ese día.
   - El almuerzo utiliza la columna de promedio del almuerzo para cada categoría (semana o finde/feriado según el día).
   - La cena utiliza la columna de promedio de la cena para cada categoría (semana o finde/feriado según el día).
6. La función del cálculo del pedido recibe la tabla de promedios como parámetro (permite reemplazar el origen por promedios automáticos en el futuro).

### 8.2 Categorización de Ingredientes
- **Verdura y Fruta:** Acelga, Ajo, Apio, Arveja, Berenjena, Cebolla, Cebolla verde, Chaucha, Coreanito, Lechuga, Limón, Papa, Perejil, Pimiento, Remolacha, Tomate, Verdeo, Zanahoria, Zapallito, Zapallo.
- **Carne, Pollo y Cerdo:** Carne, Cerdo, Filet de pollo, Pollo entero.

### 8.3 Alias de Nombres
Mapas de normalización para consolidados de nombres como *Coreano -> Coreanito*, *Zanahoria rallada -> Zanahoria*, *Carne molida -> Carne*, *Pollo desmenuzado -> Filet de pollo*, etc.

### 8.4 Factores de Corrección (Neto a Bruto)
Aplica factores por defecto (ej. Papa x1.25, Cebolla x1.15, Carne x1.15) editables desde el modal de configuración de factores. Pollo entero en unidades no aplica factor de corrección de mermas.

### 8.7 Matriz de Promedios de Raciones
La interfaz del Despensero presenta una tabla editable con los 16 valores de promedios:

| Categoría | Almuerzo semana | Cena semana | Almuerzo finde/feriado | Cena finde/feriado |
|---|---|---|---|---|
| Personal Autorizado | (editable) | (editable) | (editable) | (editable) |
| Régimen Normal | (editable) | (editable) | (editable) | (editable) |
| Régimen Diabético | (editable) | (editable) | (editable) | (editable) |
| Régimen Hepático | (editable) | (editable) | (editable) | (editable) |

- **Persistencia y Migración:** Al cargar la app, si se detectan datos guardados en el formato anterior (un único valor por categoría y tipo de día), el sistema los migra automáticamente duplicando dicho valor en almuerzo y cena para esa misma columna y guardando el nuevo esquema en `localStorage`.
