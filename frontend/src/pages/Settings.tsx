import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, RefreshCw, Users, ShieldCheck, FilePieChart, Layout } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { useToastContext } from "@/contexts/ToastContext";
import { adminService } from "@/services/adminService";



// Modais
import { UserFormModal } from "@/components/settings/UserFormModal";
import { GroupFormModal } from "@/components/settings/GroupFormModal";
import { GroupsTab } from "@/components/settings/sections/GroupsTab";
import { UsersTab } from "@/components/settings/sections/UsersTab";
import { ReportsTab } from "@/components/settings/sections/ReportsTab";
import { PagesTab } from "@/components/settings/sections/PagesTab";

export default function Settings() {
  const { addToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, gRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getGroups()
      ]);
      setUsers(uRes.data?.results || uRes.data || []);
      setGroups(gRes.data?.results || gRes.data || []);
    } catch (error) {
      addToast("Erro ao sincronizar dados.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredUsers = Array.isArray(users) ? users.filter(u => {
    const search = searchTerm.toLowerCase();
    return u.username?.toLowerCase().includes(search) || 
           `${u.first_name} ${u.last_name}`.toLowerCase().includes(search);
  }) : [];

  return (
    <div className="min-h-screen p-6 lg:p-8 animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" /> Configurações
          </h1>
          <p className="text-muted-foreground text-sm">Gestão de acessos e recursos.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-2">
          <RefreshCw className={loading ? "animate-spin" : ""} /> Sincronizar
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <div className="glass-panel p-1 rounded-xl inline-block w-full lg:w-auto shadow-sm">
          <TabsList className="bg-transparent gap-1">
            <TabsTrigger value="users" className="gap-2 px-4 py-2 font-medium">
              <Users className="h-4 w-4" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2 px-4 py-2 font-medium">
              <ShieldCheck className="h-4 w-4" /> Grupos
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2 px-4 py-2 font-medium">
              <FilePieChart className="h-4 w-4" /> Relatórios
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2 px-4 py-2 font-medium">
              <Layout className="h-4 w-4" /> Páginas
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users">
          <UsersTab 
            users={filteredUsers} groups={groups} loading={loading} searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
            onEditClick={(u) => { setEditingUser(u); setIsUserModalOpen(true); }}
            onDeleteClick={(id) => adminService.deleteUser(id).then(fetchData)}
          />
        </TabsContent>

        <TabsContent value="groups">
          <GroupsTab 
            groups={groups} 
            onAddClick={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
            onEditClick={(g) => { setEditingGroup(g); setIsGroupModalOpen(true); }}
            onDeleteClick={(e, id) => { e.stopPropagation(); adminService.deleteGroup(id).then(fetchData); }}
          />
        </TabsContent>

        <TabsContent value="reports"><ReportsTab /></TabsContent>
        <TabsContent value="pages"><PagesTab /></TabsContent>
      </Tabs>

      <UserFormModal 
        isOpen={isUserModalOpen} 
        onClose={() => { setIsUserModalOpen(false); setEditingUser(null); }} 
        onSuccess={fetchData} 
        groups={groups} 
        editingUser={editingUser}
      />

      <GroupFormModal 
        isOpen={isGroupModalOpen} 
        onClose={() => { setIsGroupModalOpen(false); setEditingGroup(null); }} 
        onSuccess={fetchData} 
        editingGroup={editingGroup}
      />
    </div>
  );
}