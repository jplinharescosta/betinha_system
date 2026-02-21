import { useState } from "react";
import { 
  useCatalogItems, useCreateCatalogItem, useUpdateCatalogItem, useDeleteCatalogItem,
  useCategories, useCreateCategory
} from "@/hooks/use-resources";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search, Loader2, Tag } from "lucide-react";
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
import { insertCatalogItemSchema, type CatalogItemResponse, type CategoryResponse } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CatalogPage() {
  const { data: items, isLoading } = useCatalogItems();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItemResponse | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const filteredItems = items?.filter((item: CatalogItemResponse) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Catálogo" 
        description="Gerencie seus produtos e serviços"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCategoryOpen(true)} className="gap-2">
            <Tag className="h-4 w-4" />
            Nova Categoria
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            Novo Item
          </Button>
        </div>
      </PageHeader>

      {/* Categories overview */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat: CategoryResponse) => (
            <Badge key={cat.id} variant="secondary" className="text-sm px-3 py-1">
              {cat.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nome ou descrição..." 
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
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Preço Cliente</TableHead>
              <TableHead>Custo Interno</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredItems?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum item encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems?.map((item: CatalogItemResponse) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <div>
                      <p>{item.name}</p>
                      {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category?.name || "Sem categoria"}</Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={item.type === "PRODUCT" ? "Produto" : "Serviço"} 
                      variant={item.type === "PRODUCT" ? "info" : "primary"} 
                    />
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.priceClient))}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.internalCost))}
                  </TableCell>
                  <TableCell>{item.stockQuantity}</TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={item.active ? "Ativo" : "Inativo"} 
                      variant={item.active ? "success" : "default"} 
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditingItem(item)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteCatalogButton id={item.id} name={item.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CatalogItemDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        categories={categories || []}
      />
      
      {editingItem && (
        <CatalogItemDialog 
          open={!!editingItem} 
          onOpenChange={(open) => !open && setEditingItem(null)} 
          item={editingItem}
          categories={categories || []}
        />
      )}

      <CategoryDialog 
        open={isCategoryOpen}
        onOpenChange={setIsCategoryOpen}
      />
    </div>
  );
}

function DeleteCatalogButton({ id, name }: { id: string, name: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteItem, isPending } = useDeleteCatalogItem();

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
          <AlertDialogTitle>Excluir Item</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => deleteItem(id)}
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

const itemFormSchema = insertCatalogItemSchema.extend({
  priceClient: z.coerce.number().min(0, "Deve ser maior ou igual a 0"),
  internalCost: z.coerce.number().min(0, "Deve ser maior ou igual a 0"),
  stockQuantity: z.coerce.number().min(0).default(0),
});

function CatalogItemDialog({ 
  open, 
  onOpenChange, 
  item,
  categories,
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  item?: CatalogItemResponse;
  categories: CategoryResponse[];
}) {
  const isEditing = !!item;
  const { mutate: create, isPending: isCreating } = useCreateCatalogItem();
  const { mutate: update, isPending: isUpdating } = useUpdateCatalogItem();
  const isPending = isCreating || isUpdating;

  const form = useForm<z.infer<typeof itemFormSchema>>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      type: item?.type || "SERVICE",
      categoryId: item?.categoryId || undefined,
      priceClient: item ? Number(item.priceClient) : 0,
      internalCost: item ? Number(item.internalCost) : 0,
      stockQuantity: item?.stockQuantity || 0,
      active: item?.active ?? true,
    },
  });

  function onSubmit(values: z.infer<typeof itemFormSchema>) {
    const payload = {
      ...values,
      priceClient: String(values.priceClient),
      internalCost: String(values.internalCost),
    };
    if (isEditing && item) {
      update({ id: item.id, ...payload } as any, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      create(payload as any, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Item" : "Novo Item do Catálogo"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do produto ou serviço.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Garçom, Buffet Completo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição opcional" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PRODUCT">Produto</SelectItem>
                        <SelectItem value="SERVICE">Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priceClient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Cliente (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="internalCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Interno (R$)</FormLabel>
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
              name="stockQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade em Estoque</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Criar Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

function CategoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { mutate: create, isPending } = useCreateCategory();
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  function onSubmit(values: z.infer<typeof categorySchema>) {
    create(values, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>Crie uma categoria para organizar o catálogo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Buffet, Decoração..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Categoria
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
