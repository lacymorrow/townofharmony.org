import {
  AlertCircle,
  AlertTriangle,
  Briefcase,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Flame,
  Heart,
  Home,
  Info,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  ShieldAlert,
  Siren,
  Stethoscope,
  TreePine,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  AlertCircle,
  AlertTriangle,
  Briefcase,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Flame,
  Heart,
  Home,
  Info,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  ShieldAlert,
  Siren,
  Stethoscope,
  TreePine,
  Users,
  Wrench,
  Zap,
};

/**
 * Resolves a string icon name to a Lucide React component.
 * Returns a fallback icon if the name is not found.
 */
export const resolveIcon = (name: string | null | undefined): LucideIcon => {
  if (!name) return Info;
  return iconMap[name] ?? Info;
};
