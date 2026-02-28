"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  getContactsByJobId,
  createContact,
  updateContact,
  deleteContact,
} from "@/actions/contacts";
import ContactDialog from "./ContactDialog";
import { toast } from "sonner";
import {
  Plus,
  Mail,
  Phone,
  Linkedin,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  company: string | null;
  linkedIn: string | null;
  notes: string | null;
  jobId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ContactListProps {
  jobId: string;
}

export default function ContactList({ jobId }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const loadContacts = useCallback(async () => {
    try {
      const data = await getContactsByJobId(jobId);
      setContacts(data as Contact[]);
    } catch {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleAddContact = () => {
    setEditingContact(null);
    setDialogOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const handleSave = async (data: {
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    company?: string;
    linkedIn?: string;
    notes?: string;
  }) => {
    try {
      if (editingContact) {
        const updated = await updateContact(editingContact.id, data);
        setContacts((prev) =>
          prev.map((c) => (c.id === editingContact.id ? (updated as Contact) : c))
        );
        toast.success("Contact updated");
      } else {
        const created = await createContact({ ...data, jobId });
        setContacts((prev) => [created as Contact, ...prev]);
        toast.success("Contact added");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save contact"
      );
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Contact deleted");
    } catch {
      toast.error("Failed to delete contact");
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        Loading contacts...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          Contacts ({contacts.length})
        </h4>
        <Button variant="outline" size="sm" onClick={handleAddContact}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {contacts.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">
          No contacts yet. Add people involved with this application.
        </p>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-md border p-3 space-y-1.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{contact.name}</p>
                  {contact.role && (
                    <p className="text-xs text-muted-foreground">
                      {contact.role}
                      {contact.company ? ` at ${contact.company}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEditContact(contact)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(contact.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Mail className="h-3 w-3" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    {contact.phone}
                  </a>
                )}
                {contact.linkedIn && (
                  <a
                    href={contact.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Linkedin className="h-3 w-3" />
                    LinkedIn
                  </a>
                )}
              </div>
              {contact.notes && (
                <p className="text-xs text-muted-foreground mt-1">
                  {contact.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <ContactDialog
        contact={editingContact}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
}
