/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../libs/api";

export const inventoryService = {
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

    return api.post("physical-control/items/create-batch/", formData);
  },
  updateItemProcessing: async (id: number, data: any) => 
    api.patch(`physical-control/processing/${id}/`, data),
  getSingleProcessing: async (id: number) => api.get(`physical-control/processing/${id}/`),
};