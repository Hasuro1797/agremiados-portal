import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import { UserRoles, UserStatus } from "@/utils/enum";
import {
  removeAccessTokenCookie,
  removeRefreshTokenCookie,
} from "@/lib/cookies";

export type UserState = {
  id: string;
  name: string;
  maternalSurname: string;
  paternalSurname: string;
  email?: string;
  avatar?: string;
  role: UserRoles;
  status: UserStatus;
  isRegistered: boolean;
  hasPaymentPerDay: boolean;
};

export type UserActions = {
  setInfo: (user: UserState) => void;
  setPaymentStatus: (
    status: UserStatus,
    hasPaymentPerDay: boolean,
    isRegistered: boolean,
  ) => void;
  cleanInfo: () => void;
};

export type UserStore = UserState & UserActions;

type PersistedUserState = Pick<
  UserState,
  | "id"
  | "name"
  | "paternalSurname"
  | "maternalSurname"
  | "email"
  | "avatar"
  | "role"
>;

export const defaultUserState: UserState = {
  id: "",
  name: "",
  paternalSurname: "",
  maternalSurname: "",
  email: "",
  avatar: "",
  role: UserRoles.MEMBER,
  status: UserStatus.INACTIVE,
  isRegistered: false,
  hasPaymentPerDay: false,
};

export const createUserStore = (initState: UserState = defaultUserState) => {
  return createStore(
    persist<UserStore, [], [], PersistedUserState>(
      (set) => ({
        ...initState,
        setInfo: (user: UserState) => set(user),
        setPaymentStatus: (status, hasPaymentPerDay, isRegistered) =>
          set({ status, hasPaymentPerDay, isRegistered }),
        cleanInfo: () => {
          removeAccessTokenCookie();
          removeRefreshTokenCookie();
          set(defaultUserState);
        },
      }),
      {
        name: "user-store",
        partialize: (state) => ({
          id: state.id,
          name: state.name,
          paternalSurname: state.paternalSurname,
          maternalSurname: state.maternalSurname,
          email: state.email,
          avatar: state.avatar,
          role: state.role,
        }),
      },
    ),
  );
};
