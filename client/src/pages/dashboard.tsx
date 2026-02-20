import { useStats } from "@/hooks/use-resources";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, Package, Users } from "lucide-react";
import { 
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Dashboard" 
        description="Visão geral do desempenho financeiro e operacional"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Receita Mensal" 
          value={stats?.monthlyRevenue ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(stats.monthlyRevenue)) : "R$ 0,00"} 
          icon={DollarSign}
          description="Total faturado este mês"
          trend="up"
        />
        <StatCard 
          title="Lucro Líquido" 
          value={stats?.monthlyProfit ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(stats.monthlyProfit)) : "R$ 0,00"} 
          icon={TrendingUp}
          description="Após todos os custos"
          trend="up"
        />
        <StatCard 
          title="Margem Média" 
          value={stats?.avgMargin ? `${stats.avgMargin}%` : "0%"} 
          icon={ArrowUpRight}
          description="Rentabilidade por evento"
        />
        <StatCard 
          title="Eventos Pendentes" 
          value={stats?.pendingEvents.toString() || "0"} 
          icon={Calendar}
          description="Aguardando confirmação"
          trend="neutral"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Receita vs Custos (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chartData || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `R$${value/1000}k`} 
                  />
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Receita"
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="costs" 
                    name="Custos"
                    stroke="#f43f5e" 
                    fillOpacity={1} 
                    fill="url(#colorCosts)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/events/new">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between group cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Novo Evento</p>
                    <p className="text-xs text-muted-foreground">Cadastrar orçamento</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
            
            <Link href="/customers">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between group cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Novo Cliente</p>
                    <p className="text-xs text-muted-foreground">Cadastrar no sistema</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>

            <Link href="/catalog">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between group cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/10 text-purple-500">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Novo Produto</p>
                    <p className="text-xs text-muted-foreground">Adicionar ao catálogo</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description, trend }: any) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Skeleton className="col-span-4 h-[400px] rounded-xl" />
        <Skeleton className="col-span-3 h-[400px] rounded-xl" />
      </div>
    </div>
  );
}
