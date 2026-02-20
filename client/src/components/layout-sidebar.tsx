import { 
  LayoutDashboard, Calendar, Package, Users, Truck, 
  LogOut, Settings, Menu, Calendar as CalendarIcon
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useLogout, useUser } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Eventos", url: "/events", icon: Calendar },
  { title: "Calendário", url: "/calendar", icon: CalendarIcon },
  { title: "Clientes", url: "/customers", icon: Users },
  { title: "Catálogo", url: "/catalog", icon: Package },
  { title: "Equipe", url: "/employees", icon: Users },
  { title: "Frota", url: "/vehicles", icon: Truck },
];

export function LayoutSidebar({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { mutate: logout } = useLogout();
  const { data: user } = useUser();

  const getInitials = (name?: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "U";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">B</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight">Betinha</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground uppercase tracking-wider text-xs font-semibold px-4 py-2">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location === item.url || (item.url !== "/" && location.startsWith(item.url))}
                        className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-muted/50 transition-colors"
                      >
                        <Link href={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-muted text-muted-foreground">{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex items-center gap-4">
              {/* Additional header items like notifications could go here */}
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
