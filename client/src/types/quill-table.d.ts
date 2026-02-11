// src/types/quill-table.d.ts
// Minimal declaration to make TypeScript happy with quill-table package
// We use 'any' since no official types exist — safe and sufficient for this use case

declare module 'quill-table' {
  const TableHandler: any;                // default export = the module handler
  const rewirteFormats: () => void;       // note: typo in original package

  export { TableHandler, rewirteFormats };
}
// Also declare the CSS file import (prevents TS error on import '...css')
declare module 'quill-table/dist/quill-table.css' {
  // empty module – just tells TS it's valid to import
}