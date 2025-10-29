import { Bug, Clock, AlertCircle, CheckCircle2, XCircle, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';


const severityConfig = {
  low: { color: 'hsl(var(--severity-low))', label: 'Low' },
  medium: { color: 'hsl(var(--severity-medium))', label: 'Medium' },
  high: { color: 'hsl(var(--severity-high))', label: 'High' },
  critical: { color: 'hsl(var(--severity-critical))', label: 'Critical' },
};

const statusIcons = {
  'open': AlertCircle,
  'in-progress': Clock,
  'resolved': CheckCircle2,
  'closed': XCircle,
};

export const BugCard = ({ bug, onEdit, onDelete }) => {
  const StatusIcon = statusIcons[bug.status];
  
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 animate-fade-in"
      style={{ borderLeftColor: severityConfig[bug.severity].color }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <h3 className="text-lg font-semibold text-foreground truncate">
              {bug.title}
            </h3>
          </div>

          {bug.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {bug.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
              variant="outline"
              style={{ 
                borderColor: severityConfig[bug.severity].color,
                color: severityConfig[bug.severity].color 
              }}
            >
              {severityConfig[bug.severity].label}
            </Badge>
            
            <Badge variant="secondary" className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {bug.status}
            </Badge>

            <Badge variant="outline">
              Priority: {bug.priority}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(bug.created_at), { addSuffix: true })}
            </span>
            {bug.assigned_to && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Assigned
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(bug.id)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(bug.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};
