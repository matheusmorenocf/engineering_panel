// frontend/src/services/inventoryService.ts
import api from "@/libs/api";

export interface PhysicalControlEntry {
  id?: number;
  tracking_code?: string;
  // Alterado para string | number para suportar tanto o nome da peça quanto IDs se necessário
  product: string | number; 
  product_name?: string;
  quantity: number;
  location: string;
  responsible_person: string;
  sender?: string;
  client_name?: string;
  client_code?: string;
  nf_number?: string;
  action_type: 'IN' | 'OUT';
  notes?: string;
  movement_history?: any[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Service para gestão do Controle Físico (Inventário)
 */
export const inventoryService = {
  // Busca todos os registros. O tipo 'any' aqui ajuda a lidar com o objeto de paginação do Django (results)
  getAll: () => api.get<PhysicalControlEntry[] | any>("inventory/physical-control/"),
  
  // Busca um registro específico por ID
  getById: (id: number) => api.get<PhysicalControlEntry>(`inventory/physical-control/${id}/`),
  
  // Cria um novo registro (Entrada/Saída)
  create: (data: PhysicalControlEntry) => api.post<PhysicalControlEntry>("inventory/physical-control/", data),
  
  // Atualiza um registro existente (Alterar)
  // Utilizamos Partial para permitir enviar apenas os campos que mudaram
  update: (id: number, data: Partial<PhysicalControlEntry>) => 
    api.patch<PhysicalControlEntry>(`inventory/physical-control/${id}/`, data),
  
  // Remove um registro do sistema (Apagar)
  delete: (id: number) => api.delete(`inventory/physical-control/${id}/`),
};