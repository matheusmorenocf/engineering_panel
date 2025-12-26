/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileText, ImageIcon, Eye, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

interface PhysicalGroupedViewProps {
  items: any[];
  onSelectItem: (item: any) => void;
}

export function PhysicalGroupedView({ items, onSelectItem }: PhysicalGroupedViewProps) {
  const groupedByNF = useMemo(() => {
    return items.reduce((acc: any, item) => {
      const nf = item.nf_number || "SEM NF";
      if (!acc[nf]) acc[nf] = { nf, sender: item.sender, products: [] };
      acc[nf].products.push(item);
      return acc;
    }, {});
  }, [items]);

  return (
    <div className="space-y-6">
      {Object.values(groupedByNF).map((group: any) => (
        <Card key={group.nf} className="bg-card border border-border shadow-md overflow-hidden">
          <div className="bg-muted/50 p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight">NF: {group.nf}</h2>
                <p className="text-[10px] text-muted-foreground font-black uppercase">Remetente: {group.sender || "N/A"}</p>
              </div>
            </div>
          </div>
          <Table>
            <TableBody>
              {group.products.map((product: any) => (
                <TableRow key={product.id} className="hover:bg-muted/30 cursor-pointer border-border" onClick={() => onSelectItem(product)}>
                  <TableCell className="w-[80px]">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {product.photo_top ? <img src={product.photo_top} className="object-cover h-full w-full" /> : <ImageIcon className="h-6 w-6 text-muted-foreground/20" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-black text-sm uppercase line-clamp-1">{product.product}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{product.customer || "Consumidor Final"}</p>
                    <p className="text-[9px] text-muted-foreground/60 font-mono">ID: {product.control_id}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-black uppercase text-[10px]">
                      <MapPin className="h-3 w-3 mr-1" /> {product.location_name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6"><Eye className="h-5 w-5 text-muted-foreground" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ))}
    </div>
  );
}