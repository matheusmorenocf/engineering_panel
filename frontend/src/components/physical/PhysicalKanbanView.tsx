/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapPin, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

interface PhysicalKanbanViewProps {
  items: any[];
  onSelectItem: (item: any) => void;
}

export function PhysicalKanbanView({ items, onSelectItem }: PhysicalKanbanViewProps) {
  const kanbanColumns = useMemo(() => {
    return items.reduce((acc: any, item) => {
      const loc = item.location_name || "NÃO ENDEREÇADO";
      if (!acc[loc]) acc[loc] = [];
      acc[loc].push(item);
      return acc;
    }, {});
  }, [items]);

  return (
    <div className="flex gap-6 h-full pb-4 overflow-x-auto custom-scrollbar">
      {Object.entries(kanbanColumns).map(([location, products]: any) => (
        <div key={location} className="w-80 flex-shrink-0 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase flex items-center gap-2 tracking-widest">
              <MapPin className="h-4 w-4 text-primary" /> {location}
            </h3>
            <Badge variant="secondary" className="font-black">{products.length}</Badge>
          </div>
          <div className="flex-1 space-y-4 p-4 rounded-2xl bg-muted/30 border border-dashed overflow-y-auto max-h-[70vh] custom-scrollbar">
            {products.map((p: any) => (
              <Card key={p.id} className="bg-card border border-border shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => onSelectItem(p)}>
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {p.photo_top ? <img src={p.photo_top} className="object-cover w-full h-full" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="h-10 w-10 text-muted-foreground/20" /></div>}
                  <div className="absolute top-2 right-2"><Badge className="bg-foreground text-background font-black text-[10px]">{p.quantity} un</Badge></div>
                </div>
                <CardContent className="p-4">
                  <p className="text-xs font-black uppercase group-hover:text-primary transition-colors line-clamp-2">{p.product}</p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase truncate">{p.customer || "Consumidor Final"}</p>
                  <div className="mt-2 text-[9px] font-black uppercase p-1.5 rounded bg-warning/10 text-warning border border-warning/20 text-center font-mono">{p.control_id}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}