import { object, string, z } from "zod";

//?Auth
export const loginFormSchema = object({
  user: string({ required_error: "Usuario es requerido" }).min(
    1,
    "El usuario debe tener al menos 1 caracter",
  ),
  password: string({ required_error: "Contraseña es requerida" }).min(
    8,
    "Contraseña debe tener al menos 8 caracteres",
  ),
  birthDay: z.date({
    message: "Se requiere una fecha de nacimiento",
  }),
});

export type FormSignInValues = z.infer<typeof loginFormSchema>;

export const accesssFormSchema = object({
  user: string({ required_error: "Usuario es requerido" }).min(
    1,
    "El usuario debe tener al menos 1 caracter",
  ),
  password: string({ required_error: "Contraseña es requerida" }).min(
    8,
    "Contraseña debe tener al menos 8 caracteres",
  ),
});

export type FormAccessValues = z.infer<typeof accesssFormSchema>;

//? Update Data
export const updateDataFormSchema = object({
  name: string({ required_error: "El nombre es requerido" }).min(
    1,
    "El nombre debe tener al menos 1 caracter",
  ),
  paternal_surname: string({
    required_error: "Apellido paterno requerido",
  }).min(1, "El apellido debe tener al menos 1 caracter"),
  maternal_surname: string({
    required_error: "Apellido materno requerido",
  }).min(1, "El apellido debe tener al menos 1 caracter"),
  password: string({ required_error: "Contraseña es requerida" }).min(
    8,
    "Contraseña debe tener al menos 8 caracteres",
  ),
  email: string({ required_error: "Email es requerido" }).email({
    message: "Email no válido",
  }),
  phone: string({ required_error: "Teléfono es requerido" }).min(
    9,
    "El teléfono debe tener al menos 9 caracteres",
  ),
  address: string({ required_error: "Dirección es requerida" }).min(
    1,
    "La dirección debe tener al menos 1 caracter",
  ),
  district: string({ required_error: "Distrito es requerido" }),
  country: string({ required_error: "País es requerido" }),
  department: string({ required_error: "Departamento es requerido" }),
  province: string({ required_error: "Provincia es requerida" }),
  aceptTerms: z
    .boolean({ required_error: "Debe aceptar los términos y condiciones" })
    .refine((value) => value === true, {
      message: "Debe aceptar los términos y condiciones",
    }),
});

export type FormUpdateDataSchema = z.infer<typeof updateDataFormSchema>;

export const availableFormSchema = object({
  document: string({ required_error: "Campo requerido" }).max(
    6,
    "Campo debe tener máximo 6 carácteres",
  ),
});

export type FormAvailableSchema = z.infer<typeof availableFormSchema>;

// Reservation request form
export const reservationRequestSchema = z
  .object({
    eventName: z.string().min(2, {
      message: "El nombre del evento debe tener al menos 2 caracteres",
    }),
    purpose: z.string().optional(),
    guestCount: z
      .number({ invalid_type_error: "Ingrese un número válido" })
      .int()
      .min(1, { message: "Debe haber al menos 1 asistente" }),
    startDate: z
      .string()
      .min(1, { message: "La fecha de inicio es requerida" }),
    endDate: z.string().min(1, { message: "La fecha de fin es requerida" }),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["endDate"],
  });

export type ReservationRequestValues = z.infer<typeof reservationRequestSchema>;

export const amountForQuotesDTO = z.object({
  periodFrom: z.string().min(1, {
    message: "El periodo desde es requerido",
  }),
  totalQuotes: z.number().min(1, {
    message: "El total de cuotas debe ser al menos 1",
  }),
});
export type AmountForQuotesDTO = z.infer<typeof amountForQuotesDTO>;

//? Forgot / Reset Password
export const forgotPasswordSchema = object({
  document: string({ required_error: "El número de documento es requerido" })
    .min(8, "El documento debe tener 8 dígitos")
    .max(8, "El documento debe tener 8 dígitos"),
});
export type FormForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = object({
  password: string({ required_error: "La contraseña es requerida" }).min(
    8,
    "La contraseña debe tener al menos 8 caracteres",
  ),
  confirmPassword: string({ required_error: "Confirme su contraseña" }).min(
    8,
    "La contraseña debe tener al menos 8 caracteres",
  ),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
export type FormResetPasswordValues = z.infer<typeof resetPasswordSchema>;
