import { useState } from "react";
import { useEvents, useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/use-resources";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Phone, MapPin, Mail, ExternalLink, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EventResponse, CustomerResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const { data: customers, isLoading } = useCustomers();
  const { data: events } = useEvents();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<CustomerResponse | null>(null);

  const filteredCustomers = (customers || []).filter((c: CustomerResponse) => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Get events for a specific customer by matching name
  const getCustomerEvents = (customerName: string) => {
    return (events || []).filter((e: EventResponse) => 
      e.clientName.toLowerCase() === customerName.toLowerCase()
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Clientes" 
        description="Gerencie sua base de clientes"
      >
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-lg shadow-primary/25">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </PageHeader>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nome, telefone ou email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none shadow-none focus-visible:ring-0 h-auto p-0 placeholder:text-muted-foreground"
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/30">
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Eventos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer: CustomerResponse) => {
                const customerEvents = getCustomerEvents(customer.name);
                return (
                  <TableRow 
                    key={customer.id} 
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => setViewingCustomer(customer)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        {customer.name}
                      </div>
                    </TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{customer.address || "-"}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                        {customerEvents.length} evento{customerEvents.length !== 1 ? "s" : ""}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setEditingCustomer(customer)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteCustomerButton id={customer.id} name={customer.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <CustomerFormDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
      
      {/* Edit Dialog */}
      {editingCustomer && (
        <CustomerFormDialog 
          open={!!editingCustomer} 
          onOpenChange={(open) => !open && setEditingCustomer(null)} 
          customer={editingCustomer}
        />
      )}

      {/* View Details Dialog */}
      {viewingCustomer && (
        <CustomerDetailDialog 
          customer={viewingCustomer} 
          events={getCustomerEvents(viewingCustomer.name)}
          open={!!viewingCustomer} 
          onOpenChange={(open) => !open && setViewingCustomer(null)}
          onEdit={() => { setEditingCustomer(viewingCustomer); setViewingCustomer(null); }}
        />
      )}
    </div>
  );
}

function DeleteCustomerButton({ id, name }: { id: string, name: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteCustomer, isPending } = useDeleteCustomer();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(true)}
        className="hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => deleteCustomer(id)}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CustomerFormDialog({ 
  open, 
  onOpenChange, 
  customer 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  customer?: CustomerResponse; 
}) {
  const isEditing = !!customer;
  const { mutate: create, isPending: isCreating } = useCreateCustomer();
  const { mutate: update, isPending: isUpdating } = useUpdateCustomer();
  const isPending = isCreating || isUpdating;
  const { toast } = useToast();

  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [notes, setNotes] = useState(customer?.notes || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    const payload = { name: name.trim(), phone, email, address, notes };
    if (isEditing && customer) {
      update({ id: customer.id, ...payload }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      create(payload, {
        onSuccess: () => {
          setName(""); setPhone(""); setEmail(""); setAddress(""); setNotes("");
          onOpenChange(false);
        },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome Completo *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do cliente" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Endereço</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro, cidade" className="mt-1" />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas ou informações adicionais..." className="mt-1" rows={3} />
          </div>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar Alterações" : "Criar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CustomerDetailDialog({ 
  customer, 
  events, 
  open, 
  onOpenChange, 
  onEdit 
}: { 
  customer: CustomerResponse; 
  events: EventResponse[]; 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onEdit: () => void;
}) {
  const totalRevenue = events.reduce((sum, e) => sum + Number(e.totalPrice), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {customer.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              {customer.phone || "Não informado"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {customer.email || "Não informado"}
            </div>
          </div>
          {customer.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{customer.address}</span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
          {customer.notes && (
            <div className="text-sm p-3 bg-muted/30 rounded-lg border border-border/50">
              <span className="text-xs font-medium text-muted-foreground uppercase">Observações</span>
              <p className="mt-1">{customer.notes}</p>
            </div>
          )}

          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Histórico de Eventos ({events.length})
              </h4>
              <span className="text-xs font-semibold text-primary">
                Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
              </span>
            </div>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento registrado.</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {events.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                      <div>
                        <span className="font-medium">{format(new Date(event.eventDate), "dd/MM/yyyy", { locale: ptBR })}</span>
                        {event.eventTime && <span className="text-muted-foreground ml-2">{event.eventTime}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(event.totalPrice))}
                        </span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onEdit} className="gap-2">
            <Pencil className="h-4 w-4" />
            Editar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
