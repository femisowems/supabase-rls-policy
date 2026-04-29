'use client';

import React from 'react';
import { useStore, UserRole } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, User, Shield, Ghost, ShieldCheck, EyeOff, Plus, Trash2, Save, Edit2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const iconMap: Record<string, any> = {
  User,
  Users,
  Ghost,
  ShieldCheck,
  EyeOff
};

export function UserSimulator() {
  const { userContext, setUserContext, personas, addPersona, deletePersona, updatePersona } = useStore();
  const [editingPersona, setEditingPersona] = React.useState<any>(null);
  const [editName, setEditName] = React.useState('');

  const handleSavePersona = () => {
    const name = prompt('Enter a name for this persona:');
    if (!name) return;

    addPersona({
      name,
      icon: 'User',
      description: `Custom ${userContext.role} persona`,
      context: { ...userContext }
    });
  };

  return (
    <Card className="border-muted shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4 border-b bg-muted/30 flex flex-row items-center gap-2 space-y-0">
        <Users className="w-4 h-4 text-primary" />
        <CardTitle className="text-sm font-medium">User Simulator</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Quick Personas
          </Label>
          <ScrollArea className="w-full whitespace-nowrap rounded-md pb-2">
            <div className="flex gap-2 w-max p-1">
              {personas.map((persona) => {
                const Icon = iconMap[persona.icon] || User;
                const isActive = userContext.role === persona.context.role && userContext.uid === persona.context.uid;
                
                return (
                  <div key={persona.name} className="relative group">
                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      className="h-auto py-2 px-3 flex flex-col items-center gap-1 min-w-[90px] relative overflow-hidden"
                      onClick={() => setUserContext(persona.context)}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold">{persona.name}</span>
                        <span className="text-[8px] opacity-60 font-normal leading-none truncate max-w-[70px]">
                          {persona.description}
                        </span>
                      </div>
                    </Button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingPersona(persona);
                        setEditName(persona.name);
                      }}
                      className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-lg hover:scale-110 z-10"
                      title="Edit persona"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deletePersona(persona.name); }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-lg hover:scale-110 z-10"
                      title="Delete persona"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-full py-2 px-3 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 flex flex-col items-center gap-1 min-w-[90px] min-h-[54px]"
                onClick={handleSavePersona}
              >
                <Plus className="w-4 h-4 text-primary/60" />
                <span className="text-[10px] font-bold text-primary/60">Save Current</span>
              </Button>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

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

      <Dialog open={!!editingPersona} onOpenChange={(open) => !open && setEditingPersona(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Persona</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Persona Name</Label>
              <Input 
                id="edit-name" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security Context</p>
              <div className="text-[10px] space-y-1">
                <div className="flex justify-between"><span className="opacity-60">Role:</span> <span>{editingPersona?.context.role}</span></div>
                <div className="flex justify-between"><span className="opacity-60">UID:</span> <span className="font-mono">{editingPersona?.context.uid || 'anon'}</span></div>
              </div>
              <Button 
                variant="outline" 
                size="xs" 
                className="w-full mt-2 gap-1.5 text-[10px]"
                onClick={() => {
                  updatePersona(editingPersona.name, { context: { ...userContext } });
                  setEditingPersona({ ...editingPersona, context: { ...userContext } });
                }}
              >
                <Save className="w-3 h-3" />
                Capture current simulator state
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingPersona(null)}>Cancel</Button>
            <Button onClick={() => {
              updatePersona(editingPersona.name, { name: editName });
              setEditingPersona(null);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
