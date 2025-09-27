import { SidebarProvider } from "@/components/ui/sidebar";
import RolesLayout from "./(roles)/layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
        <RolesLayout>
          {children}
        </RolesLayout>
    </SidebarProvider>
  );
}
