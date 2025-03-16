import { useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { User, ReferralEarning, MilestoneReward } from "@shared/schema";

export default function ReferralsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Get direct referrals
  const referralsQuery = useQuery({
    queryKey: ["/api/referrals"],
    queryFn: getQueryFn({
      on401: "throw",
    }),
    enabled: !!user
  });

  // Get referral earnings
  const earningsQuery = useQuery({
    queryKey: ["/api/referrals/earnings"],
    queryFn: getQueryFn({
      on401: "throw",
    }),
    enabled: !!user
  });

  // Get unclaimed earnings
  const unclaimedEarningsQuery = useQuery({
    queryKey: ["/api/referrals/earnings/unclaimed"],
    queryFn: getQueryFn({
      on401: "throw",
    }),
    enabled: !!user
  });

  // Get milestone rewards
  const milestonesQuery = useQuery({
    queryKey: ["/api/milestones"],
    queryFn: getQueryFn({
      on401: "throw",
    }),
    enabled: !!user
  });

  // Get unclaimed milestone rewards
  const unclaimedMilestonesQuery = useQuery({
    queryKey: ["/api/milestones/unclaimed"],
    queryFn: getQueryFn({
      on401: "throw",
    }),
    enabled: !!user
  });

  // Get salary payments
  const salaryQuery = useQuery({
    queryKey: ["/api/salary/payments"],
    queryFn: getQueryFn({
      on401: "throw",
    }),
    enabled: !!user
  });

  const handleClaimReferralEarning = async (earningId: number) => {
    try {
      await apiRequest(`/api/referrals/earnings/${earningId}/claim`, { method: "POST" });
      toast({
        title: "Success!",
        description: "Referral earnings claimed and added to your balance."
      });
      // Invalidate queries to refresh data
      unclaimedEarningsQuery.refetch();
      earningsQuery.refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim referral earnings.",
        variant: "destructive"
      });
    }
  };

  const handleClaimMilestoneReward = async (milestoneId: number) => {
    try {
      await apiRequest(`/api/milestones/${milestoneId}/claim`, { method: "POST" });
      toast({
        title: "Success!",
        description: "Milestone reward claimed and added to your balance."
      });
      // Invalidate queries to refresh data
      unclaimedMilestonesQuery.refetch();
      milestonesQuery.refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim milestone reward.",
        variant: "destructive"
      });
    }
  };

  const isLoading = 
    referralsQuery.isLoading || 
    earningsQuery.isLoading || 
    unclaimedEarningsQuery.isLoading || 
    milestonesQuery.isLoading || 
    unclaimedMilestonesQuery.isLoading ||
    salaryQuery.isLoading;

  const getReferralLevel = (level: number): string => {
    switch (level) {
      case 1: return "Direct (Level 1) - 10%";
      case 2: return "Level 2 - 5%";
      case 3: return "Level 3 - 3%";
      case 4: return "Level 4 - 2%";
      case 5: return "Level 5 - 1%";
      case 6: return "Level 6 - 0.5%";
      default: return `Level ${level}`;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Referrals & Team</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading referral data...</p>
          </div>
        </div>
      </div>
    );
  }

  const directReferrals = referralsQuery.data || [];
  const referralEarnings = earningsQuery.data || [];
  const unclaimedEarnings = unclaimedEarningsQuery.data || [];
  const milestones = milestonesQuery.data || [];
  const unclaimedMilestones = unclaimedMilestonesQuery.data || [];
  const salaryPayments = salaryQuery.data || [];

  const totalDirectReferrals = directReferrals.length;
  const totalReferralEarnings = user?.totalReferralEarnings ? parseFloat(user.totalReferralEarnings.toString()) : 0;
  const totalTeamEarnings = user?.totalTeamEarnings ? parseFloat(user.totalTeamEarnings.toString()) : 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Referrals & Team</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>Share with friends to earn commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-md text-center font-mono font-bold text-lg">
              {user?.referralCode}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Team Stats</CardTitle>
            <CardDescription>Your referral network performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Direct Referrals:</span>
                <span className="font-bold">{totalDirectReferrals}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Referral Earnings:</span>
                <span className="font-bold">${totalReferralEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Team Earnings:</span>
                <span className="font-bold">${totalTeamEarnings.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Unclaimed Rewards</CardTitle>
            <CardDescription>Earnings waiting to be claimed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Referral Earnings:</span>
                <span className="font-bold">
                  ${unclaimedEarnings.reduce((sum, earning) => sum + parseFloat(earning.amount.toString()), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Milestone Rewards:</span>
                <span className="font-bold">
                  ${unclaimedMilestones.reduce((sum, milestone) => sum + parseFloat(milestone.reward.toString()), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="referrals" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="referrals">Direct Referrals</TabsTrigger>
          <TabsTrigger value="earnings">Referral Earnings</TabsTrigger>
          <TabsTrigger value="milestones">Milestone Rewards</TabsTrigger>
          <TabsTrigger value="salary">Monthly Salary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Your Direct Referrals</CardTitle>
              <CardDescription>Users who joined using your referral code</CardDescription>
            </CardHeader>
            <CardContent>
              {directReferrals.length > 0 ? (
                <div className="space-y-4">
                  {directReferrals.map((referral: User) => (
                    <div key={referral.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{referral.username}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined: {formatDistanceToNow(new Date(referral.lastLoginAt || Date.now()), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Balance: ${parseFloat(referral.usdtBalance).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You don't have any direct referrals yet.</p>
                  <p className="mt-2">Share your referral code to start earning commissions!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Referral Earnings</CardTitle>
              <CardDescription>Commissions from your referral network</CardDescription>
            </CardHeader>
            <CardContent>
              {unclaimedEarnings.length > 0 && (
                <>
                  <h3 className="font-bold mb-2">Unclaimed Earnings</h3>
                  <div className="space-y-3 mb-6">
                    {unclaimedEarnings.map((earning: ReferralEarning) => (
                      <div key={earning.id} className="p-3 border rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium">${parseFloat(earning.amount.toString()).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{getReferralLevel(earning.level)} commission</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(earning.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleClaimReferralEarning(earning.id)}
                          size="sm"
                        >
                          Claim
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                </>
              )}
              
              {referralEarnings.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-bold mb-2">Earnings History</h3>
                  {referralEarnings
                    .filter((earning: ReferralEarning) => earning.claimed)
                    .slice(0, 10)
                    .map((earning: ReferralEarning) => (
                      <div key={earning.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between">
                          <p className="font-medium">${parseFloat(earning.amount.toString()).toFixed(2)}</p>
                          <p className="text-sm text-green-600">Claimed</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{getReferralLevel(earning.level)} commission</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(earning.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No referral earnings yet.</p>
                  <p className="mt-2">Share your referral code to start earning commissions!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>Team Milestone Rewards</CardTitle>
              <CardDescription>Bonuses unlocked by your team's performance</CardDescription>
            </CardHeader>
            <CardContent>
              {unclaimedMilestones.length > 0 && (
                <>
                  <h3 className="font-bold mb-2">Unclaimed Milestone Rewards</h3>
                  <div className="space-y-3 mb-6">
                    {unclaimedMilestones.map((milestone: MilestoneReward) => (
                      <div key={milestone.id} className="p-3 border rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium">${parseFloat(milestone.reward.toString()).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            For reaching ${parseFloat(milestone.milestone.toString()).toFixed(2)} in team earnings
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(milestone.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleClaimMilestoneReward(milestone.id)}
                          size="sm"
                        >
                          Claim
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                </>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">Available Milestones</h3>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg flex justify-between">
                      <div>
                        <p className="font-medium">$50 Bonus</p>
                        <p className="text-sm text-muted-foreground">When team earnings reach $1,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Progress: {Math.min(100, Math.round((totalTeamEarnings / 1000) * 100))}%
                        </p>
                        <div className="w-24 h-2 bg-gray-200 rounded mt-1">
                          <div 
                            className="h-full bg-primary rounded" 
                            style={{ width: `${Math.min(100, Math.round((totalTeamEarnings / 1000) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg flex justify-between">
                      <div>
                        <p className="font-medium">$500 Bonus</p>
                        <p className="text-sm text-muted-foreground">When team earnings reach $10,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Progress: {Math.min(100, Math.round((totalTeamEarnings / 10000) * 100))}%
                        </p>
                        <div className="w-24 h-2 bg-gray-200 rounded mt-1">
                          <div 
                            className="h-full bg-primary rounded" 
                            style={{ width: `${Math.min(100, Math.round((totalTeamEarnings / 10000) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg flex justify-between">
                      <div>
                        <p className="font-medium">$2,500 Bonus</p>
                        <p className="text-sm text-muted-foreground">When team earnings reach $50,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Progress: {Math.min(100, Math.round((totalTeamEarnings / 50000) * 100))}%
                        </p>
                        <div className="w-24 h-2 bg-gray-200 rounded mt-1">
                          <div 
                            className="h-full bg-primary rounded" 
                            style={{ width: `${Math.min(100, Math.round((totalTeamEarnings / 50000) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg flex justify-between">
                      <div>
                        <p className="font-medium">$5,000 Bonus</p>
                        <p className="text-sm text-muted-foreground">When team earnings reach $100,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Progress: {Math.min(100, Math.round((totalTeamEarnings / 100000) * 100))}%
                        </p>
                        <div className="w-24 h-2 bg-gray-200 rounded mt-1">
                          <div 
                            className="h-full bg-primary rounded" 
                            style={{ width: `${Math.min(100, Math.round((totalTeamEarnings / 100000) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {milestones.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">Claimed Milestone Rewards</h3>
                    <div className="space-y-2">
                      {milestones
                        .filter((milestone: MilestoneReward) => milestone.claimed)
                        .map((milestone: MilestoneReward) => (
                          <div key={milestone.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between">
                              <p className="font-medium">${parseFloat(milestone.reward.toString()).toFixed(2)}</p>
                              <p className="text-sm text-green-600">Claimed</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              For reaching ${parseFloat(milestone.milestone.toString()).toFixed(2)} in team earnings
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {milestone.claimedAt && formatDistanceToNow(new Date(milestone.claimedAt), { addSuffix: true })}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Team Salary</CardTitle>
              <CardDescription>Regular income based on your team's total earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">Salary Tiers</h3>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg flex justify-between">
                      <div>
                        <p className="font-medium">$100 Monthly</p>
                        <p className="text-sm text-muted-foreground">When team earnings reach $10,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Progress: {Math.min(100, Math.round((totalTeamEarnings / 10000) * 100))}%
                        </p>
                        <div className="w-24 h-2 bg-gray-200 rounded mt-1">
                          <div 
                            className="h-full bg-primary rounded" 
                            style={{ width: `${Math.min(100, Math.round((totalTeamEarnings / 10000) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg flex justify-between">
                      <div>
                        <p className="font-medium">$500 Monthly</p>
                        <p className="text-sm text-muted-foreground">When team earnings reach $50,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Progress: {Math.min(100, Math.round((totalTeamEarnings / 50000) * 100))}%
                        </p>
                        <div className="w-24 h-2 bg-gray-200 rounded mt-1">
                          <div 
                            className="h-full bg-primary rounded" 
                            style={{ width: `${Math.min(100, Math.round((totalTeamEarnings / 50000) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg flex justify-between">
                      <div>
                        <p className="font-medium">$1,000 Monthly</p>
                        <p className="text-sm text-muted-foreground">When team earnings reach $100,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Progress: {Math.min(100, Math.round((totalTeamEarnings / 100000) * 100))}%
                        </p>
                        <div className="w-24 h-2 bg-gray-200 rounded mt-1">
                          <div 
                            className="h-full bg-primary rounded" 
                            style={{ width: `${Math.min(100, Math.round((totalTeamEarnings / 100000) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {salaryPayments.length > 0 ? (
                  <div>
                    <h3 className="font-bold mb-2">Salary Payment History</h3>
                    <div className="space-y-2">
                      {salaryPayments.map((payment: any) => (
                        <div key={payment.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between">
                            <p className="font-medium">${parseFloat(payment.amount.toString()).toFixed(2)}</p>
                            <p className="text-sm">{payment.period}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Paid {formatDistanceToNow(new Date(payment.paidAt), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No salary payments yet.</p>
                    <p className="mt-2">Build your team to start earning monthly income!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}