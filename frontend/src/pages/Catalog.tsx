import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DrawingCard } from "@/components/catalog/DrawingCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

export const Catalog = () {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.get("/api/drawings/");
        setDrawings(response.data);
      } catch (error) {
        console.error("Erro ao carregar catálogo", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredDrawings = drawings.filter((d: any) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Desenhos</h1>
          <p className="text-muted-foreground">Visualize e gerencie os desenhos técnicos.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar desenho..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDrawings.map((drawing: any) => (
            <DrawingCard key={drawing.id} drawing={drawing} />
          ))}
        </div>
      )}
    </div>
  );
}