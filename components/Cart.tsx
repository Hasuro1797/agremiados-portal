import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function Cart() {
  const { items, total, removeItem } = useCartStore();

  if (items.length === 0) {
    return (
      <Badge variant="secondary" className="cursor-pointer">
        <ShoppingCart className="w-4 h-4 mr-2" />
        Carrito
      </Badge>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge variant="secondary" className="cursor-pointer">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Carrito ({items.length})
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Carrito de compras</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div className="text-xl font-bold">${item.price.toFixed(2)}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    Eliminar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-6 flex justify-between items-center">
          <div className="text-lg font-bold">Total: ${total().toFixed(2)}</div>
          <Button
            onClick={() => {
              if (items.length > 0) {
                toast.success('Redirigiendo al checkout...');
                // Aquí iría la lógica de redirección al checkout
              }
            }}
          >
            Proceder al pago
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
