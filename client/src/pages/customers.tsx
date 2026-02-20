import { useState } from "react";
import { useEvents } from "@/hooks/use-resources";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Search, User, Phone, MapPin, ExternalLink } from "lucide-react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EventResponse } from "@shared/schema";

export default function Customers() {
  const { data: events } = useEvents();
  const [search, setSearch] = useState("");

  // Group events by client
  const clientsMap = new Map();
  events?.forEach((event: EventResponse) => {
    if (!clientsMap.has(event.clientName)) {
      clientsMap.set(event.clientName, {
        name: event.clientName,
        phone: event.clientPhone,
        email: event.clientEmail,
        address: event.clientAddress,
        events: []
      });
    }
    clientsMap.get(event.clientName).events.push(event);
  });

  const clients = Array.from(clientsMap.values());
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Clientes" 
        description="Histórico e base de dados de clientes"
      />

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nome ou telefone..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none shadow-none focus-visible:ring-0 h-auto p-0 placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card/50 rounded-xl border border-dashed border-border">
            Nenhum cliente encontrado.
          </div>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.name} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {client.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {client.phone || "Não informado"}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{client.address || "Endereço não cadastrado"}</span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Últimos Eventos ({client.events.length})</h4>
                  <div className="space-y-2">
                    {client.events.slice(0, 3).map((event: any) => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="flex items-center justify-between text-xs p-2 rounded bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                          <span>{format(new Date(event.eventDate), "dd/MM/yyyy", { locale: ptBR })}</span>
                          <span className="font-medium group-hover:text-primary transition-colors flex items-center gap-1">
                            Ver Detalhes <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
