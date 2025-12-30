import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { Position, Candidate } from "@shared/schema";
import {
  Briefcase,
  Plus,
  MapPin,
  Users,
  Building2,
  Edit2,
  Trash2,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const positionFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  department: z.string().min(2, "Department is required"),
  location: z.string().min(2, "Location is required"),
  employmentType: z.string().default("full-time"),
  status: z.string().default("open"),
  description: z.string().optional(),
  openings: z.coerce.number().min(1).default(1),
});

type PositionFormData = z.infer<typeof positionFormSchema>;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    paused: { label: "Paused", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    closed: { label: "Closed", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const variant = variants[status] || variants.open;
  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

function PositionCard({ 
  position, 
  onEdit, 
  onDelete,
  onSelect,
}: { 
  position: Position; 
  onEdit: () => void; 
  onDelete: () => void;
  onSelect: () => void;
}) {
  const { data: summary } = useQuery<{ position: Position; summary: { total: number; applied: number; screening: number; interview: number; offer: number; hired: number } }>({
    queryKey: ["/api/positions", position.id, "summary"],
  });

  const candidateCount = summary?.summary?.total || 0;

  return (
    <Card className="hover-elevate cursor-pointer" onClick={onSelect} data-testid={`card-position-${position.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate" data-testid={`text-position-title-${position.id}`}>{position.title}</h3>
              <StatusBadge status={position.status} />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {position.department}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {position.location}
              </span>
            </div>
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button size="icon" variant="ghost" onClick={onEdit} data-testid={`button-edit-position-${position.id}`}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete} data-testid={`button-delete-position-${position.id}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{candidateCount}</span>
              <span className="text-muted-foreground">candidates</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{position.openings} opening{position.openings !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {position.employmentType}
          </Badge>
        </div>

        {summary?.summary && summary.summary.total > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-border">
            {[
              { label: "Applied", value: summary.summary.applied, color: "bg-slate-500" },
              { label: "Screening", value: summary.summary.screening, color: "bg-blue-500" },
              { label: "Interview", value: summary.summary.interview, color: "bg-purple-500" },
              { label: "Offer", value: summary.summary.offer, color: "bg-orange-500" },
              { label: "Hired", value: summary.summary.hired, color: "bg-green-500" },
            ].map((stage) => (
              <div key={stage.label} className="text-center">
                <div className={`h-1.5 rounded-full ${stage.color} mb-1`} style={{ opacity: stage.value > 0 ? 1 : 0.2 }} />
                <p className="text-xs font-medium">{stage.value}</p>
                <p className="text-[10px] text-muted-foreground">{stage.label}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PositionDetail({ 
  position, 
  onClose 
}: { 
  position: Position; 
  onClose: () => void;
}) {
  const { data: candidates = [] } = useQuery<Candidate[]>({
    queryKey: ["/api/positions", position.id, "candidates"],
  });

  const { data: summary } = useQuery<{ position: Position; summary: Record<string, number> }>({
    queryKey: ["/api/positions", position.id, "summary"],
  });

  const stages = [
    { key: "applied", label: "Applied", icon: Clock, color: "text-slate-400" },
    { key: "screening", label: "Screening", icon: Clock, color: "text-blue-400" },
    { key: "interview", label: "Interview", icon: Clock, color: "text-purple-400" },
    { key: "offer", label: "Offer", icon: CheckCircle2, color: "text-orange-400" },
    { key: "hired", label: "Hired", icon: CheckCircle2, color: "text-green-400" },
    { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold">{position.title}</h2>
            <StatusBadge status={position.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {position.department}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {position.location}
            </span>
            <Badge variant="secondary">{position.employmentType}</Badge>
          </div>
        </div>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>

      {position.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{position.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {stages.map((stage) => {
              const count = summary?.summary?.[stage.key] || 0;
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="text-center p-3 rounded-md bg-muted/50">
                  <Icon className={`h-5 w-5 mx-auto mb-1 ${stage.color}`} />
                  <p className="text-lg font-semibold">{count}</p>
                  <p className="text-xs text-muted-foreground">{stage.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Candidates ({candidates.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No candidates assigned to this position yet.
            </p>
          ) : (
            <div className="space-y-2">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center gap-3 p-2 rounded-md hover-elevate">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{candidate.stage}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PositionForm({ 
  position, 
  onSuccess, 
  onCancel 
}: { 
  position?: Position; 
  onSuccess: () => void; 
  onCancel: () => void;
}) {
  const { toast } = useToast();
  
  const form = useForm<PositionFormData>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      title: position?.title || "",
      department: position?.department || "",
      location: position?.location || "",
      employmentType: position?.employmentType || "full-time",
      status: position?.status || "open",
      description: position?.description || "",
      openings: position?.openings || 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: PositionFormData) => apiRequest("POST", "/api/positions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
      toast({ title: "Position created successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to create position", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PositionFormData) => apiRequest("PATCH", `/api/positions/${position?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
      toast({ title: "Position updated successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to update position", variant: "destructive" });
    },
  });

  const onSubmit = (data: PositionFormData) => {
    if (position) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Senior Frontend Developer" {...field} data-testid="input-position-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Engineering" {...field} data-testid="input-position-department" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. San Francisco, CA" {...field} data-testid="input-position-location" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="employmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-employment-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-position-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="openings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Openings</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} data-testid="input-position-openings" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the role and responsibilities..." 
                  className="min-h-[100px]"
                  {...field} 
                  data-testid="textarea-position-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} data-testid="button-save-position">
            {isPending ? "Saving..." : position ? "Update Position" : "Create Position"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Positions() {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: positions = [], isLoading } = useQuery<Position[]>({
    queryKey: ["/api/positions"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/positions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
      toast({ title: "Position deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete position", variant: "destructive" });
    },
  });

  const openPositions = positions.filter(p => p.status === "open");
  const otherPositions = positions.filter(p => p.status !== "open");

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Job Positions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage open positions and track candidate pipelines
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-position">
              <Plus className="h-4 w-4 mr-2" />
              Add Position
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Position</DialogTitle>
            </DialogHeader>
            <PositionForm 
              onSuccess={() => setIsCreateOpen(false)} 
              onCancel={() => setIsCreateOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {selectedPosition ? (
        <PositionDetail 
          position={selectedPosition} 
          onClose={() => setSelectedPosition(null)} 
        />
      ) : (
        <>
          {openPositions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Open Positions ({openPositions.length})</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {openPositions.map((position) => (
                  <PositionCard
                    key={position.id}
                    position={position}
                    onEdit={() => setEditingPosition(position)}
                    onDelete={() => deleteMutation.mutate(position.id)}
                    onSelect={() => setSelectedPosition(position)}
                  />
                ))}
              </div>
            </div>
          )}

          {otherPositions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Paused & Closed ({otherPositions.length})</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {otherPositions.map((position) => (
                  <PositionCard
                    key={position.id}
                    position={position}
                    onEdit={() => setEditingPosition(position)}
                    onDelete={() => deleteMutation.mutate(position.id)}
                    onSelect={() => setSelectedPosition(position)}
                  />
                ))}
              </div>
            </div>
          )}

          {positions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No positions yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  Create your first job position to organize candidates by role and track your hiring pipeline for each opening.
                </p>
                <Button onClick={() => setIsCreateOpen(true)} data-testid="button-empty-add-position">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={!!editingPosition} onOpenChange={(open) => !open && setEditingPosition(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
          </DialogHeader>
          {editingPosition && (
            <PositionForm 
              position={editingPosition}
              onSuccess={() => setEditingPosition(null)} 
              onCancel={() => setEditingPosition(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
