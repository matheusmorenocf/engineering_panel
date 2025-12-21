import { redirect } from "next/navigation";

export default function RootPage() {
  // Redireciona para a nova rota de login
  redirect("/login");
}