import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Plus, Download, Trash2 } from "lucide-react";
import { EnrichedShoppingList } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function ShoppingListComponent() {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const { toast } = useToast();

  const { data: shoppingLists, isLoading } = useQuery<EnrichedShoppingList[]>({
    queryKey: ["/api/shopping-lists"],
  });

  const createListMutation = useMutation({
    mutationFn: async () => {
      const listName = `Shopping List - ${new Date().toLocaleDateString()}`;
      return apiRequest("POST", "/api/shopping-lists", { name: listName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
      toast({
        title: "Success",
        description: "New shopping list created!"
      });
    }
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ listId, name, quantity }: { listId: number; name: string; quantity?: string }) => {
      return apiRequest("POST", "/api/shopping-items", {
        listId,
        name,
        quantity,
        category: "manual",
        completed: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
      setNewItemName("");
      setNewItemQuantity("");
      toast({
        title: "Success",
        description: "Item added to shopping list!"
      });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      return apiRequest("PUT", `/api/shopping-items/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
    }
  });

  const generateListMutation = useMutation({
    mutationFn: async () => {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      return apiRequest("POST", "/api/shopping-lists/generate", {
        startDate: today.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0],
        userId: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
      toast({
        title: "Success",
        description: "Shopping list generated from meal plans!"
      });
    }
  });

  const deleteListMutation = useMutation({
    mutationFn: async (listId: number) => {
      return apiRequest("DELETE", `/api/shopping-lists/${listId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
      toast({
        title: "Success",
        description: "Shopping list deleted!"
      });
    }
  });

  const handleAddItem = (listId: number) => {
    if (!newItemName.trim()) return;
    
    addItemMutation.mutate({
      listId,
      name: newItemName.trim(),
      quantity: newItemQuantity.trim() || undefined
    });
  };

  const handleToggleItem = (itemId: number, completed: boolean) => {
    updateItemMutation.mutate({ id: itemId, completed });
  };

  const exportList = (list: EnrichedShoppingList) => {
    const content = `${list.name}\n\n${list.items.map(item => 
      `${item.completed ? '✓' : '□'} ${item.name}${item.quantity ? ` (${item.quantity})` : ''}`
    ).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeList = shoppingLists?.[0];

  return (
    <div className="space-y-6">
      {/* Current Shopping List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Shopping List</span>
              {activeList && (
                <Badge variant="outline" className="bg-accent/10 text-accent">
                  Auto-generated
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateListMutation.mutate()}
                disabled={generateListMutation.isPending}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                {generateListMutation.isPending ? "Generating..." : "Generate from Meals"}
              </Button>
              {!activeList && (
                <Button
                  size="sm"
                  onClick={() => createListMutation.mutate()}
                  disabled={createListMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New List
                </Button>
              )}
              {activeList && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteListMutation.mutate(activeList.id)}
                  disabled={deleteListMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete List
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!activeList ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No shopping lists yet</p>
              <p className="text-sm">Create a new list or generate one from your meal plans</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add new item */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Add item..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem(activeList.id)}
                  className="flex-1"
                />
                <Input
                  placeholder="Qty"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem(activeList.id)}
                  className="w-20"
                />
                <Button
                  onClick={() => handleAddItem(activeList.id)}
                  disabled={!newItemName.trim() || addItemMutation.isPending}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Shopping items */}
              <div className="space-y-3">
                {activeList.items.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No items in this list</p>
                ) : (
                  activeList.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg border border-gray-200">
                      <Checkbox
                        checked={item.completed || false}
                        onCheckedChange={(checked) => handleToggleItem(item.id, !!checked)}
                      />
                      <span className={`flex-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="text-xs text-gray-500">({item.quantity})</span>
                      )}
                      {item.relatedMeal && (
                        <Badge variant="outline" className="text-xs">
                          {item.relatedMeal}
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* List actions */}
              {activeList.items.length > 0 && (
                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportList(activeList)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export List
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Shopping stats */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total items:</span>
                  <span className="font-medium">{activeList.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">
                    {activeList.items.filter(item => item.completed).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium">
                    {activeList.items.filter(item => !item.completed).length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Shopping Lists */}
      {shoppingLists && shoppingLists.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>All Shopping Lists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {shoppingLists.map((list) => (
                <div key={list.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div>
                    <h4 className="font-medium text-gray-900">{list.name}</h4>
                    <p className="text-sm text-gray-500">
                      {list.items.length} items • {list.items.filter(item => item.completed).length} completed
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {list.completed && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Completed
                      </Badge>
                    )}
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
