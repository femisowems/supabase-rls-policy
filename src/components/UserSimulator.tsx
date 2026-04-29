'use client';

import React from 'react';
import { useStore, UserRole } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, User, Shield, Ghost } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export function UserSimulator() {
  const { userContext, setUserContext } = useStore();

  return (
    <Card className="border-muted shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4 border-b bg-muted/30 flex flex-row items-center gap-2 space-y-0">
        <Users className="w-4 h-4 text-primary" />
        <CardTitle className="text-sm font-medium">User Simulator</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Auth State
          </Label>
          <Tabs
            value={userContext.role}
            onValueChange={(val) => setUserContext({ role: val as UserRole })}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full h-12 bg-muted/50 p-1">
              <TabsTrigger value="authenticated" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <div className="flex flex-col items-center gap-1 py-1">
                  <User className="w-3 h-3" />
                  <span className="text-[10px]">Auth</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="anon" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <div className="flex flex-col items-center gap-1 py-1">
                  <Ghost className="w-3 h-3" />
                  <span className="text-[10px]">Anon</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="service_role" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <div className="flex flex-col items-center gap-1 py-1">
                  <Shield className="w-3 h-3" />
                  <span className="text-[10px]">Admin</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {userContext.role === 'authenticated' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <Label htmlFor="uid" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                User ID (auth.uid)
              </Label>
              <Input
                id="uid"
                value={userContext.uid || ''}
                onChange={(e) => setUserContext({ uid: e.target.value })}
                className="bg-background/50 font-mono text-sm"
                placeholder="e.g. user_123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jwt-claims" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                JWT Claims (auth.jwt)
                <Badge variant="outline" className="text-[10px] font-normal py-0">JSON</Badge>
              </Label>
              <Textarea
                id="jwt-claims"
                value={JSON.stringify(userContext.jwt, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setUserContext({ jwt: parsed });
                  } catch (_err) {}
                }}
                className="bg-background/50 font-mono text-xs min-h-[100px]"
                placeholder='{ "role": "authenticated", "org_id": "org_123" }'
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-claims" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                Custom Attributes
                <Badge variant="outline" className="text-[10px] font-normal py-0">Merged Into JWT</Badge>
              </Label>
              <Textarea
                id="custom-claims"
                value={JSON.stringify(userContext.claims, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setUserContext({ claims: parsed });
                  } catch (_err) {}
                }}
                className="bg-background/50 font-mono text-xs min-h-[100px]"
                placeholder='{ "org_id": "org_123", "plan": "pro" }'
              />
            </div>
          </div>
        )}
        
        {userContext.role === 'anon' && (
          <div className="py-4 px-3 bg-muted/20 border border-dashed rounded-md text-center">
            <p className="text-xs text-muted-foreground italic">
              Anonymous users have no UID and limited permissions by default.
            </p>
          </div>
        )}

        {userContext.role === 'service_role' && (
          <div className="py-4 px-3 bg-primary/5 border border-primary/20 rounded-md text-center">
            <p className="text-xs text-primary font-medium">
              Service role (admin) typically bypasses all RLS policies.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
