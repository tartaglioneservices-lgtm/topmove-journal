import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Analyses avancées de vos performances
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center">Bientôt disponible</CardTitle>
          <CardDescription className="text-center">
            Les analytics avancées seront disponibles prochainement
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Fonctionnalités à venir :</p>
          <ul className="mt-2 space-y-1">
            <li>• Calendrier heatmap</li>
            <li>• Métriques par setup</li>
            <li>• Distribution des gains/pertes</li>
            <li>• Analyse par horaire</li>
            <li>• Comparaison de périodes</li>
            <li>• Exports PDF</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
