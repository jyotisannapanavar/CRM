import { useEffect, useState } from "react";
import { settingsApi, salesStageApi, lostReasonApi, competitorApi } from "@/services/api";
import type { CrmSetting, SalesStage, OpportunityLostReason, Competitor } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<CrmSetting | null>(null);
  const [stages, setStages] = useState<SalesStage[]>([]);
  const [reasons, setReasons] = useState<OpportunityLostReason[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newStage, setNewStage] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newCompetitor, setNewCompetitor] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      settingsApi.get(),
      salesStageApi.list(),
      lostReasonApi.list(),
      competitorApi.list(),
    ]).then(([s, st, r, c]) => {
      setSettings(s);
      setStages(st);
      setReasons(r);
      setCompetitors(c);
    });
  }, []);

  const updateSetting = async (key: string, value: string | boolean | number) => {
    if (!settings) return;
    setSaving(true);
    const updated = await settingsApi.update({ [key]: value });
    setSettings(updated);
    setSaving(false);
  };

  const addStage = async () => {
    if (!newStage.trim()) return;
    const stage = await salesStageApi.create({ stage_name: newStage });
    setStages([...stages, stage]);
    setNewStage("");
  };

  const deleteStage = async (id: number) => {
    await salesStageApi.delete(id);
    setStages(stages.filter((s) => s.id !== id));
  };

  const addReason = async () => {
    if (!newReason.trim()) return;
    const reason = await lostReasonApi.create({ reason: newReason });
    setReasons([...reasons, reason]);
    setNewReason("");
  };

  const deleteReason = async (id: number) => {
    await lostReasonApi.delete(id);
    setReasons(reasons.filter((r) => r.id !== id));
  };

  const addCompetitor = async () => {
    if (!newCompetitor.trim()) return;
    const comp = await competitorApi.create({ competitor_name: newCompetitor });
    setCompetitors([...competitors, comp]);
    setNewCompetitor("");
  };

  const deleteCompetitor = async (id: number) => {
    await competitorApi.delete(id);
    setCompetitors(competitors.filter((c) => c.id !== id));
  };

  if (!settings) return <p className="text-gray-500 py-8 text-center">Loading settings...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold">CRM Settings</h2>

      <Card>
        <CardHeader><CardTitle className="text-base">General Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm">Campaign Naming By</label>
            <Select className="w-48" value={settings.campaign_naming_by || "Campaign Name"} onChange={(e) => updateSetting("campaign_naming_by", e.target.value)}>
              <option value="Campaign Name">Campaign Name</option>
              <option value="Naming Series">Naming Series</option>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm">Close Opportunity After (days)</label>
            <Input className="w-24" type="number" value={settings.close_opportunity_after_days || ""} onChange={(e) => updateSetting("close_opportunity_after_days", Number(e.target.value))} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm">Allow Lead Duplication By Email</label>
            <input type="checkbox" checked={settings.allow_lead_duplication_based_on_emails} onChange={(e) => updateSetting("allow_lead_duplication_based_on_emails", e.target.checked)} className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm">Auto Create Contact</label>
            <input type="checkbox" checked={settings.auto_creation_of_contact} onChange={(e) => updateSetting("auto_creation_of_contact", e.target.checked)} className="h-4 w-4" />
          </div>
          {saving && <p className="text-xs text-blue-500">Saving...</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Sales Stages</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stages.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded">
                <span className="text-sm">{s.stage_name}</span>
                <Button variant="ghost" size="icon" onClick={() => deleteStage(s.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <Input placeholder="New stage name" value={newStage} onChange={(e) => setNewStage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addStage()} />
              <Button size="sm" onClick={addStage}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Lost Reasons</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reasons.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded">
                <span className="text-sm">{r.reason}</span>
                <Button variant="ghost" size="icon" onClick={() => deleteReason(r.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <Input placeholder="New lost reason" value={newReason} onChange={(e) => setNewReason(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addReason()} />
              <Button size="sm" onClick={addReason}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Competitors</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {competitors.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded">
                <span className="text-sm">{c.competitor_name}</span>
                <Button variant="ghost" size="icon" onClick={() => deleteCompetitor(c.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <Input placeholder="New competitor name" value={newCompetitor} onChange={(e) => setNewCompetitor(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCompetitor()} />
              <Button size="sm" onClick={addCompetitor}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
