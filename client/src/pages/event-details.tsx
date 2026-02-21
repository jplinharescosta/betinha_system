import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  useEvent, useCreateEvent, useUpdateEvent, useDeleteEvent,
  useVehicles, useCatalogItems, useEmployees, useCustomers,
  useAddEventItem, useRemoveEventItem,
  useAddEventTeam, useRemoveEventTeam
} from "@/hooks/use-resources";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, ArrowLeft, Plus, Trash2, DollarSign, MapPin, ExternalLink } from "lucide-react";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { insertEventSchema } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertEventSchema.extend({
  distanceKm: z.coerce.number().min(0),
  guestAdults: z.coerce.number().min(0),
  guestKids: z.coerce.number().min(0),
  eventDate: z.coerce.date(),
  extraExpenses: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientAddress: z.string().optional(),
});

function formatDateForInput(date: Date): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}

function openInMaps(address: string) {
  const encoded = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank");
}

export default function EventDetails() {
  const [, params] = useRoute("/events/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;
  const isNew = id === "new";
  const { toast } = useToast();

  const { data: event, isLoading: isLoadingEvent } = useEvent(id || "");
  const { data: vehicles } = useVehicles();
  const { data: customersList } = useCustomers();
  const { mutate: create, isPending: isCreating } = useCreateEvent();
  const { mutate: update, isPending: isUpdating } = useUpdateEvent();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      address: "",
      eventDate: new Date(),
      distanceKm: 0,
      guestAdults: 0,
      guestKids: 0,
      transportType: "NO_TRANSPORT",
      status: "PENDING",
      financialStatus: "UNPAID",
      notes: "",
      extraExpenses: "0",
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (event && !isNew) {
      form.reset({
        ...event,
        eventDate: new Date(event.eventDate),
        distanceKm: Number(event.distanceKm),
        guestAdults: event.guestAdults,
        guestKids: event.guestKids,
        vehicleId: event.vehicleId || undefined,
        extraExpenses: event.extraExpenses || "0",
        clientEmail: event.clientEmail || "",
        clientAddress: event.clientAddress || "",
      });
    }
  }, [event, isNew, form]);

  const transportType = form.watch("transportType");

  // When customer is selected from dropdown, auto-fill phone/email/address
  function handleCustomerSelect(customerName: string) {
    form.setValue("clientName", customerName);
    const customer = customersList?.find((c: any) => c.name === customerName);
    if (customer) {
      if (customer.phone) form.setValue("clientPhone", customer.phone);
      if (customer.email) form.setValue("clientEmail", customer.email);
      if (customer.address) form.setValue("clientAddress", customer.address);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      distanceKm: String(values.distanceKm),
      guestAdults: values.guestAdults,
      guestKids: values.guestKids,
    };
    if (isNew) {
      create(payload, {
        onSuccess: (newEvent) => setLocation(`/events/${newEvent.id}`),
      });
    } else if (id) {
      update({ id, ...payload }, {
        onSuccess: () => {
          toast({ title: "Evento salvo com sucesso!" });
        }
      });
    }
  }

  function handleDelete() {
    if (id) {
      deleteEvent(id, {
        onSuccess: () => {
          setLocation("/events");
        }
      });
    }
  }

  if (!isNew && isLoadingEvent) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/events")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader 
          title={isNew ? "Novo Evento" : `Evento: ${event?.clientName}`} 
          description={isNew ? "Preencha os dados iniciais" : `Data: ${format(new Date(event?.eventDate || new Date()), "dd/MM/yyyy HH:mm", { locale: ptBR })}`}
          className="mb-0 flex-1"
        />
        {!isNew && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Evento
          </Button>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o evento de <strong>{event?.clientName}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Cliente</FormLabel>
                          {customersList && customersList.length > 0 ? (
                            <Select onValueChange={handleCustomerSelect} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um cliente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customersList.map((c: any) => (
                                  <SelectItem key={c.id} value={c.name}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <FormControl><Input {...field} /></FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail do Cliente</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço do Cliente</FormLabel>
                          <div className="flex gap-2">
                            <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                            {field.value && (
                              <Button type="button" variant="outline" size="icon" onClick={() => openInMaps(field.value || "")} title="Abrir no Google Maps">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local do Evento</FormLabel>
                        <div className="flex gap-2">
                          <FormControl><Input {...field} /></FormControl>
                          {field.value && (
                            <Button type="button" variant="outline" size="icon" onClick={() => openInMaps(field.value)} title="Abrir no Google Maps">
                              <MapPin className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data e Hora</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              value={formatDateForInput(field.value)}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                const d = new Date(val);
                                if (!isNaN(d.getTime())) {
                                  field.onChange(d);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="distanceKm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distância (Km)</FormLabel>
                          <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                          <p className="text-xs text-amber-600 mt-1 font-medium">⚠ Ida e volta</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PENDING">Pendente</SelectItem>
                              <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                              <SelectItem value="DONE">Realizado</SelectItem>
                              <SelectItem value="CANCELED">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                      control={form.control}
                      name="guestAdults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Convidados (Adultos)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guestKids"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Convidados (Crianças)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="transportType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Transporte</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NO_TRANSPORT">Sem Transporte</SelectItem>
                              <SelectItem value="FLEET_VEHICLE">Veículo da Frota</SelectItem>
                              <SelectItem value="INDIVIDUAL_TRANSPORT">Transporte Próprio</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {transportType === "FLEET_VEHICLE" && (
                      <FormField
                        control={form.control}
                        name="vehicleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Veículo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o veículo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vehicles?.map((v: any) => (
                                  <SelectItem key={v.id} value={v.id}>{v.name} ({v.licensePlate})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="extraExpenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Despesas Extras (R$)</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <p className="text-xs text-muted-foreground mt-1">Custos adicionais não previstos no catálogo.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="financialStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Situação Financeira</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="UNPAID">Pendente</SelectItem>
                              <SelectItem value="PARTIAL">Parcial</SelectItem>
                              <SelectItem value="PAID">Pago</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full md:w-auto" disabled={isCreating || isUpdating}>
                    {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Evento
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Items & Team - Only visible if event exists (not new) */}
          {!isNew && id && (
            <>
              <EventItemsSection eventId={id} items={event?.items || []} />
              <EventTeamSection eventId={id} team={event?.team || []} />
            </>
          )}
        </div>

        {/* Right Column: Financial Summary */}
        <div className="lg:col-span-1">
           <div className="sticky top-24 space-y-6">
            <FinancialSummaryCard event={event} />
           </div>
        </div>
      </div>
    </div>
  );
}

function FinancialSummaryCard({ event }: { event: any }) {
  if (!event) return null;

  const formatMoney = (val: string | number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val || 0));

  const totalCosts = Number(event.totalCostItems || 0) + Number(event.totalCostLabor || 0) + Number(event.totalCostTransport || 0) + Number(event.extraExpenses || 0);
  const margin = Number(event.profitMargin || 0);
  const marginColor = margin > 30 ? "text-green-500" : margin > 10 ? "text-yellow-500" : "text-red-500";

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-md shadow-xl">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-primary" />
          Resumo Financeiro
        </CardTitle>
        <CardDescription>Cálculo automático</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Receita Total</span>
          <span className="font-bold text-lg">{formatMoney(event.totalRevenue)}</span>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Custo Itens</span>
            <span className="text-red-400">{formatMoney(event.totalCostItems)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Custo Mão de Obra</span>
            <span className="text-red-400">{formatMoney(event.totalCostLabor)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Custo Transporte</span>
            <span className="text-red-400">{formatMoney(event.totalCostTransport)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Despesas Extras</span>
            <span className="text-red-400">{formatMoney(event.extraExpenses)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-muted-foreground">Total de Custos</span>
            <span className="text-red-500">{formatMoney(totalCosts)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center pt-2">
          <span className="font-medium">Lucro Líquido</span>
          <span className={cn("font-bold text-xl", Number(event.netProfit) >= 0 ? "text-green-500" : "text-red-500")}>
            {formatMoney(event.netProfit)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Margem</span>
          <span className={cn("font-bold", marginColor)}>{Number(margin).toFixed(1)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

function EventItemsSection({ eventId, items }: { eventId: string, items: any[] }) {
  const { data: catalog } = useCatalogItems();
  const { mutate: addItem, isPending: isAdding } = useAddEventItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveEventItem();
  const { toast } = useToast();
  
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Filter out items already added to the event (prevent duplicates)
  const availableItems = catalog?.filter((item: any) => 
    !items.some((ei: any) => ei.catalogItemId === item.id)
  );

  const handleAdd = () => {
    if (!selectedItem) return;
    
    const alreadyAdded = items.some((ei: any) => ei.catalogItemId === selectedItem);
    if (alreadyAdded) {
      toast({ title: "Item já adicionado", description: "Este item já está no evento. Remova-o primeiro para alterar a quantidade.", variant: "destructive" });
      return;
    }
    
    addItem({ eventId, catalogItemId: selectedItem, quantity });
    setSelectedItem("");
    setQuantity(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos e Serviços</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Adicionar item..." />
            </SelectTrigger>
            <SelectContent>
              {availableItems?.map((item: any) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} - R$ {item.priceClient}
                </SelectItem>
              ))}
              {availableItems?.length === 0 && (
                <div className="p-2 text-sm text-muted-foreground text-center">Todos os itens já foram adicionados</div>
              )}
            </SelectContent>
          </Select>
          <Input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} 
            className="w-20" 
            min={1}
          />
          <Button onClick={handleAdd} disabled={!selectedItem || isAdding}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="border rounded-lg divide-y">
          {items.map((item) => (
            <div key={item.id} className="p-3 flex justify-between items-center hover:bg-muted/50">
              <div>
                <p className="font-medium">{item.catalogItem?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity}x R$ {item.unitPriceSnapshot} = R$ {(item.quantity * Number(item.unitPriceSnapshot)).toFixed(2)}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => removeItem({ eventId, itemId: item.id })}
                disabled={isRemoving}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {items.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">Nenhum item adicionado</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function EventTeamSection({ eventId, team }: { eventId: string, team: any[] }) {
  const { data: employees } = useEmployees();
  const { mutate: addTeam, isPending: isAdding } = useAddEventTeam();
  const { mutate: removeTeam, isPending: isRemoving } = useRemoveEventTeam();
  const { toast } = useToast();
  
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Filter out employees already in the team (prevent duplicates)
  const availableEmployees = employees?.filter((emp: any) => 
    !team.some((t: any) => t.employeeId === emp.id)
  );

  const handleAdd = () => {
    if (!selectedEmployee) return;
    
    const alreadyAdded = team.some((t: any) => t.employeeId === selectedEmployee);
    if (alreadyAdded) {
      toast({ title: "Funcionário já escalado", description: "Este funcionário já está na equipe do evento.", variant: "destructive" });
      return;
    }
    
    addTeam({ eventId, employeeId: selectedEmployee });
    setSelectedEmployee("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Adicionar funcionário..." />
            </SelectTrigger>
            <SelectContent>
              {availableEmployees?.map((emp: any) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </SelectItem>
              ))}
              {availableEmployees?.length === 0 && (
                <div className="p-2 text-sm text-muted-foreground text-center">Todos os funcionários já foram escalados</div>
              )}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={!selectedEmployee || isAdding}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="border rounded-lg divide-y">
          {team.map((member) => (
            <div key={member.id} className="p-3 flex justify-between items-center hover:bg-muted/50">
              <div>
                <p className="font-medium">{member.employee?.name}</p>
                <p className="text-xs text-muted-foreground">{member.employee?.role} — R$ {member.paymentSnapshot}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => removeTeam({ eventId, teamId: member.id })}
                disabled={isRemoving}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {team.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma equipe escalada</div>}
        </div>
      </CardContent>
    </Card>
  );
}
