import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Transaction } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Copy, Link } from "lucide-react";
import BalanceBar from "@/components/balance-bar";

export default function AccountPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const transactionsQuery = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const handleCopyReferral = () => {
    const referralLink = `${window.location.origin}?ref=${user?.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral Link Copied",
      description: "The referral link has been copied to your clipboard.",
    });
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatAmount = (amount: string, type: string) => {
    const value = parseFloat(amount);
    return `${type === "withdrawal" ? "-" : "+"}$${Math.abs(value).toFixed(2)}`;
  };

  if (transactionsQuery.isLoading) {
    return (
      <div className="pb-20 md:pb-6">
        <BalanceBar />
        <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px] mt-2 sm:mt-4">
          <div className="animate-spin rounded-full h-7 w-7 sm:h-8 sm:w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-6">
      <BalanceBar />
      
      <div className="space-y-4 sm:space-y-6 mt-2 sm:mt-4 px-2 sm:px-4">
        <h1 className="text-xl sm:text-2xl font-bold">Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          <Card>
            <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Username</p>
                <p className="text-base sm:text-lg font-medium">{user?.username}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Current Balance</p>
                <p className="text-base sm:text-lg font-medium">${user?.usdtBalance || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Referral Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Share your referral link with friends and earn commission when they join!
              </p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-primary/10 p-1.5 sm:p-2 rounded text-xs sm:text-sm overflow-x-auto">
                  {window.location.origin}?ref={user?.referralCode}
                </code>
                <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={handleCopyReferral}>
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Link className="h-4 w-4 sm:h-5 sm:w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            {transactionsQuery.data?.length === 0 ? (
              <p className="text-center text-xs sm:text-sm text-muted-foreground py-6 sm:py-8">
                No transactions found
              </p>
            ) : (
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <Table className="w-full text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Transaction ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsQuery.data?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(transaction.createdAt), "MM/dd/yy")}
                          <span className="hidden sm:inline"> {format(new Date(transaction.createdAt), "HH:mm")}</span>
                        </TableCell>
                        <TableCell className="capitalize">{transaction.type}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatAmount(transaction.amount, transaction.type)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`capitalize text-xs ${getTransactionStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs hidden sm:table-cell">
                          {transaction.transactionId ? transaction.transactionId.substring(0, 10) + "..." : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
