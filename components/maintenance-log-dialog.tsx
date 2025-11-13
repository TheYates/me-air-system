"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface MaintenanceLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentId: number;
  equipmentName?: string;
}

export function MaintenanceLogDialog({
  open,
  onOpenChange,
  equipmentId,
  equipmentName,
}: MaintenanceLogDialogProps) {
  const [formData, setFormData] = useState({
    maintenanceType: "",
    performedBy: "",
    performedDate: new Date().toISOString().split("T")[0],
    cost: "",
    nextMaintenanceDate: "",
    description: "",
    notes: "",
    status: "completed",
    equipmentStatus: "operational",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.maintenanceType || !formData.performedBy) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.maintenance.create({
        equipmentId,
        maintenanceType: formData.maintenanceType,
        performedBy: formData.performedBy,
        performedDate: formData.performedDate,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        nextMaintenanceDate: formData.nextMaintenanceDate || null,
        description: formData.description,
        notes: formData.notes,
        status: formData.status,
        equipmentStatus: formData.equipmentStatus,
      });

      // Invalidate cache
      queryClient.invalidateQueries({
        queryKey: ["maintenance", "equipment", equipmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });

      toast({
        title: "Success",
        description: "Maintenance logged successfully!",
      });

      // Reset form and close
      setFormData({
        maintenanceType: "",
        performedBy: "",
        performedDate: new Date().toISOString().split("T")[0],
        cost: "",
        nextMaintenanceDate: "",
        description: "",
        notes: "",
        status: "completed",
        equipmentStatus: "operational",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log maintenance",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Maintenance</DialogTitle>
          <DialogDescription>
            Record maintenance activity for {equipmentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Maintenance Type */}
          <div className="space-y-2">
            <Label htmlFor="maintenanceType">Maintenance Type *</Label>
            <Select
              value={formData.maintenanceType}
              onValueChange={(value) => handleChange("maintenanceType", value)}
            >
              <SelectTrigger id="maintenanceType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
                <SelectItem value="predictive">Predictive</SelectItem>
                <SelectItem value="breakdown">Breakdown Repair</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="calibration">Calibration</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Performed By */}
          <div className="space-y-2">
            <Label htmlFor="performedBy">Performed By *</Label>
            <Input
              id="performedBy"
              placeholder="Name of technician/person"
              value={formData.performedBy}
              onChange={(e) => handleChange("performedBy", e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="performedDate">Date Performed</Label>
              <Input
                id="performedDate"
                type="date"
                value={formData.performedDate}
                onChange={(e) => handleChange("performedDate", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost (GHS)</Label>
              <Input
                id="cost"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={formData.cost}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, "");
                  handleChange("cost", value);
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the maintenance performed"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={2}
            />
          </div>

          {/* Next Maintenance Date */}
          <div className="space-y-2">
            <Label htmlFor="nextMaintenanceDate">Next Maintenance Date</Label>
            <Input
              id="nextMaintenanceDate"
              type="date"
              value={formData.nextMaintenanceDate}
              onChange={(e) => handleChange("nextMaintenanceDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Equipment Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Maintenance Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipmentStatus">Equipment Status After</Label>
              <Select
                value={formData.equipmentStatus}
                onValueChange={(value) => handleChange("equipmentStatus", value)}
              >
                <SelectTrigger id="equipmentStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="broken">Broken</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isSubmitting ? "Saving..." : "Log Maintenance"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

