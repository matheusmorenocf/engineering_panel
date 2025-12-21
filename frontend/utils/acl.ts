export function canSeeRoute(
  routePermission: string | null,
  userPermissions: string[] | undefined,
  isSuperuser?: boolean
) {
  // superuser vê tudo
  if (isSuperuser) return true;

  // rota pública (qualquer logado)
  if (!routePermission) return true;

  // sem permissões carregadas ainda
  if (!userPermissions || userPermissions.length === 0) return false;

  // aceita permission curta ("view_product") OU completa ("catalog.view_product")
  return (
    userPermissions.includes(routePermission) ||
    userPermissions.some((p) => p.endsWith(`.${routePermission}`))
  );
}
