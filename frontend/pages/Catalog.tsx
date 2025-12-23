import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Filter, 
  X, 
  Image as ImageIcon, 
  Package, 
  FileText,
  Settings,
  ChevronDown,
  Loader2,
  Grid,
  List,
  Plus
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../contexts/AuthContext";
import { useToastContext } from "../../contexts/ToastContext";
import DrawingCard from "../../components/catalog/DrawingCard";
import ProductDetailsModal from "../../components/catalog/ProductDetailsModal";
import ManagementModal from "../../components/catalog/ManagementModal";

// Mock data for demonstration
const MOCK_DRAWINGS = [
  {
    id: "PG448",
    drawingId: "PG448",
    sector: "FUNDIÇÃO",
    type: "PEÇA MECÂNICA",
    items_count: 5,
    products: "PROD001; PROD002; PROD003",
    descriptions: "EIXO PRINCIPAL DIAMETRO 50MM; EIXO SECUNDÁRIO; FLANGE ESPECIAL",
    imageUrl: null,
  },
  {
    id: "PG449",
    drawingId: "PG449",
    sector: "USINAGEM",
    type: "COMPONENTE",
    items_count: 3,
    products: "COMP100; COMP101",
    descriptions: "BUCHA DE BRONZE; ROLAMENTO AXIAL",
    imageUrl: null,
  },
  {
    id: "PG450",
    drawingId: "PG450",
    sector: "MONTAGEM",
    type: "CONJUNTO",
    items_count: 8,
    products: "CONJ200; CONJ201; CONJ202; CONJ203",
    descriptions: "CONJUNTO TRANSMISSÃO; KIT VEDAÇÃO; SUPORTE FIXAÇÃO",
    imageUrl: null,
  },
  {
    id: "AT125",
    drawingId: "AT125",
    sector: "CALDEIRARIA",
    type: "ESTRUTURA",
    items_count: 2,
    products: "EST300; EST301",
    descriptions: "VIGA PRINCIPAL; SUPORTE LATERAL",
    imageUrl: null,
  },
  {
    id: "AT126",
    drawingId: "AT126",
    sector: "FUNDIÇÃO",
    type: "PEÇA MECÂNICA",
    items_count: 4,
    products: "PROD500; PROD501; PROD502",
    descriptions: "CARCAÇA MOTOR; TAMPA FRONTAL; FLANGE TRASEIRO",
    imageUrl: null,
  },
  {
    id: "MX789",
    drawingId: "MX789",
    sector: "USINAGEM",
    type: "COMPONENTE",
    items_count: 6,
    products: "COMP600; COMP601; COMP602; COMP603",
    descriptions: "PINO GUIA; ANEL TRAVA; ESPAÇADOR; ARRUELA ESPECIAL",
    imageUrl: null,
  },
];

const SECTORS = ["FUNDIÇÃO", "USINAGEM", "MONTAGEM", "CALDEIRARIA", "PINTURA"];
const TYPES = ["PEÇA MECÂNICA", "COMPONENTE", "CONJUNTO", "ESTRUTURA", "ACESSÓRIO"];

export default function CatalogPage() {
  const { hasPermission } = useAuth();
  const { addToast } = useToastContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [drawings, setDrawings] = useState(MOCK_DRAWINGS);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Filters
  const [searchCode, setSearchCode] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [searchDrawing, setSearchDrawing] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [onlyMapped, setOnlyMapped] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modals
  const [selectedDrawing, setSelectedDrawing] = useState<typeof MOCK_DRAWINGS[0] | null>(null);
  const [showManagement, setShowManagement] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const filteredDrawings = useMemo(() => {
    return drawings.filter((drawing) => {
      if (searchCode && !drawing.products.toLowerCase().includes(searchCode.toLowerCase())) {
        return false;
      }
      if (searchDescription && !drawing.descriptions.toLowerCase().includes(searchDescription.toLowerCase())) {
        return false;
      }
      if (searchDrawing && !drawing.drawingId.toLowerCase().includes(searchDrawing.toLowerCase())) {
        return false;
      }
      if (selectedSectors.length > 0 && !selectedSectors.includes(drawing.sector)) {
        return false;
      }
      if (selectedTypes.length > 0 && !selectedTypes.includes(drawing.type)) {
        return false;
      }
      return true;
    });
  }, [drawings, searchCode, searchDescription, searchDrawing, selectedSectors, selectedTypes]);

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchCode("");
    setSearchDescription("");
    setSearchDrawing("");
    setSelectedSectors([]);
    setSelectedTypes([]);
    setOnlyMapped(false);
  };

  const hasActiveFilters = searchCode || searchDescription || searchDrawing || 
    selectedSectors.length > 0 || selectedTypes.length > 0 || onlyMapped;

  return (
    <div className="min-h-screen p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">
            Catálogo de Produtos
          </h1>
          <p className="text-muted-foreground">
            {filteredDrawings.length} desenhos encontrados
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasPermission("catalog.add_product") && (
            <Button variant="outline" onClick={() => setShowManagement(true)}>
              <Settings className="h-4 w-4" />
              Gerenciar Parâmetros
            </Button>
          )}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel rounded-xl p-4 mb-6">
        {/* Main Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Código do produto..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Descrição..."
              value={searchDescription}
              onChange={(e) => setSearchDescription(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Código do desenho..."
              value={searchDrawing}
              onChange={(e) => setSearchDrawing(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filtros avançados
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
            >
              <X className="h-4 w-4" />
              Limpar filtros
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sectors */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Setores</p>
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map((sector) => (
                    <button
                      key={sector}
                      onClick={() => toggleSector(sector)}
                      className={`
                        px-3 py-1.5 text-xs font-medium rounded-full border transition-all
                        ${selectedSectors.includes(sector)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/50"
                        }
                      `}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>

              {/* Types */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Tipos</p>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`
                        px-3 py-1.5 text-xs font-medium rounded-full border transition-all
                        ${selectedTypes.includes(type)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:border-primary/50"
                        }
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Only Mapped Toggle */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setOnlyMapped(!onlyMapped)}
                className={`
                  w-10 h-5 rounded-full transition-colors relative
                  ${onlyMapped ? "bg-primary" : "bg-muted"}
                `}
              >
                <div
                  className={`
                    absolute top-0.5 w-4 h-4 rounded-full bg-primary-foreground transition-transform
                    ${onlyMapped ? "translate-x-5" : "translate-x-0.5"}
                  `}
                />
              </button>
              <span className="text-sm text-foreground">Apenas produtos mapeados</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Badges */}
      {(selectedSectors.length > 0 || selectedTypes.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedSectors.map((sector) => (
            <span
              key={sector}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
            >
              {sector}
              <button onClick={() => toggleSector(sector)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selectedTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full"
            >
              {type}
              <button onClick={() => toggleType(type)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDrawings.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros para encontrar o que procura
          </p>
        </div>
      ) : (
        <div className={`
          ${viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
            : "flex flex-col gap-3"
          }
        `}>
          {filteredDrawings.map((drawing, index) => (
            <DrawingCard
              key={drawing.id}
              drawing={drawing}
              viewMode={viewMode}
              onClick={() => setSelectedDrawing(drawing)}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedDrawing && (
        <ProductDetailsModal
          drawing={selectedDrawing}
          onClose={() => setSelectedDrawing(null)}
          sectors={SECTORS}
          types={TYPES}
        />
      )}

      {showManagement && (
        <ManagementModal
          onClose={() => setShowManagement(false)}
          sectors={SECTORS}
          types={TYPES}
        />
      )}
    </div>
  );
}
