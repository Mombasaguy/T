import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  actionHref 
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          {description}
        </p>
        {actionLabel && (onAction || actionHref) && (
          actionHref ? (
            <a href={actionHref}>
              <Button data-testid="button-empty-action">
                {actionLabel}
              </Button>
            </a>
          ) : (
            <Button onClick={onAction} data-testid="button-empty-action">
              {actionLabel}
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}

export default EmptyState;
