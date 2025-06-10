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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Shopping Lists</span>
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
              <Button
                size="sm"
                onClick={() => createListMutation.mutate()}
                disabled={createListMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-1" />
                New List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!shoppingLists || shoppingLists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No shopping lists yet</p>
              <p className="text-sm">Create a new list or generate one from your meal plans</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shoppingLists.map((list) => (
                <Card key={list.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{list.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {list.items.length} items
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {list.items.filter(item => item.completed).length} completed
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportList(list)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteListMutation.mutate(list.id)}
                          disabled={deleteListMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex space-x-2 mb-4">
                      <Input
                        placeholder="Add item..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem(list.id)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Qty"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem(list.id)}
                        className="w-20"
                      />
                      <Button
                        onClick={() => handleAddItem(list.id)}
                        disabled={!newItemName.trim() || addItemMutation.isPending}
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {list.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center space-x-3 p-2 rounded-lg border ${
                            item.completed ? "bg-gray-50 text-gray-500" : "bg-white"
                          }`}
                        >
                          <Checkbox
                            checked={item.completed || false}
                            onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <span className={item.completed ? "line-through" : ""}>{item.name}</span>
                            {item.quantity && (
                              <span className="text-sm text-gray-500 ml-2">({item.quantity})</span>
                            )}
                          </div>
                          {item.category && (
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}