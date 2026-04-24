interface ExportReportToPdfOptions {
  element: HTMLElement;
  filename: string;
}

export async function exportReportToPdf({
  element,
  filename,
}: ExportReportToPdfOptions) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    backgroundColor: "#0a0c1a",
    scale: 2,
    useCORS: true,
    ignoreElements: (node) =>
      node instanceof HTMLElement && node.dataset.pdfExclude === "true",
  });

  const imageData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;
  const imageHeight = (canvas.height * printableWidth) / canvas.width;

  let heightLeft = imageHeight;
  let position = margin;

  pdf.addImage(imageData, "PNG", margin, position, printableWidth, imageHeight, undefined, "FAST");
  heightLeft -= printableHeight;

  while (heightLeft > 0) {
    position = heightLeft - imageHeight + margin;
    pdf.addPage();
    pdf.addImage(imageData, "PNG", margin, position, printableWidth, imageHeight, undefined, "FAST");
    heightLeft -= printableHeight;
  }

  pdf.save(filename);
}
