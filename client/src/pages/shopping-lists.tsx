import { ShoppingListComponent } from "@/components/shopping-list";

export default function ShoppingListsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Lists</h1>
        <p className="text-gray-600 mt-1">Manage your family's shopping lists and generate them automatically from meal plans.</p>
      </div>
      
      <ShoppingListComponent />
    </div>
  );
}
