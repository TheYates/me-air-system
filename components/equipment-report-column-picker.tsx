"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_REPORT_COLUMNS,
  EQUIPMENT_REPORT_COLUMN_DEFS,
  type ReportColumns,
} from "@/lib/equipment-report-columns";

interface EquipmentReportColumnPickerProps {
  columns: ReportColumns;
  onChange: (columns: ReportColumns) => void;
  idPrefix?: string;
  showReset?: boolean;
}

export function EquipmentReportColumnPicker({
  columns,
  onChange,
  idPrefix = "report",
  showReset = true,
}: EquipmentReportColumnPickerProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {EQUIPMENT_REPORT_COLUMN_DEFS.map((def) => {
          const inputId = `${idPrefix}-${def.key}`;
          return (
            <div key={def.key} className="flex items-center space-x-2">
              <Checkbox
                id={inputId}
                checked={columns[def.key]}
                onCheckedChange={(checked) =>
                  onChange({ ...columns, [def.key]: checked === true })
                }
              />
              <Label htmlFor={inputId}>{def.label}</Label>
            </div>
          );
        })}
      </div>
      {showReset && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange({ ...DEFAULT_REPORT_COLUMNS })}
        >
          Reset to Default
        </Button>
      )}
    </div>
  );
}
