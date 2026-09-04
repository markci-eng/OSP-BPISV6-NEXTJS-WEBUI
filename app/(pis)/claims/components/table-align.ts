"use client";

// Right-aligning a column heading over a right-aligned figure.
//
// A number column is read up and down, and the eye finds it by its right edge:
// units under units, tens under tens. A heading left-aligned over it starts a
// column-width away from the figures it names, so on a wide table "Chapels" sits
// above nothing and the 13 under it appears to belong to whatever heading is
// nearest. The two have to end on the same edge.
//
// WHY THIS IS A CSS OVERRIDE. The kit's `DataTable` sets `textAlign: "left"` on
// every `Table.ColumnHeader` it renders, and it wraps the heading in a flex row
// of its own (the label, the sort caret, the filter control). It exposes no
// per-column alignment — there is no `meta.align` — so a header node cannot
// right-align itself from the inside: `textAlign` loses to the kit's own prop,
// and a `justify` on anything the column supplies only moves within a flex box
// that is already sized to its content and parked at the left.
//
// So both halves are set from outside: the cell's `text-align`, and the
// justification of the kit's flex row inside it. `> div` is that row — the only
// element the kit puts directly inside a header cell.
//
// THE COLUMNS ARE NAMED BY POSITION, which is the one unhappy part of this and
// the reason it is a function rather than a constant: a table that inserts a
// column has to be looked at again. `nth-of-type` and not `nth-child`, so the
// count is of `th` elements and cannot be shifted by anything else the kit
// renders in the row.

/**
 * Right-align the headings of the columns matching `selector`, which is a
 * `th`-relative suffix:
 *
 *   `":not(:first-of-type)"`  every column but the first — a table whose first
 *                             column is a name and whose rest are figures.
 *   `":nth-of-type(4)"`       one column, counted from 1.
 *
 * The BODY cells are not touched. Each table right-aligns its own figures where
 * it renders them, because what is in a cell is that table's business — this
 * only makes the heading agree with it.
 */
export function alignHeadersRight(selector: string) {
  return {
    [`& thead th${selector}`]: { textAlign: "right" },
    [`& thead th${selector} > div`]: { justifyContent: "flex-end" },
  };
}

/** Every column but the first — the shape both dashboard tables have. */
export const ALIGN_FIGURES_RIGHT = alignHeadersRight(":not(:first-of-type)");
