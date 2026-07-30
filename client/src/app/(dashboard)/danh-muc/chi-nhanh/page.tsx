'use client';

import { useEffect, useState } from 'react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { useCrud } from '@/hooks/use-crud';
import { CrudTable } from '@/components/features/danh-muc/crud-table';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import { RecordStatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Branch, RecordStatus } from '@/types';

interface FormState {
  name: string;
  address: string;
  wifiSsid: string;
  wifiBssid: string;
  status: RecordStatus;
}

const emptyForm: FormState = {
  name: '',
  address: '',
  wifiSsid: '',
  wifiBssid: '',
  status: 'ACTIVE',
};

export default function ChiNhanhPage() {
  usePageTitle('Chi nhánh');
  const { items, loading, create, update, remove } = useCrud<Branch>('/branches');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        address: editing.address ?? '',
        wifiSsid: editing.wifiSsid ?? '',
        wifiBssid: editing.wifiBssid ?? '',
        status: editing.status,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editing, dialogOpen]);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      address: form.address || undefined,
      wifiSsid: form.wifiSsid || undefined,
      wifiBssid: form.wifiBssid || undefined,
      status: form.status,
    };
    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
  };

  return (
    <div className="space-y-4">
      <CrudTable
        items={items}
        loading={loading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(item) => remove(item.id)}
        getRowLabel={(item) => item.name}
        columns={[
          { header: 'Tên chi nhánh', cell: (item) => <span className="font-medium">{item.name}</span> },
          { header: 'Địa chỉ', cell: (item) => item.address || '-' },
          {
            header: 'WiFi chấm công',
            cell: (item) =>
              item.wifiSsid ? (
                <span title={item.wifiBssid ? `BSSID: ${item.wifiBssid}` : undefined}>
                  {item.wifiSsid}
                </span>
              ) : (
                <span className="text-muted-foreground">Chưa cấu hình</span>
              ),
          },
          { header: 'Trạng thái', cell: (item) => <RecordStatusBadge status={item.status} /> },
        ]}
      />

      <CrudFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Sửa chi nhánh' : 'Thêm chi nhánh'}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-2">
          <Label htmlFor="name">Tên chi nhánh</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Địa chỉ</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="wifiSsid">Tên WiFi chấm công</Label>
            <Input
              id="wifiSsid"
              value={form.wifiSsid}
              onChange={(e) => setForm((f) => ({ ...f, wifiSsid: e.target.value }))}
              placeholder="VD: Indoor Coffee"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="wifiBssid">Địa chỉ MAC (BSSID)</Label>
            <Input
              id="wifiBssid"
              value={form.wifiBssid}
              onChange={(e) => setForm((f) => ({ ...f, wifiBssid: e.target.value }))}
              placeholder="VD: EE:74:D7:12:97:EF"
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">
          Lấy từ nhãn dán trên router hoặc app WiFi Analyzer. Nhân viên chỉ chấm công được khi
          điện thoại đang kết nối đúng WiFi này.
        </p>
      </CrudFormDialog>
    </div>
  );
}
