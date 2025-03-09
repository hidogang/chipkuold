import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Home, ShoppingBag, BarChart2, Wallet, User } from "lucide-react";

export default function Navigation() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex space-x-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5" />
                <span>Shop</span>
              </Button>
            </Link>
            <Link href="/market">
              <Button variant="ghost" className="flex items-center space-x-2">
                <BarChart2 className="h-5 w-5" />
                <span>Market</span>
              </Button>
            </Link>
            <Link href="/wallet">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>Wallet</span>
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost" className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Account</span>
              </Button>
            </Link>
          </div>
          <Button
            variant="ghost"
            onClick={() => logoutMutation.mutate()}
            className="text-destructive"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
