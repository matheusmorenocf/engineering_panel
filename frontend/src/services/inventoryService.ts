import api from "@/libs/api";

export interface PhysicalControlEntry {
  id?: number;
  product: string | number; 
  product_name?: string;
  quantity: number;
  location: string | number; // No backend é uma FK para Location
  location_name?: string;
  action_type: 'IN' | 'OUT';
  notes?: string;
  attachments?: FileList | any[]; // Suporte para anexos
  created_at?: string;
  updated_at?: string;
}

/**
 * Service para gestão do Controle Físico (Inventário)
 */
export const inventoryService = {
  // Busca todos os registros
  getAll: () => api.get<any>("inventory/physical-control/"),
  
  // Busca um registro específico por ID
  getById: (id: number) => api.get<PhysicalControlEntry>(`inventory/physical-control/${id}/`),
  
  // Cria um novo registro (Entrada/Saída) usando FormData para suportar anexos
  create: (data: PhysicalControlEntry) => {
    const formData = new FormData();
    
    // Adiciona campos básicos (Removidos campos inexistentes no backend)
    formData.append("product", String(data.product));
    formData.append("quantity", String(data.quantity));
    formData.append("location", String(data.location));
    formData.append("action_type", data.action_type);
    
    if (data.notes) {
      formData.append("notes", data.notes);
    }

    // Adiciona múltiplos arquivos se houver
    if (data.attachments && data.attachments instanceof FileList) {
      Array.from(data.attachments).forEach((file) => {
        formData.append("uploaded_attachments", file);
      });
    }

    return api.post<PhysicalControlEntry>("inventory/physical-control/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  
  // Atualiza um registro existente
  update: (id: number, data: Partial<PhysicalControlEntry>) => {
    // Para PATCH com arquivos, também é recomendado usar FormData se for alterar anexos
    return api.patch<PhysicalControlEntry>(`inventory/physical-control/${id}/`, data);
  },
  
  // Remove um registro do sistema
  delete: (id: number) => api.delete(`inventory/physical-control/${id}/`),
};