"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

type PinDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (pin: string) => Promise<boolean>;
};

export function PinDialog({ open, onOpenChange, onSubmit }: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pin.trim()) {
      setError("Please enter a PIN");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const success = await onSubmit(pin);
      if (success) {
        setPin("");
        onOpenChange(false);
      } else {
        setError("Invalid PIN. Please try again.");
      }
    } catch {
      setError("Failed to verify PIN. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPin("");
      setError("");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter PIN to continue</DialogTitle>
          <DialogDescription>
            Editing, exporting, and printing require a PIN. Access stays unlocked
            for 30 minutes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-2 py-2">
            <Label htmlFor="edit-pin">PIN</Label>
            <Input
              id="edit-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="Enter PIN"
              disabled={isSubmitting}
            />
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Unlock"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
