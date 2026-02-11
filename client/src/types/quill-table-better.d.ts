// client/src/types/quill-table-better.d.ts

// Tell TypeScript that the default export exists (the module class)
declare module 'quill-table-better' {
  const QuillTableBetter: any;
  export default QuillTableBetter;
}

// Tell TypeScript the CSS file can be imported (no types needed for CSS)
declare module 'quill-table-better/dist/quill-table-better.css' {
  // empty module — just marks it as importable
}