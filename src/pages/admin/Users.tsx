import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  User,
  Zap,
  Shield,
  Wallet,
  MoreHorizontal,
  Eye,
  Ban,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import api from '@/utils/api';
import type { User as UserType, UserRole } from '@shared/types';

const roleLabels: Record<UserRole, string> = {
  user: '普通用户',
  operator: '运维人员',
  dispatcher: '调度人员',
  finance: '财务人员',
  admin: '管理员',
};

const roleColors: Record<UserRole, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
  user: 'default',
  operator: 'primary',
  dispatcher: 'success',
  finance: 'warning',
  admin: 'danger',
};

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        pageSize: 20,
      };
      if (roleFilter) {
        params.role = roleFilter;
      }
      if (keyword) {
        params.keyword = keyword;
      }
      const res = await api.get<{ list: UserType[]; total: number }>('/admin/users', params);
      setUsers(res.data.list);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, keyword]);

  const handleViewDetail = (user: UserType) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleDisable = (user: UserType) => {
    setSelectedUser(user);
    setShowDisableModal(true);
  };

  const confirmDisable = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}/disable`);
      setShowDisableModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to disable user:', error);
    }
  };

  const roleOptions = [
    { value: '', label: '全部角色' },
    { value: 'user', label: '普通用户' },
    { value: 'operator', label: '运维人员' },
    { value: 'dispatcher', label: '调度人员' },
    { value: 'finance', label: '财务人员' },
    { value: 'admin', label: '管理员' },
  ];

  return (
    <Layout title="用户管理">
      <div className="space-y-6">
        <Card hoverable={false}>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">搜索：</span>
                </div>
                <Input
                  placeholder="输入昵称或手机号搜索"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-64"
                />
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <Select
                    options={roleOptions}
                    value={roleFilter}
                    onChange={setRoleFilter}
                    className="w-36"
                  />
                </div>
              </div>
              <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                新增用户
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>用户列表</CardTitle>
              <Badge variant="primary">共 {total} 人</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      用户
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      角色
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      信用分
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      实名认证
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      押金状态
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-primary-600" />
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.nickname}</p>
                              <p className="text-xs text-gray-500">{user.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={roleColors[user.role]} size="sm">
                            {roleLabels[user.role]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-warning-500" />
                            <span className="font-medium text-gray-900">
                              {user.creditScore}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {user.realNameVerified ? (
                            <Badge variant="success" size="sm">
                              已认证
                            </Badge>
                          ) : (
                            <Badge variant="warning" size="sm">
                              未认证
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {user.depositPaid ? (
                            <Badge variant="primary" size="sm">
                              已缴纳 ¥{user.depositAmount}
                            </Badge>
                          ) : (
                            <Badge variant="default" size="sm">
                              未缴纳
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="w-4 h-4 text-primary-500" />}
                              onClick={() => handleViewDetail(user)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Ban className="w-4 h-4 text-danger-500" />}
                              onClick={() => handleDisable(user)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <span className="text-sm text-gray-500">
                共 {total} 条记录，第 {page} 页
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 20 >= total}
                >
                  下一页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="用户详情"
        width="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedUser.nickname}
                </h3>
                <p className="text-sm text-gray-500">{selectedUser.phone}</p>
                <Badge variant={roleColors[selectedUser.role]} className="mt-2">
                  {roleLabels[selectedUser.role]}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-warning-500" />
                  <span className="text-sm text-gray-600">信用分</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {selectedUser.creditScore}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-gray-600">押金</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {selectedUser.depositPaid
                    ? `¥${selectedUser.depositAmount}`
                    : '未缴纳'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-success-500" />
                  <span className="text-sm text-gray-600">实名认证</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {selectedUser.realNameVerified ? '已认证' : '未认证'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-secondary-500" />
                  <span className="text-sm text-gray-600">用户ID</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{selectedUser.id}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                关闭
              </Button>
              <Button variant="primary">编辑用户</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        title="禁用用户"
        description="确定要禁用该用户账号吗？"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-warning-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedUser.nickname}</p>
                  <p className="text-sm text-gray-500">{selectedUser.phone}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              禁用后该用户将无法登录和使用骑行服务，请谨慎操作。
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowDisableModal(false)}
              >
                取消
              </Button>
              <Button variant="danger" fullWidth onClick={confirmDisable}>
                确认禁用
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
