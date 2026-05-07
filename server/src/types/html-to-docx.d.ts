declare module 'html-to-docx' {
  function HTMLtoDOCX(
    htmlString: string,
    headerHTMLString: string | null,
    options?: Record<string, any>
  ): Promise<ArrayBuffer>;
  export default HTMLtoDOCX;
}
