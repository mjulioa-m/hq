"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { CONTACT_STAGES } from "@/lib/constants";
import { apiSend } from "@/lib/client-api";

export function ContactForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState("lead");
  const [nextAction, setNextAction] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    try {
      await apiSend("/api/contacts", "POST", {
        projectId,
        name,
        company,
        email,
        phone,
        value,
        stage,
        nextAction,
        nextActionDate: nextActionDate || null,
        notes,
      });
      setOpen(false);
      setName("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nuevo contacto</Button>
      <Modal open={open} title="Nuevo contacto" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Empresa" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" />
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Valor en COP" />
          <Select value={stage} onChange={(e) => setStage(e.target.value)}>
            {CONTACT_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
          <Input value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="Siguiente acción" />
          <Input type="date" value={nextActionDate} onChange={(e) => setNextActionDate(e.target.value)} />
          <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas" />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button onClick={() => void save()}>Guardar</Button>
        </div>
      </Modal>
    </>
  );
}
