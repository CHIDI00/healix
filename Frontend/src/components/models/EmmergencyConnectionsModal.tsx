import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Phone, Mail, AlertTriangle } from "lucide-react";

interface EmergencyConnectionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialContacts = [
  { id: "1", name: "Dr. Chinedu Okafor", email: "chinedu.okafor@hospital.ng", role: "Primary Physician" },
  { id: "2", name: "Adaeze Joshua", email: "adaeze.joshua@gmail.com", role: "Emergency Contact" },
];

const EmergencyConnectionsModal = ({ open, onOpenChange }: EmergencyConnectionsModalProps) => {
  const [contacts, setContacts] = useState(initialContacts);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  const addContact = () => {
    if (!newEmail.trim() || !newName.trim()) return;
    setContacts((prev) => [...prev, { id: Date.now().toString(), name: newName.trim(), email: newEmail.trim(), role: "Care Team" }]);
    setNewEmail("");
    setNewName("");
  };

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-slate-200 bg-[#FAFAFA] overflow-y-auto h-[36rem] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-800">Emergency Connections</DialogTitle>
        </DialogHeader>

        {/* Alert Info */}
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-xs text-slate-600">
            These contacts will be auto-notified during critical health events. Ensure all emails are accurate.
          </p>
        </div>

        {/* Contact List */}
        <div className="space-y-2">
          <AnimatePresence>
            {contacts.map((contact) => (
              <motion.div
                key={contact.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50">
                    <Phone className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{contact.name}</p>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <p className="text-xs text-slate-400">{contact.email}</p>
                    </div>
                    <span className="text-[10px] font-medium text-indigo-500">{contact.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeContact(contact.id)}
                  className="rounded-full p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add New Contact */}
        <div className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Add Contact</p>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Full name"
            className="h-9 rounded-lg border-slate-200 bg-slate-50/50 text-sm"
          />
          <Input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            className="h-9 rounded-lg border-slate-200 bg-slate-50/50 text-sm"
          />
          <Button
            onClick={addContact}
            disabled={!newEmail.trim() || !newName.trim()}
            className="w-full rounded-xl bg-indigo-600 text-sm hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add to Emergency List
          </Button>
        </div>

        <p className="text-center text-xs text-slate-400">Auto-dispatch enabled for critical alerts</p>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyConnectionsModal;
