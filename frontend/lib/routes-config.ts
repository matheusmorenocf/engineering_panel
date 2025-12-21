import { 
  ClipboardList, 
  FileSearch, 
  DollarSign, 
  Settings,
  LayoutDashboard,
  Package
} from 'lucide-react';

export const DASHBOARD_ROUTES = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    // Dashboard geralmente todos logados podem ver
    permission: null 
  },
  {
    label: 'Ordens de Produção',
    href: '/orders',
    icon: ClipboardList,
    permission: 'view_productionorder' // Nome que o Django gera automaticamente
  },
  {
    label: 'Gestão de Desenhos',
    href: '/drawings',
    icon: FileSearch,
    permission: 'view_drawing'
  },
  {
    label: 'Orçamentos',
    href: '/quotes',
    icon: DollarSign,
    permission: 'view_quote'
  },
  {
    label: 'Administração',
    href: '/admin',
    icon: Settings,
    permission: 'view_user'
  },
    {
    label: 'Catálogo',
    href: '/catalog',
    icon: Package, 
    permission: 'view_product'
  },
];