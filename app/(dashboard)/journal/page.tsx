import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default function JournalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
        <p className="text-muted-foreground">
          Notez vos réflexions et analyses quotidiennes
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center">Bientôt disponible</CardTitle>
          <CardDescription className="text-center">
            Le journal de trading sera disponible prochainement
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Fonctionnalités à venir :</p>
          <ul className="mt-2 space-y-1">
            <li>• Notes quotidiennes enrichies</li>
            <li>• Checklist pré-trade personnalisable</li>
            <li>• Analyse psychologique</li>
            <li>• Session replay</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
