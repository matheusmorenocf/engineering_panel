/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../libs/api";

export const inventoryService = {
  // ==========================================
  // LOCAIS (LOCATIONS)
  // ==========================================
  
  getLocations: async () => api.get("physical-control/locations/"),
  
  createLocation: async (data: any) => 
    api.post("physical-control/locations/", data),
    
  updateLocation: async (id: number, data: any) => 
    api.put(`physical-control/locations/${id}/`, data),
  
  deleteLocation: async (id: number) => 
    api.delete(`physical-control/locations/${id}/`),

  // ==========================================
  // REGISTROS (PHYSICAL CONTROL)
  // ==========================================
  
  getAll: async () => api.get("physical-control/items/"),
  
  /**
   * Criação em lote (Batch) enviando FormData para suportar arquivos.
   */
  createBatch: async (data: any) => {
    const formData = new FormData();
    
    // Dados do cabeçalho da NF
    formData.append("nf_number", data.nf_number);
    formData.append("receipt_date", data.receipt_date);
    formData.append("sender", data.sender);
    formData.append("general_notes", data.general_notes);
    if (data.nf_file) formData.append("nf_file", data.nf_file);

    // Itens do lote
    data.items.forEach((item: any, index: number) => {
      const p = `items[${index}]`;
      formData.append(`${p}[product]`, item.product);
      formData.append(`${p}[quantity]`, item.quantity.toString());
      formData.append(`${p}[location]`, item.location.toString());
      formData.append(`${p}[notes]`, item.notes || "");
      
      if (item.photo_top) formData.append(`${p}[photo_top]`, item.photo_top);
      if (item.photo_front) formData.append(`${p}[photo_front]`, item.photo_front);
      if (item.photo_side) formData.append(`${p}[photo_side]`, item.photo_side);
      if (item.photo_iso) formData.append(`${p}[photo_iso]`, item.photo_iso);
    });

    return api.post("physical-control/items/create-batch/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Atualiza um item individual (utilizado pelo PhysicalDetailsModal).
   * Note a barra final '/' - O Django a exige para métodos PATCH/PUT.
   */
  updateItem: async (id: number, data: any) => {
    return api.patch(`physical-control/items/${id}/`, data);
  },

  /**
   * Remove um registro permanentemente.
   */
  deleteItem: async (id: number) => 
    api.delete(`physical-control/items/${id}/`),
};