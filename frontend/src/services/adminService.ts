import api from "@/libs/api";

export const adminService = {
  // Usuários
  getUsers: () => api.get("userprefs/users/"), 
  createUser: (data: any) => api.post("userprefs/users/", data),
  updateUser: (id: number, data: any) => api.patch(`userprefs/users/${id}/`, data),
  deleteUser: (id: number) => api.delete(`userprefs/users/${id}/`),

  // Grupos
  getGroups: () => api.get("userprefs/groups/"),
  createGroup: (data: any) => api.post("userprefs/groups/", data),
  updateGroup: (id: number, data: any) => api.patch(`userprefs/groups/${id}/`, data),
  deleteGroup: (id: number) => api.delete(`userprefs/groups/${id}/`),

  // Permissões
  getPermissions: () => api.get("userprefs/permissions/"),

  // Preferências e Visibilidade (URLs Corrigidas)
  getUserPreferences: () => api.get("userprefs/preferences/"),
  
  // Enviamos o objeto 'data' diretamente, pois o backend recebe o JSONField
  updateUserPreferences: (payload: any) => api.post("userprefs/preferences/", { data: payload }),
};