import { gql } from "@apollo/client";

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshTokens {
      access_token
      refresh_token
    }
  }
`;

export const SIGN_IN_MUTATION = gql`
  mutation SignInMember($input: LoginInput!) {
    signinMember(input: $input) {
      access_token
      refresh_token
      user {
        id
        name
        paternalSurname
        maternalSurname
        email
        role
        status
      }
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      message
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($resetPasswordInput: ResetPasswordInput!) {
    resetPassword(resetPasswordInput: $resetPasswordInput) {
      message
    }
  }
`;

export const SIGN_OUT_MUTATION = gql`
  mutation SignOut {
    signout {
      message
    }
  }
`;
