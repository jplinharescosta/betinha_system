import { useEvents, useDeleteEvent } from "@/hooks/use-resources";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MapPin, Truck, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatusBadge } from "@/components/status-badge";
import { type EventResponse } from "@shared/schema";

export default function EventsList() {
  const { data: events, isLoading } = useEvents();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="p-8 text-center">Carregando eventos...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Eventos" 
        description="Gerencie todos os seus eventos e orçamentos"
      >
        <Link href="/events/new">
          <Button className="gap-2 shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card/50 rounded-xl border border-dashed border-border">
            Nenhum evento encontrado. Crie o primeiro!
          </div>
        ) : (
          events?.map((event: EventResponse) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventResponse }) {
  const date = new Date(event.eventDate);
  
  const statusVariant = {
    PENDING: "warning",
    CONFIRMED: "success",
    DONE: "default",
    CANCELED: "error",
  }[event.status] as any;

  const financialVariant = {
    UNPAID: "error",
    PARTIAL: "warning",
    PAID: "success",
  }[event.financialStatus] as any;

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <StatusBadge status={event.status} variant={statusVariant} />
            <span className="text-xs font-mono text-muted-foreground">
              {format(date, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
          <CardTitle className="text-lg font-bold line-clamp-1 mt-2 group-hover:text-primary transition-colors">
            {event.clientName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{format(date, "EEEE, HH:mm", { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{event.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 shrink-0" />
            <span className="capitalize">{event.transportType.replace("_", " ").toLowerCase()}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-3 border-t border-border/50 flex justify-between items-center bg-muted/20">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Valor Total</span>
            <span className="font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(event.totalRevenue))}
            </span>
          </div>
          <StatusBadge status={event.financialStatus} variant={financialVariant} className="text-[10px] px-2" />
        </CardFooter>
      </Card>
    </Link>
  );
}
