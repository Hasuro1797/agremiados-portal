"use client";
import { SIGN_OUT_MUTATION } from "@/graphql/mutation/auth.mutation";
import {
  removeAccessTokenCookie,
  removeRefreshTokenCookie,
} from "@/lib/cookies";
import { routes } from "@/lib/routes";
import { useOrganization } from "@/providers/organization-provider";
import { useUserStore } from "@/providers/user-provider";
import { useMutation } from "@apollo/client";
import {
  Bell,
  CalendarCheck,
  type LucideIcon,
  Loader,
  LogOut,
  ReceiptText,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import { toast } from "sonner";
import CustomAvatar from "./CustomAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function DropdownAvatar({
  isEditable = false,
}: {
  isEditable?: boolean;
}) {
  const { name, paternalSurname, cleanInfo } = useUserStore((state) => state);
  const { organization } = useOrganization();
  const router = useRouter();
  const [logOut, { loading }] = useMutation(SIGN_OUT_MUTATION);

  const navItems: {
    label: string;
    href: string;
    icon: LucideIcon;
    show: boolean;
  }[] = [
    { label: "Mi perfil", href: routes.privates.updateData, icon: UserCog, show: true },
    {
      label: "Mis notificaciones",
      href: routes.myNotifications,
      icon: Bell,
      show: true,
    },
    {
      label: "Mis pagos",
      href: routes.myPayments,
      icon: ReceiptText,
      show: true,
    },
    {
      label: "Mis reservas",
      href: routes.myReservations,
      icon: CalendarCheck,
      show: !!organization?.moduleReservations,
    },
  ].filter((item) => item.show);

  const handleLogOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error(error);
    } finally {
      router.push(routes.autorization.signIn);
      cleanInfo();
      removeAccessTokenCookie();
      removeRefreshTokenCookie();
      window.localStorage.removeItem("user-store");
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex gap-2 items-center cursor-pointer">
          {!isEditable && (
            <div className="grid flex-1 text-left text-md leading-tight">
              <span className="truncate font-semibold text-sm">{name}</span>
              <span className="truncate text-xs">{paternalSurname}</span>
            </div>
          )}
          <CustomAvatar
            name={name}
            last_name={paternalSurname}
            styleFallback="bg-primary text-sm text-secondary "
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-xl"
        sideOffset={8}
        align="end"
      >
        <DropdownMenuLabel>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-semibold text-sm">
              {name} {paternalSurname}
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              Mi cuenta
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {navItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild className="cursor-pointer">
            <Link href={item.href}>
              <item.icon className="size-4 text-muted-foreground" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={handleLogOut}
        >
          {loading ? (
            <Loader className="size-4 animate-spin repeat-infinite" />
          ) : (
            <LogOut className="size-4" />
          )}
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
