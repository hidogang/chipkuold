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
    return `${type === "withdrawal" ? "-" : "+"}₹${Math.abs(value).toFixed(2)}`;
  };

  if (transactionsQuery.isLoading) {
    return (
      <div>
        <BalanceBar />
        <div className="flex justify-center items-center min-h-[400px] mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <BalanceBar />
      
      <div className="space-y-6 mt-4">
        <h1 className="text-2xl font-bold">Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="text-lg font-medium">{user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-lg font-medium">₹{user?.usdtBalance || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Referral Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share your referral link with friends and earn commission when they join!
              </p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-primary/10 p-2 rounded text-sm">
                  {window.location.origin}?ref={user?.referralCode}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopyReferral}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsQuery.data?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transactions found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsQuery.data?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.createdAt), "PPp")}
                        </TableCell>
                        <TableCell className="capitalize">{transaction.type}</TableCell>
                        <TableCell>
                          {formatAmount(transaction.amount, transaction.type)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`capitalize ${getTransactionStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono">
                          {transaction.transactionId || "-"}
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
