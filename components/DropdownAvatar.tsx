"use client";
import { SIGN_OUT_MUTATION } from "@/graphql/mutation/auth.mutation";
import {
  removeAccessTokenCookie,
  removeRefreshTokenCookie,
} from "@/lib/cookies";
import { routes } from "@/lib/routes";
import { useUserStore } from "@/providers/user-provider";
import { useMutation } from "@apollo/client";
import { Loader, LogOut } from "lucide-react";
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
  const router = useRouter();
  const [logOut, { loading }] = useMutation(SIGN_OUT_MUTATION);

  const handleLogOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error(error);
      // toast.error("Error al cerrar sesión", {
      //   description: "Intente nuevamente",
      //   classNames: {
      //     icon: "tex-red-500",
      //     toast: "bg-secondary text-primary",
      //   },
      // });
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
          {/* <ArrowDownRight /> */}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] md:min-w-40 rounded-lg"
        sideOffset={4}
        align="end"
      >
        {isEditable && (
          <>
            <DropdownMenuLabel>
              <div className="grid flex-1 text-left text-md leading-tight">
                <span className="truncate font-semibold text-sm">{name}</span>
                <span className="truncate text-xs">{paternalSurname}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {/* <DropdownMenuItem>Perfil</DropdownMenuItem>
        <DropdownMenuItem>Configuración</DropdownMenuItem>
        <DropdownMenuSeparator/> */}
        <DropdownMenuItem className="text-red-600" onClick={handleLogOut}>
          {loading ? (
            <Loader className="animate-spin repeat-infinite" />
          ) : (
            <LogOut />
          )}
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
