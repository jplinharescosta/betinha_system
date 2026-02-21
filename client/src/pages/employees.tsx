import { useState } from "react";
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from "@/hooks/use-resources";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { insertEmployeeSchema, type EmployeeResponse } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StatusBadge } from "@/components/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPLOYEE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Ativo", variant: "success" as const },
  { value: "INACTIVE", label: "Inativo", variant: "error" as const },
  { value: "TESTING", label: "Em teste", variant: "default" as const },
  { value: "WARNING", label: "Aviso", variant: "warning" as const },
];

function getEmployeeStatusDisplay(status: string) {
  return EMPLOYEE_STATUS_OPTIONS.find(o => o.value === status) || EMPLOYEE_STATUS_OPTIONS[0];
}

export default function Employees() {
  const { data: employees, isLoading } = useEmployees();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeResponse | null>(null);

  const filteredEmployees = employees?.filter((emp: EmployeeResponse) => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Equipe" 
        description="Gerencie seus funcionários e prestadores de serviço"
      >
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-lg shadow-primary/25">
          <Plus className="h-4 w-4" />
          Novo Funcionário
        </Button>
      </PageHeader>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nome ou cargo..." 
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
              <TableHead>Cargo</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Custo Base</TableHead>
              <TableHead>Transp. Individual</TableHead>
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
            ) : filteredEmployees?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum funcionário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees?.map((employee: EmployeeResponse) => (
                <TableRow key={employee.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.phone || "-"}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(employee.basePayment))}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(employee.individualTransportCost))}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const st = getEmployeeStatusDisplay((employee as any).status || (employee.active ? "ACTIVE" : "INACTIVE"));
                      return <StatusBadge status={st.label} variant={st.variant} />;
                    })()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditingEmployee(employee)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteEmployeeButton id={employee.id} name={employee.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EmployeeDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
      
      {editingEmployee && (
        <EmployeeDialog 
          open={!!editingEmployee} 
          onOpenChange={(open) => !open && setEditingEmployee(null)} 
          employee={editingEmployee}
        />
      )}
    </div>
  );
}

function DeleteEmployeeButton({ id, name }: { id: string, name: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteEmployee, isPending } = useDeleteEmployee();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Funcionário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => deleteEmployee(id)}
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

const formSchema = insertEmployeeSchema.extend({
  basePayment: z.coerce.number().min(0, "Deve ser maior ou igual a 0"),
  individualTransportCost: z.coerce.number().min(0, "Deve ser maior ou igual a 0"),
});

function EmployeeDialog({ 
  open, 
  onOpenChange, 
  employee 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  employee?: EmployeeResponse; 
}) {
  const isEditing = !!employee;
  const { mutate: create, isPending: isCreating } = useCreateEmployee();
  const { mutate: update, isPending: isUpdating } = useUpdateEmployee();
  const isPending = isCreating || isUpdating;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: employee?.name || "",
      phone: employee?.phone || "",
      role: employee?.role || "",
      basePayment: employee ? Number(employee.basePayment) : 0,
      individualTransportCost: employee ? Number(employee.individualTransportCost) : 0,
      active: employee?.active ?? true,
      status: (employee as any)?.status || "ACTIVE",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const status = (values as any).status || "ACTIVE";
    const payload = {
      ...values,
      basePayment: String(values.basePayment),
      individualTransportCost: String(values.individualTransportCost),
      status,
      active: status !== "INACTIVE",
    };
    if (isEditing && employee) {
      update({ id: employee.id, ...payload }, {
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
          <DialogTitle>{isEditing ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do funcionário abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Animador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="basePayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Base (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="individualTransportCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vale Transporte (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                  {EMPLOYEE_STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Criar Funcionário"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
