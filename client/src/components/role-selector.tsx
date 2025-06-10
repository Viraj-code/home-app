import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

const roles = [
  { value: "parent", label: "👨‍👩‍👧 Parent View", description: "Full access to all features" },
  { value: "cook", label: "👨‍🍳 Cook View", description: "Focus on meal planning and recipes" },
  { value: "driver", label: "🚗 Driver View", description: "Transportation and scheduling" },
  { value: "admin", label: "⚙️ Admin View", description: "System management and settings" }
];

interface RoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  const { user } = useAuth();

  const getCurrentRoleLabel = () => {
    const role = roles.find(r => r.value === currentRole);
    return role?.label || "👨‍👩‍👧 Parent View";
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <Select value={currentRole} onValueChange={onRoleChange}>
        <SelectTrigger className="w-full bg-gray-100 border border-gray-300 rounded-lg">
          <SelectValue placeholder={getCurrentRoleLabel()} />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              <div className="flex flex-col">
                <span className="font-medium">{role.label}</span>
                <span className="text-xs text-gray-500">{role.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
