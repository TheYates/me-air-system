import type { Equipment } from "@/types/equipment";
import {
  buildReportTable,
  type ReportColumns,
} from "@/lib/equipment-report-columns";

export type ExportFormat = "csv" | "xlsx" | "pdf";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string | number) {
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportEquipmentCsv(
  equipment: Equipment[],
  columns: ReportColumns,
  filename: string
) {
  const { headers, rows } = buildReportTable(equipment, columns);
  const csvContent = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((row) => row.map(escapeCsvField).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

export async function exportEquipmentXlsx(
  equipment: Equipment[],
  columns: ReportColumns,
  filename: string
) {
  const XLSX = await import("xlsx");
  const { headers, rows } = buildReportTable(equipment, columns);
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Equipment");
  XLSX.writeFile(workbook, filename);
}

export async function exportEquipmentPdf(
  equipment: Equipment[],
  columns: ReportColumns,
  filename: string,
  meta?: { generatedOn?: string; totalCount?: number }
) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const { headers, rows } = buildReportTable(equipment, columns);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(16);
  doc.text("Equipment Inventory Report", 14, 15);
  doc.setFontSize(10);
  doc.text(
    `Generated: ${meta?.generatedOn ?? new Date().toLocaleDateString()}`,
    14,
    22
  );
  if (meta?.totalCount != null) {
    doc.text(`Total records: ${meta.totalCount}`, 14, 28);
  }

  autoTable(doc, {
    head: [headers],
    body: rows.map((row) => row.map(String)),
    startY: meta?.totalCount != null ? 32 : 26,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
  });

  doc.save(filename);
}

export async function exportEquipment(
  format: ExportFormat,
  equipment: Equipment[],
  columns: ReportColumns,
  baseFilename: string,
  meta?: { generatedOn?: string; totalCount?: number }
) {
  const date = new Date().toISOString().split("T")[0];
  const name = `${baseFilename}-${date}`;

  switch (format) {
    case "csv":
      exportEquipmentCsv(equipment, columns, `${name}.csv`);
      break;
    case "xlsx":
      await exportEquipmentXlsx(equipment, columns, `${name}.xlsx`);
      break;
    case "pdf":
      await exportEquipmentPdf(equipment, columns, `${name}.pdf`, meta);
      break;
  }
}
