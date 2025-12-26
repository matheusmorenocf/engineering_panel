/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../libs/api";

export const inventoryService = {
  // =========================
  // Physical Control - Items
  // =========================
  getAll: async (params?: any) => api.get("physical-control/items/", { params }),
  updateItem: async (id: number, data: any) => api.patch(`physical-control/items/${id}/`, data),
  deleteItem: async (id: number) => api.delete(`physical-control/items/${id}/`),

  // =========================
  // Physical Control - Locations
  // =========================
  getLocations: async (params?: any) => api.get("physical-control/locations/", { params }),
  createLocation: async (data: any) => api.post("physical-control/locations/", data),
  updateLocation: async (id: number, data: any) => api.patch(`physical-control/locations/${id}/`, data),
  deleteLocation: async (id: number) => api.delete(`physical-control/locations/${id}/`),

  // =========================
  // Physical Control - Batch create
  // =========================
  createBatch: async (data: any) => {
    const formData = new FormData();
    formData.append("nf_number", data.nf_number || "S/NF");
    formData.append("receipt_date", data.receipt_date);
    formData.append("sender", data.sender);
    formData.append("general_notes", data.general_notes);
    if (data.nf_file) formData.append("nf_file", data.nf_file);

    data.items.forEach((item: any, index: number) => {
      const p = `items[${index}]`;
      formData.append(`${p}[product]`, item.product);
      formData.append(`${p}[quantity]`, item.quantity.toString());
      formData.append(`${p}[location]`, item.location.toString());
      formData.append(`${p}[physical_location]`, item.physical_location || "");
      formData.append(`${p}[notes]`, item.notes || "");
      if (item.photo_top) formData.append(`${p}[photo_top]`, item.photo_top);
      if (item.photo_front) formData.append(`${p}[photo_front]`, item.photo_front);
      if (item.photo_side) formData.append(`${p}[photo_side]`, item.photo_side);
      if (item.photo_iso) formData.append(`${p}[photo_iso]`, item.photo_iso);
    });

    // Seu api.ts seta Content-Type JSON por default; pra upload precisa multipart
    return api.post("physical-control/items/create-batch/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // =========================
  // Technical Processing (Triagem)
  // =========================
  getProcessingQueue: async (params?: any) => api.get("physical-control/processing/", { params }),
  updateItemProcessing: async (id: number, data: any) =>
    api.patch(`physical-control/processing/${id}/`, data),
  getSingleProcessing: async (id: number) => api.get(`physical-control/processing/${id}/`),
};
