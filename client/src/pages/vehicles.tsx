import { useState } from "react";
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "@/hooks/use-resources";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVehicleSchema, type VehicleResponse } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StatusBadge } from "@/components/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const VEHICLE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Ativo", variant: "success" as const },
  { value: "INACTIVE", label: "Inativo", variant: "error" as const },
  { value: "MAINTENANCE", label: "Em manutenção", variant: "warning" as const },
];

function getVehicleStatusDisplay(status: string) {
  return VEHICLE_STATUS_OPTIONS.find(o => o.value === status) || VEHICLE_STATUS_OPTIONS[0];
}

export default function Vehicles() {
  const { data: vehicles, isLoading } = useVehicles();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleResponse | null>(null);

  const filteredVehicles = vehicles?.filter((v: VehicleResponse) => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.licensePlate.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Frota" 
        description="Gerencie os veículos da empresa"
      >
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Novo Veículo
        </Button>
      </PageHeader>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nome ou placa..." 
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
              <TableHead>Placa</TableHead>
              <TableHead>KM/L</TableHead>
              <TableHead>Preço Combustível</TableHead>
              <TableHead>Manutenção/KM</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredVehicles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum veículo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles?.map((vehicle: VehicleResponse) => (
                <TableRow key={vehicle.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell>{vehicle.licensePlate}</TableCell>
                  <TableCell>{vehicle.kmPerLiter}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(vehicle.avgFuelPrice))}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(vehicle.maintenanceCostPerKm))}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const st = getVehicleStatusDisplay((vehicle as any).status || (vehicle.active ? "ACTIVE" : "INACTIVE"));
                      return <StatusBadge status={st.label} variant={st.variant} />;
                    })()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditingVehicle(vehicle)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteVehicleButton id={vehicle.id} name={vehicle.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <VehicleDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
      
      {editingVehicle && (
        <VehicleDialog 
          open={!!editingVehicle} 
          onOpenChange={(open) => !open && setEditingVehicle(null)} 
          vehicle={editingVehicle}
        />
      )}
    </div>
  );
}

function DeleteVehicleButton({ id, name }: { id: string, name: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteVehicle, isPending } = useDeleteVehicle();

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
          <AlertDialogTitle>Excluir Veículo</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => deleteVehicle(id)}
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

const formSchema = insertVehicleSchema.extend({
  kmPerLiter: z.coerce.number().min(0.1, "Deve ser maior que 0"),
  avgFuelPrice: z.coerce.number().min(0, "Deve ser maior ou igual a 0"),
  maintenanceCostPerKm: z.coerce.number().min(0, "Deve ser maior ou igual a 0"),
});

function VehicleDialog({ 
  open, 
  onOpenChange, 
  vehicle 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  vehicle?: VehicleResponse; 
}) {
  const isEditing = !!vehicle;
  const { mutate: create, isPending: isCreating } = useCreateVehicle();
  const { mutate: update, isPending: isUpdating } = useUpdateVehicle();
  const isPending = isCreating || isUpdating;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: vehicle?.name || "",
      licensePlate: vehicle?.licensePlate || "",
      kmPerLiter: vehicle ? Number(vehicle.kmPerLiter) : 10,
      avgFuelPrice: vehicle ? Number(vehicle.avgFuelPrice) : 5,
      maintenanceCostPerKm: vehicle ? Number(vehicle.maintenanceCostPerKm) : 0,
      active: vehicle?.active ?? true,
      status: (vehicle as any)?.status || "ACTIVE",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const status = (values as any).status || "ACTIVE";
    const payload = {
      ...values,
      kmPerLiter: String(values.kmPerLiter),
      avgFuelPrice: String(values.avgFuelPrice),
      maintenanceCostPerKm: String(values.maintenanceCostPerKm),
      status,
      active: status !== "INACTIVE",
    };
    if (isEditing && vehicle) {
      update({ id: vehicle.id, ...payload }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      create(payload, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do veículo abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Veículo</FormLabel>
                  <FormControl>
                    <Input placeholder="Fiat Fiorino" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placa</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kmPerLiter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KM por Litro</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avgFuelPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Combustível (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="maintenanceCostPerKm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custo Manutenção/KM (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={(form.watch as any)("status") || "ACTIVE"}
                onValueChange={(val) => form.setValue("status" as any, val)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Criar Veículo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
