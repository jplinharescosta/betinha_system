import { useState } from "react";
import { useEvents } from "@/hooks/use-resources";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, LayoutGrid, ExternalLink } from "lucide-react";
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addYears, subYears, compareAsc } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EventResponse } from "@shared/schema";

function getDotColor(count: number) {
  if (count >= 3) return "bg-red-500";
  if (count === 2) return "bg-yellow-500";
  if (count === 1) return "bg-green-500";
  return "";
}

function getStatusLabel(s: string) {
  switch (s) {
    case "CONFIRMED": return { label: "Confirmado", variant: "success" as const };
    case "PENDING": return { label: "Pendente", variant: "warning" as const };
    case "DONE": return { label: "Concluído", variant: "info" as const };
    case "CANCELED": return { label: "Cancelado", variant: "error" as const };
    default: return { label: s, variant: "default" as const };
  }
}

export default function Calendar() {
  const [currentYear, setCurrentYear] = useState(new Date());
  const [view, setView] = useState<"grid" | "timeline">("grid");
  const [selectedDay, setSelectedDay] = useState<{ date: Date; events: EventResponse[] } | null>(null);
  const [, navigate] = useLocation();
  const { data: events } = useEvents();

  const months = eachMonthOfInterval({
    start: startOfYear(currentYear),
    end: endOfYear(currentYear)
  });

  const getEventsForDay = (day: Date) => {
    return events?.filter((event: EventResponse) => isSameDay(new Date(event.eventDate), day)) || [];
  };

  // Get events for the whole year, sorted by date
  const yearEvents = (events || [])
    .filter((e: EventResponse) => {
      const d = new Date(e.eventDate);
      return d.getFullYear() === currentYear.getFullYear();
    })
    .sort((a: EventResponse, b: EventResponse) => compareAsc(new Date(a.eventDate), new Date(b.eventDate)));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Calendário de Eventos" 
        description="Visualize todos os eventos do ano"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-card p-1 rounded-lg border border-border shadow-sm">
            <Button 
              variant={view === "grid" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setView("grid")}
              className="gap-1.5"
            >
              <LayoutGrid className="h-4 w-4" />
              Grade
            </Button>
            <Button 
              variant={view === "timeline" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setView("timeline")}
              className="gap-1.5"
            >
              <List className="h-4 w-4" />
              Linha do Tempo
            </Button>
          </div>
          <div className="flex items-center gap-2 bg-card p-1 rounded-lg border border-border shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => setCurrentYear(subYears(currentYear, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-bold px-2">{format(currentYear, "yyyy")}</span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentYear(addYears(currentYear, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PageHeader>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span>1 evento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span>2 eventos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>3+ eventos</span>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {months.map((month) => {
            const days = eachDayOfInterval({
              start: startOfMonth(month),
              end: endOfMonth(month)
            });

            return (
              <Card key={month.toString()} className="border-border/50 shadow-sm overflow-hidden bg-card">
                <div className="bg-primary/5 p-2 border-b border-border/50 text-center font-semibold capitalize text-primary">
                  {format(month, "MMMM", { locale: ptBR })}
                </div>
                <CardContent className="p-3">
                  <div className="grid grid-cols-7 gap-1 text-[10px] text-center mb-1 text-muted-foreground font-medium uppercase">
                    <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: startOfMonth(month).getDay() }).map((_, i) => (
                      <div key={`pad-${i}`} className="h-8" />
                    ))}
                    
                    {days.map((day) => {
                      const dayEvents = getEventsForDay(day);
                      const count = dayEvents.length;
                      return (
                        <div 
                          key={day.toString()} 
                          className={cn(
                            "h-8 rounded-md flex flex-col items-center justify-center relative transition-colors border border-transparent",
                            count > 0 ? "bg-primary/10 border-primary/20 cursor-pointer" : "hover:bg-muted"
                          )}
                          onClick={() => {
                            if (count === 1) {
                              navigate(`/events/${dayEvents[0].id}`);
                            } else if (count > 1) {
                              setSelectedDay({ date: day, events: dayEvents });
                            }
                          }}
                        >
                          <span className={cn(
                            "text-xs font-medium",
                            count > 0 ? "text-primary font-bold" : "text-foreground"
                          )}>
                            {format(day, "d")}
                          </span>
                          {count > 0 && (
                            <div className={cn("w-1.5 h-1.5 rounded-full mt-0.5", getDotColor(count))} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-4">
          {yearEvents.length === 0 ? (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhum evento encontrado para {format(currentYear, "yyyy")}.
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
              {yearEvents.map((event: EventResponse, idx: number) => {
                const st = getStatusLabel(event.status);
                const eventDate = new Date(event.eventDate);
                return (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="relative flex items-start gap-4 pl-12 pr-4 py-3 group cursor-pointer">
                      <div className={cn(
                        "absolute left-[18px] top-5 w-3.5 h-3.5 rounded-full border-2 border-background z-10",
                        event.status === "CONFIRMED" ? "bg-green-500" :
                        event.status === "PENDING" ? "bg-yellow-500" :
                        event.status === "DONE" ? "bg-blue-500" :
                        event.status === "CANCELED" ? "bg-red-500" : "bg-gray-500"
                      )} />
                      <Card className="flex-1 border-border/50 shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{event.clientName}</span>
                                <StatusBadge status={st.label} variant={st.variant} />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(eventDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                {event.eventTime && ` às ${event.eventTime}`}
                              </div>
                              {event.eventAddress && (
                                <div className="text-xs text-muted-foreground mt-1 truncate">
                                  📍 {event.eventAddress}
                                </div>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm font-bold text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(event.totalRevenue) || 0)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Dialog for multiple events on same day */}
      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              Eventos em {selectedDay ? format(selectedDay.date, "dd 'de' MMMM, EEEE", { locale: ptBR }) : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {selectedDay?.events.map((event: EventResponse) => {
              const st = getStatusLabel(event.status);
              return (
                <Link key={event.id} href={`/events/${event.id}`} onClick={() => setSelectedDay(null)}>
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm">{event.clientName}</span>
                        <StatusBadge status={st.label} variant={st.variant} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.eventTime && `${event.eventTime} · `}
                        {event.eventAddress || "Sem endereço"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(event.totalRevenue) || 0)}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
