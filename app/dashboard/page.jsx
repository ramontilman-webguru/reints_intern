import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, User, FileText, TrendingUp } from "lucide-react";
import { getDashboardStats, getOrders } from "@/lib/data-service";
import { Button } from "@/components/ui/button";
import TodoCreator from "@/components/ai/TodoCreator";

export default async function DashboardPage() {
  // Haal statistieken op
  const stats = await getDashboardStats();
  const recentOrders = await getOrders();

  return (
    <div className='space-y-6'>
      <h2 className='text-3xl font-bold tracking-tight'>
        Welkom bij Reints Office
      </h2>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Producten'
          value={stats.productCount.toString()}
          description='Actieve producten'
          icon={<Package className='h-5 w-5 text-muted-foreground' />}
        />
        <StatsCard
          title='Klanten'
          value={stats.customerCount.toString()}
          description='Actieve klanten'
          icon={<User className='h-5 w-5 text-muted-foreground' />}
        />
        <StatsCard
          title='Open Orders'
          value={stats.openOrderCount.toString()}
          description='In behandeling'
          icon={<FileText className='h-5 w-5 text-muted-foreground' />}
        />
        <StatsCard
          title='Te doen'
          value={stats.openTaskCount.toString()}
          description='Openstaande taken'
          icon={<TrendingUp className='h-5 w-5 text-muted-foreground' />}
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Recente Orders</CardTitle>
            <CardDescription>De laatste binnengekomen orders</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <ul className='space-y-2'>
                {recentOrders.slice(0, 5).map((order) => (
                  <li key={order.id} className='border-b pb-2'>
                    <div className='flex justify-between'>
                      <p className='font-medium'>
                        {order.customer?.name || "Onbekende klant"}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {new Date(order.created_at).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Status: {order.status}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-muted-foreground'>
                Geen orders gevonden
              </p>
            )}
          </CardContent>
        </Card>
        <Card className='lg:col-span-1'>
          <CardHeader>
            <CardTitle>AI To-Do Creator</CardTitle>
            <CardDescription>
              Create tasks using natural language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TodoCreator />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, description, icon }) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <p className='text-xs text-muted-foreground'>{description}</p>
      </CardContent>
    </Card>
  );
}
