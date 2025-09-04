"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/auth/auth-context";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  user_id?: number;
  product_id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  is_available?: boolean;
  product_code?: string;
  description?: string;
  added_at?: string;
  last_updated?: string;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addItem: (
    item: Omit<CartItem, "user_id" | "added_at" | "last_updated">
  ) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  total: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch cart items from database
  const fetchCartItems = async () => {
    if (!user?.id) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/cart?user_id=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setItems(data.cart_items || []);
      } else {
        console.error("Error fetching cart:", data.error);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addItem = async (
    item: Omit<CartItem, "user_id" | "added_at" | "last_updated">
  ) => {
    console.log("AddItem called, user:", user);

    if (!user?.id) {
      console.log("User not authenticated, showing login message");
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: item.product_id,
          quantity: item.quantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item added to cart successfully",
        });
        await fetchCartItems(); // Refresh cart
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add item to cart",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productId: number) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/cart/${productId}?user_id=${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item removed from cart",
        });
        await fetchCartItems(); // Refresh cart
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to remove item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user?.id) return;

    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          quantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCartItems(); // Refresh cart
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update quantity",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/cart/clear?user_id=${user.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Cart cleared successfully",
        });
        setItems([]);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to clear cart",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh cart (public method)
  const refreshCart = async () => {
    await fetchCartItems();
  };

  // Calculate totals
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch cart items when user changes
  useEffect(() => {
    fetchCartItems();
  }, [user?.id]);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
        total,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
