import React from "react";
import { Search, Plus, Pencil, Key, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UsersTabProps {
  users: any[];
  groups: any[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  onEditClick: (user: any) => void;
  onDeleteClick: (id: number) => void;
}

export function UsersTab({
  users,
  groups,
  loading,
  searchTerm,
  onSearchChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: UsersTabProps) {
  return (
    <div className="space-y-4 outline-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por login ou nome..." 
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button onClick={onAddClick} className="gap-2 w-full md:w-auto shadow-md">
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-bold">Nome Completo</TableHead>
              <TableHead className="font-bold">Login</TableHead>
              <TableHead className="font-bold">Grupos</TableHead>
              <TableHead className="text-right font-bold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : <span className="text-muted-foreground italic">Administrador</span>}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{u.username}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(u.groups) && u.groups.map((gId: any) => {
                        const groupName = Array.isArray(groups) ? groups.find(g => g.id === gId)?.name : null;
                        return (
                          <Badge key={gId} variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none">
                            {groupName || `ID: ${gId}`}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => onEditClick(u)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Redefinir Senha"><Key className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDeleteClick(u.id)} title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                  {loading ? "Carregando..." : "Nenhum usuário encontrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}