import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function Positions() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Job Positions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage open positions and job postings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Open Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm" data-testid="text-positions-placeholder">
            Job position management coming soon. Use the Search page to find candidates for your open roles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
