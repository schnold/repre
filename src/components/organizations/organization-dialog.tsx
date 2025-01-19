import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateOrganizationForm } from "./create-organization-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

interface OrganizationDialogProps {
  mode: "create" | "edit";
  organizationId?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function OrganizationDialog({ mode, organizationId, trigger, onSuccess }: OrganizationDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Organization
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Organization" : "Edit Organization"}
          </DialogTitle>
        </DialogHeader>
        <CreateOrganizationForm
          onSuccess={() => {
            setOpen(false);
            onSuccess?.();
          }}
          organizationId={organizationId}
        />
      </DialogContent>
    </Dialog>
  );
} 