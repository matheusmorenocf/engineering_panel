import React from "react";
import { ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GroupsTabProps {
  groups: any[];
  onAddClick: () => void;
  onEditClick: (group: any) => void;
  onDeleteClick: (e: React.MouseEvent, id: number) => void;
}

export function GroupsTab({ groups, onAddClick, onEditClick, onDeleteClick }: GroupsTabProps) {
  return (
    <div className="space-y-4 outline-none">
      <div className="flex justify-end">
        <Button onClick={onAddClick} variant="outline" className="gap-2 border-dashed">
          <ShieldCheck className="h-4 w-4" /> Criar Novo Grupo
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(groups) && groups.map((group) => (
          <Card 
            key={group.id} 
            className="hover:shadow-md transition-all border-l-4 border-l-primary group cursor-pointer"
            onClick={() => onEditClick(group)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">{group.name}</CardTitle>
                <div className="flex gap-1">
                   <Badge variant="outline" className="text-[10px]">{group.permissions?.length || 0} Perms</Badge>
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     className="text-destructive h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                     onClick={(e) => onDeleteClick(e, group.id)} // Aciona a exclusão
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
               <div className="flex flex-wrap gap-1">
                  {Array.isArray(group.permissions_details) && group.permissions_details.slice(0, 3).map((p: any) => (
                    <Badge key={p.id} variant="secondary" className="text-[9px] lowercase">{p.codename}</Badge>
                  ))}
                  {group.permissions?.length > 3 && <span className="text-[10px] text-muted-foreground">...+{group.permissions.length - 3}</span>}
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}