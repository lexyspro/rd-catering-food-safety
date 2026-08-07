"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

export default function ExportForm() {
  const [module, setModule] = useState("suppliers");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState(false);

  async function handleExport(format: "pdf" | "excel") {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        module,
        startDate,
        endDate,
        format,
      });

      // Navigate to download endpoint
      window.open(`/api/export?${params.toString()}`, "_blank");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="form-group">
        <label className="form-label" htmlFor="export-module">Select Module</label>
        <select
          id="export-module"
          className="form-select"
          value={module}
          onChange={(e) => setModule(e.target.value)}
        >
          <option value="suppliers">Suppliers List & Purchase Log</option>
          <option value="equipment-cleaning">Equipment Cleaning Records</option>
          <option value="general-cleaning">General Cleaning Records</option>
          <option value="ingredients">Ingredients checklist (Goods received)</option>
          <option value="temperature">Temperature Monitoring Records</option>
          <option value="calibration">Calibration Records</option>
        </select>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="export-start">Start Date (optional)</label>
          <input
            id="export-start"
            type="date"
            className="form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="export-end">End Date (optional)</label>
          <input
            id="export-end"
            type="date"
            className="form-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
        <button
          id="btn-export-pdf"
          type="button"
          className="btn btn-ghost"
          style={{ gap: 8 }}
          onClick={() => handleExport("pdf")}
          disabled={exporting}
        >
          <FileText size={16} style={{ color: "var(--color-danger)" }} />
          Export to PDF
        </button>

        <button
          id="btn-export-excel"
          type="button"
          className="btn btn-primary"
          style={{ gap: 8 }}
          onClick={() => handleExport("excel")}
          disabled={exporting}
        >
          <FileSpreadsheet size={16} />
          Export to Excel
        </button>
      </div>
    </div>
  );
}
