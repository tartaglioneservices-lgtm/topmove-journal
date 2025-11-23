import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  description?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  trend = 'neutral',
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {change !== undefined && (
          <p
            className={cn(
              'text-xs mt-1',
              trend === 'up' && 'text-profit',
              trend === 'down' && 'text-loss',
              trend === 'neutral' && 'text-muted-foreground'
            )}
          >
            {change > 0 ? '+' : ''}
            {change.toFixed(2)}% depuis le dernier mois
          </p>
        )}
      </CardContent>
    </Card>
  )
}
