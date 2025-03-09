import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings } from "lucide-react";

// Game icons
function HomeIcon() {
  return <img src="/assets/home-icon.png" className="w-8 h-8 object-contain" alt="Home" />;
}

function ShopIcon() {
  return <img src="/assets/shop-icon.png" className="w-8 h-8 object-contain" alt="Shop" />;
}

function MarketIcon() {
  return <img src="/assets/market-icon.png" className="w-8 h-8 object-contain" alt="Market" />;
}

function WalletIcon() {
  return <img src="/assets/wallet-icon.png" className="w-8 h-8 object-contain" alt="Wallet" />;
}

export default function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const initials = user.username.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg md:hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <Link href="/">
            <Button variant={location === "/" ? "default" : "ghost"} 
              className="flex flex-col items-center space-y-1 h-auto py-2 px-3">
              <HomeIcon />
              <span className="text-xs font-medium">Home</span>
            </Button>
          </Link>

          <Link href="/shop">
            <Button variant={location === "/shop" ? "default" : "ghost"}
              className="flex flex-col items-center space-y-1 h-auto py-2 px-3">
              <ShopIcon />
              <span className="text-xs font-medium">Shop</span>
            </Button>
          </Link>

          <Link href="/market">
            <Button variant={location === "/market" ? "default" : "ghost"}
              className="flex flex-col items-center space-y-1 h-auto py-2 px-3">
              <MarketIcon />
              <span className="text-xs font-medium">Market</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center space-y-1 h-auto py-2 px-3">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary/10">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mb-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Balance: ${user.usdtBalance || 0}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/wallet">
                <DropdownMenuItem className="cursor-pointer">
                  <WalletIcon />
                  <span className="ml-2">My Wallet</span>
                </DropdownMenuItem>
              </Link>
              {user.isAdmin && (
                <Link href="/admin">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                </Link>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive"
                onClick={() => logoutMutation.mutate()}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}