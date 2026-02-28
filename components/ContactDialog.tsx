"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContactData {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  company?: string | null;
  linkedIn?: string | null;
  notes?: string | null;
}

interface ContactDialogProps {
  contact: ContactData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    company?: string;
    linkedIn?: string;
    notes?: string;
  }) => Promise<void>;
}

export default function ContactDialog({
  contact,
  open,
  onOpenChange,
  onSave,
}: ContactDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [notes, setNotes] = useState("");

  const isEditing = !!contact?.id;

  useEffect(() => {
    if (contact) {
      setName(contact.name || "");
      setEmail(contact.email || "");
      setPhone(contact.phone || "");
      setRole(contact.role || "");
      setCompany(contact.company || "");
      setLinkedIn(contact.linkedIn || "");
      setNotes(contact.notes || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setRole("");
      setCompany("");
      setLinkedIn("");
      setNotes("");
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name,
        email: email || undefined,
        phone: phone || undefined,
        role: role || undefined,
        company: company || undefined,
        linkedIn: linkedIn || undefined,
        notes: notes || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save contact:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Contact" : "Add Contact"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update contact details."
              : "Add a new contact for this job application."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                placeholder="+1 555-0100"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="contact-role">Role/Title</Label>
              <Input
                id="contact-role"
                placeholder="Recruiter"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-company">Company</Label>
              <Input
                id="contact-company"
                placeholder="Google"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-linkedin">LinkedIn (optional)</Label>
            <Input
              id="contact-linkedin"
              type="url"
              placeholder="https://linkedin.com/in/..."
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-notes">Notes (optional)</Label>
            <Textarea
              id="contact-notes"
              placeholder="Met at career fair, very responsive..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
