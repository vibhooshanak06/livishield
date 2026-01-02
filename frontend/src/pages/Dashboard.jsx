import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Shield, Activity, Settings, Scan, LogOut, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen dashboard-background">
      <header className="border-b dashboard-gradient-header">
        <nav className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">LiveShield</h1>
            <Badge className="ml-2 bg-white/20 text-white border-white/30 backdrop-blur-sm">Online</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white/80">Welcome, {user?.name || "User"}!</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </nav>
      </header>

      <main className="container py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="dashboard-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-liveshield-200" />
                  <span>Security Status</span>
                </div>
                <Badge className="bg-liveshield-100 text-liveshield-400 border-liveshield-200">Protected</Badge>
              </CardTitle>
              <CardDescription>Your system protection overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-3 w-3 rounded-full status-pulse"></div>
                <span className="font-medium text-liveshield-300">All Systems Operational</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your devices are actively monitored and protected against threats.
              </p>
              <Button className="w-full bg-liveshield-200 hover:bg-liveshield-300 text-white" size="sm">
                <Scan className="mr-2 h-4 w-4" />
                Run Full Scan
              </Button>
            </CardContent>
          </Card>

          <Card className="dashboard-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-liveshield-200" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-liveshield-200" />
                    <span className="font-medium">System scan completed</span>
                  </div>
                  <span className="text-muted-foreground">2 min ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-liveshield-100" />
                    <span className="font-medium">Threat blocked</span>
                  </div>
                  <span className="text-muted-foreground">1 hour ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-liveshield-300" />
                    <span className="font-medium">Security update installed</span>
                  </div>
                  <span className="text-muted-foreground">3 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-liveshield-200" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>Common security tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-liveshield-200 hover:bg-liveshield-300 text-white">
                  <Scan className="mr-2 h-4 w-4" />
                  Run Full Scan
                </Button>
                <Button variant="outline" className="w-full justify-start border-liveshield-200 text-liveshield-300 hover:bg-liveshield-50">
                  <Activity className="mr-2 h-4 w-4" />
                  Update Definitions
                </Button>
                <Button variant="outline" className="w-full justify-start border-liveshield-200 text-liveshield-300 hover:bg-liveshield-50">
                  <Settings className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card-hover">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Resource usage monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">CPU Usage</span>
                    <Badge className="bg-liveshield-50 text-liveshield-400 border-liveshield-100">35%</Badge>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Memory</span>
                    <Badge className="bg-liveshield-100 text-liveshield-400 border-liveshield-200">62%</Badge>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Disk Space</span>
                    <Badge variant="destructive">78%</Badge>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 dashboard-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Threat Detection</span>
                <Badge className="bg-liveshield-100 text-liveshield-400 border-liveshield-200">Active</Badge>
              </CardTitle>
              <CardDescription>Real-time security monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-liveshield-200">0</div>
                  <div className="text-sm text-muted-foreground">Active Threats</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-liveshield-300">247</div>
                  <div className="text-sm text-muted-foreground">Blocked Today</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-liveshield-400">1,432</div>
                  <div className="text-sm text-muted-foreground">Total Blocked</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;