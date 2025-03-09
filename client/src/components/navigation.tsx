import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChevronDown, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Import game icons as React components
function HomeIcon() {
  return <img src="attached_assets/home icon.png" className="w-8 h-8 object-contain" alt="Home" />;
}

function ShopIcon() {
  return <img src="attached_assets/shop icon.png" className="w-8 h-8 object-contain" alt="Shop" />;
}

function MarketIcon() {
  return <img src="attached_assets/Market icon.png" className="w-8 h-8 object-contain" alt="Market" />;
}

function WalletIcon() {
  return <img src="attached_assets/wallet icon.png" className="w-8 h-8 object-contain" alt="Wallet" />;
}

export default function Navigation() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const initials = user.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <nav className="bg-card border-b shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex space-x-6">
            <Link href="/">
              <Button variant="ghost" className="flex flex-col items-center space-y-1 h-auto py-2 px-4 hover:bg-primary/10">
                <HomeIcon />
                <span className="text-xs font-medium">Home</span>
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="ghost" className="flex flex-col items-center space-y-1 h-auto py-2 px-4 hover:bg-primary/10">
                <ShopIcon />
                <span className="text-xs font-medium">Shop</span>
              </Button>
            </Link>
            <Link href="/market">
              <Button variant="ghost" className="flex flex-col items-center space-y-1 h-auto py-2 px-4 hover:bg-primary/10">
                <MarketIcon />
                <span className="text-xs font-medium">Market</span>
              </Button>
            </Link>
            {user.isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" className="flex flex-col items-center space-y-1 h-auto py-2 px-4 hover:bg-primary/10">
                  <Settings className="h-6 w-6" />
                  <span className="text-xs font-medium">Admin</span>
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-primary/5 rounded-lg px-3 py-1.5">
              <WalletIcon />
              <span className="text-sm font-medium">${user.usdtBalance || 0}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10">{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Balance: ${user.usdtBalance || 0}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/account">
                  <DropdownMenuItem className="cursor-pointer">
                    <Avatar className="mr-2 h-4 w-4">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/wallet">
                  <DropdownMenuItem className="cursor-pointer">
                    <WalletIcon />
                    <span>My Wallet</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/wallet?tab=recharge">
                  <DropdownMenuItem className="cursor-pointer">
                    <MarketIcon />
                    <span>Deposit</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/wallet?tab=withdraw">
                  <DropdownMenuItem className="cursor-pointer">
                    <WalletIcon />
                    <span>Withdraw</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/account#transactions">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Transaction History</span>
                  </DropdownMenuItem>
                </Link>
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
      </div>
    </nav>
  );
}