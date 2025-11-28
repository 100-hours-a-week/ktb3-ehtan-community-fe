import { AuthProvider } from "./auth-provider";

export function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
