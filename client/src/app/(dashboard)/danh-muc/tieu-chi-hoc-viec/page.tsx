'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { usePageTitle } from '@/components/layout/page-title-context';
import { api } from '@/lib/api-client';
import { activeOnly } from '@/lib/record-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/simple-select';
import { RecordStatusBadge } from '@/components/ui/status-badge';
import { CrudFormDialog } from '@/components/features/danh-muc/crud-form-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Department, RecordStatus, TrainingCriteria, TrainingCriteriaGroup } from '@/types';

interface GroupFormState {
  name: string;
  order: string;
  status: RecordStatus;
}

interface CriteriaFormState {
  name: string;
  maxScore: string;
  order: string;
  status: RecordStatus;
}

const emptyGroupForm: GroupFormState = { name: '', order: '0', status: 'ACTIVE' };
const emptyCriteriaForm: CriteriaFormState = {
  name: '',
  maxScore: '10',
  order: '0',
  status: 'ACTIVE',
};

export default function TieuChiHocViecPage() {
  usePageTitle('Cấu hình học việc');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [groups, setGroups] = useState<TrainingCriteriaGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TrainingCriteriaGroup | null>(null);
  const [groupForm, setGroupForm] = useState<GroupFormState>(emptyGroupForm);

  const [criteriaDialogOpen, setCriteriaDialogOpen] = useState(false);
  const [criteriaGroupId, setCriteriaGroupId] = useState('');
  const [editingCriteria, setEditingCriteria] = useState<TrainingCriteria | null>(null);
  const [criteriaForm, setCriteriaForm] = useState<CriteriaFormState>(emptyCriteriaForm);

  const [pendingDelete, setPendingDelete] = useState<
    { kind: 'group' | 'criteria'; id: string; label: string } | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get<Department[]>('/departments')
      .then((data) => {
        const usable = activeOnly(data);
        setDepartments(usable);
        setDepartmentId((current) => current || usable[0]?.id || '');
      })
      .catch(() => {});
  }, []);

  const loadGroups = useCallback(async () => {
    if (!departmentId) return;
    setLoading(true);
    try {
      const data = await api.get<TrainingCriteriaGroup[]>(
        `/training-criteria?departmentId=${departmentId}`
      );
      setGroups(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const openAddGroup = () => {
    setEditingGroup(null);
    setGroupForm({ ...emptyGroupForm, order: String(groups.length + 1) });
    setGroupDialogOpen(true);
  };

  const openEditGroup = (group: TrainingCriteriaGroup) => {
    setEditingGroup(group);
    setGroupForm({ name: group.name, order: String(group.order), status: group.status });
    setGroupDialogOpen(true);
  };

  const submitGroup = async () => {
    const payload = {
      departmentId,
      name: groupForm.name,
      order: groupForm.order === '' ? 0 : Number(groupForm.order),
      status: groupForm.status,
    };
    if (editingGroup) {
      await api.put(`/training-criteria/${editingGroup.id}`, payload);
      toast.success('Đã cập nhật nhóm tiêu chí');
    } else {
      await api.post('/training-criteria', payload);
      toast.success('Đã thêm nhóm tiêu chí');
    }
    await loadGroups();
  };

  const openAddCriteria = (group: TrainingCriteriaGroup) => {
    setCriteriaGroupId(group.id);
    setEditingCriteria(null);
    setCriteriaForm({ ...emptyCriteriaForm, order: String(group.criteria.length + 1) });
    setCriteriaDialogOpen(true);
  };

  const openEditCriteria = (groupId: string, criteria: TrainingCriteria) => {
    setCriteriaGroupId(groupId);
    setEditingCriteria(criteria);
    setCriteriaForm({
      name: criteria.name,
      maxScore: String(criteria.maxScore),
      order: String(criteria.order),
      status: criteria.status,
    });
    setCriteriaDialogOpen(true);
  };

  const submitCriteria = async () => {
    const payload = {
      groupId: criteriaGroupId,
      name: criteriaForm.name,
      maxScore: criteriaForm.maxScore === '' ? 0 : Number(criteriaForm.maxScore),
      order: criteriaForm.order === '' ? 0 : Number(criteriaForm.order),
      status: criteriaForm.status,
    };
    if (editingCriteria) {
      await api.put(`/training-criteria/criteria/${editingCriteria.id}`, payload);
      toast.success('Đã cập nhật tiêu chí');
    } else {
      await api.post('/training-criteria/criteria', payload);
      toast.success('Đã thêm tiêu chí');
    }
    await loadGroups();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const path =
        pendingDelete.kind === 'group'
          ? `/training-criteria/${pendingDelete.id}`
          : `/training-criteria/criteria/${pendingDelete.id}`;
      await api.delete(path);
      toast.success('Xoá thành công');
      setPendingDelete(null);
      await loadGroups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const totalMaxScore = groups
    .filter((g) => g.status === 'ACTIVE')
    .reduce(
      (sum, g) =>
        sum + g.criteria.filter((c) => c.status === 'ACTIVE').reduce((s, c) => s + c.maxScore, 0),
      0
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
        <Label className="text-sm font-normal text-muted-foreground">Bộ phận học việc</Label>
        <SimpleSelect
          value={departmentId}
          onValueChange={setDepartmentId}
          className="w-64"
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
        />
        <span className="text-sm text-muted-foreground">
          Thang điểm hiện tại: <span className="font-medium">{totalMaxScore}</span> điểm
        </span>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <span className="text-sm text-muted-foreground">Tổng số {groups.length} nhóm tiêu chí</span>
          <Button size="sm" onClick={openAddGroup} disabled={!departmentId}>
            <Plus className="size-4" />
            Thêm nhóm
          </Button>
        </div>

        <div className="flex flex-col gap-4 p-4">
          {loading && <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>}

          {!loading && groups.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Bộ phận này chưa có bộ tiêu chí học việc. Bấm &quot;Thêm nhóm&quot; để bắt đầu.
            </p>
          )}

          {!loading &&
            groups.map((group) => {
              const groupMax = group.criteria.reduce((s, c) => s + c.maxScore, 0);
              return (
                <div key={group.id} className="rounded-lg border">
                  <div className="flex items-center justify-between gap-3 border-b bg-muted/30 p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{group.name}</span>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          ({groupMax} điểm)
                        </span>
                        <RecordStatusBadge status={group.status} />
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => openAddCriteria(group)}>
                        <Plus className="size-4" />
                        Thêm tiêu chí
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEditGroup(group)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-500 hover:text-red-600"
                        onClick={() =>
                          setPendingDelete({ kind: 'group', id: group.id, label: group.name })
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {group.criteria.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground">Chưa có tiêu chí nào</p>
                  ) : (
                    <div className="divide-y">
                      {group.criteria.map((criteria) => (
                        <div key={criteria.id} className="flex items-center gap-3 p-3">
                          <span className="min-w-0 flex-1 truncate text-sm">{criteria.name}</span>
                          <span className="shrink-0 text-sm text-muted-foreground">
                            {criteria.maxScore} điểm
                          </span>
                          <RecordStatusBadge status={criteria.status} />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEditCriteria(group.id, criteria)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-red-500 hover:text-red-600"
                            onClick={() =>
                              setPendingDelete({
                                kind: 'criteria',
                                id: criteria.id,
                                label: criteria.name,
                              })
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      <CrudFormDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        title={editingGroup ? 'Sửa nhóm tiêu chí' : 'Thêm nhóm tiêu chí'}
        onSubmit={submitGroup}
      >
        <div className="grid gap-2">
          <Label htmlFor="group-name">Tên nhóm</Label>
          <Input
            id="group-name"
            value={groupForm.name}
            onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="VD: KỸ NĂNG PHỤC VỤ"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="group-order">Thứ tự hiển thị</Label>
            <Input
              id="group-order"
              type="number"
              value={groupForm.order}
              onChange={(e) => setGroupForm((f) => ({ ...f, order: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Trạng thái</Label>
            <SimpleSelect
              value={groupForm.status}
              onValueChange={(v) => setGroupForm((f) => ({ ...f, status: v as RecordStatus }))}
              options={[
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'INACTIVE', label: 'Ngừng' },
              ]}
            />
          </div>
        </div>
      </CrudFormDialog>

      <CrudFormDialog
        open={criteriaDialogOpen}
        onOpenChange={setCriteriaDialogOpen}
        title={editingCriteria ? 'Sửa tiêu chí' : 'Thêm tiêu chí'}
        onSubmit={submitCriteria}
      >
        <div className="grid gap-2">
          <Label htmlFor="criteria-name">Tên tiêu chí</Label>
          <Input
            id="criteria-name"
            value={criteriaForm.name}
            onChange={(e) => setCriteriaForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="VD: Chào đón, hướng dẫn khách hàng nhiệt tình"
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="criteria-max">Điểm tối đa</Label>
            <Input
              id="criteria-max"
              type="number"
              min={1}
              value={criteriaForm.maxScore}
              onChange={(e) => setCriteriaForm((f) => ({ ...f, maxScore: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="criteria-order">Thứ tự</Label>
            <Input
              id="criteria-order"
              type="number"
              value={criteriaForm.order}
              onChange={(e) => setCriteriaForm((f) => ({ ...f, order: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Trạng thái</Label>
            <SimpleSelect
              value={criteriaForm.status}
              onValueChange={(v) => setCriteriaForm((f) => ({ ...f, status: v as RecordStatus }))}
              options={[
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'INACTIVE', label: 'Ngừng' },
              ]}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Sửa điểm tối đa chỉ ảnh hưởng phiếu tạo mới — phiếu đã chấm giữ nguyên thang điểm cũ.
        </p>
      </CrudFormDialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá &quot;{pendingDelete?.label}&quot;?
              {pendingDelete?.kind === 'group' && ' Toàn bộ tiêu chí trong nhóm cũng bị xoá theo.'}{' '}
              Phiếu học việc đã chấm không bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={confirmDelete}>
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
