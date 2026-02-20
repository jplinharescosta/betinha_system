import { useState } from "react";
import { useEvents } from "@/hooks/use-resources";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addYears, subYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Calendar() {
  const [currentYear, setCurrentYear] = useState(new Date());
  const { data: events } = useEvents();

  const months = eachMonthOfInterval({
    start: startOfYear(currentYear),
    end: endOfYear(currentYear)
  });

  const getEventsForDay = (day: Date) => {
    return events?.filter(event => isSameDay(new Date(event.eventDate), day)) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'DONE': return 'bg-blue-500';
      case 'CANCELED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Calendário de Eventos" 
        description="Visualize todos os eventos do ano"
      >
        <div className="flex items-center gap-2 bg-card p-1 rounded-lg border border-border shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => setCurrentYear(subYears(currentYear, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-bold px-2">{format(currentYear, "yyyy")}</span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentYear(addYears(currentYear, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </PageHeader>

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
                  {/* Padding for start of month */}
                  {Array.from({ length: startOfMonth(month).getDay() }).map((_, i) => (
                    <div key={`pad-${i}`} className="h-8" />
                  ))}
                  
                  {days.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    return (
                      <div 
                        key={day.toString()} 
                        className={cn(
                          "h-8 rounded-md flex flex-col items-center justify-center relative transition-colors border border-transparent",
                          dayEvents.length > 0 ? "bg-primary/10 border-primary/20" : "hover:bg-muted"
                        )}
                      >
                        <span className={cn(
                          "text-xs font-medium",
                          dayEvents.length > 0 ? "text-primary font-bold" : "text-foreground"
                        )}>
                          {format(day, "d")}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5">
                            {dayEvents.slice(0, 3).map((event, idx) => (
                              <div 
                                key={event.id} 
                                className={cn("w-1 h-1 rounded-full", getStatusColor(event.status))}
                              />
                            ))}
                          </div>
                        )}
                        {dayEvents.length > 0 && (
                          <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-background/95 flex items-center justify-center p-1 z-20 rounded-md border border-border shadow-lg transition-opacity overflow-hidden">
                            <div className="flex flex-col gap-1 w-full">
                              {dayEvents.map(event => (
                                <Link key={event.id} href={`/events/${event.id}`} className="text-[8px] truncate hover:text-primary transition-colors">
                                  • {event.clientName}
                                </Link>
                              ))}
                            </div>
                          </div>
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
    </div>
  );
}
